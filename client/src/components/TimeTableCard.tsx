import React from 'react';
import { 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Play, 
  Award, 
  Trash2, 
  ShieldCheck, 
  Smile, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { SelfTimetableEntry } from '../api/client';

export interface SubjectTheme {
  icon: string;
  pastelBg: string;
  borderColor: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  'Biology': {
    icon: '🧬',
    pastelBg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    accentText: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.15)'
  },
  'Physics': {
    icon: '⚡',
    pastelBg: 'bg-indigo-950/20 hover:bg-indigo-950/30',
    borderColor: 'border-indigo-500/30 hover:border-indigo-500/50',
    accentText: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/15 border-indigo-500/30',
    badgeText: 'text-indigo-300',
    glowColor: 'rgba(99, 102, 241, 0.15)'
  },
  'Chemistry': {
    icon: '🧪',
    pastelBg: 'bg-amber-950/20 hover:bg-amber-950/30',
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.15)'
  },
  'Maths': {
    icon: '📐',
    pastelBg: 'bg-cyan-950/20 hover:bg-cyan-950/30',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30',
    badgeText: 'text-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.15)'
  },
  'Mathematics': {
    icon: '📐',
    pastelBg: 'bg-cyan-950/20 hover:bg-cyan-950/30',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30',
    badgeText: 'text-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.15)'
  },
  'Science': {
    icon: '🔬',
    pastelBg: 'bg-teal-950/20 hover:bg-teal-950/30',
    borderColor: 'border-teal-500/30 hover:border-teal-500/50',
    accentText: 'text-teal-300',
    badgeBg: 'bg-teal-500/15 border-teal-500/30',
    badgeText: 'text-teal-300',
    glowColor: 'rgba(20, 184, 166, 0.15)'
  },
  'Social Science': {
    icon: '🌍',
    pastelBg: 'bg-rose-950/20 hover:bg-rose-950/30',
    borderColor: 'border-rose-500/30 hover:border-rose-500/50',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.15)'
  },
  'English': {
    icon: '📖',
    pastelBg: 'bg-purple-950/20 hover:bg-purple-950/30',
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.15)'
  },
  'Hindi': {
    icon: '📝',
    pastelBg: 'bg-orange-950/20 hover:bg-orange-950/30',
    borderColor: 'border-orange-500/30 hover:border-orange-500/50',
    accentText: 'text-orange-300',
    badgeBg: 'bg-orange-500/15 border-orange-500/30',
    badgeText: 'text-orange-300',
    glowColor: 'rgba(249, 115, 22, 0.15)'
  },
  'Computer Science': {
    icon: '💻',
    pastelBg: 'bg-blue-950/20 hover:bg-blue-950/30',
    borderColor: 'border-blue-500/30 hover:border-blue-500/50',
    accentText: 'text-blue-300',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-300',
    glowColor: 'rgba(59, 130, 246, 0.15)'
  },
  'Sanskrit': {
    icon: '📜',
    pastelBg: 'bg-fuchsia-950/20 hover:bg-fuchsia-950/30',
    borderColor: 'border-fuchsia-500/30 hover:border-fuchsia-500/50',
    accentText: 'text-fuchsia-300',
    badgeBg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
    badgeText: 'text-fuchsia-300',
    glowColor: 'rgba(217, 70, 239, 0.15)'
  },
  'EVS': {
    icon: '🌿',
    pastelBg: 'bg-lime-950/20 hover:bg-lime-950/30',
    borderColor: 'border-lime-500/30 hover:border-lime-500/50',
    accentText: 'text-lime-300',
    badgeBg: 'bg-lime-500/15 border-lime-500/30',
    badgeText: 'text-lime-300',
    glowColor: 'rgba(132, 204, 22, 0.15)'
  }
};

export const getSubjectTheme = (subject: string): SubjectTheme => {
  return SUBJECT_THEMES[subject] || {
    icon: '📚',
    pastelBg: 'bg-slate-900/90 hover:bg-slate-900',
    borderColor: 'border-teal-500/30 hover:border-teal-500/50',
    accentText: 'text-teal-300',
    badgeBg: 'bg-teal-500/15 border-teal-500/30',
    badgeText: 'text-teal-300',
    glowColor: 'rgba(20, 184, 166, 0.15)'
  };
};

interface TimeTableCardProps {
  entry: SelfTimetableEntry;
  isExpanded: boolean;
  isNow?: boolean;
  isNext?: boolean;
  isLast?: boolean;
  onToggleExpand: () => void;
  onStatusChange: (id: string, newStatus: 'not_started' | 'in_progress' | 'done' | 'deferred') => void;
  onOpenNotes: (entry: SelfTimetableEntry) => void;
  onOpenVideo: (entry: SelfTimetableEntry) => void;
  onOpenQuiz: (entry: SelfTimetableEntry) => void;
  onDelete: (id: string, name: string) => void;
}

export const TimeTableCard: React.FC<TimeTableCardProps> = ({
  entry,
  isExpanded,
  isNow = false,
  isNext = false,
  isLast = false,
  onToggleExpand,
  onStatusChange,
  onOpenNotes,
  onOpenVideo,
  onOpenQuiz,
  onDelete
}) => {
  const theme = getSubjectTheme(entry.subject);
  const isJunior = entry.class_level <= 5 || entry.video_style === 'cartoon';

  // Extract start and end time from time_slot e.g. "06:00 PM - 06:45 PM"
  const timeParts = (entry as any).time_slot ? (entry as any).time_slot.split(' - ') : [];
  const startTime = timeParts[0] || '06:00 PM';
  const endTime = timeParts[1] || `${entry.daily_minutes} mins`;

  return (
    <div className="flex items-stretch gap-2.5 sm:gap-4 relative group">
      
      {/* 1. LEFT TIMELINE COLUMN (Time + Indicators) */}
      <div className="w-16 sm:w-24 shrink-0 flex flex-col items-end pt-3 sm:pt-4 text-right select-none">
        <div className="space-y-0.5">
          <div className="text-xs sm:text-sm font-black text-white tracking-tight">
            {startTime}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
            {endTime.includes('AM') || endTime.includes('PM') ? endTime : `${entry.daily_minutes}m`}
          </div>
        </div>

        {/* Now / Next Indicator Pills on Timeline */}
        {isNow && (
          <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black tracking-wider animate-pulse shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NOW</span>
          </div>
        )}

        {isNext && !isNow && (
          <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>NEXT</span>
          </div>
        )}
      </div>

      {/* 2. TIMELINE CONNECTOR LINE & NODE */}
      <div className="relative flex flex-col items-center shrink-0">
        {/* Node Circle */}
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center z-10 transition-transform mt-3 sm:mt-3.5 border ${
            entry.status === 'done'
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
              : entry.status === 'in_progress' || isNow
                ? 'bg-slate-900 border-teal-400 text-teal-300 shadow-md shadow-teal-500/30 ring-2 ring-teal-400/40'
                : isNext
                  ? 'bg-slate-900 border-blue-400 text-blue-300 ring-2 ring-blue-400/30'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
          }`}
        >
          {entry.status === 'done' ? (
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          ) : entry.status === 'in_progress' || isNow ? (
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          )}
        </div>

        {/* Vertical Connecting Line to Next Card */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-slate-800 group-hover:bg-slate-700 transition-colors my-1" />
        )}
      </div>

      {/* 3. TIME TABLE CARD (COLLAPSED BY DEFAULT, TAP TO EXPAND) */}
      <div className="flex-1 pb-3 sm:pb-4 min-w-0">
        <div
          className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-md ${theme.pastelBg} ${theme.borderColor} ${
            isExpanded ? 'ring-2 ring-teal-400/40 shadow-xl' : 'hover:shadow-lg'
          }`}
        >
          {/* A. COLLAPSED VIEW (FRONT PAGE - STRICTLY MINIMAL & UNCLUTTERED) */}
          <div
            role="button"
            tabIndex={0}
            onClick={onToggleExpand}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleExpand();
              }
            }}
            aria-expanded={isExpanded}
            className="w-full min-h-[52px] sm:min-h-[56px] px-3.5 sm:px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors"
          >
            {/* Left: Time Slot + Subject Tag & Icon */}
            <div className="flex items-center space-x-3 min-w-0">
              {/* Subject Icon Box */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 border ${theme.badgeBg}`}>
                <span>{theme.icon}</span>
              </div>

              {/* Subject Title & Quick Time Slot */}
              <div className="min-w-0">
                <h3 className={`text-base sm:text-lg font-black tracking-tight truncate ${theme.accentText}`}>
                  {entry.subject}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{(entry as any).time_slot || `${startTime} - ${endTime}`}</span>
                </div>
              </div>
            </div>

            {/* Right: Status Tag + Animated Chevron */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Status Indicator Pill */}
              {entry.status === 'done' ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Done</span>
                </span>
              ) : entry.status === 'in_progress' ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="hidden sm:inline">In Progress</span>
                </span>
              ) : entry.status === 'deferred' ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="hidden sm:inline">Deferred</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-400 border border-slate-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span className="hidden sm:inline">Pending</span>
                </span>
              )}

              {/* Chevron Arrow (Rotates 180° when expanded) */}
              <div className={`w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                isExpanded ? 'rotate-180 text-teal-400 bg-teal-500/10 border-teal-500/30' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* B. EXPANDED VIEW - DETAILS REVEALED ON DEMAND */}
          {isExpanded && (
            <div className="border-t border-slate-800/80 p-3.5 sm:p-5 bg-slate-950/60 space-y-4 animate-fadeIn">
              
              {/* 1. Chapter Name (Clear & Prominent) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Topic / Chapter</span>
                  {entry.is_verified ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{entry.verification_source || 'NCERT Syllabus Verified'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-amber-400 text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Custom Topic</span>
                    </span>
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                  {entry.chapter_topic_name}
                </h4>
              </div>

              {/* 2. Metadata Grid (Class, Day/Date, Duration) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Class</span>
                  <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                    Class {entry.class_level}
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Subject</span>
                  <span className={`text-xs sm:text-sm font-bold truncate mt-0.5 block ${theme.accentText}`}>
                    {entry.subject}
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Duration</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">
                    {entry.daily_minutes} mins
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Scheduled Day</span>
                  <span className="text-xs sm:text-sm font-bold text-teal-300 mt-0.5 block truncate">
                    {(entry as any).day_name || 'Today'}
                  </span>
                </div>
              </div>

              {/* 3. Status Selector Bar */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Update Task Status:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { key: 'not_started', label: 'Pending', icon: '○' },
                    { key: 'in_progress', label: 'In Progress', icon: '⏳' },
                    { key: 'done', label: 'Completed ✓', icon: '✓' },
                    { key: 'deferred', label: 'Deferred ⏸', icon: '⏸' }
                  ].map(st => {
                    const isCurrent = entry.status === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => onStatusChange(entry.id, st.key as any)}
                        className={`min-h-[44px] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border ${
                          isCurrent
                            ? st.key === 'done'
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-xs'
                              : st.key === 'in_progress'
                                ? 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-xs'
                                : st.key === 'deferred'
                                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-xs'
                                  : 'bg-slate-800 border-slate-600 text-white shadow-xs'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span>{st.icon}</span>
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Action Buttons (Notes, Video, 10-Q Quiz, Delete) */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {/* Notes Button */}
                  <button
                    type="button"
                    onClick={() => onOpenNotes(entry)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>Read Notes</span>
                  </button>

                  {/* Video Button */}
                  <button
                    type="button"
                    onClick={() => onOpenVideo(entry)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
                      isJunior
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    }`}
                  >
                    {isJunior ? <Smile className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isJunior ? 'Cartoon Video' : 'Concept Video'}</span>
                  </button>

                  {/* 10-Q Quiz Button */}
                  <button
                    type="button"
                    onClick={() => onOpenQuiz(entry)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>10-Q Quiz</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Delete Button (Hidden inside expanded view) */}
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id, entry.chapter_topic_name)}
                    className="min-h-[44px] px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer flex items-center space-x-1 text-xs font-medium"
                    title="Remove from timetable"
                    aria-label="Delete chapter entry"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  {/* Collapse Button */}
                  <button
                    type="button"
                    onClick={onToggleExpand}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Close ▲
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
