import React from 'react';
import { Calendar } from 'lucide-react';

interface TimeTableDaySelectorProps {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
  countsByDay: Record<string, number>;
  todayDayName: string;
  totalCount: number;
}

export const TimeTableDaySelector: React.FC<TimeTableDaySelectorProps> = ({
  days,
  selectedDay,
  onSelectDay,
  countsByDay,
  todayDayName,
  totalCount
}) => {
  const shortNames: Record<string, string> = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-md">
      <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-800/80 mb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Weekly Schedule
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          Today is <strong className="text-teal-300 font-semibold">{todayDayName}</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {/* All Days Tab */}
        <button
          type="button"
          onClick={() => onSelectDay('all')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
            selectedDay === 'all'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40 ring-1 ring-teal-400/40'
              : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="View all scheduled days"
        >
          <span>All Days</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
            selectedDay === 'all' ? 'bg-teal-700/80 text-teal-100' : 'bg-slate-800 text-slate-400'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Mon - Sun Tabs */}
        {days.map(day => {
          const isSelected = selectedDay === day;
          const isToday = day === todayDayName;
          const count = countsByDay[day] || 0;
          const short = shortNames[day] || day.slice(0, 3);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`min-h-[44px] min-w-[56px] sm:min-w-[68px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-md shadow-teal-950/40 ring-1 ring-teal-300/40'
                  : isToday
                    ? 'bg-teal-950/30 border border-teal-500/40 text-teal-300 hover:bg-teal-900/40'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label={`Select ${day}${isToday ? ' (Today)' : ''}, ${count} study tasks`}
            >
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold">{short}</span>
                {isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-400'} animate-pulse`} />
                )}
              </div>

              <div className="flex items-center space-x-1 mt-0.5">
                {isToday ? (
                  <span className={`text-[9px] uppercase font-black px-1 rounded ${
                    isSelected ? 'bg-teal-800 text-teal-100' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    Today
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono ${
                    isSelected ? 'text-teal-100' : count > 0 ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {count > 0 ? `${count} slots` : '0'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
