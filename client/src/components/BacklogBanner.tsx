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
    <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-teal-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Backlog Detected ({backlogCount} incomplete {backlogCount === 1 ? 'topic' : 'topics'})
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {backlogHours} hrs pending
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Don't worry — we never ask you to study 12–14 hours to catch up. Pivott will protect your 
              <strong> ≤ {maxDailyHours}h/day cap</strong>, prioritize your highest-weightage topics, and rebalance smoothly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
          <button
            onClick={onReplan}
            disabled={isReplanning}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-500/10 transition-all disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isReplanning ? 'animate-spin' : ''}`} />
            <span>{isReplanning ? 'Intelligently Re-Planning...' : 'Re-Plan Now'}</span>
            {!isReplanning && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};
