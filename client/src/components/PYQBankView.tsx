import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Search, 
  HelpCircle, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Flame, 
  RefreshCw, 
  Calculator, 
  Hash, 
  Send,
  Target,
  RotateCcw,
  X
} from 'lucide-react';
import { api, PYQQuestion, PYQStatsResponse } from '../api/client';

interface PYQBankViewProps {
  initialExamKey?: string;
  onOpenDoubtBot?: (context: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

// Normalizes any string representation of an exam (e.g. from user profile or onboarding) to the dropdown key
export const normalizeExamKey = (examKey?: string): string => {
  if (!examKey) return 'all';
  const raw = examKey.toLowerCase().trim();
  if (raw === 'all') return 'all';

  if (raw.includes('cbse') && raw.includes('12')) {
    if (raw.includes('pcmb')) return 'cbse12_pcmb';
    if (raw.includes('pcb')) return 'cbse12_pcb';
    if (raw.includes('pcm')) return 'cbse12';
    return 'cbse12_all';
  }
  if (raw.includes('bihar') || raw.includes('bseb')) {
    return raw.includes('12') ? 'bseb12' : 'bseb10';
  }
  if (raw.includes('10')) return 'class10';
  if (raw.includes('jee') && raw.includes('adv')) return 'jee';
  if (raw.includes('jee')) return 'jee_main';
  if (raw.includes('neet')) return 'neet';
  return examKey;
};

const EXAM_OPTIONS = [
  { key: 'all', label: 'All Exams & Boards', icon: '🌐' },
  { key: 'cbse12_all', label: 'CBSE 12th Board (All Streams)', icon: '🏆' },
  { key: 'cbse12', label: 'CBSE 12th PCM (Physics, Chem, Math, CS, PE)', icon: '📐' },
  { key: 'cbse12_pcb', label: 'CBSE 12th PCB (Physics, Chem, Bio, PE)', icon: '🧬' },
  { key: 'cbse12_pcmb', label: 'CBSE 12th PCMB (Physics, Chem, Math, Bio)', icon: '🔬' },
  { key: 'class10', label: 'Class 10th Board Exam', icon: '📚' },
  { key: 'neet', label: 'NEET (Medical Entrance)', icon: '🩺' },
  { key: 'jee_main', label: 'JEE Main (NTA)', icon: '⚡' },
  { key: 'jee', label: 'JEE Advanced (IIT)', icon: '🎯' },
  { key: 'bseb12', label: 'Bihar Board 12th Inter', icon: '🌟' },
  { key: 'bseb10', label: 'Bihar Board 10th Matric', icon: '📖' },
  { key: 'olympiad_iso', label: 'Science Olympiad (ISO)', icon: '🔬' },
  { key: 'olympiad_imo', label: 'Maths Olympiad (IMO)', icon: '🧮' },
  { key: 'olympiad_eio', label: 'English Olympiad (EIO)', icon: '📖' },
  { key: 'olympiad_ico', label: 'Computer Olympiad (ICO)', icon: '💻' }
];

const YEARS = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

const SUBJECT_OPTIONS = [
  { key: 'all', label: 'All Subjects', icon: '📚' },
  { key: 'Physics', label: 'Physics', icon: '⚡' },
  { key: 'Chemistry', label: 'Chemistry', icon: '🧪' },
  { key: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { key: 'Biology', label: 'Biology', icon: '🧬' },
  { key: 'Science', label: 'Science', icon: '🔬' },
  { key: 'English', label: 'English', icon: '📖' },
  { key: 'Hindi', label: 'Hindi', icon: '📝' },
  { key: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { key: 'Social Science', label: 'Social Science', icon: '🌍' },
  { key: 'Physical Education', label: 'Physical Education', icon: '🌿' }
];

export const PYQBankView: React.FC<PYQBankViewProps> = ({ initialExamKey, onOpenDoubtBot }) => {
  const [selectedExam, setSelectedExam] = useState<string>(() => normalizeExamKey(initialExamKey));
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'numerical'>('all');
  const [importantOnly, setImportantOnly] = useState<boolean>(false);
  const [unattemptedOnly, setUnattemptedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [stats, setStats] = useState<PYQStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // MCQ Practice interactive state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  
  // Numerical Practice interactive state
  const [numericalInputs, setNumericalInputs] = useState<Record<string, string>>({});
  const [numericalResults, setNumericalResults] = useState<Record<string, {
    is_correct: boolean;
    correct_answer?: number;
    difference?: number;
    tolerance?: number;
    explanation: string;
  }>>({});
  const [submittingNum, setSubmittingNum] = useState<Record<string, boolean>>({});

  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Sync initialExamKey if updated
  useEffect(() => {
    if (initialExamKey) {
      setSelectedExam(normalizeExamKey(initialExamKey));
    }
  }, [initialExamKey]);

  // Load stats on mount
  useEffect(() => {
    api.getPYQStats()
      .then(res => setStats(res))
      .catch(err => console.error('PYQ Stats failed:', err));
  }, []);

  // Fetch filtered questions
  const fetchQuestions = () => {
    setLoading(true);
    api.getPYQs({
      exam_key: selectedExam === 'all' ? undefined : selectedExam,
      subject: selectedSubject === 'all' ? undefined : selectedSubject,
      year: selectedYear === 'All' ? undefined : Number(selectedYear),
      search: searchQuery.trim() || undefined,
      is_important: importantOnly ? true : undefined,
      limit: 100
    })
      .then(res => {
        let filtered = res.questions || [];
        if (selectedType !== 'all') {
          filtered = filtered.filter(q => (q.type || 'mcq') === selectedType);
        }
        setQuestions(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch PYQs error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedExam, selectedSubject, selectedYear, selectedType, importantOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleSelectOption = async (question: PYQQuestion, optionIdx: number) => {
    if (userAnswers[question.id] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [question.id]: optionIdx }));
    setRevealedSolutions(prev => ({ ...prev, [question.id]: true }));

    try {
      await api.checkPyqAnswer({
        question_id: question.id,
        selected_index: optionIdx,
        selected_option: question.options[optionIdx]
      });
    } catch (e) {
      console.warn('Failed to record practice in background:', e);
    }
  };

  const handleNumericalSubmit = async (question: PYQQuestion, e: React.FormEvent) => {
    e.preventDefault();
    const val = numericalInputs[question.id];
    if (!val || val.trim() === '') return;

    setSubmittingNum(prev => ({ ...prev, [question.id]: true }));
    try {
      const res = await api.checkPyqAnswer({
        question_id: question.id,
        answer: parseFloat(val.trim())
      });
      setNumericalResults(prev => ({
        ...prev,
        [question.id]: {
          is_correct: res.is_correct,
          correct_answer: res.correct_answer,
          difference: res.difference,
          tolerance: res.tolerance,
          explanation: res.explanation
        }
      }));
      setRevealedSolutions(prev => ({ ...prev, [question.id]: true }));
    } catch (err: any) {
      alert(err.message || 'Failed to check numerical answer.');
    } finally {
      setSubmittingNum(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Practice scoreboard metrics
  const scoreboard = useMemo(() => {
    let attempted = 0;
    let correct = 0;

    questions.forEach(q => {
      if (q.type === 'numerical') {
        const res = numericalResults[q.id];
        if (res) {
          attempted++;
          if (res.is_correct) correct++;
        }
      } else {
        const ans = userAnswers[q.id];
        if (ans !== undefined) {
          attempted++;
          if (ans === q.correct_index) correct++;
        }
      }
    });

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return { attempted, correct, accuracy };
  }, [questions, userAnswers, numericalResults]);

  // Reset practice session
  const resetPracticeSession = () => {
    if (!window.confirm('Reset your current session practice score and start fresh?')) return;
    setUserAnswers({});
    setNumericalInputs({});
    setNumericalResults({});
    setRevealedSolutions({});
  };

  // Filter unattempted questions if toggle active
  const displayedQuestions = useMemo(() => {
    if (!unattemptedOnly) return questions;
    return questions.filter(q => {
      if (q.type === 'numerical') {
        return !numericalResults[q.id];
      }
      return userAnswers[q.id] === undefined;
    });
  }, [questions, unattemptedOnly, userAnswers, numericalResults]);

  const isCBSE12 = selectedExam.startsWith('cbse12');

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* 1. HERO ARCHIVE BANNER WITH LIVE PRACTICE SCOREBOARD */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-40 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Official 10-Year Question Archive (2016 – 2025)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono">
              Verified Solutions • Step-by-Step Derivations
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                10-Year PYQ Practice & Master Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Practice actual repeating questions from CBSE, NEET, JEE & State Boards with instant MCQ feedback and numerical tolerance verification.
              </p>
            </div>

            {/* Live Student Practice Scoreboard */}
            <div className="bg-slate-900/90 backdrop-blur border border-teal-500/40 rounded-2xl p-3 sm:p-4 shadow-xl shrink-0 space-y-2 min-w-[240px]">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-400" /> Practice Scoreboard
                </span>
                {scoreboard.attempted > 0 && (
                  <button
                    type="button"
                    onClick={resetPracticeSession}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    title="Reset practice session"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-black text-white">{scoreboard.attempted}</div>
                  <div className="text-[10px] text-slate-400">Attempted</div>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-400">{scoreboard.correct}</div>
                  <div className="text-[10px] text-emerald-300">Correct</div>
                </div>
                <div>
                  <div className="text-lg font-black text-amber-300">{scoreboard.accuracy}%</div>
                  <div className="text-[10px] text-amber-200">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar from DB */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10 text-center sm:text-left">
              <div className="bg-white/5 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Archived Questions</span>
                <span className="text-base sm:text-lg font-black text-teal-300">{stats.total_pyqs}+ Questions</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Exams Covered</span>
                <span className="text-base sm:text-lg font-black text-indigo-300">CBSE, NEET & JEE</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Span</span>
                <span className="text-base sm:text-lg font-black text-amber-300">10 Yrs (2016–25)</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 sm:p-3 border border-white/10">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Formats</span>
                <span className="text-base sm:text-lg font-black text-emerald-300">MCQ + Numerical</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special CBSE 12th Student Notice Banner */}
      {isCBSE12 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-teal-500/10 border border-amber-500/30 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">CBSE 12th Board Complete 8-Subject Vault</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Physics, Chem, Math, Bio, Eng, Hindi, CS, PE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Practice official board questions with step-by-step mark distribution and numerical step answers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setImportantOnly(!importantOnly)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              importantOnly
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{importantOnly ? '✓ Showing High-Priority Only' : '⭐ Show High-Priority Questions'}</span>
          </button>
        </div>
      )}

      {/* 2. FILTER TOOLBAR: EXAM, SUBJECT, FORMAT & YEAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Row 1: Search + Exam Dropdown + Subject Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-5 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search keyword (e.g. friction, optics, capacitor)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Exam Selector */}
          <div className="md:col-span-4 w-full">
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {EXAM_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="md:col-span-3 w-full">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Format Tabs + Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Mode Filter */}
            <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('mcq')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedType === 'mcq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MCQ Only
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('numerical')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedType === 'numerical' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🔢 Numerical Only
              </button>
            </div>

            {/* Important Revision Filter Button */}
            <button
              type="button"
              onClick={() => setImportantOnly(!importantOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                importantOnly
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black ring-2 ring-amber-400'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{importantOnly ? '✓ Important Only' : '⭐ Important Questions'}</span>
            </button>

            {/* Unattempted Filter Button */}
            <button
              type="button"
              onClick={() => setUnattemptedOnly(!unattemptedOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                unattemptedOnly
                  ? 'bg-indigo-600 text-white shadow-sm font-black ring-2 ring-indigo-400/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{unattemptedOnly ? '✓ Unattempted Only' : 'Unattempted Only'}</span>
            </button>
          </div>
        </div>

        {/* Row 3: 10-Year Horizontal Scroller */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none pt-1">
          <span className="text-slate-400 font-bold shrink-0 flex items-center space-x-1 mr-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Select Year:</span>
          </span>
          {YEARS.map(yr => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                selectedYear === yr
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {yr === 'All' ? 'All (10 Yrs)' : yr}
            </button>
          ))}
        </div>
      </div>

      {/* 3. QUESTION LIST & INTERACTIVE PRACTICE */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading Question Archive...</p>
        </div>
      ) : displayedQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No questions found matching this filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching the Exam, Subject, or Year filter. For CBSE 12th, select <strong>&ldquo;CBSE 12th Board (All Streams)&rdquo;</strong> to view all available questions.
          </p>
          <div className="pt-2 flex justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSelectedExam('cbse12_all');
                setSelectedSubject('all');
                setSelectedYear('All');
                setSelectedType('all');
                setImportantOnly(false);
                setUnattemptedOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
            >
              View All CBSE 12th Questions
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedExam('all');
                setSelectedSubject('all');
                setSelectedYear('All');
                setSelectedType('all');
                setImportantOnly(false);
                setUnattemptedOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{displayedQuestions.length}</strong> previous year questions
            </span>
            <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Interactive Practice Mode • Detailed Explanations
            </span>
          </div>

          {displayedQuestions.map((q, qIdx) => {
            const isNumerical = q.type === 'numerical';
            const hasAnsweredMcq = userAnswers[q.id] !== undefined;
            const chosenOption = userAnswers[q.id];
            const numResult = numericalResults[q.id];
            const isSolutionOpen = revealedSolutions[q.id];
            const isImportantQuestion = q.frequency_score?.includes('Important') || q.weightage >= 5 || q.frequency_score?.includes('Repeated');

            return (
              <div
                key={q.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs hover:shadow-md transition-all space-y-4 ${
                  isImportantQuestion ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200/80'
                }`}
              >
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60">
                      {q.year} Exam Paper
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {q.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {q.topic}
                    </span>
                    {isNumerical ? (
                      <span className="px-2.5 py-0.5 rounded-xl bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200/60 flex items-center space-x-1">
                        <Calculator className="w-3 h-3 text-violet-600" />
                        <span>Numerical-Type</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                        MCQ
                      </span>
                    )}

                    {isImportantQuestion && (
                      <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/15 text-amber-800 text-[11px] font-black border border-amber-300 flex items-center space-x-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                        <span>High Repeat Probability</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200/60 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{q.frequency_score}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                      Weightage {q.weightage}/5
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    <span className="text-slate-400 font-mono mr-2 font-bold">Q{qIdx + 1}.</span>
                    {q.question}
                  </h4>
                </div>

                {/* NUMERICAL QUESTION ANSWER INPUT */}
                {isNumerical ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-violet-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-violet-600" /> Enter your calculated answer
                      </span>
                      <span className="text-[11px] text-violet-600 font-normal">Tolerated precision: ±{q.tolerance || 0.01}</span>
                    </div>

                    <form onSubmit={e => handleNumericalSubmit(q, e)} className="flex flex-col sm:flex-row gap-2.5 items-center">
                      <div className="relative flex-1 w-full">
                        <Hash className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          step="any"
                          disabled={!!numResult}
                          value={numericalInputs[q.id] || ''}
                          onChange={e => setNumericalInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Type numerical value (e.g. 24.5)..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none shadow-2xs"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingNum[q.id] || !!numResult || !numericalInputs[q.id]}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submittingNum[q.id] ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{numResult ? 'Submitted' : 'Check Answer'}</span>
                      </button>
                    </form>

                    {numResult && (
                      <div className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${
                        numResult.is_correct
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {numResult.is_correct ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          <span>
                            {numResult.is_correct
                              ? `Correct! Answer: ${numResult.correct_answer} (within ±${numResult.tolerance} tolerance)`
                              : `Incorrect. Your answer: ${numericalInputs[q.id]} | Correct Value: ${numResult.correct_answer} (tolerance ±${numResult.tolerance})`}
                          </span>
                        </div>
                        {numResult.difference !== undefined && (
                          <span className="text-[11px] opacity-80 font-mono">Diff: {numResult.difference}</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* MCQ OPTIONS GRID */
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = chosenOption === oIdx;
                      const isCorrect = q.correct_index === oIdx;

                      let optStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800';

                      if (hasAnsweredMcq) {
                        if (isCorrect) {
                          optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs';
                        } else if (isSelected && !isCorrect) {
                          optStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
                        } else {
                          optStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q, oIdx)}
                          disabled={hasAnsweredMcq}
                          className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 transition-all cursor-pointer ${optStyle}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {hasAnsweredMcq && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {hasAnsweredMcq && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleSolution(q.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    <span>{isSolutionOpen ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                    {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Ask Doubt Bot Shortcut */}
                  {onOpenDoubtBot && (
                    <button
                      type="button"
                      onClick={() => onOpenDoubtBot({
                        doubt: `Please explain this ${q.year} ${q.subject} question on "${q.topic}" step-by-step: "${q.question}"`,
                        topic: q.topic,
                        subject: q.subject,
                        exam: isCBSE12 ? 'CBSE 12th Board' : q.exam_key
                      })}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 hover:from-teal-100 hover:to-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI Doubt Bot About This Question</span>
                    </button>
                  )}
                </div>

                {/* Explanation Section */}
                {isSolutionOpen && (
                  <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2.5 animate-fade-in shadow-2xs">
                    <div className="flex items-center space-x-1.5 text-teal-800 font-black text-xs uppercase tracking-wide">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      <span>
                        {isNumerical
                          ? `Calculated Value: ${q.correct_numeric_answer} (Tolerance ±${q.tolerance || 0.01})`
                          : `Correct Option: (${String.fromCharCode(65 + q.correct_index)}) ${q.options[q.correct_index]}`}
                      </span>
                    </div>

                    <div className="leading-relaxed text-slate-700 pl-5 whitespace-pre-line font-sans text-xs sm:text-sm">
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
