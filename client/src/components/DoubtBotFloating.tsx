import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface DoubtBotFloatingProps {
  onOpen: () => void;
}

export const DoubtBotFloating: React.FC<DoubtBotFloatingProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fade-in">
      <button
        type="button"
        onClick={onOpen}
        className="group flex items-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 hover:from-teal-500 hover:to-indigo-600 text-white shadow-xl shadow-teal-700/30 hover:shadow-teal-700/50 border border-teal-300/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Open AI Doubt Solver Bot"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
        </div>
        <span className="text-xs sm:text-sm font-bold tracking-wide">
          AI Problem Solver
        </span>
      </button>
    </div>
  );
};
