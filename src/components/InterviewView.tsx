import React, { useState } from 'react';
import { InterviewResponse, InterviewQuestion } from '../types';
import { MessagesSquare, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InterviewViewProps {
  interviewData: InterviewResponse | null;
}

export const InterviewView: React.FC<InterviewViewProps> = ({ interviewData }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!interviewData || !interviewData.questions || interviewData.questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
        No interview prep generated yet. Click "Analyze Code" to prepare technical interview questions.
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'HR/Behavioral':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Follow-up':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Edge Case':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl space-y-1">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <MessagesSquare className="w-4 h-4" />
          <span>Technical Interview Simulator & Answer Key</span>
        </div>
        <h3 className="text-lg font-bold text-white">
          Topic: {interviewData.topic || 'Algorithmic Problem Solving'}
        </h3>
        <p className="text-xs text-slate-400">
          Review questions that hiring managers and tech interviewers ask for this exact code structure.
        </p>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {interviewData.questions.map((q: InterviewQuestion, idx: number) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id || idx}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg transition-all"
            >
              {/* Question Bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 cursor-pointer hover:bg-slate-800/50 flex items-start justify-between gap-3 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${getCategoryBadge(
                        q.category
                      )}`}
                    >
                      {q.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Question {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </h4>
                </div>

                <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Collapsible Answer & Hints Area */}
              {isExpanded && (
                <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4 text-xs text-slate-300">
                  {/* Hints */}
                  {q.hints && q.hints.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>Interview Hints to Keep in Mind</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                        {q.hints.map((hint, hIdx) => (
                          <li key={hIdx}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sample Answer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Model Candidate Answer</span>
                    </div>
                    <p className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 leading-relaxed text-slate-200">
                      {q.sampleAnswer}
                    </p>
                  </div>

                  {/* Key points to mention */}
                  {q.keyPointsToMention && q.keyPointsToMention.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                        Must-Mention Keywords for Extra Marks:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {q.keyPointsToMention.map((point, pIdx) => (
                          <span
                            key={pIdx}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-cyan-800/60 rounded-lg text-cyan-300 text-[11px]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>{point}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
