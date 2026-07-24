import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Layers, ArrowRight, Eye, Sparkles, Hash } from 'lucide-react';

interface StackFrameAnimatorProps {
  variables: Record<string, any>;
  lineNumber: number;
  lineContent: string;
  theme?: 'dark' | 'light';
}

interface ArrayMemory {
  varName: string;
  elements: Array<{ index: number; value: any }>;
}

interface PointerConnection {
  varName: string;
  value: number;
  arrayVarName: string;
  color: string;
}

const POINTER_COLORS = [
  '#38bdf8', // cyan
  '#a855f7', // purple
  '#34d399', // emerald
  '#f43f5e', // rose
  '#fbbf24', // amber
  '#818cf8', // indigo
];

export const StackFrameAnimator: React.FC<StackFrameAnimatorProps> = ({
  variables = {},
  lineNumber,
  lineContent,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const arrayRefs = useRef<Record<string, Record<number, HTMLDivElement | null>>>({});

  const [hoveredPointer, setHoveredPointer] = useState<string | null>(null);
  const [svgLines, setSvgLines] = useState<
    Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      label: string;
      targetValue: any;
    }>
  >([]);

  // 1. Identify Arrays vs Primitive Stack Frame Variables
  const { arrays, primitives, pointers } = useMemo(() => {
    const arrs: ArrayMemory[] = [];
    const prims: Array<{ key: string; val: any; isPointer: boolean }> = [];
    const ptrs: PointerConnection[] = [];

    let colorIdx = 0;

    Object.entries(variables).forEach(([key, value]) => {
      let parsedVal = value;
      if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
        try {
          parsedVal = JSON.parse(value);
        } catch {
          // keep as string
        }
      }

      if (Array.isArray(parsedVal)) {
        arrs.push({
          varName: key,
          elements: parsedVal.map((v, idx) => ({ index: idx, value: v })),
        });
      } else {
        const numVal = Number(value);
        const isNum = !isNaN(numVal) && typeof value !== 'boolean' && value !== null;

        prims.push({
          key,
          val: value,
          isPointer: isNum,
        });
      }
    });

    // Match pointers to array indices if array exists
    if (arrs.length > 0) {
      const primaryArray = arrs[0];
      prims.forEach((p) => {
        if (p.isPointer) {
          const idxVal = Number(p.val);
          if (idxVal >= 0 && idxVal < primaryArray.elements.length) {
            ptrs.push({
              varName: p.key,
              value: idxVal,
              arrayVarName: primaryArray.varName,
              color: POINTER_COLORS[colorIdx % POINTER_COLORS.length],
            });
            colorIdx++;
          }
        }
      });
    }

    return { arrays: arrs, primitives: prims, pointers: ptrs };
  }, [variables]);

  // 2. Measure DOM coordinates to draw dynamic SVG connection curves
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current || pointers.length === 0) {
        setSvgLines([]);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: typeof svgLines = [];

      pointers.forEach((ptr) => {
        const pointerEl = document.getElementById(`stack-var-${ptr.varName}`);
        const targetArrayEl = arrayRefs.current[ptr.arrayVarName]?.[ptr.value];

        if (pointerEl && targetArrayEl) {
          const pRect = pointerEl.getBoundingClientRect();
          const tRect = targetArrayEl.getBoundingClientRect();

          const x1 = pRect.right - containerRect.left;
          const y1 = pRect.top + pRect.height / 2 - containerRect.top;

          const x2 = tRect.left + tRect.width / 2 - containerRect.left;
          const y2 = tRect.top - containerRect.top;

          const arrayTargetVal = arrays.find((a) => a.varName === ptr.arrayVarName)?.elements[ptr.value]?.value;

          newLines.push({
            id: ptr.varName,
            x1,
            y1,
            x2,
            y2,
            color: ptr.color,
            label: `${ptr.varName} = ${ptr.value}`,
            targetValue: arrayTargetVal,
          });
        }
      });

      setSvgLines(newLines);
    };

    const timer = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [variables, pointers, arrays]);

  return (
    <div
      ref={containerRef}
      className={`relative p-5 rounded-2xl border transition-all overflow-hidden ${
        isLight
          ? 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border-slate-200/80 text-slate-800 shadow-lg'
          : 'bg-gradient-to-br from-[#0c0c10] via-[#09090e] to-[#120f1d] border-white/10 text-slate-100 shadow-xl'
      }`}
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-500/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              Interactive Stack Frame & Pointer Animator
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Line {lineNumber}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
              {lineContent || 'Execution Step Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SVG Memory Mesh</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas Overlay for Dynamic Lines */}
      {svgLines.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {svgLines.map((line) => {
            const isHovered = hoveredPointer === line.id;
            // Cubic bezier curve calculation
            const controlX1 = line.x1 + (line.x2 - line.x1) * 0.5;
            const controlY1 = line.y1;
            const controlX2 = line.x1 + (line.x2 - line.x1) * 0.5;
            const controlY2 = line.y2;

            const pathD = `M ${line.x1} ${line.y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${line.x2} ${line.y2}`;

            return (
              <g key={line.id}>
                {/* Glow shadow line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={isHovered ? 5 : 3}
                  strokeOpacity={0.4}
                  filter="url(#glow)"
                />
                {/* Main animated line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeDasharray="6,4"
                  className="animate-[dash_10s_linear_infinite]"
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Grid Layout: Left Stack Frame | Right Heap Memory Arrays */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        {/* Left Col: Function Stack Frame Card (md:col-span-4) */}
        <div
          ref={stackRef}
          className={`md:col-span-4 p-4 rounded-xl border flex flex-col space-y-3 ${
            isLight
              ? 'bg-white/90 border-indigo-200/80 shadow-md'
              : 'bg-[#101016]/90 border-indigo-500/20 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Call Stack Frame</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
              locals()
            </span>
          </div>

          <div className="space-y-2">
            {primitives.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-xs font-mono">
                No active stack variables.
              </div>
            ) : (
              primitives.map((prim) => {
                const ptrObj = pointers.find((p) => p.varName === prim.key);
                const isHovered = hoveredPointer === prim.key;

                return (
                  <motion.div
                    key={prim.key}
                    id={`stack-var-${prim.key}`}
                    onMouseEnter={() => setHoveredPointer(prim.key)}
                    onMouseLeave={() => setHoveredPointer(null)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      ptrObj
                        ? isLight
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-sm'
                          : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 shadow-lg shadow-indigo-950/30'
                        : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="font-mono text-xs font-bold">{prim.key}</span>
                      {ptrObj && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-300">
                          PTR → [{ptrObj.value}]
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      {String(prim.val)}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Heap Memory & Array Slots (md:col-span-8) */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Heap Memory & Array Inspection</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Indexed Memory Blocks
            </span>
          </div>

          {arrays.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center font-mono text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              No dynamic arrays or collections detected in current frame.
            </div>
          ) : (
            arrays.map((arr) => (
              <div
                key={arr.varName}
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight
                    ? 'bg-white/90 border-slate-200 shadow-sm'
                    : 'bg-[#101016]/90 border-white/10 shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    {arr.varName}
                    <span className="text-[10px] text-slate-500">({arr.elements.length} slots)</span>
                  </span>
                </div>

                {/* Array Memory Boxes Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {arr.elements.map((el) => {
                    const pointingVars = pointers.filter(
                      (p) => p.arrayVarName === arr.varName && p.value === el.index
                    );
                    const isTargeted = pointingVars.length > 0;

                    return (
                      <div
                        key={el.index}
                        ref={(node) => {
                          if (!arrayRefs.current[arr.varName]) {
                            arrayRefs.current[arr.varName] = {};
                          }
                          arrayRefs.current[arr.varName][el.index] = node;
                        }}
                        className="relative flex flex-col items-center"
                      >
                        {/* Pointer badges above slot */}
                        <div className="min-h-[22px] flex flex-wrap justify-center gap-1 mb-1">
                          {pointingVars.map((p) => (
                            <motion.span
                              key={p.varName}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-md text-white bg-gradient-to-r from-indigo-500 to-cyan-500 border border-cyan-300/40"
                            >
                              {p.varName} ↓
                            </motion.span>
                          ))}
                        </div>

                        {/* Element Box */}
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${
                            isTargeted
                              ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                              : isLight
                                ? 'bg-slate-100 border-slate-300 text-slate-800'
                                : 'bg-white/5 border-white/15 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{String(el.value)}</span>
                        </motion.div>

                        {/* Index label below slot */}
                        <span className="text-[10px] font-mono text-slate-500 mt-1">
                          [{el.index}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
