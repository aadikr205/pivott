import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Filter, Sparkles, CheckCircle2, XCircle, Search, HelpCircle, Bot, ChevronDown, ChevronUp, Award, Flame, RefreshCw, Calculator, Hash, Check, Send } from 'lucide-react';
import { api, PYQQuestion, PYQStatsResponse } from '../api/client';

interface PYQBankViewProps {
  initialExamKey?: string;
  onOpenDoubtBot?: (context: { doubt?: string; topic?: string; subject?: string; exam?: string }) => void;
}

const EXAM_OPTIONS = [
  { key: 'all', label: 'All Exams / Courses', icon: '🌐' },
  { key: 'neet', label: 'NEET (Medical Entrance)', icon: '🩺' },
  { key: 'jee_main', label: 'JEE Main (NTA)', icon: '⚡' },
  { key: 'jee', label: 'JEE Advanced (IIT)', icon: '🎯' },
  { key: 'cbse12', label: 'CBSE 12th PCM', icon: '📐' },
  { key: 'cbse12_pcb', label: 'CBSE 12th PCB', icon: '🧬' },
  { key: 'cbse12_pcmb', label: 'CBSE 12th PCMB', icon: '🔬' },
  { key: 'class10', label: 'Class 10th Board', icon: '📚' },
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

export const PYQBankView: React.FC<PYQBankViewProps> = ({ initialExamKey, onOpenDoubtBot }) => {
  const [selectedExam, setSelectedExam] = useState<string>(initialExamKey || 'all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'numerical'>('all');
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
      year: selectedYear === 'All' ? undefined : Number(selectedYear),
      search: searchQuery.trim() || undefined,
      limit: 60
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
  }, [selectedExam, selectedYear, selectedType]);

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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Previous 10 Years Questions (100 Qs/Year Bank)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono">
              2016 – 2025 Archive • English Only
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            High-Yield Exam Questions & Numerical Practice
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Practice actual repeating questions from the past 10 years calibrated with exam weightages, repeat frequency tags, step-by-step formula derivations, and numerical tolerance verification.
          </p>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Curated PYQs</span>
                <span className="text-xl font-black text-teal-300">{stats.total_pyqs} Questions</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Annual Archive</span>
                <span className="text-xl font-black text-indigo-300">100 Qs / Year</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Year Span</span>
                <span className="text-xl font-black text-amber-300">10 Years (2016–25)</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-400 block font-medium">Format Modes</span>
                <span className="text-xl font-black text-emerald-300">MCQ & Numerical</span>
              </div>
            </div>
          )}
        </div>
      </div>

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
              placeholder="Search topic, formula, or keyword in English..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Exam Select */}
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-teal-500"
            >
              {EXAM_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('mcq')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'mcq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                MCQ
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('numerical')}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedType === 'numerical' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Numerical
              </button>
            </div>
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
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Loading PYQ Bank Questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No questions found matching this filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching the Exam, Year, or Format filter to view questions.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedExam('all');
              setSelectedYear('All');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{questions.length}</strong> previous year questions</span>
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Interactive Practice Mode • English
            </span>
          </div>

          {questions.map((q, qIdx) => {
            const isNumerical = q.type === 'numerical';
            const hasAnsweredMcq = userAnswers[q.id] !== undefined;
            const chosenOption = userAnswers[q.id];
            const numResult = numericalResults[q.id];
            const isSolutionOpen = revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
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
                  </div>

                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200/60 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{q.frequency_score}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                      Focus {q.weightage}/5
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
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    <span>{isSolutionOpen ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                    {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Ask Doubt Bot Shortcut */}
                  {onOpenDoubtBot && (
                    <button
                      type="button"
                      onClick={() => onOpenDoubtBot({
                        doubt: `Please explain this ${q.year} ${isNumerical ? 'numerical' : 'MCQ'} question on ${q.topic}: "${q.question}"`,
                        topic: q.topic,
                        subject: q.subject,
                        exam: q.exam_key
                      })}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 hover:from-teal-100 hover:to-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI Bot About This</span>
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
                    <div className="leading-relaxed text-slate-700 pl-5 whitespace-pre-line font-mono text-[11px] sm:text-xs">
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
