import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, Play, 
  ChevronRight, Sparkles, Award, ArrowRight, ShieldCheck, HelpCircle,
  Printer, Download, Copy, Check, Search, FileText, Compass, ListFilter,
  Layers, ArrowDownToLine, Zap
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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

  // 1. Download Guaranteed One-Page Vector PDF (A4 - Strictly 1 Page!)
  const handleDownloadOnePagePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 10;
      const usableWidth = pageWidth - (marginX * 2); // 190mm

      // Top Header Banner (Dark Navy)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(marginX, 8, usableWidth, 22, 'F');

      // Teal accent bottom strip
      doc.setFillColor(13, 148, 136); // teal-600
      doc.rect(marginX, 29.5, usableWidth, 1.2, 'F');

      // Title & Subtitle
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('PIVOTT | ONE-PAGE QUICK STUDY ROADMAP', marginX + 4, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`${title} • High-Yield Quick Recap & Timetable Schedule`, marginX + 4, 21);

      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240); // slate-200
      const metaLine = `Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  |  Total Topics: ${items.length}  |  Completed: ${completedCount} (${progressPercent}%)  |  Total Time: ${(totalMinutes / 60).toFixed(1)} hrs  |  Days: ${uniqueDatesCount}`;
      doc.text(metaLine, marginX + 4, 26.5);

      let currentY = 34;

      // Section 1: Quick Recap Strategy & Subject Breakdown Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.roundedRect(marginX, currentY, usableWidth, 15, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('QUICK RECAP STRATEGY & HIGH-YIELD TARGETS', marginX + 3.5, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85); // slate-700

      // Subject counts
      const subjectSummary = subjectList.map(s => {
        const c = items.filter(i => i.subject_name === s).length;
        return `${s}: ${c}`;
      }).join('  •  ');
      doc.text(`Subject Breakdown:  ${subjectSummary || 'All Chapters'}`, marginX + 3.5, currentY + 8.5);

      doc.setTextColor(71, 85, 105);
      doc.text('3-Step Success Protocol:  1. 5-Min Concept Video & Visual Map  →  2. Key Formulas/Notes  →  3. 10 PYQ Quiz Practice', marginX + 3.5, currentY + 12.5);

      currentY += 18;

      // Section 2: Master Quick Schedule Table
      const footerReservedHeight = 12;
      const availableTableHeight = pageHeight - currentY - footerReservedHeight;

      const tableData = filteredItems.length > 0 ? filteredItems : items;
      const totalRows = tableData.length;

      // If more than 18 items, use 2-column compact layout so it comfortably fits on 1 page!
      const useDualColumn = totalRows > 18;

      if (!useDualColumn) {
        // SINGLE FULL-WIDTH TABLE
        const colWidths = {
          dayDate: 32,
          slot: 28,
          subject: 28,
          topic: 70,
          duration: 14,
          status: 18
        };

        const tableHeaderHeight = 6;
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(marginX, currentY, usableWidth, tableHeaderHeight, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);

        let colX = marginX + 2;
        doc.text('DAY & DATE', colX, currentY + 4.2); colX += colWidths.dayDate;
        doc.text('TIME SLOT', colX, currentY + 4.2); colX += colWidths.slot;
        doc.text('SUBJECT', colX, currentY + 4.2); colX += colWidths.subject;
        doc.text('TOPIC (QUICK RECAP)', colX, currentY + 4.2); colX += colWidths.topic;
        doc.text('DURATION', colX, currentY + 4.2); colX += colWidths.duration;
        doc.text('STATUS', colX, currentY + 4.2);

        currentY += tableHeaderHeight;

        // Dynamic row height
        const tableBodySpace = availableTableHeight - tableHeaderHeight;
        const calcRowHeight = totalRows > 0 ? tableBodySpace / totalRows : 7;
        const rowHeight = Math.min(8.0, Math.max(5.0, calcRowHeight));
        const fontSize = rowHeight < 5.8 ? 6.2 : 7.0;

        doc.setFontSize(fontSize);

        tableData.forEach((item, idx) => {
          if (currentY + rowHeight > pageHeight - footerReservedHeight) return;

          if (idx % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(248, 250, 252);
          }
          doc.rect(marginX, currentY, usableWidth, rowHeight, 'F');

          doc.setDrawColor(226, 232, 240);
          doc.line(marginX, currentY + rowHeight, marginX + usableWidth, currentY + rowHeight);

          let x = marginX + 2;
          const textY = currentY + (rowHeight * 0.68);

          // Date
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          const dStr = item.date_str ? `${item.date_str}${item.day_name ? ` (${item.day_name.slice(0, 3)})` : ''}` : `Day ${idx + 1}`;
          doc.text(doc.splitTextToSize(dStr, colWidths.dayDate - 3)[0] || '', x, textY);
          x += colWidths.dayDate;

          // Slot
          const sStr = item.time_slot || '-';
          doc.text(doc.splitTextToSize(sStr, colWidths.slot - 2)[0] || '', x, textY);
          x += colWidths.slot;

          // Subject
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(2, 132, 199); // sky-600
          doc.text(doc.splitTextToSize(item.subject_name || '', colWidths.subject - 2)[0] || '', x, textY);
          x += colWidths.subject;

          // Topic
          doc.setFont('helvetica', item.status === 'done' ? 'normal' : 'bold');
          doc.setTextColor(item.status === 'done' ? 100 : 15, item.status === 'done' ? 116 : 23, item.status === 'done' ? 139 : 42);
          let tName = item.topic_name || '';
          if (tName.length > 40) tName = tName.substring(0, 38) + '...';
          doc.text(tName, x, textY);
          x += colWidths.topic;

          // Duration
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`${item.allocated_minutes || 0}m`, x, textY);
          x += colWidths.duration;

          // Status
          if (item.status === 'done') {
            doc.setTextColor(16, 185, 129); // emerald-500
            doc.setFont('helvetica', 'bold');
            doc.text('DONE [✓]', x, textY);
          } else {
            doc.setTextColor(217, 119, 6); // amber-600
            doc.setFont('helvetica', 'normal');
            doc.text('PENDING', x, textY);
          }

          currentY += rowHeight;
        });
      } else {
        // DUAL COLUMN COMPACT TABLE (for 19+ items to guarantee 1 single page)
        const colWidth = (usableWidth - 4) / 2; // 93mm each
        const halfCount = Math.ceil(totalRows / 2);
        const colHeaderHeight = 5.5;

        // Calculate dynamic row height
        const tableBodySpace = availableTableHeight - colHeaderHeight;
        const calcRowHeight = tableBodySpace / halfCount;
        const rowHeight = Math.min(6.5, Math.max(4.2, calcRowHeight));
        const fontSize = rowHeight < 4.8 ? 5.5 : 6.3;

        // Sub-column widths inside each 93mm column:
        const subW = { date: 19, subj: 16, topic: 42, stat: 16 };

        // Headers for Column 1 & Column 2
        [marginX, marginX + colWidth + 4].forEach(startX => {
          doc.setFillColor(30, 41, 59);
          doc.rect(startX, currentY, colWidth, colHeaderHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.2);

          let hx = startX + 1.5;
          doc.text('DATE', hx, currentY + 3.8); hx += subW.date;
          doc.text('SUBJ', hx, currentY + 3.8); hx += subW.subj;
          doc.text('TOPIC (RECAP)', hx, currentY + 3.8); hx += subW.topic;
          doc.text('STATUS', hx, currentY + 3.8);
        });

        currentY += colHeaderHeight;
        const tableStartY = currentY;

        doc.setFontSize(fontSize);

        tableData.forEach((item, idx) => {
          const isSecondCol = idx >= halfCount;
          const colIndex = isSecondCol ? idx - halfCount : idx;
          const startX = isSecondCol ? (marginX + colWidth + 4) : marginX;
          const rowY = tableStartY + (colIndex * rowHeight);

          if (rowY + rowHeight > pageHeight - footerReservedHeight) return;

          if (idx % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(248, 250, 252);
          }
          doc.rect(startX, rowY, colWidth, rowHeight, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.line(startX, rowY + rowHeight, startX + colWidth, rowY + rowHeight);

          let x = startX + 1.5;
          const textY = rowY + (rowHeight * 0.68);

          // Date
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          const dStr = item.date_str ? item.date_str.slice(5) : `D${idx + 1}`;
          doc.text(dStr, x, textY);
          x += subW.date;

          // Subject
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(2, 132, 199);
          const sName = (item.subject_name || '').slice(0, 7);
          doc.text(sName, x, textY);
          x += subW.subj;

          // Topic
          doc.setFont('helvetica', item.status === 'done' ? 'normal' : 'bold');
          doc.setTextColor(item.status === 'done' ? 100 : 15, item.status === 'done' ? 116 : 23, item.status === 'done' ? 139 : 42);
          let tName = item.topic_name || '';
          if (tName.length > 25) tName = tName.substring(0, 23) + '..';
          doc.text(tName, x, textY);
          x += subW.topic;

          // Status
          if (item.status === 'done') {
            doc.setTextColor(16, 185, 129);
            doc.setFont('helvetica', 'bold');
            doc.text('[✓] DONE', x, textY);
          } else {
            doc.setTextColor(217, 119, 6);
            doc.setFont('helvetica', 'normal');
            doc.text('PENDING', x, textY);
          }
        });
      }

      // Footer: Strictly Page 1 of 1
      const footerY = pageHeight - 5;
      doc.setDrawColor(203, 213, 225);
      doc.line(marginX, footerY - 2.5, marginX + usableWidth, footerY - 2.5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      doc.text('Pivott: Consistency is the key to top rank • Complete daily goals • Strict 1-Page Quick Recap', marginX + 2, footerY);

      doc.setFont('helvetica', 'bold');
      doc.text('Page 1 of 1 (Guaranteed One-Page PDF)', marginX + usableWidth - 52, footerY);

      // Save PDF file
      const filename = `Pivott_OnePage_Study_Roadmap_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err: any) {
      console.error('Failed to generate 1-page PDF:', err);
      window.print();
    }
  };

  // 2. Browser Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // 3. Download formatted text file schedule
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

  // 4. Copy Quick Schedule to Clipboard
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
        <div className="flex items-center gap-2 flex-wrap">
          {/* Prominent Guaranteed 1-Page PDF Download */}
          <button
            type="button"
            onClick={handleDownloadOnePagePDF}
            title="Download Instant One-Page PDF Schedule"
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-teal-500/25 cursor-pointer flex items-center gap-1.5 ring-1 ring-teal-400/30"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Download 1-Page PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save as PDF (Strict 1-Page)"
            className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Print 1-Page</span>
          </button>

          <button
            type="button"
            onClick={handleCopySchedule}
            title="Copy Schedule to Clipboard"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadText}
            title="Download Schedule File (.txt)"
            className="px-2.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.txt</span>
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
      {/* MODE 1: ONE-PAGE QUICK ROADMAP (Compact Recap Table & Single-Page Matrix)  */}
      {/* ========================================================================= */}
      {roadmapMode === 'onepage' ? (
        <div className="space-y-4 printable-onepage-roadmap">
          {/* Executive Quick Stats & Strategy Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            {/* 4 Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Days</span>
                  <span className="text-sm font-black text-white">{uniqueDatesCount} Scheduled</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Topics</span>
                  <span className="text-sm font-black text-white">{filteredItems.length} Total</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Study Time</span>
                  <span className="text-sm font-black text-white">{(totalMinutes / 60).toFixed(1)} hrs</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mastery</span>
                  <span className="text-sm font-black text-emerald-400">{completedCount}/{totalCount} ({progressPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Quick Recap Strategy & Subject Breakdown Strip */}
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-teal-400 font-bold flex items-center gap-1 shrink-0">
                  <Zap className="w-3.5 h-3.5" /> High-Yield Strategy:
                </span>
                <span className="text-slate-300 font-mono text-[11px]">
                  1. 5-Min Video Map  →  2. Key Formulas  →  3. 10 PYQ Quiz Practice
                </span>
              </div>

              {subjectList.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {subjectList.map(s => {
                    const count = items.filter(i => i.subject_name === s).length;
                    return (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[10px] font-semibold text-slate-300">
                        {s}: <strong className="text-teal-300">{count}</strong>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* High-Density Quick Schedule Matrix / Table */}
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 text-sm">
              No milestones found matching your filter criteria.
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Day & Date</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Time Slot</th>
                      <th className="py-2.5 px-3 min-w-[110px]">Subject</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Topic (Quick Recap)</th>
                      <th className="py-2.5 px-3 w-20 text-center">Duration</th>
                      <th className="py-2.5 px-3 w-24 text-center">Status</th>
                      <th className="py-2.5 px-3 w-36 text-right no-print">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredItems.map((item, idx) => {
                      const isDone = item.status === 'done';
                      const isInProgress = item.status === 'in_progress';

                      return (
                        <tr
                          key={item.id || idx}
                          className={`transition-colors hover:bg-slate-800/50 ${
                            isDone ? 'bg-emerald-950/10' : idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/20'
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-slate-500 font-sans text-[11px]">
                            {idx + 1}
                          </td>

                          <td className="py-2 px-3 text-slate-200 font-bold whitespace-nowrap text-[11px]">
                            <div className="flex items-center gap-1.5 font-mono">
                              <Calendar className="w-3 h-3 text-teal-400 shrink-0" />
                              <span>{item.date_str || `Day ${idx + 1}`}</span>
                              {item.day_name && (
                                <span className="text-slate-400 font-normal">({item.day_name.slice(0, 3)})</span>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{item.time_slot || '-'}</span>
                            </div>
                          </td>

                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              {item.subject_name}
                            </span>
                          </td>

                          <td className="py-2 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-medium ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                                {item.topic_name}
                              </span>
                            </div>
                          </td>

                          <td className="py-2 px-3 text-center text-slate-400 whitespace-nowrap text-[11px]">
                            {item.allocated_minutes || 0}m
                          </td>

                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                Done ✓
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                                Active ⚡
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                                Scheduled ⏳
                              </span>
                            )}
                          </td>

                          <td className="py-2 px-3 text-right whitespace-nowrap no-print">
                            <div className="flex items-center justify-end space-x-1">
                              {onOpenNotes && (
                                <button
                                  type="button"
                                  onClick={() => onOpenNotes(item.topic_name, item.subject_name)}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors cursor-pointer"
                                >
                                  Notes
                                </button>
                              )}

                              {onOpenVideo && (
                                <button
                                  type="button"
                                  onClick={() => onOpenVideo(item.id, item.topic_name, item.subject_name)}
                                  className="px-2 py-0.5 rounded-md bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                                >
                                  Video
                                </button>
                              )}

                              {onOpenQuiz && (
                                <button
                                  type="button"
                                  onClick={() => onOpenQuiz(item.id, item.topic_name, item.subject_name)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Quiz
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary Strip */}
              <div className="bg-slate-950/80 border-t border-slate-800 p-2.5 px-4 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <span>Showing {filteredItems.length} topics across {uniqueDatesCount} days</span>
                <span className="text-teal-400 font-mono">Pivott: Consistency is key to top rank 🚀</span>
              </div>
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
