import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, X, ChevronRight, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';
import { api, NotificationAlert, NotificationResponse } from '../api/client';

interface NotificationCenterProps {
  onNavigateToTab?: (tab: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateToTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertData, setAlertData] = useState<NotificationResponse | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertIdsRef = useRef<Set<string>>(new Set());

  // Gentle audio chime synthesizer using Web Audio API (Zero external audio file dependency)
  const playAlertChime = (urgency: 'critical' | 'high' | 'medium' | 'low') => {
    if (!soundEnabled) return;
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

      // Check for new critical/urgent alerts to trigger phone push and audio
      if (res.alerts && res.alerts.length > 0) {
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
            body: 'Aapko study reminders aur deadline alerts time par milte rahenge.',
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
  }, []);

  const alerts = alertData?.alerts || [];
  const criticalCount = alertData?.critical_count || 0;
  const totalCount = alerts.length;

  const handleAction = (tabName?: string) => {
    setIsOpen(false);
    if (tabName && onNavigateToTab) {
      onNavigateToTab(tabName);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Trigger with Pulse Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Study Notifications"
        className="relative p-2 sm:p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        
        {totalCount > 0 && (
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
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Study Nudge & Reminders</h4>
                  <p className="text-[11px] text-slate-400">Live Deadlines & Delay Alerts</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
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

            {/* Push Permission Prompt if not granted */}
            {permission !== 'granted' && (
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
