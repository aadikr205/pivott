import React from 'react';
import { CheckCircle2, Clock, Flame } from 'lucide-react';

interface TimeTableProgressProps {
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  dayLabel?: string;
}

export const TimeTableProgress: React.FC<TimeTableProgressProps> = ({
  totalCount,
  completedCount,
  inProgressCount,
  dayLabel = 'Today'
}) => {
  const pendingCount = Math.max(0, totalCount - completedCount - inProgressCount);
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {dayLabel} Progress
            </span>
            {percentage === 100 && totalCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>All Complete!</span>
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base font-black text-white">
            {completedCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'} done {dayLabel === 'All Days' ? 'overall' : 'today'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">{completedCount} Done</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-300 font-medium">{inProgressCount} Studying</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-slate-400 font-medium">{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Thin sleek progress bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
        <span className="flex items-center space-x-1">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>Keep your momentum going!</span>
        </span>
        <span className="font-mono font-bold text-teal-300">{percentage}% Finished</span>
      </div>
    </div>
  );
};
