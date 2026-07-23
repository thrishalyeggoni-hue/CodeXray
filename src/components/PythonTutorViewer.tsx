import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Maximize2, Minimize2, Info, MonitorPlay, Code } from 'lucide-react';
import { ProgrammingLanguage } from '../types';

interface PythonTutorViewerProps {
  code: string;
  language: ProgrammingLanguage;
  theme?: 'dark' | 'light';
}

// Map app programming languages to Python Tutor runtime URL parameters
function getPythonTutorPyParam(lang: ProgrammingLanguage): string {
  switch (lang) {
    case 'python':
      return '311'; // Python 3.11
    case 'javascript':
    case 'typescript':
      return 'js'; // JavaScript ES6
    case 'java':
      return 'java';
    case 'cpp':
      return 'cpp_g++9.3.0';
    case 'c':
      return 'c_gcc9.3.0';
    default:
      return '311'; // Default fallback
  }
}

export const PythonTutorViewer: React.FC<PythonTutorViewerProps> = ({ code, language, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [selectedPy, setSelectedPy] = useState<string>(getPythonTutorPyParam(language));
  const [curInstr, setCurInstr] = useState<number>(0);
  const [isCumulative, setIsCumulative] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [directTutorUrl, setDirectTutorUrl] = useState<string>('');
  const [keyCounter, setKeyCounter] = useState<number>(0);

  // Sync selected runtime when prop language changes
  useEffect(() => {
    setSelectedPy(getPythonTutorPyParam(language));
  }, [language]);

  // Construct Python Tutor iframe & direct URLs
  const [embedMode, setEmbedMode] = useState<'embed' | 'full'>('full');

  const updateUrls = () => {
    if (!code || !code.trim()) {
      setIframeUrl('');
      setDirectTutorUrl('');
      return;
    }

    const encodedCode = encodeURIComponent(code.trim());
    const pyParam = selectedPy;

    // Direct Visualize URL (opens full interactive UI)
    const visualizeUrl = `https://pythontutor.com/visualize.html#code=${encodedCode}&cumulative=${isCumulative}&curInstr=${curInstr}&heapPrimitives=nevershow&origin=opt-frontend.js&py=${pyParam}&rawInputLstJSON=%5B%5D&textReferences=false`;
    
    // Embed URL for iframe
    const embedUrl = embedMode === 'embed'
      ? `https://pythontutor.com/iframe-embed.html#code=${encodedCode}&codeDivWidth=350&codeDivHeight=400&cumulative=${isCumulative}&curInstr=${curInstr}&heapPrimitives=nevershow&origin=opt-frontend.js&py=${pyParam}&rawInputLstJSON=%5B%5D&textReferences=false`
      : `https://pythontutor.com/visualize.html#code=${encodedCode}&cumulative=${isCumulative}&curInstr=${curInstr}&heapPrimitives=nevershow&origin=opt-frontend.js&py=${pyParam}&rawInputLstJSON=%5B%5D&textReferences=false`;

    setIframeUrl(embedUrl);
    setDirectTutorUrl(visualizeUrl);
  };

  useEffect(() => {
    updateUrls();
  }, [code, selectedPy, isCumulative, curInstr, embedMode]);

  const handleRefresh = () => {
    setKeyCounter((prev) => prev + 1);
    updateUrls();
  };

  const isSupportedLanguage = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c'].includes(language);

  return (
    <div className={`flex flex-col h-full transition-all ${
      isFullscreen
        ? isLight ? 'fixed inset-0 z-50 p-6 bg-slate-100 text-slate-800' : 'fixed inset-0 z-50 p-6 bg-[#09090b] text-slate-200'
        : isLight ? 'bg-white text-slate-800' : 'bg-[#0e0e10] text-slate-200'
    }`}>
      {/* Top Header Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-t-xl border shrink-0 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131316] border-white/5'
      }`}>
        <div className="flex items-center space-x-2">
          <MonitorPlay className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className={`text-sm font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            Python Tutor Execution Visualizer
          </h2>
          <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
            isLight
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
          }`}>
            Interactive Frame & Memory Debugger
          </span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Runtime Selector Widget */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all ${
            isLight ? 'bg-white/80 border-slate-300/80' : 'bg-white/5 border-white/10'
          }`}>
            <Code className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <select
              value={selectedPy}
              onChange={(e) => setSelectedPy(e.target.value)}
              className={`bg-transparent font-mono outline-none cursor-pointer text-xs ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}
            >
              <option value="311">Python 3.11</option>
              <option value="js">JavaScript (ES6)</option>
              <option value="java">Java (OpenJDK)</option>
              <option value="cpp_g++9.3.0">C++ (G++ 9.3)</option>
              <option value="c_gcc9.3.0">C (GCC 9.3)</option>
              <option value="ruby">Ruby 2.7</option>
            </select>
          </div>

          {/* Mode Switcher Widget */}
          <div className={`flex items-center p-1 rounded-full border backdrop-blur-md text-[11px] shadow-sm ${
            isLight ? 'bg-white/60 border-slate-300/80' : 'bg-white/5 border-white/10'
          }`}>
            <button
              onClick={() => setEmbedMode('full')}
              className={`px-3 py-1 rounded-full transition-all ${
                embedMode === 'full'
                  ? 'bg-indigo-600/90 text-white font-semibold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Python Tutor UI with code editor and trace view"
            >
              Full Visualizer
            </button>
            <button
              onClick={() => setEmbedMode('embed')}
              className={`px-3 py-1 rounded-full transition-all ${
                embedMode === 'embed'
                  ? 'bg-indigo-600/90 text-white font-semibold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Trace-only View"
            >
              Compact Trace
            </button>
          </div>

          {/* Options Widget */}
          <label className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md cursor-pointer select-none shadow-sm transition-all ${
            isLight ? 'bg-white/80 border-slate-300/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={isCumulative}
              onChange={(e) => setIsCumulative(e.target.checked)}
              className="rounded-full text-indigo-600 focus:ring-0"
            />
            <span className="text-[11px] font-medium">Cumulative</span>
          </label>

          {/* Reload Button Widget */}
          <button
            onClick={handleRefresh}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all shadow-sm ${
              isLight
                ? 'bg-white/80 border-slate-300/80 hover:bg-white text-slate-800'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Reload Python Tutor with current editor code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Sync Code</span>
          </button>

          {/* External Link Widget */}
          {directTutorUrl && (
            <a
              href={directTutorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all shadow-sm ${
                isLight
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                  : 'bg-indigo-600/30 border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200'
              }`}
              title="Open directly on pythontutor.com"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Open on PythonTutor</span>
            </a>
          )}

          {/* Fullscreen Toggle Widget */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-sm ${
              isLight
                ? 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Visualizer"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Language compatibility banner if sql/go/rust selected */}
      {!isSupportedLanguage && (
        <div className={`border-x border-b px-4 py-2 text-xs flex items-center space-x-2 ${
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Python Tutor natively visualizes Python, Java, C, C++, and JavaScript. SQL/Go/Rust are mapped to Python 3.11 for trace modeling.
          </span>
        </div>
      )}

      {/* Embedded Iframe Container */}
      <div className={`flex-1 border-x border-b rounded-b-xl overflow-hidden relative min-h-[580px] ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-white border-white/10'
      }`}>
        {iframeUrl ? (
          <iframe
            key={keyCounter}
            id="python-tutor-iframe"
            src={iframeUrl}
            className="w-full h-full min-h-[580px] bg-white border-none block"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            allowFullScreen
            title="Python Tutor Code Visualizer"
          />
        ) : (
          <div className={`flex flex-col items-center justify-center h-full p-8 text-center space-y-3 ${
            isLight ? 'bg-slate-50 text-slate-700' : 'bg-slate-900 text-slate-300'
          }`}>
            <MonitorPlay className="w-12 h-12 text-slate-400 animate-pulse" />
            <p className="text-sm font-semibold">No code provided to visualize.</p>
            <p className="text-xs max-w-md">
              Write or paste source code in the left editor and click &quot;Sync Code&quot; to step through memory frames, call stacks, and variable values.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Visualizer Tip bar */}
      <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-700'
          : 'bg-[#131316] border-white/5 text-slate-400'
      }`}>
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-[11px]">
            Use the <strong className={isLight ? 'text-slate-900 font-semibold' : 'text-slate-200'}>First / Back / Forward / Last</strong> buttons inside the visualizer to inspect local stack frames, global pointers, and array memory step-by-step.
          </span>
        </div>
      </div>
    </div>
  );
};
