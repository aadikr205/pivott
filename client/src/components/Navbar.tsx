import React, { useState } from 'react';
import { Compass, Calendar, CheckCircle2, BarChart3, AlertCircle, History, LogOut, User as UserIcon, Download, Sparkles, X, ChevronRight, BookOpen, Bot, FileText, Activity, Camera, Layers } from 'lucide-react';
import { User } from '../api/client';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  user: User | null;
  activeTab: 'today' | 'schedule' | 'dashboard' | 'notes' | 'pyq' | 'deferred' | 'history' | 'activity' | 'self-timetable';
  setActiveTab: (tab: 'today' | 'schedule' | 'dashboard' | 'notes' | 'pyq' | 'deferred' | 'history' | 'activity' | 'self-timetable') => void;
  daysToExam: number;
  todayMinutes: number;
  maxDailyHours: number;
  onLogout: () => void;
  onReOnboard: () => void;
  isInstalled?: boolean;
  onOpenInstallModal?: () => void;
  onOpenDoubtBot?: () => void;
  onOpenProfilePhoto?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  daysToExam,
  todayMinutes,
  maxDailyHours,
  onLogout,
  onReOnboard,
  isInstalled = false,
  onOpenInstallModal,
  onOpenDoubtBot,
  onOpenProfilePhoto
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const todayHours = (todayMinutes / 60).toFixed(1);
  const isOverCap = Number(todayHours) > maxDailyHours;

  const renderUserAvatar = (sizeClass = 'w-7 h-7', textClass = 'text-xs') => {
    if (!user) return null;
    if (user.profile_photo_url) {
      if (user.profile_photo_url.startsWith('avatar:')) {
        const emojiMap: Record<string, string> = {
          avatar_scholar: '👨‍🎓',
          avatar_medic: '👩‍⚕️',
          avatar_engineer: '⚡',
          avatar_scientist: '🔬',
          avatar_math: '📐',
          avatar_astro: '🚀',
          avatar_bio: '🧬',
          avatar_fox: '🦊'
        };
        const key = user.profile_photo_url.replace('avatar:', '');
        const emoji = emojiMap[key] || '🎓';
        return (
          <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center ${textClass} shadow-xs shrink-0 select-none`}>
            {emoji}
          </div>
        );
      }
      return (
        <img
          src={user.profile_photo_url}
          alt={user.name}
          className={`${sizeClass} rounded-full object-cover shadow-xs shrink-0 border border-slate-200`}
        />
      );
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold ${textClass} shadow-xs shrink-0`}>
        {user.name ? user.name[0].toUpperCase() : 'U'}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Tagline */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer active:scale-98 transition-transform" 
              onClick={() => setActiveTab('today')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 shrink-0">
                <Compass className="w-5 h-5 animate-pulse" />

              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">Pivott</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200/60">
                    Adaptive AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Your syllabus, re-balanced daily — never overwhelmed
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges (Desktop) */}
            {user && (
              <div className="hidden md:flex items-center space-x-2.5">
                {/* Exam countdown badge */}
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-50/90 border border-indigo-100 text-xs font-medium text-indigo-900">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{user.exam_name || 'Exam'}: <strong>{daysToExam}d left</strong></span>
                </div>

                {/* Today's load pill */}
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${
                  isOverCap 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <span>Today: <strong>{todayHours}h</strong> / {maxDailyHours}h max</span>
                </div>
              </div>
            )}

            {/* Desktop Navigation Links & Account */}
            <nav className="flex items-center space-x-1">
              <div className="hidden md:flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'today'
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Today</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'schedule'
                      ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Timetable</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('self-timetable')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'self-timetable'
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Self Timetable</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pyq')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'pyq'
                      ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>10-Yr PYQs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Short Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Re-plans</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'activity'
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Activity</span>
                </button>

                {onOpenDoubtBot && (
                  <button
                    type="button"
                    onClick={onOpenDoubtBot}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer active:scale-95 ml-1"
                    title="Ask AI Doubt Solver Bot"
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Doubt Bot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </button>
                )}
              </div>

              {/* Install App Button (When not already standalone) */}
              {!isInstalled && onOpenInstallModal && (
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs shadow-teal-500/20 transition-all cursor-pointer active:scale-95"
                  title="Install Pivott on your device"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install</span>
                </button>
              )}

              {/* Notification Center (Nudges, Delay & Approaching Deadline Alerts) */}
              <NotificationCenter onNavigateToTab={(tab: any) => setActiveTab(tab)} />

              {/* Profile / Account Toggle Button (100% Clickable on Mobile & Desktop) */}
              {user && (
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className={`flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isProfileOpen 
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-100 bg-white text-slate-700'
                  }`}
                  aria-label="User Account Menu"
                >
                  {renderUserAvatar('w-7 h-7', 'text-xs')}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-none max-w-[80px] truncate">
                      {user.name || 'Account'}
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold leading-tight">
                      Account ▾
                    </span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Account Profile Modal / Drawer (Opens on Tap / Click on any device) */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 100% Full-Screen Backdrop with tap-to-close */}
          <div 
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsProfileOpen(false)}
            aria-hidden="true"
          />

          {/* Account Card Container (Centered on Mobile, Top-Right on Desktop) */}
          <div className="min-h-full flex items-center justify-center sm:items-start sm:justify-end p-4 sm:p-6 sm:pt-20">
            <div 
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 z-10 animate-scale-up max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-3 min-w-0">
                {renderUserAvatar('w-11 h-11', 'text-lg')}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Student Account'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer active:scale-95"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {onOpenProfilePhoto && (
              <div className="pt-2.5 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenProfilePhoto();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Profile Photo / Avatar</span>
                </button>
              </div>
            )}

            {/* Exam & Capacity Summary */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Exam:</span>
                <span className="font-bold text-slate-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200/60">
                  {user.exam_name || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Days Remaining:</span>
                <span className="font-semibold text-slate-800">
                  {daysToExam > 0 ? `${daysToExam} days left` : 'Target date reached'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Daily Study Cap:</span>
                <span className="font-semibold text-slate-800">
                  ≤ {maxDailyHours} hrs/day
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fatigue Protection:</span>
                <span className="font-bold text-teal-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                  <span>Active (No Overload)</span>
                </span>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-2">
              {/* Study Progress & Performance Dashboard (Moved to Account Menu) */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveTab('dashboard');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border border-emerald-200 transition-all cursor-pointer text-left active:scale-98 group shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-black text-emerald-950">Study Progress</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-black">Analytics</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">Completion stats, fatigue tracking & charts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveTab('pyq');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-950 border border-purple-200 transition-all cursor-pointer text-left active:scale-98 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950">10-Year PYQ Question Bank</p>
                    <p className="text-[11px] text-purple-700">Practice questions with detailed solutions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {onOpenDoubtBot && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenDoubtBot();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all cursor-pointer text-left active:scale-98 group shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>AI Doubt Solver Bot</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-400/90 text-slate-900 rounded-full font-black">24/7</span>
                      </p>
                      <p className="text-[11px] text-violet-100">Ask any concept or problem doubt</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onReOnboard();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100/80 text-teal-950 border border-teal-200 transition-all cursor-pointer text-left active:scale-98 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-950">Edit Syllabus & Exam Plan</p>
                    <p className="text-[11px] text-teal-700">Modify course, dates, or study capacity</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Deferred Section moved under Account Section */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveTab('deferred');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border border-amber-200 transition-all cursor-pointer text-left active:scale-98 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Deferred & Reserve Topics</p>
                    <p className="text-[11px] text-amber-700">View & re-include skipped topics</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveTab('history');
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-left active:scale-98"
              >
                <History className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-medium">View Re-Plan History Logs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveTab('activity');
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-left active:scale-98"
              >
                <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Activity History</p>
                  <p className="text-[11px] text-slate-500">Permanent timeline of quizzes, doubts & timetable actions</p>
                </div>
              </button>

              {!isInstalled && onOpenInstallModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenInstallModal();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer text-left active:scale-98"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Install Pivott App on Phone</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all cursor-pointer text-left active:scale-98"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-1 py-1.5 shadow-lg shadow-slate-900/5 safe-area-pb"
      >
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'today'
              ? 'text-teal-700 font-bold bg-teal-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Today</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'schedule'
              ? 'text-indigo-700 font-bold bg-indigo-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Timetable</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'notes'
              ? 'text-blue-700 font-bold bg-blue-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pyq')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'pyq'
              ? 'text-purple-700 font-bold bg-purple-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">10Y-PYQ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('self-timetable')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'self-timetable'
              ? 'text-teal-700 font-bold bg-teal-50/90'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Self Timetable</span>
        </button>

        {user && (
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isProfileOpen
                ? 'text-indigo-700 font-bold bg-indigo-50/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="mb-0.5">
              {renderUserAvatar('w-4 h-4', 'text-[8px]')}
            </div>
            <span className="text-[9px] sm:text-[10px]">Account</span>
          </button>
        )}
      </nav>
    </>
  );
};
