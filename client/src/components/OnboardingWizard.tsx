import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, BookOpen, Plus, Trash2, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../api/client';

interface OnboardingWizardProps {
  onCompleted: () => void;
}

const COURSE_OPTIONS = [
  { id: 'neet', name: 'NEET 2026', desc: 'Medical (Physics, Chem, Biology)', icon: '🩺', defaultName: 'NEET 2026', presetKey: 'neet' },
  { id: 'jee_main', name: 'JEE Main 2026', desc: 'Engineering (Physics, Chem, Math)', icon: '⚡', defaultName: 'JEE Main 2026', presetKey: 'jee_main' },
  { id: 'jee', name: 'JEE Advanced', desc: 'IIT Entrance (Advanced PCM)', icon: '🎯', defaultName: 'JEE Advanced', presetKey: 'jee' },
  { id: 'cbse12', name: 'CBSE 12th Board PCM', desc: 'Physics, Chemistry, Math', icon: '📐', defaultName: 'CBSE 12th Board PCM', presetKey: 'cbse12' },
  { id: 'cbse12_pcb', name: 'CBSE 12th Board PCB', desc: 'Physics, Chemistry, Biology', icon: '🧬', defaultName: 'CBSE 12th Board PCB', presetKey: 'cbse12_pcb' },
  { id: 'cbse12_pcmb', name: 'CBSE 12th Board PCMB', desc: 'Math, Physics, Chem & Biology', icon: '🔬', defaultName: 'CBSE 12th Board PCMB', presetKey: 'cbse12_pcmb' },
  { id: 'class10', name: 'Class 10th Board', desc: 'Science, Math, Social Science', icon: '📚', defaultName: 'Class 10th Board Exam', presetKey: 'class10' },
  { id: 'bseb12', name: 'Bihar Board 12th', desc: 'BSEB Inter Science (PCM/B)', icon: '🌟', defaultName: 'Bihar Board 12th (Inter)', presetKey: 'bseb12' },
  { id: 'bseb10', name: 'Bihar Board 10th', desc: 'BSEB Matric (Science, Math, SST)', icon: '📖', defaultName: 'Bihar Board 10th (Matric)', presetKey: 'bseb10' },

  // 8 New Olympiad Exams with Verified Official Class Ranges
  { id: 'olympiad_iso', name: 'International Science Olympiad (ISO)', desc: 'Science & Reasoning (Class 1–12)', icon: '🔬', defaultName: 'International Science Olympiad (ISO)', presetKey: 'olympiad_iso', minClass: 1, maxClass: 12, isOlympiad: true },
  { id: 'olympiad_imo', name: 'International Maths Olympiad (IMO)', desc: 'Maths, HOTS & Achievers (Class 1–12)', icon: '🧮', defaultName: 'International Maths Olympiad (IMO)', presetKey: 'olympiad_imo', minClass: 1, maxClass: 12, isOlympiad: true },
  { id: 'olympiad_eio', name: 'English International Olympiad (EIO)', desc: 'Grammar, Reading & HOTS (Class 1–10)', icon: '📖', defaultName: 'English International Olympiad (EIO)', presetKey: 'olympiad_eio', minClass: 1, maxClass: 10, isOlympiad: true },
  { id: 'olympiad_gkio', name: 'General Knowledge Olympiad (GKIO)', desc: 'Current Affairs & Science (Class 1–10)', icon: '🌍', defaultName: 'General Knowledge International Olympiad (GKIO)', presetKey: 'olympiad_gkio', minClass: 1, maxClass: 10, isOlympiad: true },
  { id: 'olympiad_ico', name: 'International Computer Olympiad (ICO)', desc: 'Computer Logic & Coding (Class 1–10)', icon: '💻', defaultName: 'International Computer Olympiad (ICO)', presetKey: 'olympiad_ico', minClass: 1, maxClass: 10, isOlympiad: true },
  { id: 'olympiad_ido', name: 'International Drawing Olympiad (IDO)', desc: 'Creative Art & Color Theory (Class 1–10)', icon: '🎨', defaultName: 'International Drawing Olympiad (IDO)', presetKey: 'olympiad_ido', minClass: 1, maxClass: 10, isOlympiad: true },
  { id: 'olympiad_neso', name: 'National Essay Olympiad (NESO)', desc: 'Essay Writing & Expression (Class 1–10)', icon: '✍️', defaultName: 'National Essay Olympiad (NESO)', presetKey: 'olympiad_neso', minClass: 1, maxClass: 10, isOlympiad: true },
  { id: 'olympiad_nsso', name: 'National Social Studies Olympiad (NSSO)', desc: 'History, Civics & Geography (Class 1–10)', icon: '🏛️', defaultName: 'National Social Studies Olympiad (NSSO)', presetKey: 'olympiad_nsso', minClass: 1, maxClass: 10, isOlympiad: true },

  { id: 'custom', name: 'Other / Custom Exam', desc: 'Type custom exam (CUET, NDA, etc.)', icon: '📝', defaultName: '', presetKey: '' }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onCompleted }) => {
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('neet');
  const [customExamName, setCustomExamName] = useState('');
  const [examName, setExamName] = useState('NEET 2026');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [maxDailyHours, setMaxDailyHours] = useState('6.0');
  const [offDays, setOffDays] = useState<number[]>([0]); // Sunday
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('neet');
  const [selectedOlympiadClass, setSelectedOlympiadClass] = useState<number>(8);
  
  // Subjects list
  const [subjects, setSubjects] = useState<Array<{
    name: string;
    topics: Array<{ name: string; weightage: number; estimated_minutes: number }>;
  }>>([]);

  const [loading, setLoading] = useState(false);
  const [suggestingTopicKey, setSuggestingTopicKey] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    api.getPresets()
      .then(res => {
        setPresets(res.presets || {});
        if (res.presets && res.presets[selectedPresetKey]) {
          setSubjects(res.presets[selectedPresetKey].subjects);
        } else if (res.presets && res.presets.neet) {
          setSubjects(res.presets.neet.subjects);
        }
      })
      .catch(err => console.error('Presets error:', err));
  }, []);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    const matched = COURSE_OPTIONS.find(c => c.id === courseId);
    if (!matched) return;

    if (courseId === 'custom') {
      setExamName(customExamName || '');
      setSelectedPresetKey('');
    } else if (matched.isOlympiad) {
      const minC = matched.minClass || 1;
      const maxC = matched.maxClass || 10;
      const safeClass = Math.max(minC, Math.min(maxC, selectedOlympiadClass));
      setSelectedOlympiadClass(safeClass);
      setExamName(`${matched.defaultName} (Class ${safeClass})`);
      setSelectedPresetKey(matched.presetKey);
      if (presets[matched.presetKey]) {
        setSubjects(presets[matched.presetKey].subjects);
      }
    } else {
      setExamName(matched.defaultName);
      setSelectedPresetKey(matched.presetKey);
      if (presets[matched.presetKey]) {
        setSubjects(presets[matched.presetKey].subjects);
      }
    }
  };

  const handleOlympiadClassChange = (newClass: number) => {
    setSelectedOlympiadClass(newClass);
    const matched = COURSE_OPTIONS.find(c => c.id === selectedCourse);
    if (matched && matched.isOlympiad) {
      setExamName(`${matched.defaultName} (Class ${newClass})`);
    }
  };

  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    setSelectedCourse(key);
    if (presets[key]) {
      setSubjects(presets[key].subjects);
      const matched = COURSE_OPTIONS.find(c => c.id === key);
      if (matched) {
        setExamName(matched.defaultName);
      }
    }
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, {
      name: 'New Subject',
      topics: [{ name: 'Core Topic 1', weightage: 3, estimated_minutes: 90 }]
    }]);
  };

  const handleRemoveSubject = (sIdx: number) => {
    setSubjects(subjects.filter((_, idx) => idx !== sIdx));
  };

  const handleAddTopic = (sIdx: number) => {
    const updated = [...subjects];
    updated[sIdx].topics.push({
      name: `New Topic ${updated[sIdx].topics.length + 1}`,
      weightage: 3,
      estimated_minutes: 90
    });
    setSubjects(updated);
  };

  const handleRemoveTopic = (sIdx: number, tIdx: number) => {
    const updated = [...subjects];
    updated[sIdx].topics = updated[sIdx].topics.filter((_, idx) => idx !== tIdx);
    setSubjects(updated);
  };

  const handleUpdateTopic = (sIdx: number, tIdx: number, field: string, val: any) => {
    const updated = [...subjects];
    updated[sIdx].topics[tIdx] = {
      ...updated[sIdx].topics[tIdx],
      [field]: val
    };
    setSubjects(updated);
  };

  const handleAISuggestWeightage = async (sIdx: number, tIdx: number) => {
    const topic = subjects[sIdx].topics[tIdx];
    const subject = subjects[sIdx].name;
    const key = `${sIdx}-${tIdx}`;
    setSuggestingTopicKey(key);

    try {
      const res = await api.suggestWeightage({ subject_name: subject, topic_name: topic.name });
      handleUpdateTopic(sIdx, tIdx, 'weightage', res.weightage);
    } catch (err) {
      console.error('Suggest weightage error:', err);
    } finally {
      setSuggestingTopicKey(null);
    }
  };

  const handleToggleOffDay = (day: number) => {
    if (offDays.includes(day)) {
      setOffDays(offDays.filter(d => d !== day));
    } else {
      setOffDays([...offDays, day]);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await api.setupOnboarding({
        exam_name: examName,
        exam_date: examDate,
        max_daily_hours: Number(maxDailyHours) || 6.0,
        off_days: offDays,
        subjects
      });
      onCompleted();
    } catch (err: any) {
      alert(err.message || 'Onboarding setup failed.');
      setLoading(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-xl relative overflow-hidden">
        {/* Interactive 3-Step Breadcrumb Bar (Slide-by-Slide Navigation without Reset) */}
        <div className="pb-5 mb-6 border-b border-slate-100">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Step 1 Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all cursor-pointer text-left active:scale-95 ${
                step === 1
                  ? 'bg-teal-50 border border-teal-300 text-teal-950 font-bold shadow-xs ring-2 ring-teal-500/10'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 1 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                1
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Slide 1</span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">Exam & Capacity</span>
              </div>
            </button>

            <span className="text-slate-300 text-xs font-bold">➔</span>

            {/* Step 2 Button */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all cursor-pointer text-left active:scale-95 ${
                step === 2
                  ? 'bg-teal-50 border border-teal-300 text-teal-950 font-bold shadow-xs ring-2 ring-teal-500/10'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 2 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                2
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Slide 2</span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">Syllabus & Topics</span>
              </div>
            </button>

            <span className="text-slate-300 text-xs font-bold">➔</span>

            {/* Step 3 Button */}
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all cursor-pointer text-left active:scale-95 ${
                step === 3
                  ? 'bg-teal-50 border border-teal-300 text-teal-950 font-bold shadow-xs ring-2 ring-teal-500/10'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 3 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                3
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Slide 3</span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">Plan Review</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1 text-teal-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Tap any slide above to jump back or forward — no reset needed</span>
            </span>
            <span className="font-semibold text-slate-400">Step {step} of 3</span>
          </div>
        </div>

        {/* STEP 1: Exam Details & Capacities */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Exam / Course (Option List)
                </label>
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-semibold">
                  Tap Any Course to Select
                </span>
              </div>

              {/* Visible, Interactive Grid of Option Cards (100% Touch-Friendly on Phones & PCs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto p-1.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                {COURSE_OPTIONS.map((course) => {
                  const isSelected = selectedCourse === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleCourseChange(course.id)}
                      className={`flex items-start space-x-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl shrink-0 leading-none">{course.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                            {course.name}
                          </p>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ml-1">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {course.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Olympiad Class Range Selector (Class 1-12 for ISO/IMO, Class 1-10 for others) */}
              {(() => {
                const currentCourseObj = COURSE_OPTIONS.find(c => c.id === selectedCourse);
                if (!currentCourseObj || !currentCourseObj.isOlympiad) return null;
                const minC = currentCourseObj.minClass || 1;
                const maxC = currentCourseObj.maxClass || 10;
                const count = maxC - minC + 1;
                return (
                  <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-purple-50/85 border border-indigo-200 shadow-xs animate-fade-in space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Select Olympiad Class Level (Class {minC} to Class {maxC})
                      </label>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        Official Exam Range
                      </span>
                    </div>
                    <select
                      value={selectedOlympiadClass}
                      onChange={(e) => handleOlympiadClassChange(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 text-xs sm:text-sm font-bold bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
                    >
                      {Array.from({ length: count }, (_, i) => minC + i).map(cls => (
                        <option key={cls} value={cls}>
                          Class {cls} {cls <= 5 ? '(Primary Level — Foundational)' : cls <= 10 ? '(Secondary Level — Olympiad HOTS)' : '(Senior Secondary — Advanced Analysis)'}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-indigo-700 leading-snug">
                      💡 Verified for <strong>{currentCourseObj.name}</strong> (indiantalent.org standard): This exam officially tests students from <strong>Class {minC} up to Class {maxC}</strong>. Topics, AI doubt answers, and question difficulty will automatically calibrate to your selected grade.
                    </p>
                  </div>
                );
              })()}

              {selectedCourse === 'custom' ? (
                <div className="mt-3 animate-fade-in p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200">
                  <label className="block text-[11px] font-bold text-teal-900 mb-1">
                    Enter Your Custom Exam Name:
                  </label>
                  <input
                    type="text"
                    value={customExamName}
                    onChange={e => {
                      setCustomExamName(e.target.value);
                      setExamName(e.target.value);
                    }}
                    placeholder="e.g. CUET 2026, NDA, MHT-CET, WBJEE, CA Foundation"
                    className="w-full px-4 py-2.5 rounded-xl border border-teal-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium shadow-xs"
                    autoFocus
                  />
                  <p className="text-[11px] text-teal-700 mt-1">
                    You can add custom subjects and topics in Step 2.
                  </p>
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-slate-400">Selected Target:</span>
                    <strong className="text-slate-900 truncate">{examName}</strong>
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold shrink-0 ml-2">Standard syllabus loaded ✓</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Max Daily Study Hours (Hard Cap)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="12"
                  value={maxDailyHours}
                  onChange={e => setMaxDailyHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pivott will NEVER propose a daily schedule exceeding this limit.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Off-Days (Rest / Family Days)
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((dName, idx) => {
                  const isOff = offDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleOffDay(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isOff
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dName}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Pivott avoids scheduling new syllabus on your designated off-days.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-600">Slide 1 of 3</span> • Target Exam & Capacities
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Continue to Syllabus (Slide 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Syllabus & Topics */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Slide 2 Top Navigation Bar (Back to Slide 1 & Forward to Slide 3) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
                <span>← Back to Slide 1 (Exam Details)</span>
              </button>

              <span className="text-[11px] text-teal-700 font-semibold hidden sm:inline bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                ✓ Selections stay saved without reset
              </span>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Next: Slide 3 →</span>
              </button>
            </div>

            {/* Presets Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Quick Load Standard Syllabus Preset
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('neet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'neet' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  NEET 2026
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('jee_main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'jee_main' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  JEE Main
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('jee')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'jee' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  JEE Advanced
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('cbse12')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'cbse12' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  CBSE 12th PCM
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('cbse12_pcb')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'cbse12_pcb' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  CBSE 12th PCB
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('cbse12_pcmb')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'cbse12_pcmb' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  CBSE 12th PCMB
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('class10')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'class10' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Class 10th (Board)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('bseb12')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'bseb12' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Bihar Board 12th (Inter)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('bseb10')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetKey === 'bseb10' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Bihar Board 10th (Matric)
                </button>
              </div>
            </div>

            {/* Subjects and Topics List */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {subjects.map((subj, sIdx) => (
                <div key={sIdx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <input
                      type="text"
                      value={subj.name}
                      onChange={e => {
                        const copy = [...subjects];
                        copy[sIdx].name = e.target.value;
                        setSubjects(copy);
                      }}
                      className="font-bold text-sm text-slate-900 border-b border-dashed border-slate-300 outline-none pb-0.5 focus:border-teal-500"
                    />
                    <button
                      onClick={() => handleRemoveSubject(sIdx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Topics under this subject */}
                  <div className="space-y-2">
                    {subj.topics.map((top, tIdx) => {
                      const isSuggesting = suggestingTopicKey === `${sIdx}-${tIdx}`;

                      return (
                        <div key={tIdx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <input
                            type="text"
                            value={top.name}
                            onChange={e => handleUpdateTopic(sIdx, tIdx, 'name', e.target.value)}
                            className="flex-1 text-xs text-slate-800 bg-transparent outline-none font-medium"
                            placeholder="Topic title"
                          />

                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Minutes */}
                            <div className="flex items-center space-x-1 text-xs text-slate-500">
                              <input
                                type="number"
                                step="15"
                                min="30"
                                max="300"
                                value={top.estimated_minutes}
                                onChange={e => handleUpdateTopic(sIdx, tIdx, 'estimated_minutes', Number(e.target.value))}
                                className="w-14 px-1.5 py-0.5 rounded border border-slate-200 text-xs text-center bg-white"
                              />
                              <span>min</span>
                            </div>

                            {/* Weightage (1-5) */}
                            <select
                              value={top.weightage}
                              onChange={e => handleUpdateTopic(sIdx, tIdx, 'weightage', Number(e.target.value))}
                              className="px-2 py-0.5 rounded border border-slate-200 text-xs bg-white text-slate-700"
                              title="Focus Level (1-5)"
                            >
                              <option value="5">5 - High</option>
                              <option value="4">4 - High/Med</option>
                              <option value="3">3 - Medium</option>
                              <option value="2">2 - Low</option>
                              <option value="1">1 - Foundational</option>
                            </select>

                            {/* AI Suggest Button */}
                            <button
                              type="button"
                              onClick={() => handleAISuggestWeightage(sIdx, tIdx)}
                              disabled={isSuggesting}
                              className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium transition-colors flex items-center space-x-1"
                              title="AI suggests weightage based on exam importance"
                            >
                              <Sparkles className={`w-3 h-3 ${isSuggesting ? 'animate-spin' : ''}`} />
                              <span>{isSuggesting ? '...' : 'AI'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveTopic(sIdx, tIdx)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddTopic(sIdx)}
                    className="mt-3 text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic to {subj.name}</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSubject}
              className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 hover:border-teal-400 text-xs font-medium text-slate-600 hover:text-teal-700 transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Subject</span>
            </button>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-teal-600" />
                <span>← Back to Slide 1 (Exam Selection)</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Review & Generate Plan (Slide 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Generate */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Slide 3 Top Navigation Bar (Back to Slide 2 & Back to Slide 1) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
                  <span>← Back to Slide 2 (Syllabus)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Slide 1</span>
                </button>
              </div>

              <span className="text-[11px] text-teal-700 font-semibold hidden sm:inline bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                ✓ Change anything anytime without reset
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-teal-950">Plan Ready for Intelligent Generation</h3>
                  <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                    Pivott will calculate total remaining workload against your available study days, 
                    allocate high-weightage topics first, reserve buffer revision days, and cap daily study time strictly at 
                    <strong> ≤ {maxDailyHours} hours/day</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400">Target Exam</div>
                <div className="text-sm font-bold text-slate-900 truncate">{examName}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400">Exam Date</div>
                <div className="text-sm font-bold text-slate-900">{examDate}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400">Daily Cap</div>
                <div className="text-sm font-bold text-slate-900">≤ {maxDailyHours} hrs</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-400">Total Topics</div>
                <div className="text-sm font-bold text-slate-900">
                  {subjects.reduce((sum, s) => sum + s.topics.length, 0)}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-teal-600" />
                <span>← Back to Slide 2 (Syllabus)</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Building Realistic Timetable...' : 'Generate My Schedule'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
