import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Minimize2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { ReplanResponse } from '../api/client';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  replanData: ReplanResponse | null;
}

export const ReplanModal: React.FC<ReplanModalProps> = ({
  isOpen,
  onClose,
  replanData
}) => {
  if (!isOpen || !replanData) return null;

  const { summary_text, micro_copy, diff_summary, deferred_topics, compressed_topics } = replanData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center space-x-2 text-teal-700 bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full w-fit text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Re-Adjustment Complete</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Your Plan Has Been Re-Balanced
        </h2>

        {/* Calm AI Explanation Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-medium text-slate-900 mb-1">Coach Note:</p>
          <p>{summary_text}</p>
        </div>

        {/* Micro-copy pill */}
        {micro_copy && (
          <p className="mt-3 text-xs italic text-teal-800 bg-teal-50/70 px-3 py-1.5 rounded-xl border border-teal-100">
            "{micro_copy}"
          </p>
        )}

        {/* Diff Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-emerald-900">{diff_summary.keptCount}</div>
            <div className="text-[11px] font-medium text-emerald-700">Protected High-Yield</div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-blue-700 mb-1">
              <Minimize2 className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-blue-900">{diff_summary.compressedCount}</div>
            <div className="text-[11px] font-medium text-blue-700">Skim-Revision (30%)</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-amber-700 mb-1">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-amber-900">{diff_summary.deferredCount}</div>
            <div className="text-[11px] font-medium text-amber-700">Deferred to Reserve</div>
          </div>
        </div>

        {/* Hard Constraint Confirmation Banner */}
        <div className="mt-4 flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Hard constraint enforced: Daily study load stays at <strong>≤ {diff_summary.maxDailyHours} hours/day</strong>.
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Today's Tasks</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
