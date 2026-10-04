import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Check,
  Trash2,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Goal } from '../db/db.ts';
import {
  addGoal,
  updateGoalProgress,
  toggleGoalMilestone,
  deleteGoal,
} from '../db/dbService.ts';
import { GoalsCard } from './GoalsCard.tsx';

export const GoalsView: React.FC = () => {
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];

  const [activeCategory, setActiveCategory] = useState<'All' | 'Current' | 'Short-term' | 'Long-term'>('All');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Current' | 'Short-term' | 'Long-term'>('Current');
  const [newTargetDate, setNewTargetDate] = useState('End of Semester');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Toggle milestone task in Dexie
  const handleToggleMilestone = async (goalId?: number, milestoneId?: string) => {
    if (!goalId || !milestoneId) return;
    await toggleGoalMilestone(goalId, milestoneId);
  };

  // Adjust progress in Dexie
  const handleAdjustProgress = async (goalId?: number, currentProgress: number = 0, delta: number = 0) => {
    if (!goalId) return;
    await updateGoalProgress(goalId, currentProgress + delta);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addGoal({
      title: newTitle.trim(),
      category: newCategory,
      progress: 0,
      targetDate: newTargetDate,
      status: 'In Progress',
      priority: newPriority,
      description: 'Personal tracked objective in local IndexedDB.',
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Define project scope & study goals', done: false },
        { id: `m_${Date.now()}_2`, title: 'Coursework practice & problem solving', done: false },
        { id: `m_${Date.now()}_3`, title: 'Revision & exam preparation', done: false },
      ],
    });

    setNewTitle('');
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = async (id?: number) => {
    if (!id) return;
    await deleteGoal(id);
  };

  const filteredGoals = goals.filter(
    (g) => activeCategory === 'All' || g.category === activeCategory
  );

  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / goals.length)
      : 0;

  const currentTermCount = goals.filter((g) => g.category === 'Current').length;
  const shortTermCount = goals.filter((g) => g.category === 'Short-term').length;
  const longTermCount = goals.filter((g) => g.category === 'Long-term').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Academic targets & semester milestones (IndexedDB Synced)
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GoalsCard
          title="Overall Completion"
          value={`${avgProgress}%`}
          subtext={`Across ${goals.length} goals`}
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          progressPercent={avgProgress}
          subtextColor="text-cyan-300"
        />

        <GoalsCard
          title="Current Term Targets"
          value={`${currentTermCount} Active`}
          subtext="3rd Semester"
          caption="Current Academic Goals"
          icon={<Target className="w-4 h-4 text-emerald-400" />}
          subtextColor="text-emerald-300"
        />

        <GoalsCard
          title="Short-Term Milestones"
          value={`${shortTermCount} Goals`}
          subtext="30-60 Days"
          caption="Semester Milestones"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          subtextColor="text-amber-300"
        />

        <GoalsCard
          title="Long-Term Ambition"
          value={`${longTermCount} Objectives`}
          subtext="Degree Roadmaps"
          caption="Career & Research Goals"
          icon={<Award className="w-4 h-4 text-indigo-400" />}
          subtextColor="text-indigo-300"
        />
      </div>

      {/* Inline Create Goal Form */}
      {isAddingGoal && (
        <form
          onSubmit={handleCreateGoal}
          className="glass-card rounded-3xl p-5 border border-cyan-400/40 bg-white/[0.12] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Create Structured Goal in IndexedDB</h3>
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Goal title (e.g. Master Signals and Systems Laplace Analysis)"
              className="sm:col-span-1 px-4 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
              required
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900/80 focus:outline-none"
            >
              <option value="Current">Current Term (3rd Semester)</option>
              <option value="Short-term">Short-term (30–60 Days)</option>
              <option value="Long-term">Long-term (1+ Years)</option>
            </select>
            <input
              type="text"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              placeholder="Target Date (e.g. Nov 30)"
              className="px-4 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Add Goal
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-pill">
          {(['All', 'Current', 'Short-term', 'Long-term'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-white/20 text-white shadow-sm border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? 'All Goals' : cat === 'Current' ? 'Current Term' : cat === 'Short-term' ? 'Short-term' : 'Long-term'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredGoals.length} Goals Displayed
        </span>
      </div>

      {/* Structured Goal Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No Goals Created Yet</p>
          <p className="text-xs text-slate-400 mt-1">Use "+ New Goal" above to create milestones for your subjects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card glass-card-hover rounded-3xl p-6 border border-white/20 flex flex-col justify-between space-y-5 min-w-0 overflow-hidden"
            >
              <div className="min-w-0">
                {/* Category, Date & Status Pill */}
                <div className="flex items-start sm:items-center justify-between gap-2.5 flex-wrap min-w-0">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15 shrink-0">
                      {goal.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>Target: {goal.targetDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 whitespace-nowrap ${
                        goal.status === 'Near Completion'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : goal.status === 'On Track'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : goal.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {goal.status}
                    </span>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      type="button"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Goal Title with clean word wrap */}
                <h3 className="text-base sm:text-lg font-bold text-white mt-3 leading-snug break-words">
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed break-words">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar & Quick Adjusters */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Completion Progress</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-bold text-sm">
                        {goal.progress}%
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustProgress(goal.id, goal.progress, -5)}
                          type="button"
                          className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center justify-center"
                          title="-5%"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleAdjustProgress(goal.id, goal.progress, 5)}
                          type="button"
                          className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center justify-center"
                          title="+5%"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                    <div
                      style={{ width: `${goal.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.5)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Interactive Milestones Checklist with safe wrapping */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Milestone Checkpoints ({goal.milestones.filter((m) => m.done).length}/{goal.milestones.length})
                    </span>
                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          type="button"
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all min-w-0 ${
                            m.done
                              ? 'bg-white/[0.06] text-white border border-white/15'
                              : 'bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              m.done
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'border border-slate-500'
                            }`}
                          >
                            {m.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs break-words min-w-0 flex-1 leading-snug ${
                              m.done ? 'line-through text-slate-400' : 'text-slate-200'
                            }`}
                          >
                            {m.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 min-w-0">
                <span className="font-mono">Priority: {goal.priority || 'medium'}</span>
                <span className="text-cyan-300 font-medium flex items-center gap-1 shrink-0">
                  Goal #{goal.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
