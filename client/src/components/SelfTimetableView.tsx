import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
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
  Compass,
  Search,
  Filter,
  GraduationCap,
  Flame,
  Target,
  HelpCircle,
  Video,
  ListOrdered
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

// Subject styling configuration for clear visual distinction
const SUBJECT_CONFIG: Record<string, { color: string; border: string; bg: string; badge: string; icon: string }> = {
  'Biology': { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🧬' },
  'Physics': { color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: '⚡' },
  'Chemistry': { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🧪' },
  'Maths': { color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: '📐' },
  'Science': { color: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', icon: '🔬' },
  'Social Science': { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: '🌍' },
  'English': { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '📖' },
  'Hindi': { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: '📝' },
  'Computer Science': { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '💻' },
  'Sanskrit': { color: 'text-fuchsia-400', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/10', badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40', icon: '📜' },
  'EVS': { color: 'text-lime-400', border: 'border-lime-500/30', bg: 'bg-lime-500/10', badge: 'bg-lime-500/20 text-lime-300 border-lime-500/40', icon: '🌿' },
};

const getSubjectConfig = (subject: string) => {
  return SUBJECT_CONFIG[subject] || {
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    icon: '📚'
  };
};

export const SelfTimetableView: React.FC<SelfTimetableViewProps> = ({ onBackToAccount }) => {
  const [entries, setEntries] = useState<SelfTimetableEntry[]>([]);
  const [analytics, setAnalytics] = useState<SelfTimetableAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering & Search
  const [activeFilterSubject, setActiveFilterSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'done' | 'deferred'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showStudentGuide, setShowStudentGuide] = useState<boolean>(true);
  const [showRevisionSection, setShowRevisionSection] = useState<boolean>(true);

  // Form states
  const [selectedClass, setSelectedClass] = useState<number>(8);
  const [selectedSubject, setSelectedSubject] = useState<string>('Biology');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [isAddingCustomSubject, setIsAddingCustomSubject] = useState<boolean>(false);
  const [isCustomChapterMode, setIsCustomChapterMode] = useState<boolean>(false);
  const [chapterNameInput, setChapterNameInput] = useState<string>('');
  const [dailyMinutesInput, setDailyMinutesInput] = useState<number>(45);
  const [viewMode, setViewMode] = useState<'list' | 'roadmap' | 'game'>('list');
  const [formError, setFormError] = useState<string | null>(null);

  // Available curriculum syllabus chapters for currently selected class & subject
  const currentSubject = isAddingCustomSubject ? customSubjectInput.trim() : selectedSubject;
  const availableChapters = useMemo(() => {
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
  const userSubjects = useMemo(() => Array.from(new Set(entries.map(e => e.subject))), [entries]);

  // Filtered entries based on subject, status, and search query
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchSubject = activeFilterSubject === 'all' || e.subject === activeFilterSubject;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchSearch = !searchQuery.trim() || 
        e.chapter_topic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchStatus && matchSearch;
    });
  }, [entries, activeFilterSubject, statusFilter, searchQuery]);

  // 7-Day Final Revision Sprint items (Derived from entries)
  const revisionSprintItems = useMemo(() => {
    if (entries.length === 0) return [];
    const today = new Date();
    const coreCount = entries.length;
    const items = [];
    
    for (let rDay = 1; rDay <= 7; rDay++) {
      const targetEntry = entries[(rDay - 1) % entries.length];
      const revDateObj = new Date(today);
      revDateObj.setDate(today.getDate() + coreCount + rDay - 1);
      const revDateStr = revDateObj.toISOString().split('T')[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[revDateObj.getDay()];

      items.push({
        dayNumber: rDay,
        targetEntry,
        dateStr: revDateStr,
        dayName,
        timeSlot: '06:00 PM - 07:00 PM',
        minutes: 60
      });
    }
    return items;
  }, [entries]);

  // Roadmap items: Core syllabus chapters complete first, followed by 1-Week Final Revision Sprint
  const roadmapItems = useMemo(() => {
    const base: RoadmapItem[] = filteredEntries.map((e, idx) => ({
      id: e.id,
      topic_name: e.chapter_topic_name,
      subject_name: e.subject,
      date_str: (e as any).scheduled_date || `Day ${idx + 1}`,
      day_name: (e as any).day_name || '',
      time_slot: (e as any).time_slot || `${e.daily_minutes} mins`,
      allocated_minutes: e.daily_minutes,
      status: e.status,
      explanation_tip: `Class ${e.class_level} ${e.subject} chapter. Read notes first, watch the concept video, and solve the 10-question quiz to ensure mastery.`,
      onOpenNotes: () => setViewingNotesEntry(e),
      onOpenVideo: () => setActiveVideoEntry(e),
      onOpenQuiz: () => {
        setActiveQuizEntry(e);
        setQuizUserAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
      }
    }));

    if (filteredEntries.length > 0) {
      const today = new Date();
      const coreCount = filteredEntries.length;
      for (let rDay = 1; rDay <= 7; rDay++) {
        const revTarget = filteredEntries[(rDay - 1) % filteredEntries.length];
        const revDateObj = new Date(today);
        revDateObj.setDate(today.getDate() + coreCount + rDay - 1);
        const revDateStr = revDateObj.toISOString().split('T')[0];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[revDateObj.getDay()];

        base.push({
          id: `rev-sprint-${rDay}-${revTarget.id}`,
          topic_name: `${revTarget.chapter_topic_name} (1-Week Revision & Quiz Practice)`,
          subject_name: revTarget.subject,
          date_str: revDateStr,
          day_name: dayName,
          time_slot: '06:00 PM - 07:00 PM',
          allocated_minutes: 60,
          status: 'revision',
          explanation_tip: `1-Week Final Sprint Day ${rDay}: Complete concept revision, video recap & 10-Q mastery quiz practice for ${revTarget.chapter_topic_name}.`,
          onOpenNotes: () => setViewingNotesEntry(revTarget),
          onOpenVideo: () => setActiveVideoEntry(revTarget),
          onOpenQuiz: () => {
            setActiveQuizEntry(revTarget);
            setQuizUserAnswers({});
            setQuizSubmitted(false);
            setQuizScore(0);
          }
        });
      }
    }

    return base;
  }, [filteredEntries]);

  // Overall statistics calculations
  const totalMinutes = useMemo(() => entries.reduce((acc, curr) => acc + (curr.daily_minutes || 0), 0), [entries]);
  const completedCount = useMemo(() => entries.filter(e => e.status === 'done').length, [entries]);
  const inProgressCount = useMemo(() => entries.filter(e => e.status === 'in_progress').length, [entries]);
  const masteryPercentage = entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto px-2 sm:px-4 text-slate-100">
      
      {/* 1. PROFESSIONAL COMMAND COCKPIT HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Glow ambient shapes */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>AI-Powered School Curriculum Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Self Timetable</span>
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                  Class 1–12
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Build your independent personal study schedule. Auto-fetch official NCERT notes, animated concept videos, and verify your understanding with 10-question mastery quizzes.
              </p>
            </div>

            {/* Top Action CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setReplanResultText(null);
                  setIsReplanModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-900/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-plan Backlog</span>
              </button>

              <button
                onClick={() => setShowStudentGuide(!showStudentGuide)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-teal-400" />
                <span>{showStudentGuide ? 'Hide Guide' : 'How It Works'}</span>
              </button>

              {onBackToAccount && (
                <button
                  onClick={onBackToAccount}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Back to Account
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Cockpit Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            
            {/* 1. Mastery Rate Ring */}
            <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Mastery Rate</span>
                <div className="text-2xl font-black text-white">{masteryPercentage}%</div>
                <span className="text-[10px] text-slate-400">Score ≥ 70%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-teal-400 flex items-center justify-center font-bold text-xs text-teal-300">
                <Award className="w-5 h-5 text-teal-400" />
              </div>
            </div>

            {/* 2. Total Chapters */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Topics</span>
              <div className="text-2xl font-black text-white mt-0.5">{entries.length}</div>
              <span className="text-[10px] text-slate-400 font-mono">{totalMinutes} mins planned</span>
            </div>

            {/* 3. Completed Topics */}
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed ✓</span>
              <div className="text-2xl font-black text-emerald-300 mt-0.5">{completedCount}</div>
              <span className="text-[10px] text-emerald-500/80">Quizzes Passed</span>
            </div>

            {/* 4. In Progress */}
            <div className="bg-slate-950/70 border border-blue-500/30 rounded-2xl p-4 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">In Progress</span>
              <div className="text-2xl font-black text-blue-300 mt-0.5">{inProgressCount}</div>
              <span className="text-[10px] text-blue-400/80">Currently Studying</span>
            </div>

            {/* 5. 1-Week Early Guarantee Status */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-gradient-to-br from-teal-950/40 to-indigo-950/40 border border-teal-500/40 rounded-2xl p-4 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Revision Sprint</span>
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-lg font-black text-white mt-1">7 Days Reserved</div>
              <span className="text-[10px] text-slate-300">All topics finish 1 wk early</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STUDENT CLARITY GUIDE: 3 SIMPLE STEPS TO MASTER ANY CHAPTER */}
      {showStudentGuide && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/25 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  How Pivott Self Timetable Works for Students
                </h3>
                <p className="text-xs text-slate-400">
                  Follow these 3 simple steps to master every chapter with ease and complete your syllabus on time.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStudentGuide(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Step 1 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden group hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">Step 1: Pick Topic</span>
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>Select Your Chapter</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your Class (1–12) and subject. Tap any official NCERT syllabus chapter or type your custom homework topic.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Step 2: Learn Visuals</span>
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-indigo-400 fill-current" />
                <span>Read Notes & Watch Video</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review verified bullet summaries and Mermaid concept maps. Class 1–5 gets colorful Cartoon Videos; Class 6–12 gets structured slides.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Step 3: Test Mastery</span>
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Pass the 10-Q Quiz</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Answer the 10-question concept check. Score 70% or more to lock in mastery and mark the chapter Complete ✓ in your timetable.
              </p>
            </div>
          </div>

          {/* Golden Rule Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-slate-200">
                <strong className="text-teal-300">1-Week Early Completion Rule:</strong> All your core syllabus chapters finish 7 days before your target date, so you get a full 7-day revision sprint with zero last-minute panic!
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold shrink-0">
              Active by Default
            </span>
          </div>
        </div>
      )}

      {/* 3. CHAPTER ADDITION STUDIO (ELEGANT WIZARD) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        
        {/* Box Title */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-900/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Add Chapter to Your Timetable
              </h3>
              <p className="text-xs text-slate-400">
                Pivott auto-generates structured notes, visual diagrams, video slides, and 10 test questions instantly.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 font-bold">
            Curriculum Verified
          </span>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddChapter} className="space-y-5">
          
          {/* Section A: Class & Subject Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-400" />
                <span>Select Grade & Subject</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedClass <= 5 ? '🎨 Junior Mode (Cartoon Videos)' : '📐 Senior Mode (Animated Slide Decks)'}
              </span>
            </div>

            {/* Class Level Selector Buttons (Class 1-12) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(c => {
                const isSelected = selectedClass === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedClass(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-md scale-105'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>Class {c}</span>
                    {c <= 5 && <span className="text-[10px]">🎨</span>}
                  </button>
                );
              })}
            </div>

            {/* Subject Selector Quick Pills */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Pick Subject:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomSubject(!isAddingCustomSubject)}
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
                >
                  {isAddingCustomSubject ? '← Back to Subject Pills' : '+ Custom Other Subject'}
                </button>
              </div>

              {isAddingCustomSubject ? (
                <input
                  type="text"
                  placeholder="Type any other subject name (e.g. Psychology, Economics, Coding...)"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  className="w-full bg-slate-950 border border-teal-500/50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-400"
                  autoFocus
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {BASE_SUBJECTS.map(subj => {
                    const isSelected = selectedSubject === subj;
                    const config = getSubjectConfig(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          if (subj === 'Additional Subject') {
                            setIsAddingCustomSubject(true);
                            setCustomSubjectInput('');
                          } else {
                            setSelectedSubject(subj);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? `${config.badge} shadow-md scale-105`
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{config.icon}</span>
                        <span>{subj}</span>
                        {isSelected && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section B: Topic Selection with Live NCERT Syllabus Explorer */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Class {selectedClass} {currentSubject || 'Biology'} Syllabus ({availableChapters.length} Chapters)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomChapterMode(!isCustomChapterMode)}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
              >
                {isCustomChapterMode ? '← Pick from NCERT Syllabus' : '+ Type Custom Topic Name'}
              </button>
            </div>

            {/* Quick Chapter Selector Chips */}
            {!isCustomChapterMode && availableChapters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Click any chapter to auto-fill:</span>
                  <span className="font-mono">{availableChapters.length} topics available</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {availableChapters.map((ch, idx) => {
                    const isSelected = chapterNameInput === ch;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setChapterNameInput(ch)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-teal-500/25 border-teal-400 text-teal-200 font-bold shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] opacity-60 font-mono">#{idx + 1}</span>
                        <span>{ch}</span>
                        {isSelected && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input field for selected or custom chapter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isCustomChapterMode ? 'Custom Chapter or Topic Name:' : 'Selected Chapter Name (You can customize):'}
              </label>
              <input
                type="text"
                placeholder={
                  isCustomChapterMode
                    ? 'e.g. "Chapter 4: Photosynthesis", "Newton Laws of Motion", etc.'
                    : 'Click a topic above or type here...'
                }
                value={chapterNameInput}
                onChange={(e) => setChapterNameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Section C: Daily Study Duration */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Daily Study Time Budget</span>
                </label>
                <span className="text-xs font-mono font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-lg border border-teal-500/30">
                  {dailyMinutesInput >= 60 ? `${(dailyMinutesInput / 60).toFixed(1)} hrs (${dailyMinutesInput} mins)` : `${dailyMinutesInput} mins`}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[
                  { mins: 30, label: '30m' },
                  { mins: 45, label: '45m' },
                  { mins: 60, label: '1h' },
                  { mins: 90, label: '1.5h' },
                  { mins: 120, label: '2h' },
                  { mins: 180, label: '3h' },
                  { mins: 240, label: '4h' }
                ].map(({ mins, label }) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyMinutesInput(mins)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      dailyMinutesInput === mins
                        ? 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Range Slider */}
              <div className="pt-1">
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

            {/* Submit Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !chapterNameInput.trim()}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 disabled:hover:from-teal-600 text-white text-xs sm:text-sm font-bold shadow-xl shadow-teal-950/40 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auto-Fetching Verified Notes & Videos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Add Chapter & Auto-Fetch Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. VIEW SWITCHER & FILTER CONTROLS */}
      <div className="space-y-4">
        
        {/* Main View Switcher Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Chapter Cards ({filteredEntries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Visual Daily Roadmap</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('game')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'game'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Game Quest Trail</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {entries.length} Total Topics
            </span>
          </div>
        </div>

        {/* Search & Status Filters (When in List Mode) */}
        {viewMode === 'list' && (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chapters by topic or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'not_started', label: 'Not Started' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'done', label: 'Completed ✓' },
                  { id: 'deferred', label: 'Deferred ⏸' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === tab.id
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter Pills */}
            {userSubjects.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60">
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
                {userSubjects.map(sub => {
                  const subCount = entries.filter(e => e.subject === sub).length;
                  const config = getSubjectConfig(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => setActiveFilterSubject(sub)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        activeFilterSubject === sub
                          ? `${config.badge} shadow-xs`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{sub} ({subCount})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. ROADMAP VIEW OR GAME LEVEL VIEW */}
      {viewMode === 'roadmap' ? (
        <StudyRoadmapView
          title="Self Timetable Study Roadmap"
          subtitle="Sequential daily learning progression with exact dates, time slots, and 4-step milestone guides."
          items={roadmapItems}
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
          subtitle="Every chapter is a quest level! Complete topics, earn ⭐⭐⭐ stars, and level up your preparation score."
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
        /* 6. CHAPTER CARDS VIEW (CORE SYLLABUS + 7-DAY REVISION SPRINT) */
        <div className="space-y-8">
          
          {/* A. 7-Day Final Revision & 10-Q Quiz Sprint (Dedicated Highlight Card) */}
          {entries.length > 0 && (
            <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border border-teal-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        7-Day Final Revision & Quiz Practice Sprint
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        1-Week Early Finish
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Scheduled for the final week before your deadline: Rapid concept recaps, video revisions, and 10-question practice quizzes for maximum retention.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRevisionSection(!showRevisionSection)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  {showRevisionSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showRevisionSection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {revisionSprintItems.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-teal-500/20 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                          Sprint Day {item.dayNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.dayName}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">
                          {item.targetEntry.chapter_topic_name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.targetEntry.subject} • {item.timeSlot}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => setViewingNotesEntry(item.targetEntry)}
                          className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                        >
                          Notes
                        </button>
                        <button
                          onClick={() => setActiveVideoEntry(item.targetEntry)}
                          className="flex-1 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-[10px] font-bold text-teal-300 border border-teal-500/40 transition-colors cursor-pointer"
                        >
                          Video
                        </button>
                        <button
                          onClick={() => {
                            setActiveQuizEntry(item.targetEntry);
                            setQuizUserAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(0);
                          }}
                          className="flex-1 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-[10px] font-bold text-indigo-300 border border-indigo-500/40 transition-colors cursor-pointer"
                        >
                          10-Q Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B. Core Syllabus Study Chapters Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Your Core Study Chapters</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                  {filteredEntries.length}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Sorted by sequence of learning
              </span>
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
                  <h4 className="text-base font-bold text-white">No chapters match your filters</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {searchQuery ? 'Try clearing your search query or subject filters.' : 'Use the box above to add your first chapter. Verified notes, concept videos, and quizzes will be generated immediately!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEntries.map((entry, idx) => {
                  const isJunior = entry.class_level <= 5 || entry.video_style === 'cartoon';
                  const config = getSubjectConfig(entry.subject);

                  return (
                    <div 
                      key={entry.id}
                      className={`border rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] hover:border-slate-700 ${
                        entry.status === 'done' 
                          ? 'bg-emerald-950/20 border-emerald-900/40' 
                          : entry.status === 'deferred'
                            ? 'bg-amber-950/15 border-amber-900/40'
                            : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        
                        {/* Top Badges & Status Dropdown */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-black uppercase tracking-wider">
                              Class {entry.class_level}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${config.badge}`}>
                              <span>{config.icon}</span>
                              <span>{entry.subject}</span>
                            </span>
                            {isJunior ? (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold flex items-center gap-1">
                                <Smile className="w-3 h-3" /> Cartoon Video
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                                Slide Deck
                              </span>
                            )}
                          </div>

                          {/* Status Dropdown */}
                          <select
                            value={entry.status}
                            onChange={(e) => handleStatusChange(entry.id, e.target.value as any)}
                            className={`text-[10px] font-bold uppercase tracking-wider rounded-xl px-2.5 py-1 border transition-colors cursor-pointer ${
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

                        {/* Chapter Title & Time */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500 font-bold">#{idx + 1}</span>
                            <h3 className="text-base font-black text-white leading-snug line-clamp-2">
                              {entry.chapter_topic_name}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1.5">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{entry.daily_minutes} mins/day</span>
                            </div>
                            <span>•</span>
                            <span className="text-teal-400 font-mono text-[11px]">
                              10-Q Quiz Attached
                            </span>
                          </div>
                        </div>

                        {/* Verification Status Banner */}
                        {entry.is_verified ? (
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="line-clamp-1">Verified: {entry.verification_source || 'Accredited NCERT Curriculum'}</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">Couldn't verify this topic online — content may be incomplete</span>
                          </div>
                        )}
                      </div>

                      {/* 3 Prominent Action Buttons */}
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
                              setQuizScore(0);
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
        </div>
      )}

      {/* 7. DEDICATED DAILY IMPROVEMENT & QUIZ TREND GRAPH */}
      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Self Timetable Daily Improvement Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Dedicated progress metrics for your independent school curriculum study and quiz accuracy.
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

      {/* 8. VISUAL NOTES MODAL */}
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
                    Visual Concept Architecture (Mermaid Flowchart)
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

      {/* 9. POST-VIDEO CONCEPT VIDEO MODAL */}
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

      {/* 10. DIRECT 10-QUESTION QUIZ MODAL */}
      {activeQuizEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
            
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  10-Question Mastery Check (Score ≥ 70% to Complete)
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
                        : 'Review the explanations below and give it another try to reach 70%.'}
                    </p>
                  </div>

                  {/* Answers breakdown */}
                  <div className="text-left space-y-2.5 pt-3 border-t border-slate-800">
                    {activeQuizEntry.quiz_questions?.map((q, idx) => {
                      const selected = quizUserAnswers[idx];
                      const isCorrect = selected === q.correct_index;
                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
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
                  {/* Progress tracker */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>Answer all 10 questions:</span>
                    <span className="font-mono text-teal-400 font-bold">
                      {Object.keys(quizUserAnswers).length} / {activeQuizEntry.quiz_questions?.length || 10} Answered
                    </span>
                  </div>

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
                              className={`text-left p-3 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center space-x-2.5 ${
                                isSelected
                                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
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

      {/* 11. BACKLOG RE-PLAN MODAL */}
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

              {/* 1-Week Early Completion Note in Re-plan */}
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-[11px] text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
                <span>Core chapters will be completed 7 days early, reserving the final week for full revision!</span>
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
