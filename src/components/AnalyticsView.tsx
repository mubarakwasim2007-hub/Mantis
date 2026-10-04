import React from 'react';
import { BarChart2, TrendingUp, Clock, Target, Calendar, Award } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.ts';

export const AnalyticsView: React.FC = () => {
  const studySessions = useLiveQuery(() => db.studySessions.toArray(), []) || [];
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const habitLogs = useLiveQuery(() => db.habitLogs.toArray(), []) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];

  // Compute total focus time in hours from actual IndexedDB study sessions
  const totalFocusMinutes = studySessions.reduce((sum, s) => sum + (s.minutesSpent || 0), 0);
  const totalFocusHours = Number((totalFocusMinutes / 60).toFixed(1));

  // Compute habit completion rate from real logs
  const totalLogs = habitLogs.length;
  const completedLogs = habitLogs.filter((l) => l.completed).length;
  const habitRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  // Active longest streak from real habits
  const activeStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak || 0), 0) : 0;

  // Generate dynamic 7-day window ending today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayNum}`;

    const minutes = studySessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + (s.minutesSpent || 0), 0);

    return {
      day: dayLabel,
      hours: Number((minutes / 60).toFixed(1)),
      dateStr,
    };
  });

  const maxDailyHours = Math.max(...last7Days.map((d) => d.hours), 4.0);

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
          Study Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Real-time performance metrics derived exclusively from your local IndexedDB records
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Total Logged Focus</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{totalFocusHours} hrs</p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            {studySessions.length} recorded session{studySessions.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Habit Completion Rate</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{habitRate}%</p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            {completedLogs} of {totalLogs} logs completed
          </span>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Active Streak</span>
            <span className="text-base">🔥</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{activeStreak} Days</p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
            Calculated from active habits
          </span>
        </div>
      </div>

      {/* Weekly Breakdown Bar Graph */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h3 className="text-base font-semibold text-white">Daily Focus Hours (Last 7 Days)</h3>
          <span className="text-xs text-slate-400 font-mono">Real IndexedDB Logs</span>
        </div>

        {totalFocusHours === 0 ? (
          <div className="py-12 text-center">
            <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Study Sessions Logged Yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Recorded study blocks will appear here as you log focus sessions.
            </p>
          </div>
        ) : (
          <div className="h-56 flex items-end justify-between gap-4 px-2 sm:px-6 border-b border-white/10 pb-4">
            {last7Days.map((d, i) => {
              const heightPercent = maxDailyHours > 0 ? (d.hours / maxDailyHours) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hours}h
                  </span>
                  <div className="w-full max-w-[48px] bg-white/10 rounded-2xl h-44 flex items-end p-1">
                    <div
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                      className="w-full rounded-xl bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-all group-hover:brightness-125"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{d.day}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
