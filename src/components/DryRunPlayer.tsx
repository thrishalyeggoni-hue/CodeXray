import React, { useState, useEffect } from 'react';
import { DryRunResponse, DryRunStep } from '../types';
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
} from 'lucide-react';

interface DryRunPlayerProps {
  dryRunData: DryRunResponse | null;
  onStepChange?: (lineNumber: number) => void;
}

export const DryRunPlayer: React.FC<DryRunPlayerProps> = ({
  dryRunData,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step

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
      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        No dry run trace generated yet. Click "Analyze Code" to simulate execution steps.
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

  return (
    <div className="space-y-4">
      {/* Player Header & Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Interactive Execution Player
            </span>
            <span className="px-2 py-0.5 text-xs font-mono bg-indigo-50 dark:bg-cyan-950 text-indigo-700 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-800/60 rounded-full font-bold">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Speed slider */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span>Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-transparent text-indigo-700 dark:text-cyan-400 font-mono font-bold outline-none cursor-pointer"
            >
              <option value={2000} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">0.5x (Slow)</option>
              <option value={1200} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">1.0x (Normal)</option>
              <option value={600} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">2.0x (Fast)</option>
            </select>
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
            <span>Line {currentStep?.lineNumber} Active</span>
            <span>End (Step {steps.length})</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-1">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md hover:scale-105 transition-all"
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
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Explanation & Variable Watch Split */}
      {currentStep && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Statement & Logic */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Current Executing Statement</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-cyan-900/40 text-xs font-mono text-cyan-300">
              <span className="text-slate-500 mr-2">Line {currentStep.lineNumber}:</span>
              <code>{currentStep.lineContent}</code>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              {currentStep.explanation}
            </p>
          </div>

          {/* Variable Watch Monitor */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Variable Watch Table</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {Object.keys(currentStep.variables || {}).length} variables in scope
              </span>
            </div>

            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
              {Object.keys(currentStep.variables || {}).length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs font-mono">
                  No active local variables.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 font-mono">
                  {Object.entries(currentStep.variables).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-900/50 transition-colors"
                    >
                      <span className="text-slate-400 font-bold">{key}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Output Console */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Output Terminal</span>
          </div>
          <span className="text-[10px] text-slate-500">stdout</span>
        </div>
        <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-200 min-h-[40px] whitespace-pre-wrap">
          {currentStep?.consoleOutput || dryRunData.finalOutput || '$ (No output printed at this step)'}
        </div>
      </div>
    </div>
  );
};
