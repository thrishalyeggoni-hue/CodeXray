import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { FlowchartResponse } from '../types';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Download,
  Check,
  RefreshCw,
  Code,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface FlowchartViewerProps {
  flowchartData: FlowchartResponse | null;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

function getClosingBracket(open: string): string {
  const bracketMap: { [key: string]: string } = {
    '([': '])', // Stadium
    '[[': ']]', // Subroutine
    '[(': ')]', // Cylinder
    '((': '))', // Circle
    '(': ')', // Rounded
    '[': ']', // Rectangle
    '{': '}', // Diamond
  };
  return bracketMap[open.trim()] || open;
}

function cleanLabelText(str: string): string {
  let s = str.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/"/g, "'");
  s = s.replace(/[\r\n]+/g, ' ');
  return `"${s}"`;
}

function sanitizeMermaidCode(rawCode: string): string {
  if (!rawCode) return 'graph TD\n  Start(["Start Execution"]) --> End(["End Execution"])';

  let code = rawCode.trim();
  code = code.replace(/```mermaid/gi, '').replace(/```/g, '').trim();

  if (!code.startsWith('graph') && !code.startsWith('flowchart')) {
    code = 'graph TD\n' + code;
  }

  const lines = code.split('\n');
  const sanitizedLines = lines.map((line) => {
    let l = line.trim();
    if (!l) return '';
    if (/^\s*(graph|flowchart|subgraph|end|style|classDef|click)\b/i.test(l)) {
      return l;
    }

    // Convert legacy edge decision labels like A -- "Label" --> B or A -- Label --> B to A -->|Label| B
    l = l.replace(/--\s*"?([^\n"->]+)"?\s*-->/g, (_, edgeLabel) => {
      const cleanEdge = edgeLabel.trim().replace(/\|/g, '/');
      return `-->|${cleanEdge}|`;
    });

    // Match node shape patterns: ID + opening brackets + label content + closing brackets
    // 1. Stadium shape: ID(["Label"])
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\(\[\s*(.*?)\s*\]\)/g, (_, id, content) => {
      return `${id}([${cleanLabelText(content)}])`;
    });

    // 2. Subroutine shape: ID[["Label"]]
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\[\[\s*(.*?)\s*\]\]/g, (_, id, content) => {
      return `${id}[[${cleanLabelText(content)}]]`;
    });

    // 3. Cylinder shape: ID[("Label")]
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\[\(\s*(.*?)\s*\)\]/g, (_, id, content) => {
      return `${id}[(${cleanLabelText(content)})]`;
    });

    // 4. Circle shape: ID(("Label"))
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\(\(\s*(.*?)\s*\)\)/g, (_, id, content) => {
      return `${id}((${cleanLabelText(content)}))`;
    });

    // 5. Rectangle shape: ID["Label"]
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\[(?![\[\(])\s*(.*?)\s*(?<![\]\)])\]/g, (_, id, content) => {
      return `${id}[${cleanLabelText(content)}]`;
    });

    // 6. Rhombus/Diamond shape: ID{"Label"}
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\{\s*(.*?)\s*\}/g, (_, id, content) => {
      return `${id}{${cleanLabelText(content)}}`;
    });

    // 7. Round shape: ID("Label")
    l = l.replace(/\b([A-Za-z0-9_]+)\s*\((?![\[\(])\s*(.*?)\s*(?<![\]\)])\)/g, (_, id, content) => {
      return `${id}(${cleanLabelText(content)})`;
    });

    return l;
  });

  return sanitizedLines.filter(Boolean).join('\n');
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
  flowchartData,
  onRegenerate,
  isRegenerating,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'TD' | 'LR'>('TD');
  const [showDebug, setShowDebug] = useState(false);

  const initialCode = flowchartData?.mermaidCode || '';
  const [editableCode, setEditableCode] = useState(initialCode);

  useEffect(() => {
    if (flowchartData?.mermaidCode) {
      setEditableCode(flowchartData.mermaidCode);
    }
  }, [flowchartData]);

  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        suppressErrorRendering: true,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          darkMode: true,
          background: '#0a0a0b',
          primaryColor: '#6366f1',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#4f46e5',
          lineColor: '#818cf8',
          secondaryColor: '#a855f7',
          tertiaryColor: '#1e1b4b',
        },
      });
    } catch (e: any) {
      console.error('Mermaid initialization error:', e);
      setRenderError(`Mermaid initialization failed: ${e?.message || 'Failed to initialize diagram engine.'}`);
    }
  }, []);

  const renderDiagram = async (codeToRender: string) => {
    if (!containerRef.current || !codeToRender) return;

    setRenderError(null);
    const container = containerRef.current;
    container.innerHTML = '';

    let processedCode = sanitizeMermaidCode(codeToRender);

    if (direction === 'LR' && processedCode.includes('graph TD')) {
      processedCode = processedCode.replace('graph TD', 'graph LR');
    } else if (direction === 'TD' && processedCode.includes('graph LR')) {
      processedCode = processedCode.replace('graph LR', 'graph TD');
    }

    // Parse diagram syntax explicitly to catch syntax errors
    try {
      await mermaid.parse(processedCode);
    } catch (parseErr: any) {
      console.error('[Mermaid Syntax Parse Error]:', {
        error: parseErr,
        message: parseErr?.message || parseErr,
        rawMermaidCode: codeToRender,
        processedMermaidCode: processedCode,
      });
      setRenderError(`Flowchart syntax error detected. Failed to parse diagram definition.`);
      return;
    }

    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const { svg } = await mermaid.render(uniqueId, processedCode);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        const svgElem = containerRef.current.querySelector('svg');
        if (svgElem) {
          svgElem.style.maxWidth = '100%';
          svgElem.style.height = 'auto';
        }
      }
    } catch (err: any) {
      console.error('[Mermaid Render Error]:', {
        error: err,
        message: err?.message || err,
        rawMermaidCode: codeToRender,
        processedMermaidCode: processedCode,
      });
      setRenderError('Flowchart syntax error detected. Click "Debug Syntax" below to inspect or auto-fix.');
      const errorElem = document.getElementById(uniqueId);
      if (errorElem) errorElem.remove();
    }
  };

  useEffect(() => {
    renderDiagram(editableCode);
  }, [editableCode, direction]);

  if (!flowchartData || !flowchartData.mermaidCode) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#0e0e10] rounded-xl border border-white/5 text-xs">
        No flowchart generated yet. Click "Analyze Code" to visualize control flow.
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svgElem = containerRef.current.querySelector('svg');
    if (!svgElem) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codexray-flowchart.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAutoSanitize = () => {
    const cleaned = sanitizeMermaidCode(editableCode);
    setEditableCode(cleaned);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-3 bg-[#0e0e10] rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            Control Flow Visualizer
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Orientation toggle */}
          <button
            onClick={() => setDirection(direction === 'TD' ? 'LR' : 'TD')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
            title="Toggle Layout Direction"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Direction: {direction === 'TD' ? 'Top-Down' : 'Left-Right'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-white/5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
              className="p-1 hover:text-indigo-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-400 w-10 text-center text-[11px]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1 hover:text-indigo-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Debug syntax toggle */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded border transition-colors ${
              showDebug
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
            }`}
            title="Debug Mermaid Code"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Debug Syntax</span>
          </button>

          {/* Export SVG */}
          <button
            onClick={handleDownloadSVG}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>SVG</span>
          </button>

          {/* Copy Mermaid */}
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Mermaid Code'}</span>
          </button>
        </div>
      </div>

      {/* Debug Syntax Panel */}
      {showDebug && (
        <div className="p-4 rounded-xl bg-[#0a0a0b] border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold text-indigo-400 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Mermaid.js Flowchart Debugger</span>
            </span>
            <button
              onClick={handleAutoSanitize}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs transition-colors"
            >
              Auto-Fix & Quote Labels
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-slate-200 font-mono text-xs outline-none focus:border-indigo-500/50"
            placeholder="graph TD..."
          />
        </div>
      )}

      {/* Diagram Canvas */}
      <div className="p-6 rounded-xl bg-[#0d0d0f] border border-white/5 overflow-auto min-h-[350px] flex items-center justify-center relative">
        {renderError ? (
          <div className="text-center text-rose-300 space-y-3 max-w-md p-6 rounded-xl bg-rose-950/20 border border-rose-800/40 shadow-lg">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs font-semibold leading-relaxed">{renderError}</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
              )}
              <button
                onClick={handleAutoSanitize}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
              >
                Auto-Fix Labels
              </button>
              <button
                onClick={() => setShowDebug(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors"
              >
                Inspect Code
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="transition-transform duration-200 ease-out flex justify-center w-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          />
        )}
      </div>

      {/* Explanation text */}
      {flowchartData.explanation && (
        <p className="text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
          <strong className="text-slate-200">Workflow Summary: </strong>
          {flowchartData.explanation}
        </p>
      )}
    </div>
  );
};
