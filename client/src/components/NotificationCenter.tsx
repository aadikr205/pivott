import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellOff, AlertTriangle, Clock, CheckCircle2, X, ChevronRight, 
  Volume2, VolumeX, ShieldAlert, Sparkles, Moon, Play, Pause, 
  RotateCcw, Timer, Save, Plus, ChevronDown, ChevronUp, History, BookOpen, Check
} from 'lucide-react';
import { api, NotificationAlert, NotificationResponse } from '../api/client';

interface StudySessionLog {
  id: string;
  time: string;
  durationSeconds: number;
  subject: string;
}

const STORAGE_KEY_TIMER = 'pivott_study_stopwatch_state';
const STORAGE_KEY_DAILY_PREFIX = 'pivott_study_daily_';
const getTodayDateStr = () => new Date().toISOString().split('T')[0];

interface NotificationCenterProps {
  onNavigateToTab?: (tab: any) => void;
  notificationsEnabled?: boolean;
  onToggleNotifications?: (enabled: boolean) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNavigateToTab,
  notificationsEnabled,
  onToggleNotifications
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertData, setAlertData] = useState<NotificationResponse | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertIdsRef = useRef<Set<string>>(new Set());

  // === Study Stopwatch (Stoptime) & Session Tracker State ===
  const [todayStudiedSeconds, setTodayStudiedSeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_DAILY_PREFIX}${getTodayDateStr()}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Number(parsed.totalSeconds) || 0;
      }
    } catch (e) {}
    return 0;
  });

  const [todaySessions, setTodaySessions] = useState<StudySessionLog[]>(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_DAILY_PREFIX}${getTodayDateStr()}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.sessions) ? parsed.sessions : [];
      }
    } catch (e) {}
    return [];
  });

  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TIMER);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Boolean(parsed.isRunning);
      }
    } catch (e) {}
    return false;
  });

  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TIMER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.isRunning && parsed.startTimestamp) {
          const elapsed = Math.floor((Date.now() - parsed.startTimestamp) / 1000);
          return (parsed.accumulatedSeconds || 0) + elapsed;
        }
        return parsed.accumulatedSeconds || 0;
      }
    } catch (e) {}
    return 0;
  });

  const [studySubject, setStudySubject] = useState<string>('General Study');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showSessionsHistory, setShowSessionsHistory] = useState<boolean>(false);

  // Tick stopwatch every second when active
  useEffect(() => {
    let interval: any = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds(prev => {
          const next = prev + 1;
          try {
            const raw = localStorage.getItem(STORAGE_KEY_TIMER);
            const current = raw ? JSON.parse(raw) : {};
            localStorage.setItem(STORAGE_KEY_TIMER, JSON.stringify({
              ...current,
              accumulatedSeconds: next,
              lastTick: Date.now()
            }));
          } catch (e) {}
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchRunning]);

  // Determine effective notification state (prop takes precedence, fallback to API response)
  const isEffectiveEnabled = notificationsEnabled !== undefined
    ? notificationsEnabled
    : (alertData ? alertData.notifications_enabled !== 0 : true);

  // Gentle audio chime synthesizer using Web Audio API (Zero external audio file dependency)
  const playAlertChime = (urgency: 'critical' | 'high' | 'medium' | 'low') => {
    // If user has silenced sounds OR study DND is active, do not play any sound!
    if (!soundEnabled || !isEffectiveEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (urgency === 'critical') {
        // High attention 2-tone ping (880Hz -> 1046Hz)
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Softer harmonic chime (523Hz -> 659Hz)
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(659, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await api.notifications.getAlerts();
      setAlertData(res);

      const isSilenced = notificationsEnabled !== undefined
        ? !notificationsEnabled
        : res.notifications_enabled === 0;

      // Check for new critical/urgent alerts to trigger phone push and audio
      // SILENCED COMPLETELY when Study DND is active
      if (!isSilenced && res.alerts && res.alerts.length > 0) {
        for (const alert of res.alerts) {
          if (!lastAlertIdsRef.current.has(alert.id)) {
            lastAlertIdsRef.current.add(alert.id);

            // Native Browser Push Notification on Phone / Desktop
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(alert.title, {
                  body: alert.message,
                  icon: '/vite.svg',
                  tag: alert.id
                });
              } catch (e) {}
            }

            // Sound chime
            playAlertChime(alert.urgency);
          }
        }
      }
    } catch (err) {
      // Quiet fail if network / offline
    }
  };

  // Request native phone push permission
  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermission(res);
        if (res === 'granted') {
          new Notification('Pivott Notifications Enabled! 🚀', {
            body: 'You will receive timely study reminders and deadline alerts.',
            icon: '/vite.svg'
          });
          playAlertChime('medium');
        }
      } catch (err) {
        console.error('Failed to request notification permission:', err);
      }
    }
  };

  // Poll every 45 seconds
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 45000);
    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  const alerts = alertData?.alerts || [];
  const criticalCount = alertData?.critical_count || 0;
  const totalCount = alerts.length;

  const handleAction = (tabName?: string) => {
    setIsOpen(false);
    if (tabName && onNavigateToTab) {
      onNavigateToTab(tabName);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      await api.updateNotificationPreference(true);
      if (onToggleNotifications) {
        onToggleNotifications(true);
      }
      setAlertData(prev => prev ? { ...prev, notifications_enabled: 1 } : null);
    } catch (e) {}
  };

  // === Stopwatch Actions ===
  const handleStartStopwatch = () => {
    setIsStopwatchRunning(true);
    try {
      localStorage.setItem(STORAGE_KEY_TIMER, JSON.stringify({
        isRunning: true,
        startTimestamp: Date.now(),
        accumulatedSeconds: stopwatchSeconds,
        subject: studySubject
      }));
    } catch (e) {}
    playAlertChime('medium');
  };

  const handlePauseStopwatch = () => {
    setIsStopwatchRunning(false);
    try {
      localStorage.setItem(STORAGE_KEY_TIMER, JSON.stringify({
        isRunning: false,
        startTimestamp: null,
        accumulatedSeconds: stopwatchSeconds,
        subject: studySubject
      }));
    } catch (e) {}
  };

  const handleToggleStudyMode = () => {
    if (isStopwatchRunning) {
      handlePauseStopwatch();
    } else {
      handleStartStopwatch();
    }
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchSeconds(0);
    try {
      localStorage.removeItem(STORAGE_KEY_TIMER);
    } catch (e) {}
  };

  const handleSaveSession = (overrideSeconds?: number) => {
    const durationToAdd = overrideSeconds !== undefined ? overrideSeconds : stopwatchSeconds;
    if (durationToAdd < 10) {
      alert('Please study for at least 10 seconds before saving a session.');
      return;
    }

    const newTotal = todayStudiedSeconds + durationToAdd;
    const newSession: StudySessionLog = {
      id: `sess_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: durationToAdd,
      subject: studySubject
    };
    const updatedSessions = [newSession, ...todaySessions];

    setTodayStudiedSeconds(newTotal);
    setTodaySessions(updatedSessions);

    // Save to daily storage
    try {
      localStorage.setItem(`${STORAGE_KEY_DAILY_PREFIX}${getTodayDateStr()}`, JSON.stringify({
        totalSeconds: newTotal,
        sessions: updatedSessions
      }));
    } catch (e) {}

    // If saving the active stopwatch, reset it
    if (overrideSeconds === undefined) {
      setIsStopwatchRunning(false);
      setStopwatchSeconds(0);
      try {
        localStorage.removeItem(STORAGE_KEY_TIMER);
      } catch (e) {}
    }

    const mins = Math.max(1, Math.round(durationToAdd / 60));
    setSaveSuccessMsg(`🎉 +${mins} min study session recorded in your daily tracker!`);
    setTimeout(() => setSaveSuccessMsg(null), 4500);
    playAlertChime('medium');
  };

  const formatStopwatch = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationHM = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="relative">
      {/* Bell Icon Trigger with Pulse Badge & Live Stopwatch Indicator */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isEffectiveEnabled ? 'Open Study Notifications' : 'Study Do Not Disturb Active'}
        className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
          isStopwatchRunning
            ? 'bg-slate-900 text-emerald-400 border-emerald-500/60 shadow-lg ring-2 ring-emerald-500/30'
            : !isEffectiveEnabled
            ? 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
            : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80'
        }`}
      >
        {!isEffectiveEnabled ? (
          <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        ) : (
          <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${isStopwatchRunning ? 'text-emerald-400' : ''}`} />
        )}
        
        {/* Live Stopwatch Badge on Bell Icon */}
        {isStopwatchRunning && (
          <span
            title="Study Stopwatch Running!"
            className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300 animate-pulse"
          >
            ⏱️ {Math.floor(stopwatchSeconds / 60)}m
          </span>
        )}

        {totalCount > 0 && isEffectiveEnabled && !isStopwatchRunning && (
          <span
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full text-white shadow-lg ${
              criticalCount > 0
                ? 'bg-rose-600 animate-pulse ring-2 ring-rose-400'
                : 'bg-teal-500'
            }`}
          >
            {totalCount}
          </span>
        )}

        {!isEffectiveEnabled && !isStopwatchRunning && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900" />
        )}
      </button>

      {/* Floating / Dropdown Notification Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[92vw] z-50 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isStopwatchRunning
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : !isEffectiveEnabled 
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                    : 'bg-teal-500/20 border-teal-500/30 text-teal-400'
                }`}>
                  {isStopwatchRunning ? (
                    <Timer className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : !isEffectiveEnabled ? (
                    <BellOff className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Study Reminders & Alerts</h4>
                  <p className="text-[11px] text-slate-400">
                    {isStopwatchRunning
                      ? '⏱️ Study Session Live'
                      : !isEffectiveEnabled
                      ? 'Do Not Disturb Active'
                      : 'Live Deadlines & Delay Alerts'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {soundEnabled && isEffectiveEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ⏱️ LIVE STUDY STOPWATCH & SESSION TRACKER */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
              <div className="flex items-center justify-between gap-2 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-xl border ${
                    isStopwatchRunning 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                  }`}>
                    <Timer className={`w-4 h-4 ${isStopwatchRunning ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Study Stopwatch</span>
                      <span className="text-[10px] font-normal text-slate-400">(Session Tracker)</span>
                    </h5>
                    <p className="text-[10px] text-slate-400">Track your daily study hours</p>
                  </div>
                </div>

                {/* ON / OFF Switch */}
                <button
                  type="button"
                  onClick={handleToggleStudyMode}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                    isStopwatchRunning
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isStopwatchRunning ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
                  <span>{isStopwatchRunning ? 'Study ON' : 'Study OFF'}</span>
                </button>
              </div>

              {/* Digital Clock Display & Subject Selector */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isStopwatchRunning 
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-inner ring-1 ring-emerald-500/20' 
                  : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                      {isStopwatchRunning ? '🟢 Active Session Time' : 'Session Stopwatch'}
                    </span>
                    <div className={`text-2xl sm:text-3xl font-mono font-black tracking-wider ${
                      isStopwatchRunning ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {formatStopwatch(stopwatchSeconds)}
                    </div>
                  </div>

                  {/* Subject Tag Selector */}
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Subject
                    </span>
                    <select
                      value={studySubject}
                      onChange={(e) => setStudySubject(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-400 cursor-pointer"
                    >
                      <option value="General Study">General Focus</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Revision & Notes">Revision</option>
                      <option value="Mock Test / PYQ">PYQ / Test</option>
                    </select>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {!isStopwatchRunning ? (
                    <button
                      type="button"
                      onClick={handleStartStopwatch}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Study</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePauseStopwatch}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                    >
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveSession()}
                    disabled={stopwatchSeconds < 10}
                    title={stopwatchSeconds < 10 ? 'Study for at least 10 seconds to record' : 'Add to today\'s study total'}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      stopwatchSeconds >= 10
                        ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-md active:scale-95'
                        : 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetStopwatch}
                    disabled={stopwatchSeconds === 0}
                    title="Reset stopwatch"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Success Notification Toast */}
              {saveSuccessMsg && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-semibold">{saveSuccessMsg}</span>
                </div>
              )}

              {/* Today's Study Progress Summary & Quick Manual Adds */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Today's Total Studied
                  </span>
                  <span className="font-bold text-white font-mono text-sm">
                    🎯 {formatDurationHM(todayStudiedSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    ({todaySessions.length} session{todaySessions.length === 1 ? '' : 's'})
                  </span>
                </div>

                {todaySessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSessionsHistory(!showSessionsHistory)}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showSessionsHistory ? 'Hide Log' : 'View Log'}</span>
                    {showSessionsHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Quick Offline Study Add Pills */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Quick Add:</span>
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSaveSession(mins * 60)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    +{mins}m
                  </button>
                ))}
              </div>

              {/* Collapsible Session History Log */}
              {showSessionsHistory && todaySessions.length > 0 && (
                <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Today's Recorded Sessions:
                  </span>
                  {todaySessions.map((s, idx) => (
                    <div key={s.id || idx} className="flex items-center justify-between text-[11px] text-slate-300 py-0.5 border-b border-slate-800/60 last:border-0">
                      <span className="font-mono text-slate-400">{s.time} • <strong className="text-white">{s.subject}</strong></span>
                      <span className="font-mono font-bold text-teal-300">{formatDurationHM(s.durationSeconds)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study DND Status Ribbon if muted */}
            {!isEffectiveEnabled && (
              <div className="p-3.5 bg-gradient-to-r from-amber-950/70 to-slate-900 border-b border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  <Moon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-200">
                    <span className="font-bold block">Study DND Mode Active</span>
                    <span className="text-slate-300">Audible chimes & alert popups are silenced during focus.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Turn On
                </button>
              </div>
            )}

            {/* Push Permission Prompt if not granted and notifications enabled */}
            {isEffectiveEnabled && permission !== 'granted' && (
              <div className="p-3.5 bg-gradient-to-r from-teal-950/60 to-slate-900 border-b border-teal-500/30 flex items-center justify-between gap-3">
                <div className="text-[11px] text-teal-200">
                  <span className="font-bold block">📱 Phone Push Alerts</span>
                  <span>Enable native phone push notifications for study deadlines.</span>
                </div>
                <button
                  type="button"
                  onClick={requestPushPermission}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Allow
                </button>
              </div>
            )}

            {/* Remaining Study Hours Status Ribbon */}
            {alertData && (
              <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Remaining Today:</span>
                </span>
                <span className="font-mono font-bold text-teal-300">
                  {alertData.remaining_hours}h {alertData.remaining_minutes % 60}m before midnight
                </span>
              </div>
            )}

            {/* Alerts List */}
            <div className="p-3 sm:p-4 space-y-2.5 max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-white">All Caught Up!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No overdue tasks or delayed topics right now.</p>
                </div>
              ) : (
                alerts.map(alert => {
                  const isCritical = alert.urgency === 'critical';
                  const isHigh = alert.urgency === 'high';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCritical
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : isHigh
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{alert.icon}</span>
                          <span className="text-xs font-bold text-white">{alert.title}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          }`}
                        >
                          {alert.urgency}
                        </span>
                      </div>

                      <p className="text-xs mt-1.5 leading-relaxed opacity-90 text-slate-300">
                        {alert.message}
                      </p>

                      {alert.action_label && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAction(alert.action_tab)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                              isCritical
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-teal-600 hover:bg-teal-500 text-white'
                            }`}
                          >
                            <span>{alert.action_label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
