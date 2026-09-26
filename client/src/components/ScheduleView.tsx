import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, 
  BookOpen, ShieldCheck, Layers, Compass, Zap, FileText, ChevronDown, 
  ChevronUp, Eye, EyeOff, Search, ArrowRight, ArrowLeft
} from 'lucide-react';
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

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  maxDailyHours, 
  onOpenQuiz, 
  onNavigateToPYQ, 
  onOpenDoubtBot 
}) => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Requirement 1: Day-by-day plan is HIDDEN by default (expandedDate is null).
  // Only opens when student taps on a day!
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<'all' | 'upcoming' | 'buffer'>('all');
  const [searchDateQuery, setSearchDateQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'roadmap' | 'onepage' | 'game'>('list');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const allPlannedItems = useMemo(() => {
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
        // Note: Keep expandedDate as null by default so the detailed plan is hidden until tapped!
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load schedule:', err);
        setLoading(false);
      });
  }, []);

  // Filtered days list for compact browser
  const filteredDays = useMemo(() => {
    return days.filter((d, idx) => {
      if (dayFilter === 'upcoming') {
        if (d.date < todayStr) return false;
      } else if (dayFilter === 'buffer') {
        const isBuffer = (d.total_minutes === 0) || (d.planned_items?.length === 0);
        if (!isBuffer) return false;
      }

      if (searchDateQuery.trim()) {
        const q = searchDateQuery.toLowerCase();
        const dayLabel = `day ${idx + 1}`.toLowerCase();
        const matchesDate = d.date.toLowerCase().includes(q);
        const matchesLabel = dayLabel.includes(q);
        const matchesDayName = (d.day_name || '').toLowerCase().includes(q);
        if (!matchesDate && !matchesLabel && !matchesDayName) return false;
      }

      return true;
    });
  }, [days, dayFilter, searchDateQuery, todayStr]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading complete timetable...</p>
      </div>
    );
  }

  // Find currently opened/expanded day object
  const activeDayIndex = days.findIndex(d => d.date === expandedDate);
  const activeDay = activeDayIndex !== -1 ? days[activeDayIndex] : null;

  // Handler: Tap to toggle day plan open/hide
  const handleToggleDayPlan = (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null); // Hide plan
    } else {
      setExpandedDate(date); // Open plan
    }
  };

  // Switch to next or previous day in the open plan view
  const handlePrevDay = () => {
    if (activeDayIndex > 0) {
      setExpandedDate(days[activeDayIndex - 1].date);
    }
  };

  const handleNextDay = () => {
    if (activeDayIndex < days.length - 1) {
      setExpandedDate(days[activeDayIndex + 1].date);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Adaptive Timetable
            </span>
            <span className="text-xs text-slate-500 font-medium">
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
          <span>1-Week Prior Completion • 7-Day Revision & PYQs Sprint</span>
        </div>
      </div>

      {/* View Switcher: Day-by-Day, Visual Roadmap, One-Page Roadmap, Game Level */}
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
            <span>🗺️ Visual Study Roadmap</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('onepage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'onepage'
                ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 One-Page Quick Roadmap</span>
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
            <span>🎮 Game Quest</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline px-2">
          {allPlannedItems.length} Topics Scheduled
        </span>
      </div>

      {/* RENDER VIEWS */}
      {viewMode === 'roadmap' ? (
        <StudyRoadmapView
          title="Adaptive Timetable Study Roadmap"
          subtitle="Sequential syllabus completion roadmap with exact dates, time slots, and learning milestones."
          items={allPlannedItems.map((item) => ({
            id: item.topic_id,
            topic_name: item.topic_name,
            subject_name: item.subject_name || 'Subject',
            date_str: item.scheduled_date,
            day_name: item.day_name,
            time_slot: item.time_slot,
            allocated_minutes: item.allocated_minutes,
            status: item.is_revision ? 'revision' : (item.overall_status === 'done' ? 'done' : 'not_started'),
            explanation_tip: item.revision_note || `Exam syllabus topic. Focus weightage: ${item.weightage}/5. Study key concepts, solve practice numericals, and test with quiz.`,
            onOpenQuiz: () => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)
          }))}
          defaultMode="visual"
          onOpenQuiz={(id) => {
            const found = allPlannedItems.find(i => i.topic_id === id);
            if (found) onOpenQuiz(found.topic_id, found.topic_name, found.subject_name);
          }}
        />
      ) : viewMode === 'onepage' ? (
        <StudyRoadmapView
          title="Adaptive Timetable One-Page Quick Roadmap"
          subtitle="Complete single-page view: Study schedule organized with exact dates and time slots. Ready to print or scan."
          items={allPlannedItems.map((item) => ({
            id: item.topic_id,
            topic_name: item.topic_name,
            subject_name: item.subject_name || 'Subject',
            date_str: item.scheduled_date,
            day_name: item.day_name,
            time_slot: item.time_slot,
            allocated_minutes: item.allocated_minutes,
            status: item.is_revision ? 'revision' : (item.overall_status === 'done' ? 'done' : 'not_started'),
            explanation_tip: item.revision_note || `Exam syllabus topic. Focus weightage: ${item.weightage}/5. Study key concepts, solve practice numericals, and test with quiz.`,
            onOpenQuiz: () => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)
          }))}
          defaultMode="onepage"
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
        /* ========================================================================= */
        /* MODE: DAY-BY-DAY PLAN (Clean, Compact Days + Tap-to-Open - Requirement 1) */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Controls Bar: Filters & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Filter Days:</span>
              <button
                type="button"
                onClick={() => setDayFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dayFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({days.length})
              </button>

              <button
                type="button"
                onClick={() => setDayFilter('upcoming')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dayFilter === 'upcoming'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => setDayFilter('buffer')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dayFilter === 'buffer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Buffer Days
              </button>

              {expandedDate && (
                <button
                  type="button"
                  onClick={() => setExpandedDate(null)}
                  className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto sm:ml-2"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Day Plan</span>
                </button>
              )}
            </div>

            {/* Quick Search Date */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search date or day..."
                value={searchDateQuery}
                onChange={(e) => setSearchDateQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Student Tap-Prompt Banner */}
          {!expandedDate && (
            <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-3.5 sm:px-5 flex items-center justify-between gap-3 text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <span className="text-base">👇</span>
                <span className="font-medium">
                  <strong>Day-by-Day Plan Hidden:</strong> Tap any day card below to view its study topics. Tap again to collapse and hide it.
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 shrink-0 hidden sm:inline">
                Tap to Open
              </span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPACT SCHEDULE DAYS GRID                                                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {filteredDays.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                No schedule days match your filter.
              </div>
            ) : (
              filteredDays.map((day) => {
                const dayIndex = days.findIndex(d => d.date === day.date);
                const isExpanded = day.date === expandedDate;
                const isToday = day.date === todayStr;
                const isBuffer = (day.total_minutes === 0) || (day.planned_items?.length === 0);
                const dayHours = (day.total_minutes / 60).toFixed(1);
                const dayName = day.day_name || new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <button
                    key={day.id || day.date}
                    type="button"
                    onClick={() => handleToggleDayPlan(day.date)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isExpanded
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40 scale-[1.02]'
                        : isToday
                        ? 'bg-teal-50 border-teal-300 text-slate-800 hover:bg-teal-100/60 shadow-xs'
                        : isBuffer
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-800 hover:bg-emerald-50'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Row: Day Number & Badge */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] font-black font-mono ${
                          isExpanded ? 'text-indigo-200' : 'text-slate-500'
                        }`}>
                          Day {dayIndex + 1}
                        </span>

                        {isToday ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-teal-600 text-white text-[9px] font-bold">
                            Today
                          </span>
                        ) : (isBuffer || day.is_revision) ? (
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                            isExpanded ? 'bg-indigo-700 text-indigo-100' : 'bg-purple-100 text-purple-800'
                          }`}>
                            1-Wk Revision
                          </span>
                        ) : day.is_backlog_day ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                            Backlog
                          </span>
                        ) : null}
                      </div>

                      {/* Date & Day of Week */}
                      <div className="mt-1">
                        <div className={`text-xs font-bold flex items-center gap-1 ${
                          isExpanded ? 'text-white' : 'text-slate-900'
                        }`}>
                          <Calendar className={`w-3 h-3 ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`} />
                          <span>{day.date}</span>
                        </div>
                        <span className={`text-[10px] block ${
                          isExpanded ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {dayName}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Topics Count / Hours & Tap Indicator */}
                    <div className="mt-2.5 pt-2 border-t border-dashed flex items-center justify-between text-[10px] font-medium"
                      style={{ borderColor: isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)' }}
                    >
                      <span className={isExpanded ? 'text-indigo-100' : 'text-slate-500'}>
                        {isBuffer ? 'Revision' : `${day.planned_items?.length || 0} topics`}
                      </span>

                      <span className={`font-mono font-bold flex items-center gap-0.5 ${
                        isExpanded ? 'text-white' : 'text-indigo-600'
                      }`}>
                        {isExpanded ? (
                          <>
                            <span>Hide</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>{dayHours}h</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ========================================================================= */}
          {/* EXPANDED DAY-BY-DAY PLAN (Opens ONLY when student taps a day!)             */}
          {/* ========================================================================= */}
          {activeDay && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-indigo-500/40 shadow-xl animate-fadeIn">
              {/* Day Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                    D{activeDayIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono">
                        {activeDay.date}
                      </span>
                      {activeDay.date === todayStr && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          Current Day (Today)
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                      Day {activeDayIndex + 1} Planned Topics
                    </h3>
                  </div>
                </div>

                {/* Day Allocation & Hide Button */}
                <div className="flex items-center space-x-2.5 sm:self-center">
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[11px] text-slate-400">Total Allocation</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {(activeDay.total_minutes / 60).toFixed(1)} hrs
                      <span className="text-xs font-normal text-slate-500"> / {maxDailyHours}h max</span>
                    </div>
                  </div>

                  {/* Day Navigation */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handlePrevDay}
                      disabled={activeDayIndex === 0}
                      title="Previous Day"
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-600 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextDay}
                      disabled={activeDayIndex === days.length - 1}
                      title="Next Day"
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-600 transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Explicit Hide Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedDate(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hide Plan</span>
                  </button>
                </div>
              </div>

              {/* Items List inside Opened Day */}
              <div className="mt-5 space-y-3">
                {(!activeDay.planned_items || activeDay.planned_items.length === 0) ? (
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
                  activeDay.planned_items.map((item: any, i: number) => {
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
                                Completed ✓
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

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => onOpenQuiz(item.topic_id, item.topic_name, item.subject_name)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors cursor-pointer"
                          >
                            Take Quiz
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Action to collapse */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Day {activeDayIndex + 1} of {days.length}</span>
                <button
                  type="button"
                  onClick={() => setExpandedDate(null)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide Day Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
