import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, Award, RotateCcw, X, ArrowRight, HelpCircle } from 'lucide-react';
import { api, QuizQuestion } from '../api/client';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subjectName: string;
  onQuizCompleted: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  subjectName,
  onQuizCompleted
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load quiz on open
  useEffect(() => {
    if (isOpen && topicId) {
      setLoading(true);
      setError(null);
      setResult(null);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowExplanation(false);
      setTimerSeconds(0);

      api.generateQuiz({ topic_id: topicId, topic_name: topicName, subject_name: subjectName })
        .then(res => {
          setQuestions(res.questions || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Quiz loading failed:', err);
          setError(err.message || 'Failed to load quiz.');
          setLoading(false);
        });
    }
  }, [isOpen, topicId, topicName, subjectName]);

  // Timer interval
  useEffect(() => {
    if (!isOpen || loading || result) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, loading, result]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (index: number) => {
    if (hasAnsweredCurrent) return; // Prevent changing after revealing
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: index }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score and submit
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    let calculatedScore = 0;
    const recordedQuestions = questions.map((q, idx) => {
      const chosen = selectedAnswers[idx];
      const isCorrect = chosen === q.correct_index;
      if (isCorrect) calculatedScore += 1;
      return {
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correct_index],
        user_answer: chosen !== undefined ? q.options[chosen] : 'Unanswered',
        explanation: q.explanation
      };
    });

    try {
      const res = await api.submitQuiz({
        topic_id: topicId,
        score: calculatedScore,
        total_questions: totalQuestions,
        time_taken_seconds: timerSeconds,
        questions: recordedQuestions
      });
      setResult(res);
      onQuizCompleted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <Sparkles className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Preparing Adaptive Quiz...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Generating exam-calibrated questions for <strong>{topicName}</strong>
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-8 text-center">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">Quiz unavailable</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
            >
              Close
            </button>
          </div>
        )}

        {/* Quiz In Progress */}
        {!loading && !error && !result && currentQ && (
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/50">
                  {subjectName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{topicName}</h3>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <div className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
                <span className="font-semibold text-slate-700">
                  Q{currentIndex + 1} / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
              <div
                className="bg-teal-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question prompt */}
            <div className="mb-6">
              <h4 className="text-base sm:text-lg font-medium text-slate-900 leading-snug">
                {currentQ.question}
              </h4>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIndex] === oIdx;
                const isCorrect = currentQ.correct_index === oIdx;

                let optionStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800';

                if (hasAnsweredCurrent) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                  } else {
                    optionStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={hasAnsweredCurrent}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all text-sm flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white/80 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {hasAnsweredCurrent && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {hasAnsweredCurrent && currentQ.explanation && (
              <div className="mt-5 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/60 text-xs sm:text-sm text-teal-900 animate-fade-in">
                <div className="flex items-center space-x-1.5 font-semibold text-teal-800 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Concept Explanation:</span>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next / Finish Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent || isSubmitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'Complete Quiz'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {!loading && result && (
          <div className="py-6 text-center">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg ${
              result.percentage >= 70 ? 'bg-emerald-100 text-emerald-700 shadow-emerald-500/10' :
              result.percentage >= 50 ? 'bg-indigo-100 text-indigo-700 shadow-indigo-500/10' :
              'bg-amber-100 text-amber-700 shadow-amber-500/10'
            }`}>
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Quiz Completed</h3>
            <p className="text-xs text-slate-500 mt-1">Topic: <strong>{topicName}</strong></p>

            {/* Score Ring / Pill */}
            <div className="my-6 inline-flex flex-col items-center p-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-[200px]">
              <span className="text-3xl font-extrabold text-slate-900">
                {result.score} / {result.total_questions}
              </span>
              <span className={`text-sm font-semibold mt-1 ${
                result.percentage >= 70 ? 'text-emerald-600' :
                result.percentage >= 50 ? 'text-indigo-600' : 'text-amber-600'
              }`}>
                {result.percentage}% Score
              </span>
            </div>

            {/* Adaptive Mastery Update Feedback */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200/60 text-xs sm:text-sm text-slate-700 text-left space-y-2 mb-6">
              <div className="flex items-center justify-between font-medium">
                <span>Updated Mastery Level:</span>
                <span className="font-bold text-teal-800">{result.new_mastery}%</span>
              </div>
              <p className="text-xs text-slate-600">
                {result.needs_revision 
                  ? 'Score was below 50%. Pivott marked this topic for revision and will boost its focus level in upcoming schedule re-balancing.' 
                  : 'Great job! High score feeds directly into your topic retention rating and balances out future workload.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              Done & Return to Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
