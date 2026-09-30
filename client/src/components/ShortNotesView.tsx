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
  GitFork,
  Lightbulb,
  Compass,
  FileText,
  Zap,
  Bookmark
} from 'lucide-react';
import { api, ChapterNote } from '../api/client';
import { MermaidRenderer } from './MermaidRenderer';

interface ShortNotesViewProps {
  initialExamKey?: string;
  onOpenDoubtBot?: (context: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

const EXAM_OPTIONS = [
  { key: 'all', label: 'All Exams & Boards', icon: '🌐' },
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
  { id: 'all', label: 'All Subjects', icon: '📚' },
  { id: 'Physics', label: 'Physics', icon: '⚡' },
  { id: 'Chemistry', label: 'Chemistry', icon: '🧪' },
  { id: 'Biology', label: 'Biology', icon: '🧬' },
  { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'English', label: 'English', icon: '📖' },
  { id: 'Hindi', label: 'Hindi', icon: '📝' },
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Social Science', label: 'Social Science', icon: '🌍' }
];

export const ShortNotesView: React.FC<ShortNotesViewProps> = ({ initialExamKey, onOpenDoubtBot }) => {
  const [selectedExam, setSelectedExam] = useState<string>(initialExamKey || 'all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHighYield, setOnlyHighYield] = useState<boolean>(false);
  const [notes, setNotes] = useState<ChapterNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<ChapterNote | null>(null);
  const [modalTab, setModalTab] = useState<'summary' | 'formulas' | 'map' | 'tricks' | 'traps'>('summary');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pivott_bookmarked_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  // Toggle bookmark helper
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedNotes(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('pivott_bookmarked_notes', JSON.stringify(next));
      } catch {
        // Ignore storage errors in private browsing
      }
      return next;
    });
  };

  // Subject color helper
  const getSubjectBadge = (subject: string) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('physics')) {
      return {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400',
        accent: 'hover:border-blue-500/60 group-hover:border-blue-500/50',
        tagBg: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }
    if (s.includes('chemistry')) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        accent: 'hover:border-amber-500/60 group-hover:border-amber-500/50',
        tagBg: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    if (s.includes('biology')) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        accent: 'hover:border-emerald-500/60 group-hover:border-emerald-500/50',
        tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (s.includes('math')) {
      return {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400',
        accent: 'hover:border-purple-500/60 group-hover:border-purple-500/50',
        tagBg: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    }
    if (s.includes('english')) {
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
        accent: 'hover:border-rose-500/60 group-hover:border-rose-500/50',
        tagBg: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }
    if (s.includes('computer')) {
      return {
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400',
        accent: 'hover:border-cyan-500/60 group-hover:border-cyan-500/50',
        tagBg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      };
    }
    return {
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      dot: 'bg-teal-400',
      accent: 'hover:border-teal-500/60 group-hover:border-teal-500/50',
      tagBg: 'bg-teal-50 text-teal-700 border-teal-200'
    };
  };

  // Filter notes client-side for High-Yield toggle
  const displayedNotes = useMemo(() => {
    if (!onlyHighYield) return notes;
    return notes.filter(n => n.high_yield);
  }, [notes, onlyHighYield]);

  // Total counts
  const highYieldCount = useMemo(() => {
    return notes.filter(n => n.high_yield).length;
  }, [notes]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* 1. HERO COCKPIT BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-5 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-56 h-56 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>NCERT & Entrance High-Yield Notes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Rapid Chapter Notes & Formula Vault
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Short crisp notes, formulas, memory mnemonics, Mermaid diagrams, and examiner trap alerts for NEET, JEE & Boards.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/70 rounded-2xl p-3 px-4 shadow-sm text-center min-w-[100px]">
                <div className="text-xl font-black text-teal-300">{notes.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Chapters</div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-rose-500/30 rounded-2xl p-3 px-4 shadow-sm text-center min-w-[100px]">
                <div className="text-xl font-black text-rose-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current text-rose-400" />
                  <span>{highYieldCount}</span>
                </div>
                <div className="text-[11px] text-rose-300 font-medium">High Yield</div>
              </div>
            </div>
          </div>

          {/* Real-time Search Input with Topic Suggestions */}
          <div className="space-y-2 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any chapter, formula, mnemonic or concept (e.g. Optics, Thermodynamics, Genetics, Laws of Motion)..."
                className="w-full pl-11 pr-12 py-3 bg-slate-900/95 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-inner transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
              <span className="shrink-0 text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Zap className="w-3 h-3 text-amber-400" /> Quick Search:
              </span>
              {['Laws of Motion', 'Thermodynamics', 'Optics', 'Chemical Bonding', 'Genetics', 'Calculus', 'Electromagnetism'].map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSearchQuery(topic)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-indigo-600/40 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 transition-colors shrink-0 cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR: TARGET EXAM & SUBJECT SELECTION */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Exam Pills Scroller */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-600" /> Target Exam / Board
            </span>
            <span className="text-[11px] text-slate-400">Click to filter syllabus</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {EXAM_OPTIONS.map(exam => {
              const isSelected = selectedExam === exam.key;
              return (
                <button
                  key={exam.key}
                  type="button"
                  onClick={() => setSelectedExam(exam.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <span>{exam.icon}</span>
                  <span>{exam.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter Pills & High-Yield Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUBJECT_TABS.map(sub => {
              const isSelected = selectedSubject.toLowerCase() === sub.id.toLowerCase();
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* High Yield Toggle Pill */}
          <button
            type="button"
            onClick={() => setOnlyHighYield(!onlyHighYield)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-auto cursor-pointer ${
              onlyHighYield
                ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-400/30'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-rose-500" />
            <span>{onlyHighYield ? '✓ Showing High-Yield Only' : '🔥 High-Yield Chapters Only'}</span>
          </button>
        </div>
      </div>

      {/* 3. NOTES GRID DISPLAY */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(idx => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-5 h-56 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="w-24 h-6 bg-slate-200 rounded-lg" />
                  <div className="w-16 h-6 bg-slate-200 rounded-lg" />
                </div>
                <div className="w-3/4 h-6 bg-slate-200 rounded-lg" />
                <div className="w-full h-12 bg-slate-100 rounded-lg" />
              </div>
              <div className="w-1/2 h-4 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : displayedNotes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Chapter Notes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query or switching to &ldquo;All Exams & Boards&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedExam('all');
              setSelectedSubject('all');
              setOnlyHighYield(false);
            }}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{displayedNotes.length}</strong> chapter notes
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Interactive Reader • Formula Sheets • Mermaid Maps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedNotes.map(note => {
              const badge = getSubjectBadge(note.subject);
              const isBookmarked = !!bookmarkedNotes[note.id];

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note);
                    setModalTab('summary');
                  }}
                  className={`group cursor-pointer bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 relative ${badge.accent}`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Subject Pill + High Yield Tag + Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.tagBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {note.subject}
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {note.class_level}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {note.high_yield && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black">
                            <Flame className="w-3 h-3 fill-current text-rose-500" /> High-Yield
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={e => toggleBookmark(note.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                      {note.chapter_title}
                    </h3>

                    {/* Summary Snippet */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {note.summary}
                    </p>

                    {/* Mnemonic / Example Mini Preview on card */}
                    {note.mnemonic && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 italic font-medium">Trick: &ldquo;{note.mnemonic}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {note.read_time || '5 min'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600">
                        {note.formulas_and_laws?.length || 0} Formulas
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      <span>Read Notes</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CHAPTER READER MODAL (HIGH-CLARITY STUDENT VIEWER) */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div 
            className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-4 sticky top-0 z-20 backdrop-blur">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSubjectBadge(activeNote.subject).tagBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getSubjectBadge(activeNote.subject).dot}`} />
                    {activeNote.subject}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                    {activeNote.class_level}
                  </span>

                  {activeNote.high_yield && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-black">
                      <Flame className="w-3 h-3 fill-current text-rose-500" /> High-Yield For Exam
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3 h-3" /> {activeNote.read_time || '5 min read'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {activeNote.chapter_title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveNote(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                title="Close notes"
                aria-label="Close notes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Interactive Learning Navigation Tabs */}
            <div className="px-5 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none sticky top-[80px] z-10">
              <div className="inline-flex rounded-2xl p-1 bg-white border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setModalTab('summary')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    modalTab === 'summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Key Points & Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('formulas')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    modalTab === 'formulas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Formulas ({activeNote.formulas_and_laws?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('map')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    modalTab === 'map' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Concept Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('tricks')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    modalTab === 'tricks' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Mnemonic & Examples</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('traps')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    modalTab === 'traps' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Exam Traps</span>
                </button>
              </div>
            </div>

            {/* Modal Body - Tabbed for Super Clean Reading */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
              {/* TAB 1: SUMMARY & CORE TAKEAWAYS */}
              {modalTab === 'summary' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Executive Summary Callout */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-950 text-xs sm:text-sm leading-relaxed shadow-xs">
                    <span className="font-black text-indigo-900 uppercase tracking-wide block mb-1 text-xs">
                      📌 Chapter Overview:
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeNote.summary}</p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Core Concepts & Must-Know Rules
                    </h4>
                    <div className="space-y-2.5">
                      {activeNote.key_takeaways?.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs hover:bg-white transition-colors"
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1 font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FORMULAS & LAWS CHEAT SHEET */}
              {modalTab === 'formulas' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" /> High-Yield Formula Cheat Sheet
                    </span>
                    <span className="text-[11px] text-slate-400">Click icon to copy formula</span>
                  </div>

                  {activeNote.formulas_and_laws && activeNote.formulas_and_laws.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {activeNote.formulas_and_laws.map((item, idx) => {
                        const isCopied = copiedFormula === item.formula;
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 flex flex-col justify-between transition-all shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-800">
                                {item.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyFormula(item.formula)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Copy formula"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="font-mono text-sm sm:text-base font-bold text-indigo-900 bg-indigo-50/80 px-3.5 py-2.5 rounded-xl border border-indigo-200/60 break-words">
                              {item.formula}
                            </div>

                            {item.unit && (
                              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                                Unit / Dimensional Form: <span className="font-mono text-slate-700">{item.unit}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No formula entries cataloged for this qualitative chapter.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VISUAL CONCEPT MAP (MERMAID) */}
              {modalTab === 'map' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitFork className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-medium">Interactive concept relation & flow hierarchy map.</span>
                    </div>
                    <span className="text-[10px] bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300 font-black text-teal-800">
                      Visual Map
                    </span>
                  </div>

                  <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
                    <MermaidRenderer
                      chart={
                        activeNote.concept_map_mermaid ||
                        `graph TD\n  A["${activeNote.chapter_title}"] --> B["Core Principles"]\n  A --> C["Mathematical Formulas"]\n  B --> B1["Definitions & Laws"]\n  C --> C1["Exam Numerical Applications"]`
                      }
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: MNEMONICS & PRACTICAL EXAMPLES */}
              {modalTab === 'tricks' && (
                <div className="space-y-4 animate-fade-in">
                  {activeNote.mnemonic && (
                    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 shadow-xs">
                      <div className="flex items-center space-x-2 text-amber-800 font-black text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span>Mnemonic Memory Formula</span>
                      </div>
                      <p className="text-sm sm:text-base font-black text-amber-950 leading-relaxed font-sans">
                        &ldquo;{activeNote.mnemonic}&rdquo;
                      </p>
                      <p className="text-xs text-amber-700">
                        Use this memory trigger to quickly recall formulas and sequences during timed exams.
                      </p>
                    </div>
                  )}

                  {activeNote.real_life_example && (
                    <div className="p-5 rounded-3xl bg-cyan-50 border border-cyan-200 text-cyan-950 space-y-2 shadow-xs">
                      <div className="flex items-center space-x-2 text-cyan-800 font-black text-xs uppercase tracking-wider">
                        <Compass className="w-4 h-4 text-cyan-600" />
                        <span>Real-Life Relatable Example</span>
                      </div>
                      <p className="text-xs sm:text-sm text-cyan-900 leading-relaxed font-medium">
                        {activeNote.real_life_example}
                      </p>
                    </div>
                  )}

                  {!activeNote.mnemonic && !activeNote.real_life_example && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No special mnemonics recorded for this chapter. Check Key Points for memory rules.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: EXAM TRAPS & EXAMINER TIPS */}
              {modalTab === 'traps' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold">Avoid negative marks by watching out for these frequent mistakes:</span>
                  </div>

                  {(activeNote.common_mistakes || activeNote.exam_traps_and_tips) && (
                    <div className="space-y-2.5">
                      {(activeNote.common_mistakes || activeNote.exam_traps_and_tips || []).map((trap, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 text-xs sm:text-sm text-rose-950 leading-relaxed flex items-start gap-3 shadow-2xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            !
                          </span>
                          <span className="font-medium">{trap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Target Exam Tag List */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Applicable In:</span>
                {activeNote.applicable_exams?.map(examId => (
                  <span
                    key={examId}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {examId.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenDoubtBot) {
                    onOpenDoubtBot({
                      topic: activeNote.chapter_title,
                      subject: activeNote.subject,
                      exam: activeNote.applicable_exams?.[0] || 'neet',
                      doubt: `Explain the key concepts and formulas of ${activeNote.chapter_title} in simple terms with step-by-step examples.`
                    });
                    setActiveNote(null);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Doubt Bot about this Chapter</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNote(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
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
