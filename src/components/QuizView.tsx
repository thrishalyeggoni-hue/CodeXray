import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizResponse } from '../types';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Trophy, Award } from 'lucide-react';

interface QuizViewProps {
  quizData: QuizResponse | null;
}

export const QuizView: React.FC<QuizViewProps> = ({ quizData }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Self-Assessment</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {quizData.title || 'Code Comprehension Quiz'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Answer the 5 questions below to verify your grasp of this code's logic.
          </p>
        </div>

        {/* Score indicator */}
        {showResults && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-cyan-800 px-4 py-2 rounded-xl">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-xs text-slate-400">Final Score</div>
              <div className="text-lg font-bold font-mono text-cyan-300">
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
          const isAnswered = selectedIdx !== undefined;

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg"
            >
              {/* Question text */}
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold shrink-0">
                  {qIdx + 1}
                </span>
                <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pl-9">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  const isCorrect = q.correctAnswerIndex === optIdx;

                  let optionStyle =
                    'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                  if (showResults) {
                    if (isCorrect) {
                      optionStyle =
                        'border-emerald-700 bg-emerald-950/80 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'border-rose-700 bg-rose-950/80 text-rose-200 line-through';
                    } else {
                      optionStyle = 'border-slate-800 bg-slate-950/50 text-slate-500';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-cyan-500 bg-cyan-950 text-cyan-200 font-semibold shadow-md shadow-cyan-500/10';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={showResults}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-500 w-5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>

                      {showResults && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {showResults && (
                <div className="pl-9 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400 font-semibold">Explanation: </strong>
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
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Submit Answers ({Object.keys(selectedAnswers).length}/{questions.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
