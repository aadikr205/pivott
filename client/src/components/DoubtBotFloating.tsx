import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface DoubtBotFloatingProps {
  onOpen: () => void;
}

export const DoubtBotFloating: React.FC<DoubtBotFloatingProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fade-in">
      <div className="relative group">
        <button
          type="button"
          onClick={onOpen}
          className="w-13 h-13 rounded-full flex items-center justify-center bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 hover:from-teal-500 hover:to-indigo-600 text-white shadow-xl shadow-teal-700/35 hover:shadow-teal-700/55 border border-teal-300/40 transition-all duration-200 transform hover:scale-108 active:scale-95 cursor-pointer"
          aria-label="AI Problem Solver"
          title="AI Problem Solver"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>
        </button>

        {/* Hover Tooltip (Default state shows only icon, tooltip appears on hover) */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold tracking-wide shadow-xl border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          AI Problem Solver
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95"></div>
        </div>
      </div>
    </div>
  );
};
