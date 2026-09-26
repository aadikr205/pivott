import React, { useState } from 'react';
import { CheckCircle2, Clock, Play, Pause, RotateCcw, BookOpen, Sparkles, AlertTriangle, Check, Award, Eye, Tv } from 'lucide-react';
import { TodayScheduleResponse, TopicItem } from '../api/client';
import { BacklogBanner } from './BacklogBanner';
import { RevisionSuggestionBanner } from './RevisionSuggestionBanner';

interface TodayViewProps {
  todayData: TodayScheduleResponse | null;
  loading: boolean;
  onMarkProgress: (topicId: string, status: string, minutesDone: number) => Promise<void>;
  onOpenQuiz: (topicId: string, topicName: string, subjectName: string) => void;
  onReplan: () => void;
  isReplanning: boolean;
  onNavigateToPYQ?: () => void;
  onOpenDoubtBot?: (context?: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
  onOpenConceptVideo?: (topicId: string, topicName: string, subjectName: string) => void;
  onNavigateToNotes?: (topicName?: string, subjectName?: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayData,
  loading,
  onMarkProgress,
  onOpenQuiz,
  onReplan,
  isReplanning,
  onNavigateToPYQ,
  onOpenDoubtBot,
  onOpenConceptVideo,
  onNavigateToNotes
}) => {
  const [activeTimerTopicId, setActiveTimerTopicId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [partialModalTopic, setPartialModalTopic] = useState<TopicItem | null>(null);
  const [partialMinutesInput, setPartialMinutesInput] = useState('45');

  // Study timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = (topicId: string) => {
    if (activeTimerTopicId === topicId) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerTopicId(topicId);
      setTimerSeconds(0);
      setIsTimerRunning(true);
    }
  };

  const stopAndSaveTimer = async (topicId: string) => {
    setIsTimerRunning(false);
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    await onMarkProgress(topicId, 'in_progress', minutes);
    setActiveTimerTopicId(null);
    setTimerSeconds(0);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading || !todayData) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading today's realistic plan...</p>
      </div>
    );
  }

  const plannedItems = todayData.planned_items || [];
  const completedCount = plannedItems.filter(p => p.current_status === 'done').length;
  const totalCount = plannedItems.length;
  const allocatedHours = (todayData.total_allocated_minutes / 60).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Smart Buffer & Early Completion Revision Suggestion Banner */}
      <RevisionSuggestionBanner
        onNavigateToPYQ={onNavigateToPYQ}
        onOpenDoubtBot={onOpenDoubtBot}
      />

      {/* Backlog Banner if incomplete work exists */}
      {todayData.has_backlog && (
        <BacklogBanner
          backlogCount={todayData.backlog_count}
          backlogMinutes={todayData.backlog_minutes}
          maxDailyHours={todayData.max_daily_hours}
          onReplan={onReplan}
          isReplanning={isReplanning}
        />
      )}

      {/* Dedicated Revision Day Banner */}
      {(todayData.is_revision_day || plannedItems.some(p => p.is_revision)) && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/30 text-purple-200 border border-purple-400/40 uppercase tracking-wider">
                    {todayData.revision_type === 'final_sprint' ? '10-Yr PYQ Sprint' : 'Periodic Revision Day'}
                  </span>
                  <span className="text-xs text-purple-200/70">Consolidation Mode</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {todayData.revision_type === 'final_sprint'
                    ? 'Exam Readiness: 10-Yr PYQs & Formula Revision'
                    : 'Active Recall & Chapter Revision Day'}
                </h2>
                <p className="text-xs text-purple-200/90 mt-1 max-w-xl leading-relaxed">
                  Pichle padhe gaye chapters ke formulas revise karo aur previous 10 years ke questions practice karo taaki exam tak retention strong rahe.
                </p>
              </div>
            </div>

            {onNavigateToPYQ && (
              <button
                type="button"
                onClick={onNavigateToPYQ}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Solve PYQs</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Today's Mission Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                Today's Focus
              </span>
              <span className="text-xs text-slate-400 font-mono">{todayData.date}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Daily Study Targets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {todayData.micro_copy || "Planned to protect your high-priority topics without burning you out."}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">Scheduled Time</div>
              <div className="text-base font-bold text-slate-900">
                {allocatedHours}h <span className="text-xs font-normal text-slate-500">/ {todayData.max_daily_hours}h cap</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200/60 text-center">
              <div className="text-xs text-teal-600">Completion</div>
              <div className="text-base font-bold text-teal-800">
                {completedCount} / {totalCount}
              </div>
            </div>
          </div>
        </div>

        {/* List of Today's Planned Topics */}
        <div className="mt-6 space-y-3.5">
          {plannedItems.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No study topics scheduled for today.</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy your off-day or buffer revision time!</p>
            </div>
          ) : (
            plannedItems.map((item, idx) => {
              const isDone = item.current_status === 'done';
              const isMissed = item.current_status === 'missed';
              const isSkim = item.status === 'skim_only';
              const isTiming = activeTimerTopicId === item.topic_id;

              return (
                <div
                  key={item.topic_id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200/80 shadow-none'
                      : isMissed
                      ? 'bg-amber-50/30 border-amber-200'
                      : item.is_revision
                      ? 'bg-purple-50/30 border-purple-200 hover:border-purple-300 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-teal-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start space-x-3.5">
                      <button
                        onClick={() => onMarkProgress(item.topic_id, isDone ? 'in_progress' : 'done', item.allocated_minutes)}
                        className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'border-slate-300 hover:border-teal-500 bg-white text-transparent'
                        }`}
                        title={isDone ? 'Mark in-progress' : 'Mark as done'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.subject_name || 'Subject'}
                          </span>

                          {/* Focus level / weightage badge */}
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Focus Level: {item.weightage}/5
                          </span>

                          {/* Revision indicator */}
                          {item.is_revision && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
                              <RotateCcw className="w-3 h-3" />
                              <span>{item.revision_type === 'final_sprint' ? '10-Yr PYQ Sprint' : 'Chapter Revision'}</span>
                            </span>
                          )}

                          {/* Skim only indicator */}
                          {isSkim && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>Quick Skim (30% time)</span>
                            </span>
                          )}

                          {/* Mastery indicator if tested */}
                          {item.mastery_score > 0 && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              Mastery: {item.mastery_score}%
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base font-semibold mt-1.5 ${
                          isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}>
                          {item.topic_name}
                        </h3>

                        {item.revision_note && (
                          <p className="text-xs text-purple-700 font-medium mt-1 flex items-center gap-1">
                            <span>💡</span>
                            <span>{item.revision_note}</span>
                          </p>
                        )}

                        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center space-x-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.allocated_minutes} mins planned</span>
                          </span>
                          {item.minutes_done && item.minutes_done > 0 && (
                            <span className="text-teal-600 font-medium font-mono">
                              ({item.minutes_done} mins logged)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Active Stopwatch */}
                      <div className="flex items-center space-x-1.5 mr-1">
                        <button
                          onClick={() => toggleTimer(item.topic_id)}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isTiming && isTimerRunning
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isTiming && isTimerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-rose-600" />
                              <span>{formatTimer(timerSeconds)}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-teal-600" />
                              <span>{isTiming ? 'Resume' : 'Timer'}</span>
                            </>
                          )}
                        </button>

                        {isTiming && (
                          <button
                            onClick={() => stopAndSaveTimer(item.topic_id)}
                            className="text-[11px] font-medium px-2 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200"
                            title="Save studied time"
                          >
                            Save
                          </button>
                        )}
                      </div>

                      {/* Take Quiz Button */}
                      <button
                        onClick={() => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Take Quiz</span>
                      </button>

                      {/* Partial progress button */}
                      <button
                        onClick={() => {
                          setPartialModalTopic(item);
                          setPartialMinutesInput(String(Math.round(item.allocated_minutes / 2)));
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        Partial...
                      </button>

                      {/* Missed button */}
                      <button
                        onClick={() => onMarkProgress(item.topic_id, 'missed', 0)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          isMissed
                            ? 'bg-amber-100 text-amber-900 font-semibold'
                            : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        Missed
                      </button>
                    </div>
                  </div>

                  {/* 3-Step Topic Learning Sequence (Feature 8) */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        3-Step Track:
                      </span>

                      {/* Step 1: Concept Notes */}
                      <button
                        onClick={() => {
                          if (onNavigateToNotes) onNavigateToNotes(item.topic_name, item.subject_name);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all cursor-pointer"
                        title="Step 1: Read Chapter Notes & Visual Diagram"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>1. Concept Notes</span>
                      </button>

                      {/* Step 2: Interactive Concept Video */}
                      <button
                        onClick={() => {
                          if (onOpenConceptVideo) onOpenConceptVideo(item.topic_id, item.topic_name, item.subject_name);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition-all cursor-pointer shadow-xs"
                        title="Step 2: Watch Narrated Concept Video Slideshow"
                      >
                        <Tv className="w-3.5 h-3.5 text-teal-600" />
                        <span>2. Concept Video</span>
                      </button>

                      {/* Step 3: 10-Question Post-Video Quiz */}
                      <button
                        onClick={() => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all cursor-pointer"
                        title="Step 3: Immediate 10-Question Retention Quiz"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>3. Post-Video Quiz</span>
                      </button>
                    </div>

                    {item.mastery_score >= 70 && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Mastery Confirmed ({item.mastery_score}%)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* End of day prompt banner */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            End of day? Marking topics helps Pivott spot any backlog and re-plan instantly.
          </p>

          <button
            onClick={onReplan}
            disabled={isReplanning}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{isReplanning ? 'Recalculating...' : 'Re-Check & Re-Balance'}</span>
          </button>
        </div>
      </div>

      {/* Partial Progress Modal */}
      {partialModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Log Partial Study</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              How many minutes did you spend on <strong>{partialModalTopic.topic_name}</strong>?
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">Minutes Studied:</label>
              <input
                type="number"
                min="5"
                max="600"
                value={partialMinutesInput}
                onChange={e => setPartialMinutesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setPartialModalTopic(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const mins = Number(partialMinutesInput) || 30;
                  await onMarkProgress(partialModalTopic.topic_id, 'in_progress', mins);
                  setPartialModalTopic(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
