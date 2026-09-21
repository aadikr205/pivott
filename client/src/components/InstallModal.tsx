import React from 'react';
import { Smartphone, Download, Share2, PlusSquare, Monitor, CheckCircle, X, Sparkles } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNativePrompt: boolean;
  isIOS: boolean;
  onNativeInstall: () => Promise<boolean>;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  hasNativePrompt,
  isIOS,
  onNativeInstall
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative overflow-hidden animate-scale-up">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center space-x-3.5 mb-5">
          <img src="/pivott-192.png" alt="Pivott Logo" className="w-13 h-13 rounded-2xl shadow-md border border-slate-100" />
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-lg font-bold text-slate-900">Install Pivott App</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-500">Standalone App • Works Offline • No App Store Needed</p>
          </div>
        </div>

        {/* Value proposition badges */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-5">
          <div className="flex flex-col items-center">
            <span className="text-base">🚀</span>
            <span className="text-[10px] font-semibold text-slate-700 mt-1">Full-Screen</span>
            <span className="text-[9px] text-slate-400">No browser bar</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200">
            <span className="text-base">📶</span>
            <span className="text-[10px] font-semibold text-slate-700 mt-1">Offline Sync</span>
            <span className="text-[9px] text-slate-400">Timetable cached</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base">⚡</span>
            <span className="text-[10px] font-semibold text-slate-700 mt-1">Instant Open</span>
            <span className="text-[9px] text-slate-400">Home screen icon</span>
          </div>
        </div>

        {/* Installation Instructions */}
        {hasNativePrompt ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Click the button below to install Pivott directly on your device. It will appear on your Home Screen or Desktop like any native application.
            </p>
            <button
              onClick={async () => {
                const installed = await onNativeInstall();
                if (installed) onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Pivott Now (1-Click)</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3.5">
            <p className="text-xs font-semibold text-slate-700">How to install on iPhone & iPad (Safari):</p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div className="flex items-center space-x-1.5">
                  <span>Tap the</span>
                  <strong className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-indigo-600 font-semibold">
                    <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                  </strong>
                  <span>button in Safari</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex items-center space-x-1.5">
                  <span>Scroll down & tap</span>
                  <strong className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5 mr-1 text-teal-600" /> Add to Home Screen
                  </strong>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <span>Tap <strong>Add</strong> in the top-right corner. Done! 🎉</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-xs font-semibold text-slate-700">How to install on Android / Windows / Mac:</p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Smartphone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Android (Chrome / Brave / Edge):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tap the <strong>three dots (⋮)</strong> at top right &rarr; select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Monitor className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Windows / Mac PC (Chrome / Edge):</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Look at the right side of the browser URL bar &rarr; click the <strong>Install icon (⊕)</strong> &rarr; click <strong>Install</strong>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
