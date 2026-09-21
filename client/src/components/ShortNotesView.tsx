import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Bot,
  Layers,
  ChevronRight,
  Bookmark,
  Share2,
  GitFork,
  Lightbulb,
  Compass,
  Brain,
  HelpCircle
} from 'lucide-react';
import { api, ChapterNote, ExamOption } from '../api/client';
import { MermaidRenderer } from './MermaidRenderer';

interface ShortNotesViewProps {
  initialExamKey?: string;
  onOpenDoubtBot?: (context: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

const EXAM_OPTIONS = [
  { key: 'all', label: 'All Exams / Courses', icon: '🌐' },
  { key: 'neet', label: 'NEET (UG)', icon: '🩺' },
  { key: 'jee_main', label: 'JEE Main', icon: '⚡' },
  { key: 'jee', label: 'JEE Advanced', icon: '🎯' },
  { key: 'cbse12_pcmb', label: 'CBSE 12th (PCMB)', icon: '🔬' },
  { key: 'cbse12_pcb', label: 'CBSE 12th (PCB)', icon: '🧬' },
  { key: 'cbse12', label: 'CBSE 12th (PCM)', icon: '📐' },
  { key: 'class10', label: 'Class 10th (CBSE)', icon: '📚' },
  { key: 'bseb12', label: 'BSEB 12th (Inter)', icon: '🌟' },
  { key: 'bseb10', label: 'BSEB 10th (Matric)', icon: '📖' }
];

const SUBJECT_TABS = [
  { id: 'all', label: 'All Subjects', color: 'indigo' },
  { id: 'Physics', label: 'Physics', color: 'blue' },
  { id: 'Chemistry', label: 'Chemistry', color: 'amber' },
  { id: 'Biology', label: 'Biology', color: 'emerald' },
  { id: 'Mathematics', label: 'Mathematics', color: 'purple' }
];

export const ShortNotesView: React.FC<ShortNotesViewProps> = ({ initialExamKey, onOpenDoubtBot }) => {
  const [selectedExam, setSelectedExam] = useState<string>(initialExamKey || 'all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<ChapterNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<ChapterNote | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'map'>('text');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Fetch notes from server
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getShortNotes({
      search: searchQuery,
      exam: selectedExam,
      subject: selectedSubject
    })
      .then(res => {
        if (isMounted && res && Array.isArray(res.notes)) {
          setNotes(res.notes);
        }
      })
      .catch(err => {
        console.error('Error fetching short notes:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedExam, selectedSubject, searchQuery]);

  // Copy formula helper
  const handleCopyFormula = (formula: string) => {
    if (!formula) return;
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Subject color helper
  const getSubjectBadge = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          accent: 'hover:border-blue-500/50'
        };
      case 'chemistry':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          accent: 'hover:border-amber-500/50'
        };
      case 'biology':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          accent: 'hover:border-emerald-500/50'
        };
      case 'mathematics':
      case 'maths':
      case 'math':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
          accent: 'hover:border-purple-500/50'
        };
      default:
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400',
          accent: 'hover:border-indigo-500/50'
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Full Chapter Short Notes
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Rapid Revision & Formula Sheet
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              High-yield chapter notes, formulas, laws, and common board & entrance exam traps for NEET, JEE, CBSE & BSEB.
            </p>
          </div>

          {/* Quick Count Badge */}
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-xl p-3 px-4 self-start md:self-auto">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-tight">
                {notes.length}
              </div>
              <div className="text-xs text-slate-400">Chapters Available</div>
            </div>
          </div>
        </div>

        {/* Real-time Search Bar */}
        <div className="mt-6 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any chapter, formula, law, or keyword (e.g. friction, optics, carbonyl, genetics, calculus)..."
              className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-indigo-300 flex items-center justify-between px-1">
              <span>Showing results for &ldquo;{searchQuery}&rdquo;</span>
              <button
                onClick={() => setSearchQuery('')}
                className="underline hover:text-white cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Exam / Course Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Target Exam / Course
          </span>
          <span className="text-xs text-slate-500">Select to filter chapters</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {EXAM_OPTIONS.map((exam) => {
            const isSelected = selectedExam === exam.key;
            return (
              <button
                key={exam.key}
                onClick={() => setSelectedExam(exam.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{exam.icon}</span>
                <span>{exam.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {SUBJECT_TABS.map((sub) => {
          const isSelected = selectedSubject.toLowerCase() === sub.id.toLowerCase();
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white shadow border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-48 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-24 h-5 bg-slate-800 rounded-md" />
                <div className="w-3/4 h-6 bg-slate-800 rounded-md" />
                <div className="w-full h-12 bg-slate-800/50 rounded-md" />
              </div>
              <div className="w-1/2 h-4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Chapter Notes Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            We couldn&apos;t find any notes matching your current search query or exam filter.
          </p>
          {(searchQuery || selectedExam !== 'all' || selectedSubject !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedExam('all');
                setSelectedSubject('all');
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const badge = getSubjectBadge(note.subject);
            return (
              <div
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`group cursor-pointer bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 ${badge.accent} rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {note.subject}
                    </span>

                    <div className="flex items-center gap-2">
                      {note.high_yield && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-semibold">
                          <Flame className="w-3 h-3 text-rose-400" /> High Yield
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" /> {note.read_time}
                      </span>
                    </div>
                  </div>

                  {/* Chapter Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                    {note.chapter_title}
                  </h3>

                  {/* Class / Exam level */}
                  <div className="text-xs text-slate-400 mt-1 font-medium">
                    {note.class_level}
                  </div>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {note.summary}
                  </p>
                </div>

                {/* Footer stats and Action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {note.formulas_and_laws?.length || 0} Formulas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {note.key_takeaways?.length || 0} Points
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    Read Notes <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chapter Reader Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4 sticky top-0 z-20 backdrop-blur">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      getSubjectBadge(activeNote.subject).bg
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getSubjectBadge(activeNote.subject).dot
                      }`}
                    />
                    {activeNote.subject}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs">
                    {activeNote.class_level}
                  </span>

                  {activeNote.high_yield && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> High Yield For Exams
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-1">
                    <Clock className="w-3 h-3" /> {activeNote.read_time}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {activeNote.chapter_title}
                </h2>
              </div>

              <button
                onClick={() => setActiveNote(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close notes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Mode Switcher Bar */}
            <div className="px-5 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-[73px] z-10 backdrop-blur">
              <div className="inline-flex rounded-xl p-1 bg-slate-800/90 border border-slate-700/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'text'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Text Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Visual Concept Map (Mermaid)</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
                {viewMode === 'map' ? 'Interactive Flowchart • Zoom & Pan' : 'Structured Summary & Learning Aids'}
              </span>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* VISUAL CONCEPT MAP (MERMAID) VIEW */}
              {viewMode === 'map' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-200 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitFork className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Interactive concept hierarchy and mathematical relation map.</span>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30 font-bold">
                      Mermaid.js Diagram
                    </span>
                  </div>

                  <MermaidRenderer
                    chart={
                      activeNote.concept_map_mermaid ||
                      `graph TD\n  A["${activeNote.chapter_title}"] --> B["Core Concepts"]\n  A --> C["Key Formulas"]\n  B --> B1["Theoretical Foundations"]\n  C --> C1["Exam Applications"]`
                    }
                  />
                </div>
              )}

              {/* LEARNING AIDS: MNEMONIC & REAL-LIFE EXAMPLE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeNote.mnemonic && (
                  <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 text-amber-200 space-y-1.5 shadow-sm">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Mnemonic Memory Trick</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-amber-100 italic leading-relaxed">
                      "{activeNote.mnemonic}"
                    </p>
                  </div>
                )}

                {activeNote.real_life_example && (
                  <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-500/30 text-cyan-200 space-y-1.5 shadow-sm">
                    <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Real-Life Relatable Example</span>
                    </div>
                    <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                      {activeNote.real_life_example}
                    </p>
                  </div>
                )}
              </div>

              {/* Executive Summary (in Text view) */}
              {viewMode === 'text' && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-sm leading-relaxed">
                  <span className="font-semibold text-white block mb-1">Executive Summary:</span>
                  {activeNote.summary}
                </div>
              )}

              {/* Key Takeaways */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Takeaways & Core Concepts
                </h4>
                <div className="space-y-2">
                  {activeNote.key_takeaways?.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800 text-sm text-slate-200 leading-relaxed"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas & Laws */}
              {activeNote.formulas_and_laws && activeNote.formulas_and_laws.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Essential Formulas & Laws
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeNote.formulas_and_laws.map((item, idx) => {
                      const isCopied = copiedFormula === item.formula;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-slate-400">
                              {item.name}
                            </span>
                            <button
                              onClick={() => handleCopyFormula(item.formula)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Copy formula"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="font-mono text-sm sm:text-base font-semibold text-indigo-300 bg-indigo-950/30 px-3 py-2 rounded-lg border border-indigo-500/20 break-words">
                            {item.formula}
                          </div>
                          {item.unit && (
                            <div className="mt-2 text-[11px] text-slate-500 italic">
                              Unit / Type: {item.unit}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exam Traps & Examiner Tips / Common Mistakes */}
              {(activeNote.common_mistakes || activeNote.exam_traps_and_tips) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Common Mistakes & Examiner Traps
                  </h4>
                  <div className="space-y-2">
                    {(activeNote.common_mistakes || activeNote.exam_traps_and_tips || []).map((trap, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs sm:text-sm text-rose-200 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{trap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicable Exams List */}
              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1.5 uppercase font-semibold">
                  Applicable for Target Exams:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNote.applicable_exams?.map((examId) => (
                    <span
                      key={examId}
                      className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono uppercase"
                    >
                      {examId.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Sticky Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (onOpenDoubtBot) {
                    onOpenDoubtBot({
                      topic: activeNote.chapter_title,
                      subject: activeNote.subject,
                      exam: activeNote.applicable_exams?.[0] || 'neet',
                      doubt: `Explain the key concepts of ${activeNote.chapter_title} with examples and formula derivations.`
                    });
                    setActiveNote(null);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" /> Ask AI Doubt Bot about this Chapter
              </button>

              <button
                onClick={() => setActiveNote(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
