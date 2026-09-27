import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface InstallBannerProps {
  isInstalled: boolean;
  onOpenModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ isInstalled, onOpenModal }) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return safeStorage.getItem('pivott_install_banner_dismissed') === 'true';
  });

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    safeStorage.setItem('pivott_install_banner_dismissed', 'true');
  };

  return (
    <aside aria-label="Install Pivott Application" className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-30 animate-slide-up">
      <div 
        onClick={onOpenModal}
        className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-teal-500/30 cursor-pointer hover:border-teal-400 transition-all group"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-500/30">
            <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-slate-100 truncate">Install Pivott App</p>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                1-TAP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Home Screen • Offline • Fast
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 pl-2 shrink-0">
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss installation prompt"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
