import React, { useState, useEffect } from 'react';
import { Sparkles, Award, ArrowRight, BookOpen, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { api, RevisionSuggestionsResponse } from '../api/client';

interface RevisionSuggestionBannerProps {
  onOpenPYQWithTopic?: (topicName: string) => void;
  onOpenQuizWithTopic?: (topicId: string, topicName: string) => void;
  onNavigateToPYQ?: () => void;
  onOpenDoubtBot?: (context?: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

export const RevisionSuggestionBanner: React.FC<RevisionSuggestionBannerProps> = ({
  onOpenPYQWithTopic,
  onOpenQuizWithTopic,
  onNavigateToPYQ,
  onOpenDoubtBot
}) => {
  const [data, setData] = useState<RevisionSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getRevisionSuggestions()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Revision suggestions error:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data || !data.revision_topics || data.revision_topics.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-indigo-500/10 rounded-3xl p-5 sm:p-6 border border-amber-300/40 shadow-sm relative overflow-hidden space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>High-Yield Buffer & Revision Suggestions</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                {data.days_to_exam} Days to Exam
              </span>
            </h3>
            <p className="text-[11px] text-slate-600">
              Exam: <strong>{data.exam_name || 'Target Exam'}</strong> — Remaining time before exam is auto-utilized for high-weightage topics & PYQs
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Topics List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.revision_topics.slice(0, 4).map(topic => (
          <div
            key={topic.topic_id}
            className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  Rank #{topic.rank} High-Yield Focus
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {topic.topic_name}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-amber-600">{topic.weightage}/5 Focus</span>
                <span className="block text-[10px] text-slate-500 font-medium">Mastery: {topic.mastery_score}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              {topic.recommended_action}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              {(onOpenPYQWithTopic || onNavigateToPYQ) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPYQWithTopic) onOpenPYQWithTopic(topic.topic_name);
                    else if (onNavigateToPYQ) onNavigateToPYQ();
                  }}
                  className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-all cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-3 h-3 text-teal-600" />
                  <span>Solve 10-Yr PYQs</span>
                </button>
              )}

              {onOpenDoubtBot && (
                <button
                  type="button"
                  onClick={() => onOpenDoubtBot({
                    topic: topic.topic_name,
                    subject: topic.subject_name || 'General',
                    doubt: `Please explain the key formulas and high-weightage concepts for ${topic.topic_name}.`
                  })}
                  className="inline-flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 text-[11px] font-bold border border-violet-200 transition-all cursor-pointer active:scale-95"
                  title="Ask Doubt Bot about this topic"
                >
                  <Sparkles className="w-3 h-3 text-violet-600" />
                  <span>Ask Bot</span>
                </button>
              )}

              {onOpenQuizWithTopic && (
                <button
                  type="button"
                  onClick={() => onOpenQuizWithTopic(topic.topic_id, topic.topic_name)}
                  className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition-all cursor-pointer active:scale-95"
                >
                  <Award className="w-3 h-3 text-indigo-600" />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
