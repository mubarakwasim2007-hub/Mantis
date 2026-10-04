import React, { useState } from 'react';
import {
  Search,
  Bell,
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  Flame,
  Plus,
  Clock,
  Check,
  BookOpen,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Habit, Task, Goal, StudySession, HabitLog } from '../db/db.ts';
import {
  addHabit,
  toggleHabitLog,
  getTodayDateString,
} from '../db/dbService.ts';
import { NavTab } from './Sidebar.tsx';

interface DashboardGridProps {
  onNavigate?: (tab: NavTab) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onNavigate }) => {
  const todayStr = getTodayDateString();

  // Query IndexedDB live state without mock seed triggers
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const todayLogs = useLiveQuery(() => db.habitLogs.where('date').equals(todayStr).toArray(), [todayStr]) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];
  const studySessions = useLiveQuery(() => db.studySessions.where('date').equals(todayStr).toArray(), [todayStr]) || [];

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeMenuCard, setActiveMenuCard] = useState<string | null>(null);
  const [newHabitText, setNewHabitText] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Check if a habit is completed today
  const isHabitCompletedToday = (habitId?: number): boolean => {
    if (!habitId) return false;
    const log = todayLogs.find((l) => l.habitId === habitId);
    return !!log?.completed;
  };

  const handleToggleHabit = async (habitId?: number) => {
    if (!habitId) return;
    await toggleHabitLog(habitId, todayStr);
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitText.trim()) return;

    await addHabit({
      title: newHabitText.trim(),
      category: 'Academic',
      frequency: 'daily',
      targetDays: 7,
      currentStreak: 1,
      bestStreak: 1,
      timeEstimate: '30 min',
      createdAt: todayStr,
    });

    setNewHabitText('');
    setShowAddHabit(false);
  };

  // Dynamically calculate study hours from Dexie studySessions
  const actualMinutes = studySessions.reduce((sum, s) => sum + (s.minutesSpent || 0), 0);
  const plannedMinutes = studySessions.reduce((sum, s) => sum + (s.plannedMinutes || 0), 0);
  const actualHours = Number((actualMinutes / 60).toFixed(1));
  const plannedHours = Number((plannedMinutes / 60).toFixed(1));

  // Streak calculation from real active habits
  const streakDays = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak || 0), 0) : 0;

  // Dynamic Task & Habit completion percentage calculation
  const completedHabitsCount = habits.filter((h) => isHabitCompletedToday(h.id)).length;
  const totalHabits = habits.length;

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const totalMilestones = totalHabits + totalTasks;
  const completedMilestones = completedHabitsCount + completedTasksCount;
  const completionPercentage =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Filter tasks for upcoming deadlines (Top Right card)
  const pendingTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    return searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
  });

  const topDeadlines = pendingTasks.slice(0, 4).map((t, idx) => ({
    id: t.id ? String(t.id) : `t_${idx}`,
    number: idx + 1,
    title: t.title,
    tag: t.priority === 'Priority 1' ? 'Priority 1' : t.priority === 'Priority 2' ? 'Priority 2' : 'Notes',
    tagColor:
      t.priority === 'Priority 1'
        ? ('red' as const)
        : t.priority === 'Priority 2'
        ? ('green' as const)
        : t.priority === 'Notes'
        ? ('orange' as const)
        : ('blue' as const),
    dueText: t.courseCode ? `${t.courseCode} · ${t.dueDate}` : t.dueDate,
  }));

  // Summary breakdown of tasks strictly from real IndexedDB tasks
  const priority1Count = tasks.filter((t) => t.priority === 'Priority 1').length;
  const priority2Count = tasks.filter((t) => t.priority === 'Priority 2').length;
  const notesCount = tasks.filter((t) => t.priority === 'Notes').length;
  const regularCount = tasks.filter((t) => t.priority === 'Regular').length;

  const summaryDeadlines = [
    { id: 's1', badgeColor: 'red' as const, title: 'Priority 1 Deadlines', count: priority1Count },
    { id: 's2', badgeColor: 'orange' as const, title: 'Priority 2 Tasks', count: priority2Count },
    { id: 's3', badgeColor: 'green' as const, title: 'Research Notes', count: notesCount },
    { id: 's4', badgeColor: 'blue' as const, title: 'Regular Tasks', count: regularCount },
  ];

  // Active Goals (Bottom Right card)
  const activeGoals = goals.slice(0, 3);

  // Radial Donut chart math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    completionPercentage > 0
      ? circumference - (completionPercentage / 100) * circumference
      : circumference;

  // Dynamic Current Date for Greeting
  const currentDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm font-['Plus_Jakarta_Sans']">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
              className="relative p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-slate-200 hover:text-white transition-all backdrop-blur-md shadow-lg"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-3xl glass-card p-4 z-50 shadow-2xl border border-white/25">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-cyan-300 font-mono">Local IndexedDB</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10">
                    <p className="text-xs font-medium text-slate-100">Local-First Storage Active</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">All your personal data is saved safely on this device.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real User Profile Monogram */}
          <div className="flex items-center gap-3 pl-2">
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-cyan-300 transition-transform group-hover:scale-105">
                MW
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Mohammed Wasim M</p>
              <p className="text-[11px] text-cyan-300 font-mono">2nd Year • 3rd Sem</p>
            </div>
          </div>
        </div>
      </header>

      {/* Greeting Card with Search & Real Dynamic Date */}
      <section className="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-white/20 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10 min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight break-words">
              Welcome Back, Mohammed Wasim M!
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-300 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Today, {currentDateFormatted}</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-cyan-300/90 font-mono truncate">SRMIST Trichy • B.Tech Biomedical Engineering</span>
            </div>
          </div>

          {/* Search bar inside Greeting Card */}
          <div className="w-full sm:w-72 lg:w-80">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks & habits..."
                className="w-full pl-10 pr-24 py-2.5 text-sm rounded-2xl glass-input text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="button"
                className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-medium text-white transition-colors border border-white/10"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Ambient decorative glow inside greeting card */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Grid: 3 Columns x 2 Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ROW 1 - CARD 1: Daily Task Completion */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Daily Task Completion
            </h3>
            <button
              onClick={() => setActiveMenuCard(activeMenuCard === 'task' ? null : 'task')}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Radial Donut Progress */}
          <div className="relative flex flex-col items-center justify-center my-3">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Track Circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/10"
                />
                {/* Progress Circle with Gradient */}
                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#donutGradient)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#glow)"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center percentage label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                  {completionPercentage}%
                </span>
                <span className="text-[11px] text-cyan-200/80 font-medium mt-0.5">
                  Target 80%
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-slate-300">
                <span className="text-white font-semibold font-mono">
                  {completedMilestones}
                </span>{' '}
                of <span className="font-mono">{totalMilestones}</span> milestones completed
              </p>
            </div>
          </div>
        </div>

        {/* ROW 1 - CARD 2: Today's Study Hours */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Today's Study Hours
            </h3>
            <button
              onClick={() => setActiveMenuCard(activeMenuCard === 'study' ? null : 'study')}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex-1 flex flex-col justify-end pt-2 pb-2">
            <div className="relative h-40 w-full flex items-end justify-between px-3">
              {/* Y Axis Guide Lines */}
              <div className="absolute inset-x-0 top-2 border-b border-white/10 flex justify-between">
                <span className="text-[10px] text-slate-400 font-mono -translate-y-2.5">4h</span>
              </div>
              <div className="absolute inset-x-0 top-1/2 border-b border-white/10 flex justify-between">
                <span className="text-[10px] text-slate-400 font-mono -translate-y-2.5">2h</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-b border-white/15 flex justify-between">
                <span className="text-[10px] text-slate-400 font-mono translate-y-1">0h</span>
              </div>

              {/* Dynamic Bars strictly based on real study sessions */}
              <div className="w-full flex items-end justify-around pl-6 z-10 gap-2">
                {studySessions.length === 0 ? (
                  <div className="w-full flex items-center justify-center py-8 text-center">
                    <p className="text-xs text-slate-400 font-mono">0 focus hours logged today</p>
                  </div>
                ) : (
                  studySessions.map((s, idx) => {
                    const barHeight = Math.min(115, Math.max(12, ((s.minutesSpent || 0) / 240) * 115));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 group/bar">
                        <div
                          style={{ height: `${barHeight}px` }}
                          className="w-4 sm:w-5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all group-hover/bar:brightness-125"
                        />
                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[48px]">
                          {s.courseCode || `#${idx + 1}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom comparison label */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                <span className="text-slate-300 font-mono">{plannedHours} hrs planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                <span className="text-slate-300 font-mono">{actualHours} hrs actual</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 1 - CARD 3: Upcoming Deadlines (Top Right) */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Upcoming Deadlines
            </h3>
            <button
              onClick={() => setActiveMenuCard(activeMenuCard === 'deadlinesTop' ? null : 'deadlinesTop')}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Numbered Deadline List strictly from IndexedDB */}
          <div className="space-y-3 my-1 min-w-0">
            {topDeadlines.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No pending deadlines.</p>
                <p className="text-[11px] text-slate-500 mt-1">Create study tasks in the Study Planner.</p>
              </div>
            ) : (
              topDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] transition-all border border-white/10 gap-3 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400 w-4 text-center shrink-0">
                      {item.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-slate-100 truncate block">{item.title}</span>
                      {item.dueText && (
                        <p className="text-[10px] text-slate-400 truncate">{item.dueText}</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.tagColor === 'red' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/25 text-rose-300 border border-rose-500/40">
                        {item.tag}
                      </span>
                    )}
                    {item.tagColor === 'green' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                        {item.tag}
                      </span>
                    )}
                    {item.tagColor === 'orange' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                        {item.tag}
                      </span>
                    )}
                    {item.tagColor === 'blue' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/25 text-cyan-300 border border-cyan-500/40">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={() => onNavigate?.('study-planner')}
              type="button"
              className="text-[11px] text-cyan-300 hover:text-cyan-200 cursor-pointer font-medium"
            >
              View all {tasks.length} tasks →
            </button>
          </div>
        </div>

        {/* ROW 2 - CARD 1: Upcoming Deadlines (Bottom Left categorized summary) */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Task Priority Breakdown
            </h3>
            <button
              onClick={() => setActiveMenuCard(activeMenuCard === 'deadlinesBottom' ? null : 'deadlinesBottom')}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Categorized Priority Rows */}
          <div className="space-y-2.5 my-1 min-w-0">
            {summaryDeadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 gap-3 min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.badgeColor === 'red' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 shrink-0">
                      Priority 1
                    </span>
                  )}
                  {item.badgeColor === 'orange' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 shrink-0">
                      Priority 2
                    </span>
                  )}
                  {item.badgeColor === 'green' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shrink-0">
                      Notes
                    </span>
                  )}
                  {item.badgeColor === 'blue' && (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/30 text-blue-300 border border-blue-500/40 shrink-0">
                      Regular
                    </span>
                  )}

                  <span className="text-sm font-medium text-slate-200 truncate min-w-0 flex-1">{item.title}</span>
                </div>

                <span className="text-sm font-bold font-mono text-slate-300 px-2 py-0.5 rounded-lg bg-white/[0.06] shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Tasks</span>
            <span className="font-mono text-white font-semibold">{tasks.length} Active in IndexedDB</span>
          </div>
        </div>

        {/* ROW 2 - CARD 2: Today's Habit Checklist (Bottom Center) */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Today's Habit Checklist
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAddHabit(!showAddHabit)}
                type="button"
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Add Habit"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveMenuCard(activeMenuCard === 'habits' ? null : 'habits')}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Habit Checklist items from IndexedDB */}
          <div className="space-y-2.5 my-1">
            {habits.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No habits added yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Click '+' above to start a daily routine.</p>
              </div>
            ) : (
              habits.slice(0, 3).map((habit) => {
                const isDone = isHabitCompletedToday(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    type="button"
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border text-left gap-3 min-w-0 ${
                      isDone
                        ? 'bg-white/[0.08] border-white/20 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.6)]'
                            : 'border-2 border-slate-400'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-sm font-medium truncate min-w-0 flex-1 ${
                          isDone ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                  </button>
                );
              })
            )}

            {/* Quick Add Habit form */}
            {showAddHabit && (
              <form onSubmit={handleAddHabit} className="pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHabitText}
                    onChange={(e) => setNewHabitText(e.target.value)}
                    placeholder="New habit (e.g. Maths Problem Solving)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Completed <span className="font-mono text-cyan-300">{completedHabitsCount}/{totalHabits}</span></span>
            <button
              onClick={() => onNavigate?.('habit-tracker')}
              type="button"
              className="text-cyan-300 hover:text-white font-medium"
            >
              Full Tracker →
            </button>
          </div>
        </div>

        {/* ROW 2 - CARD 3: Active Goals (Bottom Right) */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Active Goals
            </h3>
            <button
              onClick={() => setActiveMenuCard(activeMenuCard === 'goals' ? null : 'goals')}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Goal Progress Bars strictly from real IndexedDB */}
          <div className="space-y-4 my-1">
            {activeGoals.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-400">No active goals yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Set academic milestones in the Goals section.</p>
              </div>
            ) : (
              activeGoals.map((goal) => (
                <div key={goal.id} className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between text-xs font-medium gap-2">
                    <span className="text-slate-200 truncate min-w-0 flex-1">{goal.title}</span>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                    <div
                      style={{ width: `${goal.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Streak Counter with Flame */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                {streakDays} days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate?.('goals')}
                type="button"
                className="text-[11px] font-semibold text-white hover:text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-1 rounded-xl border border-cyan-500/40 transition-colors"
              >
                Roadmap →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
