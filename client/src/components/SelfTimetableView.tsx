import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  X, 
  Award, 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  Trash2, 
  Smile, 
  Layers, 
  FileText, 
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Compass
} from 'lucide-react';
import { api, SelfTimetableEntry, SelfTimetableAnalytics } from '../api/client';
import { MermaidRenderer } from './MermaidRenderer';
import { MarkdownKatexRenderer } from './MarkdownKatexRenderer';
import { ConceptVideoModal } from './ConceptVideoModal';
import { BASE_SUBJECTS, getCurriculumChapters } from '../data/curriculumData';
import { StudyRoadmapView, RoadmapItem } from './StudyRoadmapView';
import { GameLevelView, GameLevelItem } from './GameLevelView';

interface SelfTimetableViewProps {
  onBackToAccount?: () => void;
}

export const SelfTimetableView: React.FC<SelfTimetableViewProps> = ({ onBackToAccount }) => {
  const [entries, setEntries] = useState<SelfTimetableEntry[]>([]);
  const [analytics, setAnalytics] = useState<SelfTimetableAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilterSubject, setActiveFilterSubject] = useState<string>('all');

  // Form states
  const [selectedClass, setSelectedClass] = useState<number>(8);
  const [selectedSubject, setSelectedSubject] = useState<string>('Biology');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [isAddingCustomSubject, setIsAddingCustomSubject] = useState<boolean>(false);
  const [isCustomChapterMode, setIsCustomChapterMode] = useState<boolean>(false);
  const [chapterNameInput, setChapterNameInput] = useState<string>('');
  const [dailyMinutesInput, setDailyMinutesInput] = useState<number>(30);
  const [viewMode, setViewMode] = useState<'list' | 'roadmap' | 'game'>('list');
  const [formError, setFormError] = useState<string | null>(null);

  // Available curriculum syllabus chapters for currently selected class & subject
  const currentSubject = isAddingCustomSubject ? customSubjectInput.trim() : selectedSubject;
  const availableChapters = React.useMemo(() => {
    return getCurriculumChapters(selectedClass, currentSubject || 'Biology');
  }, [selectedClass, currentSubject]);

  // Notes Modal state
  const [viewingNotesEntry, setViewingNotesEntry] = useState<SelfTimetableEntry | null>(null);

  // Video Modal state
  const [activeVideoEntry, setActiveVideoEntry] = useState<SelfTimetableEntry | null>(null);

  // Direct Quiz Modal state
  const [activeQuizEntry, setActiveQuizEntry] = useState<SelfTimetableEntry | null>(null);
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isEvaluatingQuiz, setIsEvaluatingQuiz] = useState<boolean>(false);

  // Re-plan Modal state
  const [isReplanModalOpen, setIsReplanModalOpen] = useState<boolean>(false);
  const [replanDays, setReplanDays] = useState<number>(14);
  const [replanDailyBudget, setReplanDailyBudget] = useState<number>(90);
  const [replanResultText, setReplanResultText] = useState<string | null>(null);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedEntries, fetchedAnalytics] = await Promise.all([
        api.selfTimetable.getEntries(),
        api.selfTimetable.getAnalytics()
      ]);
      setEntries(fetchedEntries);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Failed to load self timetable data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Chapter Handler
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const subjectToUse = isAddingCustomSubject ? customSubjectInput.trim() : selectedSubject;

    if (!subjectToUse) {
      setFormError('Please select or specify a subject.');
      return;
    }

    if (!chapterNameInput.trim()) {
      setFormError('Please enter a chapter or topic name (e.g. "Chapter 4: Photosynthesis").');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry = await api.selfTimetable.addEntry({
        class_level: selectedClass,
        subject: subjectToUse,
        chapter_topic_name: chapterNameInput.trim(),
        daily_minutes: dailyMinutesInput
      });

      setEntries(prev => [newEntry, ...prev]);
      setChapterNameInput('');
      setIsCustomChapterMode(false);
      if (isAddingCustomSubject) {
        setIsAddingCustomSubject(false);
        setCustomSubjectInput('');
      }

      // Refresh analytics
      api.selfTimetable.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      setFormError(err.message || 'Failed to auto-fetch and add chapter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status toggle handler
  const handleStatusChange = async (id: string, newStatus: 'not_started' | 'in_progress' | 'done' | 'deferred') => {
    try {
      await api.selfTimetable.updateStatus(id, newStatus);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      api.selfTimetable.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete chapter handler
  const handleDeleteEntry = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from your Self Timetable?`)) return;
    try {
      await api.selfTimetable.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      api.selfTimetable.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      console.error('Failed to delete chapter entry:', err);
    }
  };

  // Quiz submission handler
  const handleSubmitQuiz = async () => {
    if (!activeQuizEntry || !activeQuizEntry.quiz_questions) return;
    setIsEvaluatingQuiz(true);

    let score = 0;
    activeQuizEntry.quiz_questions.forEach((q, idx) => {
      if (quizUserAnswers[idx] === q.correct_index) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      const res = await api.selfTimetable.submitQuiz(activeQuizEntry.id, {
        score,
        total_questions: activeQuizEntry.quiz_questions.length
      });

      if (res.passed) {
        setEntries(prev => prev.map(e => e.id === activeQuizEntry.id ? { ...e, status: 'done' } : e));
      }
      api.selfTimetable.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err);
    } finally {
      setIsEvaluatingQuiz(false);
    }
  };

  // Execute Re-Plan
  const handleExecuteReplan = async () => {
    setIsReplanning(true);
    setReplanResultText(null);
    try {
      const res = await api.selfTimetable.replan({
        target_days: replanDays,
        daily_budget_minutes: replanDailyBudget
      });
      setReplanResultText(res.summary_text);
      // Reload entries and analytics
      const [updatedEntries, updatedAnalytics] = await Promise.all([
        api.selfTimetable.getEntries(),
        api.selfTimetable.getAnalytics()
      ]);
      setEntries(updatedEntries);
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      setReplanResultText(`Re-plan failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReplanning(false);
    }
  };

  // Distinct subjects present in user entries
  const userSubjects = Array.from(new Set(entries.map(e => e.subject)));
  const filteredEntries = activeFilterSubject === 'all'
    ? entries
    : entries.filter(e => e.subject === activeFilterSubject);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      
      {/* Top Header & Re-plan Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-teal-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Non-Exam Personal Study Tracker
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Self Timetable (Class 1–12)
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl leading-relaxed">
              Build your own independent school curriculum study schedule. Add any chapter to instantly auto-fetch verified notes, cartoon/standard concept videos, and 10-Q mastery quizzes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setReplanResultText(null);
                setIsReplanModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-plan Backlog</span>
            </button>
            {onBackToAccount && (
              <button
                onClick={onBackToAccount}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Account
              </button>
            )}
          </div>
        </div>

        {/* Analytics Summary Stats Ribbon */}
        {analytics && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Chapters</span>
              <div className="text-xl font-black text-white mt-0.5">{analytics.summary.totalChapters}</div>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{analytics.summary.completedChapters}</div>
            </div>
            <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">In Progress</span>
              <div className="text-xl font-black text-blue-300 mt-0.5">{analytics.summary.inProgressChapters}</div>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Deferred</span>
              <div className="text-xl font-black text-amber-300 mt-0.5">{analytics.summary.deferredChapters}</div>
            </div>
            <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Mastery Rate</span>
              <div className="text-xl font-black text-teal-300 mt-0.5">{analytics.summary.completionRate}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Chapter Addition Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Add New School Chapter or Topic
            </h3>
            <p className="text-xs text-slate-400">
              Verified notes, Mermaid diagrams, and cartoon/standard concept videos will be generated automatically.
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddChapter} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            
            {/* Class Dropdown (Class 1-12) */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Class / Grade
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-teal-500 transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(c => (
                  <option key={c} value={c}>
                    Class {c} {c <= 5 ? '(🎨 Cartoon Videos)' : '(Standard Slides)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div className="sm:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Subject
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomSubject(!isAddingCustomSubject)}
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
                >
                  {isAddingCustomSubject ? '← Pick from Base Subjects' : '+ Add Other Subject'}
                </button>
              </div>

              {isAddingCustomSubject ? (
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Biology..."
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  className="w-full bg-slate-950 border border-teal-500/50 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-400"
                  autoFocus
                />
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-teal-500 transition-colors"
                >
                  {BASE_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Daily Study Time Budget (Up to 8 Hours / 480 mins) */}
            <div className="sm:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Daily Study Time
                </label>
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-lg border border-teal-500/30">
                  {dailyMinutesInput >= 60 ? `${(dailyMinutesInput / 60).toFixed(1)} hrs (${dailyMinutesInput}m)` : `${dailyMinutesInput}m`}
                </span>
              </div>

              {/* Quick Presets up to 8 Hours */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {[
                  { mins: 30, label: '30m' },
                  { mins: 60, label: '1h' },
                  { mins: 120, label: '2h' },
                  { mins: 180, label: '3h' },
                  { mins: 240, label: '4h' },
                  { mins: 360, label: '6h' },
                  { mins: 480, label: '8h' }
                ].map(({ mins, label }) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyMinutesInput(mins)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      dailyMinutesInput === mins
                        ? 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Fine-tune Range Slider (15m to 480m / 8 hours) */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="range"
                  min="15"
                  max="480"
                  step="15"
                  value={dailyMinutesInput}
                  onChange={(e) => setDailyMinutesInput(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Chapter / Topic Selection (Class/Grade-wise & Subject-wise) */}
          <div className="space-y-3 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>Class {selectedClass} {currentSubject || 'Biology'} Chapters & Topics ({availableChapters.length} in syllabus)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomChapterMode(!isCustomChapterMode);
                }}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer inline-flex items-center gap-1"
              >
                {isCustomChapterMode ? '← Pick from Syllabus Dropdown' : '+ Type Custom Chapter / Topic'}
              </button>
            </div>

            {/* Syllabus Dropdown */}
            {!isCustomChapterMode && (
              <div className="space-y-2.5">
                <select
                  value={availableChapters.includes(chapterNameInput) ? chapterNameInput : (chapterNameInput ? '__custom__' : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setIsCustomChapterMode(true);
                    } else if (val) {
                      setChapterNameInput(val);
                    }
                  }}
                  className="w-full bg-slate-900 border border-teal-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-teal-400 transition-colors shadow-inner"
                >
                  <option value="">-- Choose Chapter/Topic from Class {selectedClass} {currentSubject || 'Biology'} Syllabus ({availableChapters.length} Chapters) --</option>
                  {availableChapters.map((ch, idx) => (
                    <option key={idx} value={ch}>
                      {idx + 1}. {ch}
                    </option>
                  ))}
                  <option value="__custom__">+ Type Custom Chapter / Topic Name...</option>
                </select>

                {/* Quick Chapter Chips for 1-click selection */}
                {availableChapters.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Quick-Select Chips (Class {selectedClass} {currentSubject || 'Biology'}):
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {availableChapters.length} topics
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {availableChapters.map((ch, idx) => {
                        const isSelected = chapterNameInput === ch;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setChapterNameInput(ch)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-teal-500/25 border-teal-400 text-teal-200 font-bold shadow-xs'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] opacity-60">#{idx + 1}</span>
                            <span>{ch}</span>
                            {isSelected && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chapter Name Input Field (Editable preview or direct custom input) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isCustomChapterMode ? 'Enter Custom Chapter / Topic Name:' : 'Selected Chapter / Topic (You can edit or fine-tune):'}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={
                      isCustomChapterMode
                        ? 'e.g. "Chapter 4: Photosynthesis", "Genetics & Mendel Laws", or any topic'
                        : 'Select from dropdown/chips above or type here...'
                    }
                    value={chapterNameInput}
                    onChange={(e) => setChapterNameInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !chapterNameInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying & Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Add & Auto-Fetch Content</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 3-Way View Switcher: Chapters List | Visual Roadmap | Game Level Mode */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chapters List ({filteredEntries.length})</span>
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
            <span>🗺️ Visual Roadmap (Date & Time)</span>
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

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {entries.length} Topics Tracked
        </span>
      </div>

      {viewMode === 'roadmap' ? (
        <StudyRoadmapView
          title="Self Timetable Study Roadmap (रोडमैप)"
          subtitle="Sequential daily learning progression with exact dates, time slots, and 4-step milestone guides."
          items={filteredEntries.map((e, idx) => ({
            id: e.id,
            topic_name: e.chapter_topic_name,
            subject_name: e.subject,
            date_str: (e as any).scheduled_date || `Day ${idx + 1}`,
            day_name: (e as any).day_name || '',
            time_slot: (e as any).time_slot || `${e.daily_minutes} mins`,
            allocated_minutes: e.daily_minutes,
            status: e.status,
            explanation_tip: `Class ${e.class_level} ${e.subject} chapter. Pehle notes padhein, fir concept video dekhein aur aakhir me 10 questions ka quiz solve karein.`,
            onOpenNotes: () => setViewingNotesEntry(e),
            onOpenVideo: () => setActiveVideoEntry(e),
            onOpenQuiz: () => {
              setActiveQuizEntry(e);
              setQuizUserAnswers({});
              setQuizSubmitted(false);
              setQuizScore(0);
            }
          }))}
          onOpenQuiz={(id) => {
            const entry = entries.find(e => e.id === id);
            if (entry) {
              setActiveQuizEntry(entry);
              setQuizUserAnswers({});
              setQuizSubmitted(false);
              setQuizScore(0);
            }
          }}
          onOpenVideo={(id) => {
            const entry = entries.find(e => e.id === id);
            if (entry) setActiveVideoEntry(entry);
          }}
          onOpenNotes={(_) => {
            if (filteredEntries.length > 0) setViewingNotesEntry(filteredEntries[0]);
          }}
        />
      ) : viewMode === 'game' ? (
        <GameLevelView
          title="🎮 Self Timetable Quest Trail"
          subtitle="Har chapter ek level hai! Complete karein, ⭐⭐⭐ star payein aur XP badhayein."
          items={filteredEntries.map(e => ({
            id: e.id,
            topic_name: e.chapter_topic_name,
            subject_name: e.subject,
            allocated_minutes: e.daily_minutes,
            status: e.status,
            mastery_score: e.status === 'done' ? 100 : e.status === 'in_progress' ? 50 : 0
          }))}
          onOpenQuiz={(id) => {
            const entry = entries.find(e => e.id === id);
            if (entry) {
              setActiveQuizEntry(entry);
              setQuizUserAnswers({});
              setQuizSubmitted(false);
              setQuizScore(0);
            }
          }}
          onOpenVideo={(id) => {
            const entry = entries.find(e => e.id === id);
            if (entry) setActiveVideoEntry(entry);
          }}
        />
      ) : (
        /* Chapters Filter & List Section */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Your Study Chapters</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                {filteredEntries.length}
              </span>
            </div>

          {/* Subject Filter Pills */}
          {userSubjects.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setActiveFilterSubject('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                  activeFilterSubject === 'all'
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Subjects ({entries.length})
              </button>
              {userSubjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveFilterSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                    activeFilterSubject === sub
                      ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub} ({entries.filter(e => e.subject === sub).length})
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Loading your Self Timetable chapters...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">No chapters added yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use the box above to add your first chapter from your school syllabus. Verified notes, concept videos, and quizzes will be generated immediately!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntries.map(entry => {
              const isJunior = entry.class_level <= 5 || entry.video_style === 'cartoon';

              return (
                <div 
                  key={entry.id}
                  className={`border rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:border-slate-700 ${
                    entry.status === 'done' 
                      ? 'bg-emerald-950/20 border-emerald-900/40' 
                      : entry.status === 'deferred'
                        ? 'bg-amber-950/15 border-amber-900/40'
                        : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-black uppercase tracking-wider">
                          Class {entry.class_level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                          {entry.subject}
                        </span>
                        {isJunior ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold flex items-center gap-1">
                            <Smile className="w-3 h-3" /> Cartoon Mode
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                            Standard
                          </span>
                        )}
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as any)}
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                          entry.status === 'done'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : entry.status === 'in_progress'
                              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                              : entry.status === 'deferred'
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed ✓</option>
                        <option value="deferred">Deferred ⏸</option>
                      </select>
                    </div>

                    {/* Chapter Title */}
                    <div>
                      <h3 className="text-base font-black text-white leading-snug line-clamp-2">
                        {entry.chapter_topic_name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.daily_minutes} mins/day</span>
                      </div>
                    </div>

                    {/* Verification Status Banner */}
                    {entry.is_verified ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="line-clamp-1">Verified: {entry.verification_source || 'Accredited Curriculum'}</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">Couldn't verify this topic online — content may be incomplete</span>
                      </div>
                    )}
                  </div>

                  {/* 3 Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 1. View Notes */}
                      <button
                        onClick={() => setViewingNotesEntry(entry)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>Visual Notes</span>
                      </button>

                      {/* 2. Watch Concept Video */}
                      <button
                        onClick={() => setActiveVideoEntry(entry)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isJunior
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-teal-600 hover:bg-teal-500 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isJunior ? 'Watch Cartoon' : 'Watch Video'}</span>
                      </button>

                      {/* 3. Take Quiz */}
                      <button
                        onClick={() => {
                          setActiveQuizEntry(entry);
                          setQuizUserAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>10-Q Quiz</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id, entry.chapter_topic_name)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Dedicated Daily Improvement & Quiz Trend Graph */}
      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Self Timetable Daily Improvement Graph
                </h3>
                <p className="text-xs text-slate-400">
                  Dedicated tracking for your non-exam school curriculum study and quiz accuracy trajectory.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Activity Trend Bar Chart */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Daily Chapter & Quiz Activity (Last 7 Days)
                </span>
                <span className="text-[11px] text-teal-400 font-semibold">Active Consistency</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                {analytics.dailyTrend.map((d, idx) => {
                  const totalEvents = d.chaptersAdded + d.quizzesTaken;
                  const barHeightPercent = Math.min(100, Math.max(12, totalEvents * 28));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {totalEvents}
                      </div>
                      <div 
                        className="w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          height: `${barHeightPercent}%`,
                          background: totalEvents > 0 ? 'linear-gradient(to top, #0d9488, #2dd4bf)' : '#1e293b'
                        }}
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz Score History & Trend Line */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  10-Question Quiz Mastery Trajectory
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold">≥ 70% Target</span>
              </div>

              {analytics.quizScoreTrend.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-center p-4 text-xs text-slate-500">
                  Complete your first 10-Q concept quiz above to begin populating your score trend line!
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {analytics.quizScoreTrend.slice(-6).map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white line-clamp-1">{q.topic}</div>
                        <div className="text-[10px] text-slate-400">{q.subject} • {q.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${
                          q.percentage >= 70
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        }`}>
                          {q.score}/{q.total} ({q.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Notes Modal */}
      {viewingNotesEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
            
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Class {viewingNotesEntry.class_level} • {viewingNotesEntry.subject}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {viewingNotesEntry.chapter_topic_name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setViewingNotesEntry(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-950/40">
              {/* Text explanation */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                <MarkdownKatexRenderer content={viewingNotesEntry.content_text} />
              </div>

              {/* Mermaid Concept Map */}
              {viewingNotesEntry.concept_map_mermaid && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Visual Concept Architecture (Mermaid)
                  </h4>
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-x-auto">
                    <MermaidRenderer chart={viewingNotesEntry.concept_map_mermaid} />
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {viewingNotesEntry.key_points && viewingNotesEntry.key_points.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Revision Takeaways
                  </h4>
                  <div className="space-y-2">
                    {viewingNotesEntry.key_points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={() => setViewingNotesEntry(null)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Video Concept Video Modal (Reusing upgraded ConceptVideoModal with Seek & Cartoon/Standard style) */}
      {activeVideoEntry && (
        <ConceptVideoModal
          isOpen={true}
          onClose={() => setActiveVideoEntry(null)}
          topicId={activeVideoEntry.id}
          topicName={activeVideoEntry.chapter_topic_name}
          subjectName={`Class ${activeVideoEntry.class_level} ${activeVideoEntry.subject}`}
          videoStyle={activeVideoEntry.video_style}
          preloadedData={{
            topic_id: activeVideoEntry.id,
            title: activeVideoEntry.chapter_topic_name,
            subject_name: `Class ${activeVideoEntry.class_level} ${activeVideoEntry.subject}`,
            slides: activeVideoEntry.video_slides,
            quiz: activeVideoEntry.quiz_questions,
            duration_seconds: (activeVideoEntry.video_slides?.length || 1) * 30,
            video_style: activeVideoEntry.video_style
          }}
          onQuizComplete={(score, total) => {
            api.selfTimetable.submitQuiz(activeVideoEntry.id, { score, total_questions: total })
              .then(res => {
                if (res.passed) {
                  setEntries(prev => prev.map(e => e.id === activeVideoEntry.id ? { ...e, status: 'done' } : e));
                }
                api.selfTimetable.getAnalytics().then(setAnalytics).catch(() => {});
              })
              .catch(() => {});
          }}
        />
      )}

      {/* Direct 10-Question Quiz Modal */}
      {activeQuizEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
            
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  10-Question Mastery Check
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {activeQuizEntry.chapter_topic_name}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuizEntry(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-950/40">
              {quizSubmitted ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
                    quizScore >= 7 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}>
                    {quizScore >= 7 ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      {quizScore >= 7 ? 'Mastery Confirmed!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      You scored <strong className="text-white text-base font-mono">{quizScore} / {activeQuizEntry.quiz_questions?.length || 10}</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {quizScore >= 7 
                        ? 'Great work! Topic has been marked as Completed in your Self Timetable.' 
                        : 'Review the explanations below and give it another try.'}
                    </p>
                  </div>

                  {/* Answers breakdown */}
                  <div className="text-left space-y-2.5 pt-3 border-t border-slate-800">
                    {activeQuizEntry.quiz_questions?.map((q, idx) => {
                      const selected = quizUserAnswers[idx];
                      const isCorrect = selected === q.correct_index;
                      return (
                        <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1 ${
                          isCorrect ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-rose-950/30 border-rose-900/60'
                        }`}>
                          <div className="font-semibold text-slate-200">{idx + 1}. {q.question}</div>
                          <div className="text-slate-300">
                            Correct: <strong className="text-emerald-400">{q.options[q.correct_index]}</strong>
                          </div>
                          <p className="text-slate-400 italic text-[11px]">💡 {q.explanation}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setQuizUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      Re-take Quiz
                    </button>
                    <button
                      onClick={() => setActiveQuizEntry(null)}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white cursor-pointer"
                    >
                      Done & Return
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuizEntry.quiz_questions?.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Question {qIdx + 1} of {activeQuizEntry.quiz_questions.length}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizUserAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setQuizUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                              className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center space-x-2.5 ${
                                isSelected
                                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizUserAnswers).length < (activeQuizEntry.quiz_questions?.length || 10) || isEvaluatingQuiz}
                      className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <span>{isEvaluatingQuiz ? 'Evaluating...' : 'Submit 10-Q Quiz'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backlog Re-Plan Modal */}
      {isReplanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <RefreshCw className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Self Timetable Re-plan</h3>
              </div>
              <button
                onClick={() => setIsReplanModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you fell behind or missed study days, re-planning smoothly redistributes all pending chapters across your target sprint without overwhelming your daily schedule.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Study Sprint Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 21, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setReplanDays(days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        replanDays === days 
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Max Daily Self-Study Budget
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setReplanDailyBudget(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        replanDailyBudget === mins 
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {mins} mins/day
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {replanResultText && (
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-200 leading-relaxed">
                {replanResultText}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsReplanModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleExecuteReplan}
                disabled={isReplanning}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center space-x-2"
              >
                {isReplanning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isReplanning ? 'Re-balancing...' : 'Execute Re-plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
