import React, { useState, useEffect } from 'react';
import { DryRunResponse, DryRunStep } from '../types';
import { StackFrameAnimator } from './StackFrameAnimator';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Activity,
  Terminal,
  Cpu,
  Table,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  ListOrdered,
  ArrowRight,
} from 'lucide-react';

interface DryRunPlayerProps {
  dryRunData: DryRunResponse | null;
  onStepChange?: (lineNumber: number) => void;
  onRunDryRun?: () => void;
  isGenerating?: boolean;
  theme?: 'dark' | 'light';
}

export const DryRunPlayer: React.FC<DryRunPlayerProps> = ({
  dryRunData,
  onStepChange,
  onRunDryRun,
  isGenerating = false,
  theme = 'dark',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step
  const [viewMode, setViewMode] = useState<'animator' | 'table'>('animator');

  const isLight = theme === 'light';
  const steps = dryRunData?.steps || [];
  const currentStep: DryRunStep | undefined = steps[currentStepIndex];

  // Sync active line highlight with parent (editor)
  useEffect(() => {
    if (currentStep && onStepChange) {
      onStepChange(currentStep.lineNumber);
    }
  }, [currentStepIndex, currentStep, onStepChange]);

  // Autoplay effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, playbackSpeed]);

  if (!dryRunData || steps.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border flex flex-col items-center justify-center space-y-4 ${
        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900/60 border-white/10 text-slate-300'
      }`}>
        <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            No Dry Run Simulation Trace Loaded
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click below to generate a step-by-step dry run trace. You can step through execution line by line, inspect variable state mutations, and watch memory pointers move in real-time.
          </p>
        </div>

        {onRunDryRun && (
          <button
            onClick={onRunDryRun}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Line-by-Line Execution...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Generate Dry Run Trace</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Check variable mutations from previous step
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const prevVars = prevStep?.variables || {};
  const currentVars = currentStep?.variables || {};

  return (
    <div className="space-y-4">
      {/* Player Header & Controls Bar */}
      <div className={`p-4 rounded-2xl border shadow-md space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              Execution Player & Memory Inspector
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono bg-indigo-50 dark:bg-cyan-950 text-indigo-700 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-800/60 rounded-full font-bold">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle View Mode */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('animator')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'animator'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Memory Animator</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Trace Matrix</span>
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span>Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-transparent text-indigo-700 dark:text-cyan-400 font-mono font-bold outline-none cursor-pointer text-xs"
              >
                <option value={2000} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">0.5x</option>
                <option value={1200} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">1.0x</option>
                <option value={600} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">2.0x</option>
              </select>
            </div>

            {onRunDryRun && (
              <button
                onClick={onRunDryRun}
                disabled={isGenerating}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Re-run Dry Run Analysis"
              >
                <RotateCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStepIndex(Number(e.target.value));
            }}
            className="w-full accent-indigo-600 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Start (Step 1)</span>
            <span className="text-cyan-500 font-bold">Line {currentStep?.lineNumber} Active</span>
            <span>End (Step {steps.length})</span>
          </div>
        </div>

        {/* Interactive Playback Control Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play Simulation</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Stack Frame & Memory Animator */}
      {viewMode === 'animator' && (
        <>
          {currentStep && (
            <StackFrameAnimator
              variables={currentStep.variables || {}}
              lineNumber={currentStep.lineNumber}
              lineContent={currentStep.lineContent}
              theme={theme}
            />
          )}

          {/* Step Details & Variable Watcher Grid */}
          {currentStep && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Statement & Logic */}
              <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>Executing Statement</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    Line {currentStep.lineNumber}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/40 text-xs font-mono text-cyan-300 flex items-center justify-between">
                  <code>{currentStep.lineContent}</code>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {currentStep.explanation}
                </p>
              </div>

              {/* Variable Watch Monitor */}
              <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Variable Memory Inspector</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Object.keys(currentVars).length} in scope
                  </span>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
                  {Object.keys(currentVars).length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs font-mono">
                      No active local variables in scope.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 font-mono max-h-[160px] overflow-y-auto">
                      {Object.entries(currentVars).map(([key, val]) => {
                        const isMutated = prevStep && prevVars[key] !== undefined && prevVars[key] !== val;
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between px-3.5 py-2 transition-colors ${
                              isMutated ? 'bg-emerald-950/40' : 'hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-300 font-bold">{key}</span>
                              {isMutated && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                                  Updated
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded border text-xs ${
                              isMutated
                                ? 'text-emerald-300 bg-emerald-950 border-emerald-500/50 font-bold'
                                : 'text-cyan-300 bg-cyan-950/50 border-cyan-800/40'
                            }`}>
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: Full Execution Trace Matrix Table */}
      {viewMode === 'table' && (
        <div className={`p-4 rounded-2xl border overflow-hidden space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <div className="flex items-center space-x-2">
              <ListOrdered className="w-4 h-4 text-indigo-500" />
              <span>Complete Dry Run Step-by-Step Matrix</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Click any step row to jump instantly
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className={isLight ? 'bg-slate-100 text-slate-700 border-b border-slate-200' : 'bg-slate-950 text-slate-300 border-b border-slate-800'}>
                  <th className="p-2.5 w-14">Step</th>
                  <th className="p-2.5 w-16">Line</th>
                  <th className="p-2.5 min-w-[180px]">Executed Code</th>
                  <th className="p-2.5 min-w-[220px]">Explanation</th>
                  <th className="p-2.5 min-w-[200px]">Memory State (Variables)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {steps.map((s, idx) => {
                  const isActive = idx === currentStepIndex;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 dark:bg-cyan-950/50 border-l-4 border-l-indigo-600 dark:border-l-cyan-400 font-semibold'
                          : isLight
                            ? 'hover:bg-slate-50'
                            : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="p-2.5 text-center font-bold">
                        {isActive ? (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px]">
                            #{s.stepNumber}
                          </span>
                        ) : (
                          `#${s.stepNumber}`
                        )}
                      </td>
                      <td className="p-2.5 text-cyan-600 dark:text-cyan-400 font-bold">
                        L{s.lineNumber}
                      </td>
                      <td className="p-2.5 text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        <code>{s.lineContent}</code>
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        {s.explanation}
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(s.variables || {}).map(([vk, vv]) => (
                            <span
                              key={vk}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800"
                            >
                              <strong className="text-indigo-600 dark:text-cyan-400">{vk}:</strong>{' '}
                              {typeof vv === 'object' ? JSON.stringify(vv) : String(vv)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Output Console Log */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Terminal Output Stream</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Step {currentStepIndex + 1} of {steps.length} | Live Output
          </span>
        </div>
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-200 min-h-[70px] max-h-[180px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {(() => {
            const isLastStep = currentStepIndex === steps.length - 1;

            const stdoutLogs = steps
              .slice(0, currentStepIndex + 1)
              .map((s) => s.consoleOutput)
              .filter((out): out is string => Boolean(out && out.trim().length > 0));

            return (
              <div className="space-y-2 text-[11px] font-mono">
                {stdoutLogs.length > 0 && (
                  <div className="space-y-1.5 text-emerald-300 font-semibold">
                    {stdoutLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-500 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(!currentStep?.consoleOutput || currentStep.consoleOutput.trim() === '') && (
                  <div className="text-cyan-300/90 flex items-start space-x-2">
                    <span className="text-cyan-500 select-none">$</span>
                    <div>
                      <span>[Line {currentStep?.lineNumber}]: {currentStep?.lineContent}</span>
                      <span className="text-slate-400 block text-[10.5px] mt-0.5 pl-2 border-l-2 border-cyan-500/30">
                        → {currentStep?.explanation}
                      </span>
                    </div>
                  </div>
                )}

                {(isLastStep || currentStepIndex === steps.length - 1) && dryRunData?.finalOutput && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-emerald-400 font-bold flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-[10px] uppercase tracking-wider text-emerald-300">
                      ✔ Process Finished
                    </span>
                    <span>Result / Output: {dryRunData.finalOutput}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
