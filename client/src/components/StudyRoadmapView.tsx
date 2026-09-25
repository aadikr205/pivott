import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, Play, 
  ChevronRight, Sparkles, Award, ArrowRight, ShieldCheck, HelpCircle,
  Printer, Download, Copy, Check, Search, FileText, Compass, ListFilter,
  Layers
} from 'lucide-react';

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
  defaultMode?: 'visual' | 'onepage';
  onOpenQuiz?: (topicId: string, topicName: string, subjectName: string) => void;
  onOpenVideo?: (topicId: string, topicName: string, subjectName: string) => void;
  onOpenNotes?: (topicName: string, subjectName: string) => void;
}

export const StudyRoadmapView: React.FC<StudyRoadmapViewProps> = ({
  title = 'Visual Study Roadmap',
  subtitle = 'Day-by-day sequential learning path with exact dates, time slots, and easy milestone steps.',
  items,
  defaultMode = 'visual',
  onOpenQuiz,
  onOpenVideo,
  onOpenNotes
}) => {
  const [roadmapMode, setRoadmapMode] = useState<'visual' | 'onepage'>(defaultMode);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState(false);

  const completedCount = items.filter(i => i.status === 'done').length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutes = items.reduce((acc, curr) => acc + (curr.allocated_minutes || 0), 0);

  // Available subjects
  const subjectList = useMemo(() => {
    const s = new Set<string>();
    items.forEach(i => {
      if (i.subject_name) s.add(i.subject_name);
    });
    return Array.from(s);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'pending' && item.status === 'done') return false;
      if (filter === 'completed' && item.status !== 'done') return false;
      if (selectedSubject !== 'all' && item.subject_name !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = item.topic_name.toLowerCase().includes(q);
        const matchesSubject = (item.subject_name || '').toLowerCase().includes(q);
        const matchesDate = (item.date_str || '').toLowerCase().includes(q);
        if (!matchesTopic && !matchesSubject && !matchesDate) return false;
      }
      return true;
    });
  }, [items, filter, selectedSubject, searchQuery]);

  // Group items by date for One-Page Quick View
  const groupedByDate = useMemo(() => {
    const map: { [date: string]: RoadmapItem[] } = {};
    filteredItems.forEach(item => {
      const d = item.date_str || 'Scheduled';
      if (!map[d]) map[d] = [];
      map[d].push(item);
    });
    return map;
  }, [filteredItems]);

  const uniqueDatesCount = useMemo(() => {
    return Object.keys(groupedByDate).length;
  }, [groupedByDate]);

  // 1. Download formatted text file schedule
  const handleDownloadText = () => {
    const lines: string[] = [];
    lines.push('========================================================================');
    lines.push(`                   ${title.toUpperCase()}`);
    lines.push('                   ONE-PAGE QUICK STUDY ROADMAP');
    lines.push('========================================================================');
    lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`);
    lines.push(`Total Topics: ${items.length} | Completed: ${completedCount} (${progressPercent}%)`);
    lines.push(`Total Study Hours: ${(totalMinutes / 60).toFixed(1)} hrs across ${uniqueDatesCount} scheduled days`);
    lines.push('------------------------------------------------------------------------\n');

    let dayCounter = 1;
    const dates = Object.keys(groupedByDate);
    dates.forEach(date => {
      const dayTopics = groupedByDate[date];
      const dayName = dayTopics[0]?.day_name || '';
      lines.push(`[DAY ${dayCounter}] DATE: ${date} ${dayName ? `(${dayName})` : ''}`);
      lines.push('------------------------------------------------------------------------');
      dayTopics.forEach((it, idx) => {
        lines.push(`  ${idx + 1}. [${it.subject_name.toUpperCase()}] ${it.topic_name}`);
        lines.push(`     • Slot: ${it.time_slot} | Duration: ${it.allocated_minutes} mins`);
        lines.push(`     • Status: ${it.status === 'done' ? '[COMPLETED]' : it.status.toUpperCase()}`);
        if (it.explanation_tip) {
          lines.push(`     • Note: ${it.explanation_tip}`);
        }
      });
      lines.push('\n');
      dayCounter++;
    });

    lines.push('========================================================================');
    lines.push('Pivott: Consistency is the key to rank 1. Study daily! 🚀');
    lines.push('========================================================================');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pivott_Study_Roadmap_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Browser Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // 3. Copy Quick Schedule to Clipboard
  const handleCopySchedule = () => {
    const lines: string[] = [];
    lines.push(`📅 ${title} (Total Topics: ${items.length})\n`);
    Object.keys(groupedByDate).forEach((date, i) => {
      const dayTopics = groupedByDate[date];
      const dayName = dayTopics[0]?.day_name || '';
      lines.push(`Day ${i + 1} • ${date} ${dayName ? `(${dayName})` : ''}:`);
      dayTopics.forEach(it => {
        lines.push(`  - [${it.subject_name}] ${it.topic_name} (${it.allocated_minutes}m) [${it.status}]`);
      });
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="space-y-6 printable-roadmap">
      {/* View Switcher Bar: Visual Tree Roadmap vs One-Page Quick Roadmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-3xl no-print shadow-lg">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setRoadmapMode('visual')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              roadmapMode === 'visual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>🗺️ Visual Step Roadmap</span>
          </button>

          <button
            type="button"
            onClick={() => setRoadmapMode('onepage')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              roadmapMode === 'onepage'
                ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 One-Page Quick Roadmap</span>
          </button>
        </div>

        {/* Quick Download & Print Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save as PDF"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadText}
            title="Download Schedule File (.txt)"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>

          <button
            type="button"
            onClick={handleCopySchedule}
            title="Copy Schedule to Clipboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Roadmap Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 
              {roadmapMode === 'onepage' ? 'One-Page Date-Wise Schedule' : 'Structured Milestone Plan'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {roadmapMode === 'onepage' 
                ? 'Quick single-page schedule: What to study and when with exact dates and time slots. Instant scan & printable.' 
                : subtitle}
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

        {/* Filter Pills & Search Bar (no-print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800 no-print">
          <div className="flex items-center gap-2 flex-wrap">
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
                {f === 'all' ? `All (${totalCount})` : f === 'pending' ? `Pending (${totalCount - completedCount})` : `Done (${completedCount})`}
              </button>
            ))}

            {subjectList.length > 1 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">All Subjects ({subjectList.length})</option>
                {subjectList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ONE-PAGE QUICK ROADMAP                                             */}
      {/* ========================================================================= */}
      {roadmapMode === 'onepage' ? (
        <div className="space-y-4">
          {/* Quick Summary Header Bar for Printing and Fast Scan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-4 flex-wrap">
              <span>📅 <strong>{uniqueDatesCount}</strong> Total Days</span>
              <span>📚 <strong>{filteredItems.length}</strong> Topics</span>
              <span>⏱️ <strong>{(totalMinutes / 60).toFixed(1)} hrs</strong> Total Allocation</span>
              <span>✅ <strong>{completedCount}</strong> Completed ({progressPercent}%)</span>
            </div>
            <div className="text-[11px] text-teal-400 font-mono flex items-center gap-1.5 no-print">
              <span>💡 Press Print/PDF button above to save or print on paper</span>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 text-sm">
              No milestones found matching your filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.keys(groupedByDate).map((dateStr, dateIdx) => {
                const dayItems = groupedByDate[dateStr];
                const dayName = dayItems[0]?.day_name || '';
                const dayTotalMinutes = dayItems.reduce((acc, curr) => acc + (curr.allocated_minutes || 0), 0);
                const isAllDone = dayItems.every(i => i.status === 'done');

                return (
                  <div
                    key={dateStr}
                    className={`rounded-2xl border transition-all print-page-break ${
                      isAllDone
                        ? 'bg-emerald-950/15 border-emerald-900/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Date Strip Header */}
                    <div className="p-3 sm:px-4 sm:py-2.5 bg-slate-950/60 border-b border-slate-800/80 rounded-t-2xl flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[11px] font-black font-mono">
                          Day {dateIdx + 1}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          <span>{dateStr}</span>
                          {dayName && <span className="text-slate-400 font-normal">({dayName})</span>}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                        <span>{dayItems.length} topic{dayItems.length === 1 ? '' : 's'}</span>
                        <span>•</span>
                        <span className="text-teal-300 font-bold">{(dayTotalMinutes / 60).toFixed(1)} hrs</span>
                        {isAllDone && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            All Done ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Table / List of Topics for this Date */}
                    <div className="divide-y divide-slate-800/60">
                      {dayItems.map((item, topicIdx) => {
                        const isDone = item.status === 'done';
                        const isInProgress = item.status === 'in_progress';

                        return (
                          <div
                            key={item.id || topicIdx}
                            className={`p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              isDone ? 'bg-emerald-950/10' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-start sm:items-center space-x-3">
                              <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                {topicIdx + 1}
                              </span>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-teal-300 border border-slate-700 text-[10px] font-bold">
                                    {item.subject_name}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>{item.time_slot}</span>
                                    <span>({item.allocated_minutes}m)</span>
                                  </span>
                                  {isDone ? (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      Done ✓
                                    </span>
                                  ) : isInProgress ? (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                                      Active
                                    </span>
                                  ) : null}
                                </div>

                                <h4 className={`text-xs sm:text-sm font-semibold mt-1 ${
                                  isDone ? 'text-slate-400 line-through' : 'text-slate-100'
                                }`}>
                                  {item.topic_name}
                                </h4>
                              </div>
                            </div>

                            {/* Action Buttons (no-print) */}
                            <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0 no-print">
                              {onOpenNotes && (
                                <button
                                  type="button"
                                  onClick={() => onOpenNotes(item.topic_name, item.subject_name)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Notes
                                </button>
                              )}

                              {onOpenVideo && (
                                <button
                                  type="button"
                                  onClick={() => onOpenVideo(item.id, item.topic_name, item.subject_name)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Video
                                </button>
                              )}

                              {onOpenQuiz && (
                                <button
                                  type="button"
                                  onClick={() => onOpenQuiz(item.id, item.topic_name, item.subject_name)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Quiz
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: VISUAL STEP ROADMAP (Original Tree - Kept exactly as user likes!) */
        /* ========================================================================= */
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
                          `Read notes for 15–20 minutes, watch the concept video, and take the 10-question quiz at the end to master this topic.`}
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
      )}
    </div>
  );
};
