import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Filter, 
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
  Check, 
  Send,
  ShieldCheck,
  Zap,
  Bookmark
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
  { key: 'all', label: 'All Exams / Courses', icon: '🌐' },
  { key: 'cbse12_all', label: 'CBSE 12th Board (All Subjects & Streams)', icon: '🏆' },
  { key: 'cbse12', label: 'CBSE 12th PCM (Physics, Chem, Math, Eng, Hindi, PE, CS)', icon: '📐' },
  { key: 'cbse12_pcb', label: 'CBSE 12th PCB (Physics, Chem, Bio, Eng, Hindi, PE)', icon: '🧬' },
  { key: 'cbse12_pcmb', label: 'CBSE 12th PCMB (Physics, Chem, Math, Bio, Eng, Hindi, PE, CS)', icon: '🔬' },
  { key: 'class10', label: 'Class 10th Board Exam', icon: '📚' },
  { key: 'neet', label: 'NEET (Medical Entrance)', icon: '🩺' },
  { key: 'jee_main', label: 'JEE Main (NTA)', icon: '⚡' },
  { key: 'jee', label: 'JEE Advanced (IIT)', icon: '🎯' },
  { key: 'bseb12', label: 'Bihar Board 12th Inter', icon: '🌟' },
  { key: 'bseb10', label: 'Bihar Board 10th Matric', icon: '📖' },
  { key: 'olympiad_iso', label: 'International Science Olympiad (ISO)', icon: '🔬' },
  { key: 'olympiad_imo', label: 'International Maths Olympiad (IMO)', icon: '🧮' },
  { key: 'olympiad_eio', label: 'English International Olympiad (EIO)', icon: '📖' },
  { key: 'olympiad_gkio', label: 'General Knowledge Olympiad (GKIO)', icon: '🌍' },
  { key: 'olympiad_ico', label: 'International Computer Olympiad (ICO)', icon: '💻' },
  { key: 'olympiad_ido', label: 'International Drawing Olympiad (IDO)', icon: '🎨' },
  { key: 'olympiad_neso', label: 'National Essay Olympiad (NESO)', icon: '✍️' },
  { key: 'olympiad_nsso', label: 'National Social Studies Olympiad (NSSO)', icon: '🏛️' }
];

const YEARS = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

const SUBJECT_OPTIONS = [
  { key: 'all', label: 'All Subjects' },
  { key: 'Physics', label: 'Physics' },
  { key: 'Chemistry', label: 'Chemistry' },
  { key: 'Mathematics', label: 'Mathematics' },
  { key: 'Biology', label: 'Biology' },
  { key: 'Science', label: 'Science' },
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi' },
  { key: 'Physical Education', label: 'Physical Education' },
  { key: 'Sanskrit', label: 'Sanskrit' },
  { key: 'Social Science', label: 'Social Science' },
  { key: 'Computer Science', label: 'Computer Science' }
];

export const PYQBankView: React.FC<PYQBankViewProps> = ({ initialExamKey, onOpenDoubtBot }) => {
  const [selectedExam, setSelectedExam] = useState<string>(() => normalizeExamKey(initialExamKey));
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'numerical'>('all');
  const [importantOnly, setImportantOnly] = useState<boolean>(false);
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

  const isCBSE12 = selectedExam.startsWith('cbse12');

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-40 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Official 10-Year Board & Exam Question Archive (2016 – 2025)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono">
              English & Transliterated Hindi • Verified Solutions
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Previous Years Questions & Revision Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Master the actual repeating questions from the past 10 years calibrated with official weightages, repeat frequency tags, step-by-step formula derivations, and numerical tolerance verification.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Curated Questions</span>
                <span className="text-xl font-black text-teal-300">{stats.total_pyqs}+ Questions</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Board Coverage</span>
                <span className="text-xl font-black text-indigo-300">CBSE 12th & 10th</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Archive Span</span>
                <span className="text-xl font-black text-amber-300">10 Years (2016–25)</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Practice Modes</span>
                <span className="text-xl font-black text-emerald-300">MCQ & Numerical</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special CBSE 12th Student Notice Banner */}
      {isCBSE12 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-teal-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">CBSE 12th Board Complete Question Bank Active</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  All 8 Subjects
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Practice high-yield questions for Physics, Chemistry, Mathematics, Biology, English, Hindi, Computer Science, and Physical Education with step-by-step revision solutions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setImportantOnly(!importantOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              importantOnly
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{importantOnly ? '✓ Showing Important Only' : '⭐ Show Important Questions Only'}</span>
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topic, formula, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Exam Select */}
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500"
            >
              {EXAM_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>

            {/* Subject Select */}
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Format Mode Filter */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('mcq')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'mcq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                MCQ
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('numerical')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'numerical' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Numerical
              </button>
            </div>

            {/* Important Revision Filter Button */}
            <button
              type="button"
              onClick={() => setImportantOnly(!importantOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                importantOnly
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>⭐ Important Revision Only</span>
            </button>
          </div>
        </div>

        {/* 10-Year Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center space-x-1 mr-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Year:</span>
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

      {/* Question List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Loading PYQ Bank Questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No questions found matching this filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching the Exam, Subject, or Year filter. For CBSE 12th, select <strong>"CBSE 12th Board (All Subjects & Streams)"</strong> to view all available questions.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedExam('cbse12_all');
                setSelectedSubject('all');
                setSelectedYear('All');
                setSelectedType('all');
                setImportantOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
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
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{questions.length}</strong> previous year questions</span>
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Interactive Practice Mode • Detailed Explanations
            </span>
          </div>

          {questions.map((q, qIdx) => {
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
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60">
                      {q.year} Exam Paper
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {q.subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {q.topic}
                    </span>
                    {isNumerical ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200/60 flex items-center space-x-1">
                        <Calculator className="w-3 h-3 text-violet-600" />
                        <span>Numerical-Type</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                        MCQ
                      </span>
                    )}

                    {isImportantQuestion && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 text-[11px] font-black border border-amber-300 flex items-center space-x-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                        <span>Important Revision PYQ</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200/60 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{q.frequency_score}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                      Weightage {q.weightage}/5
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                    <span className="text-slate-400 font-mono mr-2">Q{qIdx + 1}.</span>
                    {q.question}
                  </h4>
                </div>

                {/* NUMERICAL QUESTION ANSWER INPUT */}
                {isNumerical ? (
                  <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-3">
                    <form onSubmit={e => handleNumericalSubmit(q, e)} className="flex flex-col sm:flex-row gap-2.5 items-center">
                      <div className="relative flex-1 w-full">
                        <Hash className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          step="any"
                          disabled={!!numResult}
                          value={numericalInputs[q.id] || ''}
                          onChange={e => setNumericalInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Type numerical answer (e.g. 24.5)..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
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
                      <div className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-between ${
                        numResult.is_correct
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {numResult.is_correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>
                            {numResult.is_correct
                              ? `Correct! Answer: ${numResult.correct_answer} (within ±${numResult.tolerance} tolerance)`
                              : `Incorrect. Your answer: ${numericalInputs[q.id]} | Correct: ${numResult.correct_answer} (tolerance ±${numResult.tolerance})`}
                          </span>
                        </div>
                        {numResult.difference !== undefined && (
                          <span className="text-[11px] opacity-80">Diff: {numResult.difference}</span>
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
                          optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-xs';
                        } else if (isSelected && !isCorrect) {
                          optStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-medium';
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
                          className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-all cursor-pointer ${optStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {hasAnsweredMcq && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {hasAnsweredMcq && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-2">
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
                        doubt: `Please explain this ${q.year} CBSE Board question on ${q.topic} step-by-step: "${q.question}"`,
                        topic: q.topic,
                        subject: q.subject,
                        exam: isCBSE12 ? 'CBSE 12th Board' : q.exam_key
                      })}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 hover:from-teal-100 hover:to-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI Bot About This Question</span>
                    </button>
                  )}
                </div>

                {/* Explanation Section */}
                {isSolutionOpen && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2 animate-fade-in">
                    <div className="flex items-center space-x-1.5 text-teal-800 font-bold">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      <span>
                        {isNumerical
                          ? `Calculated Value: ${q.correct_numeric_answer} (Tolerance ±${q.tolerance || 0.01})`
                          : `Correct Option: (${String.fromCharCode(65 + q.correct_index)}) ${q.options[q.correct_index]}`}
                      </span>
                    </div>
                    <div className="leading-relaxed text-slate-700 pl-5 whitespace-pre-line font-sans text-xs">
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
