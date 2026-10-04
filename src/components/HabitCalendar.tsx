import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarDay {
  date: number;
  full: boolean;
  active?: boolean;
}

interface HabitCalendarProps {
  calendarDays?: CalendarDay[];
  activeDate: number;
  onSelectDate: (date: number) => void;
  monthName?: string;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HabitCalendar: React.FC<HabitCalendarProps> = ({
  calendarDays,
  activeDate,
  onSelectDate,
  monthName,
}) => {
  const today = new Date();
  const currentMonthName =
    monthName || today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const currentMonthShort = today.toLocaleDateString(undefined, { month: 'short' });

  // Generate days for the current month if not provided
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysList: CalendarDay[] =
    calendarDays ||
    Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      full: false,
      active: i + 1 === activeDate,
    }));

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-teal-400" />
          <span>Weekly Consistency</span>
        </h3>
        <span className="text-xs font-mono text-teal-300">{currentMonthName}</span>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 text-center mb-2">
        {WEEK_DAYS.map((d, i) => (
          <span key={i} className="text-[11px] font-bold text-slate-400">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid - Perfectly circular interaction states, halo effect, zero square flash */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
        {daysList.map((item, idx) => {
          const isSelected = activeDate === item.date;
          return (
            <div key={idx} className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectDate(item.date)}
                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-mono transition-all duration-150 relative select-none mx-auto ${
                  isSelected
                    ? 'bg-teal-900/60 text-teal-200 font-bold rounded-full ring-1 ring-offset-2 ring-offset-slate-950 ring-teal-500/50 shadow-sm'
                    : item.full
                    ? 'text-slate-200 hover:bg-teal-900/40 hover:text-white rounded-full'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 rounded-full'
                }`}
              >
                <span className="leading-none">{item.date}</span>
                {item.full && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400/60" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend footer with dynamic month abbreviation */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400/80" /> All Habits Completed
        </span>
        <span className="font-mono text-teal-300">
          Day {activeDate} {currentMonthShort}
        </span>
      </div>
    </div>
  );
};
