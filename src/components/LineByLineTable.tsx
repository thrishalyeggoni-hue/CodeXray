import React from 'react';
import { LineExplanation } from '../types';
import { Layers, ArrowRight, Zap, Lightbulb } from 'lucide-react';

interface LineByLineTableProps {
  lines: LineExplanation[];
  highlightLine?: number;
}

export const LineByLineTable: React.FC<LineByLineTableProps> = ({
  lines,
  highlightLine,
}) => {
  if (!lines || lines.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#0e0e10] rounded-xl border border-white/5 text-xs">
        No line breakdown available. Click "Analyze Code" to generate.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Line-by-Line Execution Breakdown</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {lines.length} statement lines
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0d0d0f] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0e0e10] text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-4 w-5/12">Code Statement</th>
                <th className="py-2.5 px-4">Line Analysis & Scope Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {lines.map((line) => {
                const isHighlighted = highlightLine === line.lineNumber;
                return (
                  <tr
                    key={line.lineNumber}
                    className={`transition-colors duration-150 ${
                      isHighlighted
                        ? 'bg-indigo-500/15 border-l-2 border-l-indigo-400 text-indigo-100'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    {/* Line number */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-black/20">
                      {line.lineNumber}
                    </td>

                    {/* Code */}
                    <td className="py-2.5 px-4 font-mono font-medium text-indigo-300 overflow-x-auto whitespace-pre">
                      <code>{line.code}</code>
                    </td>

                    {/* Explanation & Variable Mutation */}
                    <td className="py-2.5 px-4 font-sans text-xs text-slate-300 leading-relaxed">
                      <div className="flex items-start space-x-2">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                        <span>{line.explanation}</span>
                      </div>
                      {line.variableChanges && (
                        <div className="mt-1 flex items-center space-x-1.5 text-[10px] text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded w-fit font-mono">
                          <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{line.variableChanges}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
