import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizResponse } from '../types';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Trophy, Award } from 'lucide-react';

interface QuizViewProps {
  quizData: QuizResponse | null;
  theme?: 'dark' | 'light';
}

export const QuizView: React.FC<QuizViewProps> = ({ quizData, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl border text-xs ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800 text-slate-500'
      }`}>
        No quiz available yet. Click "Analyze Code" to generate an interactive self-test.
      </div>
    );
  }

  const questions = quizData.questions;

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (showResults) return; // Locked when submitted
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setShowResults(true);
    const score = calculateScore();
    if (score >= Math.ceil(questions.length / 2)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className={`p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800 text-white'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Self-Assessment</span>
          </div>
          <h3 className={`text-lg font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {quizData.title || 'Code Comprehension Quiz'}
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Answer the questions below to verify your grasp of this code's logic.
          </p>
        </div>

        {/* Score indicator */}
        {showResults && (
          <div className={`flex items-center space-x-3 border px-4 py-2 rounded-xl ${
            isLight
              ? 'bg-slate-50 border-indigo-200'
              : 'bg-slate-900 border-cyan-800'
          }`}>
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Final Score</div>
              <div className={`text-lg font-bold font-mono ${isLight ? 'text-indigo-900' : 'text-cyan-300'}`}>
                {score} / {questions.length} ({percentage}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedIdx = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-900/90 border-slate-800 text-slate-100'
              }`}
            >
              {/* Question text */}
              <div className="flex items-start space-x-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full border font-mono text-xs font-bold shrink-0 ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                }`}>
                  {qIdx + 1}
                </span>
                <h4 className={`text-base font-semibold leading-relaxed ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 pl-9">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  const isCorrect = q.correctAnswerIndex === optIdx;

                  let optionStyle = isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                  if (showResults) {
                    if (isCorrect) {
                      optionStyle = isLight
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-emerald-700 bg-emerald-950/80 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = isLight
                        ? 'border-rose-300 bg-rose-50 text-rose-900 line-through'
                        : 'border-rose-700 bg-rose-950/80 text-rose-200 line-through';
                    } else {
                      optionStyle = isLight
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-800 bg-slate-950/50 text-slate-500';
                    }
                  } else if (isSelected) {
                    optionStyle = isLight
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold shadow-sm'
                      : 'border-cyan-500 bg-cyan-950 text-cyan-200 font-semibold shadow-md shadow-cyan-500/10';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={showResults}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm sm:text-[15px] leading-relaxed transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`font-mono font-semibold w-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>

                      {showResults && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {showResults && (
                <div className="pl-9 pt-2">
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <strong className={isLight ? 'text-indigo-700 font-semibold' : 'text-cyan-400 font-semibold'}>
                      Explanation:{' '}
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Submit / Reset Buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        {showResults ? (
          <button
            onClick={handleReset}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors border ${
              isLight
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border-slate-300'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Submit Answers ({Object.keys(selectedAnswers).length}/{questions.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
