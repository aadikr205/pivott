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
    <aside aria-label="Install Pivott Application" className="fixed bottom-20 md:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up">
      <div 
        onClick={onOpenModal}
        className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-teal-500/30 cursor-pointer hover:border-teal-400 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-500/30">
            <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-slate-100">Install Pivott as an App</p>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                1-TAP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Adds to Home Screen • Works Offline • Fullscreen
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pl-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss installation prompt"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
