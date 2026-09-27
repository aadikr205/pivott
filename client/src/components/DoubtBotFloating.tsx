import React, { useState } from 'react';
import { Bot, ChevronRight, X } from 'lucide-react';

interface DoubtBotFloatingProps {
  onOpen: () => void;
}

export const DoubtBotFloating: React.FC<DoubtBotFloatingProps> = ({ onOpen }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside
      aria-label="AI Doubt Solver Assistant"
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-2.5 sm:right-6 z-40 animate-fade-in touch-manipulation select-none"
    >
      {isMinimized ? (
        /* Minimized Side Tab - 0% Obstruction of Cards and Controls */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            onOpen();
          }}
          className="flex items-center space-x-1 pl-2.5 pr-1.5 py-1.5 rounded-l-full bg-gradient-to-r from-teal-700 to-indigo-700 text-white text-[11px] font-bold shadow-lg border border-r-0 border-teal-300/40 hover:from-teal-600 hover:to-indigo-600 transition-all cursor-pointer active:scale-95 group"
          title="Open AI Doubt Solver"
          aria-label="Expand AI Doubt Solver"
        >
          <Bot className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-[10px] font-bold tracking-tight">AI Doubt</span>
          <ChevronRight className="w-3.5 h-3.5 text-teal-200 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        /* Compact Floating Action Button with Optional Tuck Control */
        <div className="relative flex items-center group">
          {/* Quick tuck / minimize button for mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="md:hidden -mr-1.5 mb-6 z-10 w-5 h-5 rounded-full bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center shadow-xs border border-slate-600 text-[10px] transition-all cursor-pointer"
            title="Minimize to edge"
            aria-label="Minimize AI bot to edge"
          >
            <X className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onOpen}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 hover:from-teal-500 hover:to-indigo-600 text-white shadow-lg shadow-teal-900/30 hover:shadow-teal-700/50 border border-teal-300/40 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="AI Doubt Solver"
            title="AI Doubt Solver"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
          </button>

          {/* Desktop Hover Tooltip */}
          <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold tracking-wide shadow-xl border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            AI Problem Solver
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95"></div>
          </div>
        </div>
      )}
    </aside>
  );
};
