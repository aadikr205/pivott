import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, Play, ChevronRight, Sparkles, Award, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export interface RoadmapItem {
  id: string;
  topic_name: string;
  subject_name: string;
  date_str: string;
  day_name: string;
  time_slot: string;
  allocated_minutes: number;
  status: 'not_started' | 'in_progress' | 'done' | 'deferred' | 'revision';
  explanation_tip?: string;
  milestone_step?: number;
  onOpenNotes?: () => void;
  onOpenVideo?: () => void;
  onOpenQuiz?: () => void;
}

interface StudyRoadmapViewProps {
  title?: string;
  subtitle?: string;
  items: RoadmapItem[];
  onOpenQuiz?: (topicId: string, topicName: string, subjectName: string) => void;
  onOpenVideo?: (topicId: string, topicName: string, subjectName: string) => void;
  onOpenNotes?: (topicName: string, subjectName: string) => void;
}

export const StudyRoadmapView: React.FC<StudyRoadmapViewProps> = ({
  title = 'Visual Study Roadmap (रोडमैप)',
  subtitle = 'Day-by-day sequential learning path with exact dates, time slots, and easy milestone steps.',
  items,
  onOpenQuiz,
  onOpenVideo,
  onOpenNotes
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = items.filter(i => i.status === 'done').length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return item.status !== 'done';
    if (filter === 'completed') return item.status === 'done';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Roadmap Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Structured Milestone Plan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Progress Gauge */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-center shrink-0 min-w-[180px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Roadmap Progress
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">
              {progressPercent}%
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {completedCount} of {totalCount} completed
            </span>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? `All Milestones (${totalCount})` : f === 'pending' ? `Pending (${totalCount - completedCount})` : `Completed (${completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Sequential Roadmap Tree */}
      <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-indigo-500 before:to-slate-800">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-sm">
            No roadmap milestones found for this filter.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isDone = item.status === 'done';
            const isInProgress = item.status === 'in_progress';
            const isDeferred = item.status === 'deferred';

            return (
              <div key={item.id || index} className="relative group">
                {/* Node Connector Dot */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg border-2 transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-300 text-white'
                      : isInProgress
                      ? 'bg-teal-500 border-teal-300 text-white animate-pulse ring-4 ring-teal-500/20'
                      : isDeferred
                      ? 'bg-amber-500 border-amber-300 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                </div>

                {/* Milestone Card */}
                <div
                  className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 shadow-xl transition-all hover:border-slate-700 ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : isInProgress
                      ? 'border-teal-500/50 bg-teal-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Card Header: Date, Day & Time Slot */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{item.date_str} {item.day_name && `(${item.day_name})`}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold font-mono">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{item.time_slot} ({item.allocated_minutes}m)</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {item.subject_name}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isInProgress
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                            : isDeferred
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isDone ? 'Completed' : isInProgress ? 'In Progress' : isDeferred ? 'Deferred' : 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  {/* Chapter / Topic Title */}
                  <div className="mt-3.5">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {item.topic_name}
                    </h3>
                  </div>

                  {/* 4-Step Easy Student Roadmap Guide */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60">
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                        Step 1: Notes
                      </span>
                      <span className="text-xs text-slate-300 font-medium block mt-0.5">
                        Read key formulas & definitions
                      </span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Step 2: Video
                      </span>
                      <span className="text-xs text-slate-300 font-medium block mt-0.5">
                        Visual concept animation
                      </span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                        Step 3: Mindmap
                      </span>
                      <span className="text-xs text-slate-300 font-medium block mt-0.5">
                        Flowchart connections
                      </span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Step 4: 10-Q Quiz
                      </span>
                      <span className="text-xs text-slate-300 font-medium block mt-0.5">
                        Confirm 75%+ mastery
                      </span>
                    </div>
                  </div>

                  {/* Easy Student Tip / Explanation */}
                  <div className="mt-3 p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>
                      {item.explanation_tip ||
                        `Pehle 15-20 min notes padhein, fir concept video dekhein, aur session ke end me 10 questions ka quiz dekar mastery pakki karein.`}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                    {onOpenNotes && (
                      <button
                        type="button"
                        onClick={() => onOpenNotes(item.topic_name, item.subject_name)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                        <span>Read Notes</span>
                      </button>
                    )}

                    {onOpenVideo && (
                      <button
                        type="button"
                        onClick={() => onOpenVideo(item.id, item.topic_name, item.subject_name)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Concept Video</span>
                      </button>
                    )}

                    {onOpenQuiz && (
                      <button
                        type="button"
                        onClick={() => onOpenQuiz(item.id, item.topic_name, item.subject_name)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Take Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
