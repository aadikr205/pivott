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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const topics = data.revision_topics.slice(0, 4);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-indigo-500/10 rounded-2xl p-3.5 sm:p-5 border border-amber-300/40 shadow-2xs relative overflow-hidden transition-all animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/50">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                High-Yield Buffer Suggestions
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                {data.days_to_exam}d left
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              {data.exam_name || 'Exam'} • High-weightage topics for extra revision
            </p>
          </div>
        </div>

        {/* Toggle Collapse/Expand Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide' : `Show (${topics.length})`}</span>
          <RefreshCw className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Suggested Topics List (Collapsible on mobile, expanded on toggle) */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-1 animate-fade-in">
          {topics.map(topic => (
            <div
              key={topic.topic_id}
              className="bg-white/95 rounded-xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/70">
                      #{topic.rank} Focus
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">
                      {topic.weightage}/5 Weightage
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {topic.topic_name}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {topic.mastery_score}% Mastered
                  </span>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug line-clamp-2">
                {topic.recommended_action}
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100">
                {(onOpenPYQWithTopic || onNavigateToPYQ) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPYQWithTopic) onOpenPYQWithTopic(topic.topic_name);
                      else if (onNavigateToPYQ) onNavigateToPYQ();
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 transition-all cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>PYQs</span>
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
                    className="inline-flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 text-[10px] font-bold border border-violet-200 transition-all cursor-pointer active:scale-95"
                    title="Ask Doubt Bot about this topic"
                  >
                    <Sparkles className="w-3 h-3 text-violet-600 shrink-0" />
                    <span>Ask Bot</span>
                  </button>
                )}

                {onOpenQuizWithTopic && (
                  <button
                    type="button"
                    onClick={() => onOpenQuizWithTopic(topic.topic_id, topic.topic_name)}
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200 transition-all cursor-pointer active:scale-95"
                  >
                    <Award className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span>Quiz</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
