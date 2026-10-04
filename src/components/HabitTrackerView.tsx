import React, { useState } from 'react';
import {
  Check,
  Plus,
  Flame,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  Clock,
  CheckCircle2,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Habit, HabitLog } from '../db/db.ts';
import {
  addHabit,
  toggleHabitLog,
  deleteHabit,
  getTodayDateString,
} from '../db/dbService.ts';
import { HabitCalendar, CalendarDay } from './HabitCalendar.tsx';

export const HabitTrackerView: React.FC = () => {
  const todayStr = getTodayDateString();
  const todayDateNum = new Date().getDate();

  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const todayLogs = useLiveQuery(() => db.habitLogs.where('date').equals(todayStr).toArray(), [todayStr]) || [];
  const allLogs = useLiveQuery(() => db.habitLogs.toArray(), []) || [];

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Academic' | 'Wellness' | 'Lab Skills'>('All');
  const [activeDate, setActiveDate] = useState<number>(todayDateNum);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'Academic' | 'Wellness' | 'Lab Skills'>('Academic');
  const [newTimeEstimate, setNewTimeEstimate] = useState('30 min');
  const [isAdding, setIsAdding] = useState(false);

  // Check if a habit is completed for today
  const isHabitCompletedToday = (habitId?: number): boolean => {
    if (!habitId) return false;
    const log = todayLogs.find((l) => l.habitId === habitId);
    return !!log?.completed;
  };

  const handleToggleHabit = async (habitId?: number) => {
    if (!habitId) return;
    await toggleHabitLog(habitId, todayStr);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    await addHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      frequency: 'daily',
      targetDays: 7,
      currentStreak: 1,
      bestStreak: 1,
      timeEstimate: newTimeEstimate,
      createdAt: todayStr,
    });

    setNewHabitTitle('');
    setIsAdding(false);
  };

  const handleDeleteHabit = async (id?: number) => {
    if (!id) return;
    await deleteHabit(id);
  };

  const filteredHabits = habits.filter(
    (h) => selectedFilter === 'All' || h.category === selectedFilter
  );

  const completedTodayCount = habits.filter((h) => isHabitCompletedToday(h.id)).length;
  const completionPercentage =
    habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  // Real max streak among all habits (0 if no habits)
  const longestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak || 0), 0) : 0;

  // Dynamic Calendar computation for the current month based on REAL logs
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');

  const calendarDays: CalendarDay[] = Array.from({ length: daysInCurrentMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayKey = `${currentYear}-${currentMonthStr}-${String(dayNum).padStart(2, '0')}`;
    const logsForDay = allLogs.filter((l) => l.date === dayKey && l.completed);
    // Mark full ONLY if at least 1 habit completed on that day, or all habits completed
    const full = habits.length > 0 ? logsForDay.length === habits.length : false;
    return {
      date: dayNum,
      full,
      active: dayNum === activeDate,
    };
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Habit Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Build disciplined daily study routines for Biomedical Engineering (IndexedDB Synced)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-card border border-white/20 text-xs font-semibold text-white">
            <span className="text-lg">🔥</span>
            <span className="font-mono">{longestStreak} Days Active Streak</span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-white/20">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Progress</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {completionPercentage}%
            </span>
            <span className="text-xs text-slate-300 font-mono">
              ({completedTodayCount}/{habits.length} habits)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
            <div
              style={{ width: `${completionPercentage}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-white/20">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Current Longest Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{longestStreak}</span>
            <span className="text-xs text-amber-300">Days Consecutive</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">From real active habits</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-white/20">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Logged Checkpoints</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {allLogs.filter((l) => l.completed).length}
            </span>
            <span className="text-xs text-emerald-400">Total Check-ins</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">100% on-device IndexedDB</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-white/20">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Habits Registered</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {habits.length}
            </span>
            <span className="text-xs text-indigo-300">Active Routines</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Personal habit roster</p>
        </div>
      </div>

      {/* Inline Add Habit Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateHabit}
          className="glass-card rounded-3xl p-5 border border-cyan-400/40 bg-white/[0.12] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Create New Habit in IndexedDB</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Habit title (e.g. Signals and Systems formula practice)"
              className="sm:col-span-2 px-4 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
              required
            />
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900/80 focus:outline-none"
            >
              <option value="Academic">Academic</option>
              <option value="Wellness">Wellness</option>
              <option value="Lab Skills">Lab Skills</option>
            </select>
            <input
              type="text"
              value={newTimeEstimate}
              onChange={(e) => setNewTimeEstimate(e.target.value)}
              placeholder="Time estimate (e.g. 30 min)"
              className="px-3 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400 text-center"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Habit List & Filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-pill">
              {(['All', 'Academic', 'Wellness', 'Lab Skills'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedFilter === tab
                      ? 'bg-white/20 text-white shadow-sm border border-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono shrink-0">
              Showing {filteredHabits.length} habits
            </span>
          </div>

          {filteredHabits.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
              <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No Habits Registered Yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "+ New Habit" above to add your personal routines (e.g. Math Problem Practice, DLMS Revision).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHabits.map((habit) => {
                const isCompleted = isHabitCompletedToday(habit.id);
                return (
                  <div
                    key={habit.id}
                    className={`glass-card glass-card-hover rounded-3xl p-4 sm:p-5 border transition-all flex items-center justify-between gap-4 ${
                      isCompleted
                        ? 'border-cyan-400/30 bg-white/[0.09]'
                        : 'border-white/15 bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Interactive Checkbox */}
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        type="button"
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.7)]'
                            : 'border-2 border-slate-400 hover:border-cyan-300'
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm sm:text-base font-semibold break-words ${
                            isCompleted ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {habit.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                              habit.category === 'Academic'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : habit.category === 'Wellness'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {habit.category}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {habit.timeEstimate || '30 min'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Badge & Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                          🔥 {habit.currentStreak || 0}d
                        </span>
                        <span className="text-[10px] text-slate-400">streak</span>
                      </div>

                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {isCompleted ? 'Completed' : 'Mark Done'}
                      </button>

                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        type="button"
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Calendar & Local Focus Insights */}
        <div className="space-y-6">
          <HabitCalendar
            calendarDays={calendarDays}
            activeDate={activeDate}
            onSelectDate={setActiveDate}
          />

          <div className="glass-card rounded-3xl p-6 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Routine Insights</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consistently checking in habits reinforces active recall and helps maintain your 9.47 CGPA target across all 5 engineering courses.
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Habits Today</span>
              <span className="text-cyan-300 font-mono font-semibold">
                {completedTodayCount} / {habits.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
