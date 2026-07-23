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
  theme?: 'dark' | 'light';
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
    if (/^\s*(graph|flowchart|subgraph|end|style|classDef|click|linkStyle)\b/i.test(l)) {
      return l;
    }

    // Convert legacy edge decision labels like A -- "Label" --> B or A -- Label --> B to A -->|Label| B
    l = l.replace(/--\s*"?([^\n"->]+)"?\s*-->/g, (_, edgeLabel) => {
      const cleanEdge = edgeLabel.trim().replace(/\|/g, '/').replace(/"/g, "'");
      return `-->|${cleanEdge}|`;
    });

    // Clean pipe edge labels: -->| x < y | => -->|x &lt; y|
    l = l.replace(/-->\|(.*?)\|/g, (_, edgeLabel) => {
      const cleanEdge = edgeLabel.trim().replace(/"/g, "'").replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `-->|${cleanEdge}|`;
    });

    return l;
  });

  return sanitizedLines.filter(Boolean).join('\n');
}

function createFallbackFlowchartCode(): string {
  return `graph TD
  Start(["Start Execution"]) --> CheckInput{"Validate Input"}
  CheckInput -->|Valid| Loop["Process Code Logic"]
  CheckInput -->|Invalid| ReturnErr["Return Error / Exit"]
  Loop --> CheckCond{"Condition Met?"}
  CheckCond -->|Yes| ExecuteStep["Execute Action Step"]
  ExecuteStep --> Loop
  CheckCond -->|No| EndVal(["Return Result"])`;
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
  flowchartData,
  onRegenerate,
  isRegenerating,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
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
        theme: isLight ? 'default' : 'dark',
        securityLevel: 'loose',
        themeVariables: isLight
          ? {
              darkMode: false,
              background: '#ffffff',
              primaryColor: '#e0e7ff',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#4f46e5',
              lineColor: '#4f46e5',
              secondaryColor: '#f3e8ff',
              tertiaryColor: '#f1f5f9',
            }
          : {
              darkMode: true,
              background: '#0d0d0f',
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
    }
  }, [isLight]);

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

    // Attempt 1: Render processed code
    try {
      await mermaid.parse(processedCode);
      const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(uniqueId, processedCode);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        const svgElem = containerRef.current.querySelector('svg');
        if (svgElem) {
          svgElem.style.maxWidth = '100%';
          svgElem.style.height = 'auto';
        }
      }
      return;
    } catch (firstErr: any) {
      console.warn('[Mermaid First Pass Render Warning]:', firstErr);
    }

    // Attempt 2: Fallback diagram recovery
    try {
      const fallbackCode = createFallbackFlowchartCode();
      await mermaid.parse(fallbackCode);
      const uniqueId = `mermaid-fallback-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(uniqueId, fallbackCode);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        const svgElem = containerRef.current.querySelector('svg');
        if (svgElem) {
          svgElem.style.maxWidth = '100%';
          svgElem.style.height = 'auto';
        }
      }
      setRenderError('Complex flowchart syntax was normalized. You can inspect or edit syntax below.');
    } catch (secondErr: any) {
      console.error('[Mermaid Fallback Render Error]:', secondErr);
      setRenderError('Flowchart syntax error detected. Click "Debug Syntax" below to inspect or auto-fix.');
    }
  };

  useEffect(() => {
    renderDiagram(editableCode);
  }, [editableCode, direction, isLight]);

  if (!flowchartData || !flowchartData.mermaidCode) {
    return (
      <div className={`p-8 text-center rounded-xl border text-xs ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0e0e10] border-white/5 text-slate-500'
      }`}>
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
      <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0e0e10] border-white/5 text-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            Control Flow Visualizer
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Orientation toggle */}
          <button
            onClick={() => setDirection(direction === 'TD' ? 'LR' : 'TD')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'
            }`}
            title="Toggle Layout Direction"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Direction: {direction === 'TD' ? 'Top-Down' : 'Left-Right'}</span>
          </button>

          {/* Zoom controls */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded border ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-black/40 border-white/5'
          }`}>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`font-mono w-10 text-center text-[11px] ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
                ? isLight
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
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
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SVG</span>
          </button>

          {/* Copy Mermaid */}
          <button
            onClick={handleCopyCode}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded border transition-colors ${
              isLight
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20'
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Mermaid Code'}</span>
          </button>
        </div>
      </div>

      {/* Debug Syntax Panel */}
      {showDebug && (
        <div className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-[#0a0a0b] border-white/10 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Mermaid.js Flowchart Debugger</span>
            </span>
            <button
              onClick={handleAutoSanitize}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs transition-colors shadow-sm"
            >
              Auto-Fix & Format
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={6}
            className={`w-full p-3 rounded-lg border font-mono text-xs outline-none focus:border-indigo-500 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-black/60 border-white/10 text-slate-200'
            }`}
            placeholder="graph TD..."
          />
        </div>
      )}

      {/* Diagram Canvas */}
      <div className={`p-6 rounded-xl border overflow-auto min-h-[350px] flex items-center justify-center relative shadow-sm ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-[#0d0d0f] border-white/5 text-slate-100'
      }`}>
        {renderError && !containerRef.current?.hasChildNodes() ? (
          <div className={`text-center space-y-3 max-w-md p-6 rounded-xl border shadow-lg ${
            isLight
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
          }`}>
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
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
                Auto-Fix Code
              </button>
              <button
                onClick={() => setShowDebug(true)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-200'
                }`}
              >
                Inspect Syntax
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
        <p className={`text-xs p-3 rounded-lg border leading-relaxed ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-white/5 border-white/5 text-slate-400'
        }`}>
          <strong className={isLight ? 'text-slate-900 font-semibold' : 'text-slate-200'}>
            Workflow Summary:{' '}
          </strong>
          {flowchartData.explanation}
        </p>
      )}
    </div>
  );
};
