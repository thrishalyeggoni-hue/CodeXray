import React from 'react';
import { Clock, HardDrive, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

interface ComplexityChartProps {
  timeComplexity: string;
  spaceComplexity: string;
  reasoning: string;
  optimizations: string[];
}

export const ComplexityChart: React.FC<ComplexityChartProps> = ({
  timeComplexity = 'O(N)',
  spaceComplexity = 'O(1)',
  reasoning = '',
  optimizations = [],
}) => {
  // Complexity hierarchy map for styling
  const getComplexityBadge = (complexity: string) => {
    const comp = complexity.toUpperCase().replace(/\s/g, '');
    if (comp.includes('O(1)') || comp.includes('O(LOGN)')) {
      return {
        color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
        label: 'Optimal / Excellent',
      };
    }
    if (comp.includes('O(N)') || comp.includes('O(NLOGN)')) {
      return {
        color: 'text-cyan-400 bg-cyan-950/80 border-cyan-800',
        label: 'Moderate / Scalable',
      };
    }
    return {
      color: 'text-rose-400 bg-rose-950/80 border-rose-800',
      label: 'High Overhead / Caution',
    };
  };

  const timeBadge = getComplexityBadge(timeComplexity);
  const spaceBadge = getComplexityBadge(spaceComplexity);

  // Big O reference curves data for visual comparison
  const curves = [
    { name: 'O(1)', label: 'Constant', score: '99%', status: 'Best' },
    { name: 'O(log N)', label: 'Logarithmic', score: '90%', status: 'Great' },
    { name: 'O(N)', label: 'Linear', score: '70%', status: 'Good' },
    { name: 'O(N log N)', label: 'Linearithmic', score: '50%', status: 'Fair' },
    { name: 'O(N²)', label: 'Quadratic', score: '25%', status: 'Slow' },
  ];

  return (
    <div className="space-y-6">
      {/* Time & Space Metrics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Complexity Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Time Complexity</span>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${timeBadge.color}`}>
              {timeBadge.label}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300 tracking-tight">
            {timeComplexity}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Measures how execution time scales as input size N grows.
          </p>
        </div>

        {/* Space Complexity Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <span>Space Complexity</span>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${spaceBadge.color}`}>
              {spaceBadge.label}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-300 tracking-tight">
            {spaceComplexity}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Measures additional RAM allocated on stack/heap memory.
          </p>
        </div>
      </div>

      {/* Complexity Reasoning */}
      {reasoning && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Algorithmic Runtime Proof</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {reasoning}
          </p>
        </div>
      )}

      {/* Big-O Spectrum Reference Chart */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Big-O Efficiency Spectrum Comparison</span>
          <span className="text-slate-500 font-mono">Input Size N Scaling</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {curves.map((item) => {
            const isMatch =
              timeComplexity.toUpperCase().includes(item.name) ||
              spaceComplexity.toUpperCase().includes(item.name);
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span className={`font-bold ${isMatch ? 'text-cyan-400' : ''}`}>
                    {item.name} ({item.label})
                  </span>
                  <span className="text-slate-500">{item.status}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMatch
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                        : 'bg-slate-800'
                    }`}
                    style={{ width: item.score }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimizations */}
      {optimizations.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-amber-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Recommended Optimizations & Performance Boosts</span>
          </div>
          <ul className="space-y-2">
            {optimizations.map((opt, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
