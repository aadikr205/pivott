import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleSlowConnection = (e: any) => {
      setIsSlow(!!e.detail?.slow);
    };

    const handleSwUpdate = (e: any) => {
      setUpdateRegistration(e.detail?.registration || null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pivott:slow-connection', handleSlowConnection);
    window.addEventListener('pivott:sw-update-available', handleSwUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pivott:slow-connection', handleSlowConnection);
      window.removeEventListener('pivott:sw-update-available', handleSwUpdate);
    };
  }, []);

  const handleApplyUpdate = () => {
    if (updateRegistration && updateRegistration.waiting) {
      updateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* 1. Offline Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 shadow-sm z-50 sticky top-0 animate-fade-in">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Viewing cached syllabus & notes.</span>
        </div>
      )}

      {/* 2. Reconnected Toast */}
      {showReconnected && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <Wifi className="w-4 h-4" />
          <span>Back online — synced with server!</span>
        </div>
      )}

      {/* 3. Slow Server Connection Indicator */}
      {isSlow && !isOffline && (
        <div className="fixed bottom-4 left-4 z-40 bg-slate-900/90 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-medium flex items-center space-x-2 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Connecting to server...</span>
        </div>
      )}

      {/* 4. New Version Available Prompt */}
      {updateRegistration && (
        <div className="fixed top-4 right-4 z-50 bg-slate-950 text-white border border-teal-500/60 p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-scale-up">
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-white">Update Ready</p>
            <p className="text-[11px] text-slate-400">A new version of Pivott is installed.</p>
          </div>
          <button
            type="button"
            onClick={handleApplyUpdate}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      )}
    </>
  );
};
