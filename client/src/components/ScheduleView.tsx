import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, BookOpen, ShieldCheck, Layers, Compass, Zap } from 'lucide-react';
import { api } from '../api/client';
import { RevisionSuggestionBanner } from './RevisionSuggestionBanner';
import { StudyRoadmapView } from './StudyRoadmapView';
import { GameLevelView } from './GameLevelView';

interface ScheduleViewProps {
  maxDailyHours: number;
  onOpenQuiz: (topicId: string, topicName: string, subjectName: string) => void;
  onNavigateToPYQ?: () => void;
  onOpenDoubtBot?: (context?: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ maxDailyHours, onOpenQuiz, onNavigateToPYQ, onOpenDoubtBot }) => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'roadmap' | 'game'>('list');

  const allPlannedItems = React.useMemo(() => {
    return days.flatMap((day) =>
      (day.planned_items || []).map((item: any) => ({
        ...item,
        scheduled_date: day.date,
        day_name: day.day_name || new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        time_slot: item.time_slot || `${item.allocated_minutes} mins`
      }))
    );
  }, [days]);

  useEffect(() => {
    setLoading(true);
    api.getAllSchedule()
      .then(res => {
        setDays(res.days || []);
        if (res.days && res.days.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const foundToday = res.days.find(d => d.date === todayStr);
          setSelectedDate(foundToday ? foundToday.date : res.days[0].date);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load schedule:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading complete timetable...</p>
      </div>
    );
  }

  const selectedDay = days.find(d => d.date === selectedDate) || days[0];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Adaptive Timetable
            </span>
            <span className="text-xs text-slate-500">
              {days.length} Total Days Scheduled
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Day-by-Day Study Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every day is strictly capped at ≤ {maxDailyHours} hours. High-weightage topics are scheduled earliest.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Buffer Revision Days Auto-Reserved</span>
        </div>
      </div>

      {/* View Switcher: Day-by-Day, Visual Study Roadmap, Game Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Day-by-Day Plan ({days.length} Days)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('roadmap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🗺️ Visual Study Roadmap (Date & Time)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('game')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'game'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>🎮 Game Level Quest</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline px-2">
          {allPlannedItems.length} Topics Scheduled
        </span>
      </div>

      {viewMode === 'roadmap' ? (
        <StudyRoadmapView
          title="Adaptive Timetable Study Roadmap (रोडमैप)"
          subtitle="Sequential syllabus completion roadmap with exact dates, time slots, and learning milestones."
          items={allPlannedItems.map((item) => ({
            id: item.topic_id,
            topic_name: item.topic_name,
            subject_name: item.subject_name || 'Subject',
            date_str: item.scheduled_date,
            day_name: item.day_name,
            time_slot: item.time_slot,
            allocated_minutes: item.allocated_minutes,
            status: item.overall_status === 'done' ? 'done' : 'not_started',
            explanation_tip: `Exam syllabus topic. Focus weightage: ${item.weightage}/5. Study key concepts, solve practice numericals, and test with quiz.`,
            onOpenQuiz: () => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)
          }))}
          onOpenQuiz={(id) => {
            const found = allPlannedItems.find(i => i.topic_id === id);
            if (found) onOpenQuiz(found.topic_id, found.topic_name, found.subject_name);
          }}
        />
      ) : viewMode === 'game' ? (
        <GameLevelView
          title="🎮 Exam Syllabus Quest Trail"
          subtitle="Complete daily syllabus topics as RPG levels, earn stars ⭐⭐⭐, and level up your preparation score!"
          items={allPlannedItems.map((item) => ({
            id: item.topic_id,
            topic_name: item.topic_name,
            subject_name: item.subject_name || 'Subject',
            allocated_minutes: item.allocated_minutes,
            status: item.overall_status === 'done' ? 'done' : 'not_started',
            mastery_score: item.overall_status === 'done' ? 100 : 0
          }))}
          onOpenQuiz={(id) => {
            const found = allPlannedItems.find(i => i.topic_id === id);
            if (found) onOpenQuiz(found.topic_id, found.topic_name, found.subject_name);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Day Selector Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm max-h-[75vh] overflow-y-auto space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
            Schedule Days
          </h3>

          {days.length === 0 ? (
            <p className="text-xs text-slate-400 p-2">No schedule generated yet.</p>
          ) : (
            days.map((day) => {
              const isSelected = day.date === selectedDate;
              const isToday = day.date === todayStr;
              const isBuffer = (day.total_minutes === 0) || (day.planned_items.length === 0);
              const dayHours = (day.total_minutes / 60).toFixed(1);

              return (
                <button
                  key={day.id || day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-sm text-indigo-950'
                      : isToday
                      ? 'bg-teal-50/40 border-teal-200 text-slate-800 hover:bg-slate-50'
                      : 'bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold">{day.date}</span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-600 text-white">
                          Today
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      {isBuffer ? 'Buffer / Rev' : `${dayHours}h`}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{isBuffer ? 'Revision Reserve' : `${day.planned_items.length} topics`}</span>
                    {day.is_backlog_day && (
                      <span className="text-[10px] text-amber-700 font-medium">Backlog Day</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Day Topics Detail */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          {selectedDay ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                      {selectedDay.date}
                    </span>
                    {selectedDay.date === todayStr && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        Current Day
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    Planned Study Topics
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Total Day Allocation</div>
                  <div className="text-base font-bold text-slate-900">
                    {(selectedDay.total_minutes / 60).toFixed(1)} hrs
                    <span className="text-xs font-normal text-slate-500"> / {maxDailyHours}h max</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 space-y-3">
                {selectedDay.planned_items.length === 0 ? (
                  <div className="space-y-4">
                    <div className="py-8 text-center rounded-2xl bg-emerald-50/50 border border-emerald-200/60 p-6">
                      <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-emerald-900">Comprehensive Revision & Buffer Day</h4>
                      <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                        This date is reserved for mock tests, weak-spot revision, and calm review before your exam.
                      </p>
                    </div>

                    <RevisionSuggestionBanner
                      onNavigateToPYQ={onNavigateToPYQ}
                      onOpenDoubtBot={onOpenDoubtBot}
                    />
                  </div>
                ) : (
                  selectedDay.planned_items.map((item: any, i: number) => {
                    const isDone = item.overall_status === 'done';
                    const isSkim = item.status === 'skim_only';

                    return (
                      <div
                        key={item.topic_id || i}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                              {item.subject_name || 'Subject'}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Focus: {item.weightage}/5
                            </span>
                            {isSkim && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Skim-Only
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Completed
                              </span>
                            )}
                          </div>

                          <h4 className={`text-sm sm:text-base font-semibold mt-1.5 ${
                            isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}>
                            {item.topic_name}
                          </h4>

                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.allocated_minutes} minutes allocated</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors"
                          >
                            Take Quiz
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">Select a day from the list.</div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
