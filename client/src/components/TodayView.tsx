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
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Next recommended task: active timing topic OR first uncompleted topic
  const nextTask = (activeTimerTopicId 
    ? plannedItems.find(p => p.topic_id === activeTimerTopicId) 
    : null) || plannedItems.find(p => p.current_status !== 'done');

  // Remaining uncompleted tasks (excluding nextTask)
  const remainingTasks = plannedItems.filter(p => p.current_status !== 'done' && p.topic_id !== nextTask?.topic_id);

  // Completed tasks
  const completedTasks = plannedItems.filter(p => p.current_status === 'done' && p.topic_id !== nextTask?.topic_id);

  // Render a compact, scannable study card
  const renderTopicCard = (item: TopicItem, isHero = false) => {
    const isDone = item.current_status === 'done';
    const isMissed = item.current_status === 'missed';
    const isSkim = item.status === 'skim_only';
    const isTiming = activeTimerTopicId === item.topic_id;

    return (
      <div
        key={item.topic_id}
        className={`rounded-2xl border transition-all ${
          isHero
            ? isTiming && isTimerRunning
              ? 'p-4 sm:p-5 bg-gradient-to-br from-teal-500/15 via-indigo-500/10 to-white border-2 border-teal-500 shadow-md ring-2 ring-teal-400/20'
              : 'p-4 sm:p-5 bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/60 border-2 border-teal-400/60 shadow-xs'
            : isDone
            ? 'p-3.5 sm:p-4 bg-emerald-50/40 border-emerald-200/70 shadow-none'
            : isMissed
            ? 'p-3.5 sm:p-4 bg-amber-50/30 border-amber-200/80 shadow-2xs'
            : item.is_revision
            ? 'p-3.5 sm:p-4 bg-purple-50/30 border-purple-200 hover:border-purple-300 shadow-2xs'
            : 'p-3.5 sm:p-4 bg-white border-slate-200/80 hover:border-teal-200/80 shadow-2xs'
        }`}
      >
        {/* Next Task Highlight Header */}
        {isHero && (
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-teal-200/50">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isTiming && isTimerRunning ? 'bg-rose-500 animate-ping' : 'bg-teal-600'}`} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-teal-800">
                {isTiming && isTimerRunning ? 'Now Studying' : 'Next Recommended Task'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Focus {item.weightage}/5
            </span>
          </div>
        )}

        {/* Top Meta Line: Subject first, weightage, badges, and planned time */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2.5 min-w-0">
            {/* Mark Done Checkbox Button */}
            <button
              type="button"
              onClick={() => onMarkProgress(item.topic_id, isDone ? 'in_progress' : 'done', item.allocated_minutes)}
              className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                isDone
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'border-slate-300 hover:border-teal-500 bg-white text-transparent'
              }`}
              title={isDone ? 'Mark as in-progress' : 'Mark as completed'}
              aria-label={isDone ? `Mark ${item.topic_name} in-progress` : `Mark ${item.topic_name} done`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Subject Pill & Topic Title */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  {item.subject_name || 'Subject'}
                </span>

                {!isHero && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Focus {item.weightage}/5
                  </span>
                )}

                {item.is_revision && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center space-x-1">
                    <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                    <span>Revision</span>
                  </span>
                )}

                {isSkim && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 flex items-center space-x-1">
                    <Eye className="w-2.5 h-2.5 shrink-0" />
                    <span>Skim</span>
                  </span>
                )}

                {item.mastery_score >= 70 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                    ✓ {item.mastery_score}%
                  </span>
                )}
              </div>

              {/* Topic Name */}
              <h3 className={`font-bold mt-1 text-slate-900 leading-snug ${
                isHero ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              } ${isDone ? 'text-slate-400 line-through' : ''}`}>
                {item.topic_name}
              </h3>

              {item.revision_note && (
                <p className="text-[11px] text-purple-700 font-medium mt-0.5 line-clamp-1">
                  💡 {item.revision_note}
                </p>
              )}
            </div>
          </div>

          {/* Time planned & status badge */}
          <div className="text-right shrink-0">
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{item.allocated_minutes}m</span>
            </span>
            {item.minutes_done && item.minutes_done > 0 && (
              <span className="block text-[10px] text-teal-700 font-semibold mt-0.5">
                {item.minutes_done}m logged
              </span>
            )}
            {isDone && (
              <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Toolbar - wraps neatly on all screen sizes */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
          {/* Main Action Group: Timer & Quiz */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Stopwatch Timer */}
            <div className="inline-flex items-center space-x-1">
              <button
                type="button"
                onClick={() => toggleTimer(item.topic_id)}
                className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isTiming && isTimerRunning
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : isHero
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isTiming && isTimerRunning ? 'Pause Study Timer' : 'Start Study Timer'}
              >
                {isTiming && isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </>
                ) : (
                  <>
                    <Play className={`w-3.5 h-3.5 ${isHero ? 'text-white' : 'text-teal-600'} shrink-0`} />
                    <span>{isTiming ? 'Resume' : 'Timer'}</span>
                  </>
                )}
              </button>

              {isTiming && (
                <button
                  type="button"
                  onClick={() => stopAndSaveTimer(item.topic_id)}
                  className="text-xs font-bold px-2 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 cursor-pointer active:scale-95"
                  title="Save studied minutes"
                >
                  Save
                </button>
              )}
            </div>

            {/* Take Quiz Button */}
            <button
              type="button"
              onClick={() => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition-colors cursor-pointer active:scale-95"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Quiz</span>
            </button>

            {/* Concept Notes Shortcut */}
            {onNavigateToNotes && (
              <button
                type="button"
                onClick={() => onNavigateToNotes(item.topic_name, item.subject_name)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 transition-colors cursor-pointer active:scale-95"
                title="Read Chapter Notes"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden min-[380px]:inline">Notes</span>
              </button>
            )}

            {/* Concept Video Shortcut */}
            {onOpenConceptVideo && (
              <button
                type="button"
                onClick={() => onOpenConceptVideo(item.topic_id, item.topic_name, item.subject_name)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/70 transition-colors cursor-pointer active:scale-95"
                title="Watch Concept Video"
              >
                <Tv className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden min-[380px]:inline">Video</span>
              </button>
            )}
          </div>

          {/* Secondary Status Options: Partial & Missed */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPartialModalTopic(item);
                setPartialMinutesInput(String(Math.round(item.allocated_minutes / 2)));
              }}
              className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Partial...
            </button>

            <button
              type="button"
              onClick={() => onMarkProgress(item.topic_id, 'missed', 0)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                isMissed
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              Missed
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-fade-in">
      {/* 1. Backlog Alert if pending overdue work exists */}
      {todayData.has_backlog && (
        <BacklogBanner
          backlogCount={todayData.backlog_count}
          backlogMinutes={todayData.backlog_minutes}
          maxDailyHours={todayData.max_daily_hours}
          onReplan={onReplan}
          isReplanning={isReplanning}
        />
      )}

      {/* 2. Revision Day Banner (if scheduled) */}
      {(todayData.is_revision_day || plannedItems.some(p => p.is_revision)) && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-3.5 sm:p-4 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/30 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-400/30 text-purple-200 border border-purple-400/40 uppercase tracking-wider">
                    {todayData.revision_type === 'final_sprint' ? '10-Yr PYQ Sprint' : 'Periodic Revision'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {todayData.revision_type === 'final_sprint'
                    ? 'Exam Readiness: PYQs & Formula Revision'
                    : 'Active Recall & Chapter Revision Day'}
                </h2>
              </div>
            </div>

            {onNavigateToPYQ && (
              <button
                type="button"
                onClick={onNavigateToPYQ}
                className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 self-start sm:self-center"
              >
                <span>Solve PYQs</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Today's Progress & Time Budget Hub (Compact, High-Scannability Header) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 shrink-0">
              Today's Focus
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Daily Study Targets
            </h1>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono shrink-0">
            {todayData.date}
          </span>
        </div>

        {/* Progress & Time Budget Meters */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2.5">
          {/* Completion Progress */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50/60 border border-teal-200/60">
            <div className="flex items-center justify-between text-xs text-teal-800 font-bold mb-1">
              <span>Progress</span>
              <span>{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-teal-200/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-teal-700/90 font-medium mt-1 text-right">
              {completionPercent}% completed
            </div>
          </div>

          {/* Time Budget */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1">
              <span>Time Budget</span>
              <span>{allocatedHours}h <span className="font-normal text-slate-500">/ {todayData.max_daily_hours}h</span></span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${Number(allocatedHours) > todayData.max_daily_hours ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                style={{ width: `${Math.min(100, Math.round((Number(allocatedHours) / (todayData.max_daily_hours || 6)) * 100))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 text-right">
              {Number(allocatedHours) > todayData.max_daily_hours ? 'Cap exceeded' : 'Realistic load'}
            </div>
          </div>
        </div>

        {todayData.micro_copy && (
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {todayData.micro_copy}
          </p>
        )}
      </div>

      {/* 4. Next Recommended Study Task (Highlighted Hero Card) */}
      {plannedItems.length === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No study topics scheduled for today.</p>
          <p className="text-xs text-slate-400 mt-0.5">Enjoy your off-day or buffer revision time!</p>
        </div>
      ) : nextTask ? (
        <div className="space-y-1.5">
          {renderTopicCard(nextTask, true)}
        </div>
      ) : (
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
          <h3 className="text-sm font-bold text-emerald-950">All Planned Topics Completed! 🎉</h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            You've finished today's targets on time. Solve PYQs or practice high-yield topics below.
          </p>
        </div>
      )}

      {/* 5. Remaining Tasks List (Compact & Scannable) */}
      {remainingTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              Remaining Tasks ({remainingTasks.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              {remainingTasks.reduce((acc, t) => acc + t.allocated_minutes, 0)}m remaining
            </span>
          </div>

          <div className="space-y-2">
            {remainingTasks.map(item => renderTopicCard(item, false))}
          </div>
        </div>
      )}

      {/* 6. Completed Tasks Section (if any) */}
      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-500 px-1">
            Completed Today ({completedTasks.length})
          </h2>
          <div className="space-y-2">
            {completedTasks.map(item => renderTopicCard(item, false))}
          </div>
        </div>
      )}

      {/* 7. High-Yield Revision Buffer & Recommendations (Collapsible, never pushes tasks off-screen) */}
      <RevisionSuggestionBanner
        onNavigateToPYQ={onNavigateToPYQ}
        onOpenDoubtBot={onOpenDoubtBot}
      />

      {/* 8. End of Day Re-Balance Bar */}
      <div className="bg-slate-100/80 rounded-2xl p-3 sm:p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-600 text-center sm:text-left">
          End of day? Re-check to spot any backlog and rebalance instantly.
        </p>
        <button
          type="button"
          onClick={onReplan}
          disabled={isReplanning}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>{isReplanning ? 'Recalculating...' : 'Re-Check & Re-Balance'}</span>
        </button>
      </div>

      {/* Partial Progress Modal */}
      {partialModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Log Partial Study</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              How many minutes did you spend on <strong>{partialModalTopic.topic_name}</strong>?
            </p>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minutes Studied:</label>
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
                type="button"
                onClick={() => setPartialModalTopic(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const mins = Number(partialMinutesInput) || 30;
                  await onMarkProgress(partialModalTopic.topic_id, 'in_progress', mins);
                  setPartialModalTopic(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs cursor-pointer"
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
