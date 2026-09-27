import React from 'react';
import { ShieldAlert, Sparkles, ArrowRight, Clock } from 'lucide-react';

interface BacklogBannerProps {
  backlogCount: number;
  backlogMinutes: number;
  maxDailyHours: number;
  onReplan: () => void;
  isReplanning: boolean;
}

export const BacklogBanner: React.FC<BacklogBannerProps> = ({
  backlogCount,
  backlogMinutes,
  maxDailyHours,
  onReplan,
  isReplanning
}) => {
  const backlogHours = (backlogMinutes / 60).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-teal-50 border border-amber-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Backlog: {backlogCount} incomplete {backlogCount === 1 ? 'topic' : 'topics'}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {backlogHours}h pending
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Protected by <strong>≤ {maxDailyHours}h/day cap</strong>. High-weightage topics prioritized smoothly.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onReplan}
            disabled={isReplanning}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-60 cursor-pointer active:scale-95"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isReplanning ? 'animate-spin' : ''}`} />
            <span>{isReplanning ? 'Re-Planning...' : 'Re-Plan Now'}</span>
            {!isReplanning && <ArrowRight className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
