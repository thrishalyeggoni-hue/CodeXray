import React from 'react';
import { Clock, HardDrive, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

interface ComplexityChartProps {
  timeComplexity: string;
  spaceComplexity: string;
  reasoning: string;
  optimizations: string[];
  theme?: 'dark' | 'light';
}

export const ComplexityChart: React.FC<ComplexityChartProps> = ({
  timeComplexity = 'O(N)',
  spaceComplexity = 'O(1)',
  reasoning = '',
  optimizations = [],
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // Complexity hierarchy map for styling
  const getComplexityBadge = (complexity: string) => {
    const comp = complexity.toUpperCase().replace(/\s/g, '');
    if (comp.includes('O(1)') || comp.includes('O(LOGN)')) {
      return {
        color: isLight
          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
        label: 'Optimal / Excellent',
      };
    }
    if (comp.includes('O(N)') || comp.includes('O(NLOGN)')) {
      return {
        color: isLight
          ? 'text-indigo-800 bg-indigo-50 border-indigo-200'
          : 'text-cyan-400 bg-cyan-950/80 border-cyan-800',
        label: 'Moderate / Scalable',
      };
    }
    return {
      color: isLight
        ? 'text-rose-800 bg-rose-50 border-rose-200'
        : 'text-rose-400 bg-rose-950/80 border-rose-800',
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
        <div className={`p-5 rounded-2xl border shadow-sm space-y-3 relative overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm font-semibold ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <Clock className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span>Time Complexity</span>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${timeBadge.color}`}>
              {timeBadge.label}
            </span>
          </div>
          <div className={`text-3xl font-extrabold font-mono tracking-tight ${
            isLight ? 'text-indigo-950' : 'text-cyan-300'
          }`}>
            {timeComplexity}
          </div>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Measures how execution time scales as input size N grows.
          </p>
        </div>

        {/* Space Complexity Card */}
        <div className={`p-5 rounded-2xl border shadow-sm space-y-3 relative overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-sm font-semibold ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Space Complexity</span>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${spaceBadge.color}`}>
              {spaceBadge.label}
            </span>
          </div>
          <div className={`text-3xl font-extrabold font-mono tracking-tight ${
            isLight ? 'text-purple-950' : 'text-purple-300'
          }`}>
            {spaceComplexity}
          </div>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Measures additional RAM allocated on stack/heap memory.
          </p>
        </div>
      </div>

      {/* Complexity Reasoning */}
      {reasoning && (
        <div className={`p-4 rounded-xl border space-y-2 ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Algorithmic Runtime Proof</span>
          </div>
          <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            {reasoning}
          </p>
        </div>
      )}

      {/* Big-O Spectrum Reference Chart */}
      <div className={`p-5 rounded-xl border space-y-4 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-950 border-slate-800 text-slate-300'
      }`}>
        <div className={`flex items-center justify-between text-xs font-semibold ${
          isLight ? 'text-slate-800' : 'text-slate-300'
        }`}>
          <span>Big-O Efficiency Spectrum Comparison</span>
          <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Input Size N Scaling</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {curves.map((item) => {
            const isMatch =
              timeComplexity.toUpperCase().includes(item.name) ||
              spaceComplexity.toUpperCase().includes(item.name);
            return (
              <div key={item.name} className="space-y-1">
                <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span className={`font-bold ${
                    isMatch ? (isLight ? 'text-indigo-700' : 'text-cyan-400') : ''
                  }`}>
                    {item.name} ({item.label})
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>{item.status}</span>
                </div>
                <div className={`w-full rounded-full h-2 overflow-hidden border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMatch
                        ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-indigo-500'
                        : isLight ? 'bg-slate-300' : 'bg-slate-800'
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
        <div className={`p-5 rounded-xl border space-y-3 ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-slate-900/90 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center space-x-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Recommended Optimizations & Performance Boosts</span>
          </div>
          <ul className="space-y-2">
            {optimizations.map((opt, idx) => (
              <li
                key={idx}
                className={`flex items-start space-x-2 text-xs leading-relaxed p-2.5 rounded-lg border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
