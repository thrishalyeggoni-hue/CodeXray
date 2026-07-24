import React, { useState } from 'react';
import { InterviewResponse, InterviewQuestion } from '../types';
import { MessagesSquare, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InterviewViewProps {
  interviewData: InterviewResponse | null;
  theme?: 'dark' | 'light';
}

export const InterviewView: React.FC<InterviewViewProps> = ({ interviewData, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!interviewData || !interviewData.questions || interviewData.questions.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl border text-xs ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800 text-slate-500'
      }`}>
        No interview prep generated yet. Click "Analyze Code" to prepare technical interview questions.
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryBadge = (category: string) => {
    if (isLight) {
      switch (category) {
        case 'Technical':
          return 'bg-indigo-50 text-indigo-800 border-indigo-200';
        case 'HR/Behavioral':
          return 'bg-purple-50 text-purple-800 border-purple-200';
        case 'Follow-up':
          return 'bg-amber-50 text-amber-800 border-amber-200';
        case 'Edge Case':
          return 'bg-rose-50 text-rose-800 border-rose-200';
        default:
          return 'bg-slate-100 text-slate-800 border-slate-200';
      }
    }
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
      <div className={`p-5 rounded-2xl border shadow-md space-y-1 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <MessagesSquare className="w-4 h-4" />
          <span>Technical Interview Simulator & Answer Key</span>
        </div>
        <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Topic: {interviewData.topic || 'Algorithmic Problem Solving'}
        </h3>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
              className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-900/90 border-slate-800 text-slate-100'
              }`}
            >
              {/* Question Bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                className={`p-4 cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold uppercase rounded-full border ${getCategoryBadge(
                        q.category
                      )}`}
                    >
                      {q.category}
                    </span>
                    <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Question {idx + 1}
                    </span>
                  </div>
                  <h4 className={`text-base font-semibold leading-relaxed ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {q.question}
                  </h4>
                </div>

                <button className={`p-2 transition-colors shrink-0 ${
                  isLight ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-400 hover:text-cyan-400'
                }`}>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Collapsible Answer & Hints Area */}
              {isExpanded && (
                <div className={`p-5 border-t space-y-4 text-sm ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  {/* Hints */}
                  {q.hints && q.hints.length > 0 && (
                    <div className={`p-3.5 rounded-xl border space-y-2 ${
                      isLight
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-amber-950/30 border-amber-800/40 text-slate-300'
                    }`}>
                      <div className="flex items-center space-x-1.5 font-semibold text-amber-800 dark:text-amber-300 text-sm">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Interview Hints to Keep in Mind</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 pl-1 text-sm leading-relaxed">
                        {q.hints.map((hint, hIdx) => (
                          <li key={hIdx}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sample Answer */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Model Candidate Answer</span>
                    </div>
                    <p className={`p-4 rounded-xl border text-sm sm:text-[15px] leading-relaxed ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                      {q.sampleAnswer}
                    </p>
                  </div>

                  {/* Key points to mention */}
                  {q.keyPointsToMention && q.keyPointsToMention.length > 0 && (
                    <div className="space-y-2">
                      <span className={`font-semibold uppercase tracking-wider text-[11px] ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        Must-Mention Keywords for Extra Marks:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {q.keyPointsToMention.map((point, pIdx) => (
                          <span
                            key={pIdx}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] border ${
                              isLight
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                : 'bg-slate-900 border-cyan-800/60 text-cyan-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
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
