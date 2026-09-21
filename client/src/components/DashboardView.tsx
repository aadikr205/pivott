import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Award, Clock, CheckCircle2, Flame, Calendar, Sparkles } from 'lucide-react';
import { api, DashboardResponse } from '../api/client';

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDashboard()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Aggregating progress metrics and chart trends...</p>
      </div>
    );
  }

  const { summary, charts } = data;

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Live Analytics
            </span>
            <span className="text-xs text-slate-500 font-mono">{summary.exam_name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Progress & Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking of completion velocity, backlog reduction, and topic mastery.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
            <div className="text-[11px] text-indigo-600 font-medium">Exam Date</div>
            <div className="text-sm font-bold text-indigo-900">{summary.exam_date}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Days Left */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-[11px] font-medium text-slate-400">Target</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary.days_to_exam}</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Days Remaining</div>
        </div>

        {/* Topics Done */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] font-medium text-slate-400">Syllabus</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {summary.done_topics} <span className="text-sm font-normal text-slate-400">/ {summary.total_topics}</span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Topics Mastered</div>
        </div>

        {/* Overall Mastery Score */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[11px] font-medium text-slate-400">Quizzes</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary.overall_mastery}%</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Average Retention</div>
        </div>

        {/* Hours Studied */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-medium text-slate-400">Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary.hours_completed}h</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Hours Logged</div>
        </div>

        {/* Backlog State */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[11px] font-medium text-slate-400">Cap Protected</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {Math.round(summary.current_backlog_minutes / 60 * 10) / 10}h
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">Current Backlog</div>
        </div>
      </div>

      {/* CHART 1: Daily Completion % */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>1. Daily Completion Velocity (%)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Percentage of planned daily study hours successfully completed on each scheduled date.
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.daily_completion} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Completed']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="completion_percent" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#completionGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts: Backlog Trend & Burn-Down Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 2: Backlog Trend */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>2. Backlog Trend Over Time</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accumulated backlog volume in hours; trends down as Pivott re-balances.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.backlog_trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                <Tooltip
                  formatter={(val: any) => [`${val} hrs`, 'Backlog']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="backlog_hours" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Time-to-Exam Burn-Down Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>3. Syllabus Burn-Down Chart</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Remaining syllabus workload (hours) vs. ideal study trajectory.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.burndown} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="ideal_remaining_hours" name="Target Pace" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="actual_remaining_hours" name="Actual Remaining" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Charts: Quiz Score Trend & Subject Mastery Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Quiz Score Trend per Subject */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>4. Quiz Score Trend (Active Recall)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological quiz test scores across topics, demonstrating retention growth.
            </p>
          </div>

          <div className="h-64 w-full">
            {charts.quiz_score_trend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">No quizzes taken yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Take a quick 6-question quiz from Today's view to see trends.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.quiz_score_trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Score']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 5, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 5: Subject-wise Mastery Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>5. Subject Mastery & Completion (%)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between syllabus completion % and average quiz mastery per subject.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.subject_mastery} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject_name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="completion_percent" name="% Completed" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg_mastery_score" name="Avg Mastery Score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
