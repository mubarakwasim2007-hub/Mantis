import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Plus,
  CheckCircle2,
  ChevronRight,
  Check,
  Trash2,
  CheckSquare,
  Edit2,
  X,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task, Subject } from '../db/db.ts';
import {
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTodayDateString,
} from '../db/dbService.ts';

type PriorityType = 'Priority 1' | 'Priority 2' | 'Notes' | 'Regular';

export const StudyPlannerView: React.FC = () => {
  const todayStr = getTodayDateString();

  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) || [];

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('EEC');
  const [taskDueDate, setTaskDueDate] = useState(todayStr);
  const [taskPriority, setTaskPriority] = useState<PriorityType>('Priority 1');
  const [taskEstimatedMinutes, setTaskEstimatedMinutes] = useState<number>(45);
  const [taskStatus, setTaskStatus] = useState<'pending' | 'completed' | 'in_progress'>('pending');

  // Filtering
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const openCreateForm = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskSubject(subjects[0]?.name || 'EEC');
    setTaskDueDate(todayStr);
    setTaskPriority('Priority 1');
    setTaskEstimatedMinutes(45);
    setTaskStatus('pending');
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    if (!task.id) return;
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskSubject(task.courseCode || 'EEC');
    setTaskDueDate(task.dueDate || todayStr);
    setTaskPriority(task.priority || 'Priority 1');
    setTaskEstimatedMinutes(task.estimatedMinutes || 45);
    setTaskStatus(task.status || 'pending');
    setIsFormOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const matchedSubject = subjects.find(
      (s) => s.name === taskSubject || s.code === taskSubject
    );

    const taskData: Omit<Task, 'id'> = {
      subjectId: matchedSubject?.id,
      courseCode: matchedSubject?.code || taskSubject,
      title: taskTitle.trim(),
      dueDate: taskDueDate,
      duration: `${taskEstimatedMinutes} min`,
      status: taskStatus,
      priority: taskPriority,
      urgency: taskPriority === 'Priority 1' ? 'high' : taskPriority === 'Priority 2' ? 'medium' : 'low',
      estimatedMinutes: taskEstimatedMinutes,
      actualMinutes: taskStatus === 'completed' ? taskEstimatedMinutes : 0,
    };

    if (editingTaskId) {
      await updateTask(editingTaskId, taskData);
    } else {
      await addTask(taskData);
    }

    setIsFormOpen(false);
    setEditingTaskId(null);
    setTaskTitle('');
  };

  const toggleTask = async (task: Task) => {
    if (!task.id) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTaskStatus(task.id, nextStatus);
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await deleteTask(id);
    if (editingTaskId === id) {
      setIsFormOpen(false);
      setEditingTaskId(null);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSubject =
      selectedSubjectFilter === 'All' ||
      t.courseCode === selectedSubjectFilter ||
      subjects.find((s) => s.id === t.subjectId)?.name === selectedSubjectFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.status === 'completed') ||
      (statusFilter === 'pending' && t.status !== 'completed');

    return matchesSubject && matchesStatus;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            B.Tech Biomedical Engineering • 2nd Year • 3rd Semester • SRMIST Trichy
          </p>
        </div>

        <button
          onClick={openCreateForm}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Task</span>
        </button>
      </div>

      {/* Task Creation / Editing Modal Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveTask}
          className="glass-card rounded-3xl p-6 border border-cyan-400/40 bg-slate-950/70 backdrop-blur-2xl space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>{editingTaskId ? 'Edit Study Task' : 'Create Study Task'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-xs text-slate-300 font-medium">Task / Assignment Title *</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Derive state equations for DLMS circuit logic"
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                autoFocus
                required
              />
            </div>

            {/* Subject Dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Subject *</label>
              <select
                value={taskSubject}
                onChange={(e) => setTaskSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900 focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id || sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Due Date *</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900 focus:outline-none"
                required
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Priority *</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as PriorityType)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900 focus:outline-none"
              >
                <option value="Priority 1">Priority 1 (Urgent / Exam)</option>
                <option value="Priority 2">Priority 2 (Assignment)</option>
                <option value="Notes">Notes (Reading / Review)</option>
                <option value="Regular">Regular (Practice)</option>
              </select>
            </div>

            {/* Estimated Minutes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Estimated Study Time (minutes)</label>
              <input
                type="number"
                min="5"
                max="600"
                step="5"
                value={taskEstimatedMinutes}
                onChange={(e) => setTaskEstimatedMinutes(Number(e.target.value) || 30)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs placeholder-slate-400"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Initial Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as 'pending' | 'completed')}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs bg-slate-900 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg"
            >
              {editingTaskId ? 'Update Task' : 'Save Task to IndexedDB'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Scheduled Tasks Checklist on Left, Course Modules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Study Tasks Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>Tasks & Assignments</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {completedCount} completed · {pendingCount} pending
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-2xl glass-pill">
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    type="button"
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
              <button
                onClick={() => setSelectedSubjectFilter('All')}
                type="button"
                className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  selectedSubjectFilter === 'All'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 font-semibold'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                All Subjects ({tasks.length})
              </button>
              {subjects.map((sub) => {
                const count = tasks.filter(
                  (t) => t.courseCode === sub.name || t.courseCode === sub.code
                ).length;
                return (
                  <button
                    key={sub.id || sub.name}
                    onClick={() => setSelectedSubjectFilter(sub.name)}
                    type="button"
                    className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                      selectedSubjectFilter === sub.name
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 font-semibold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                    }`}
                  >
                    {sub.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Task Items List */}
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center">
                <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No Tasks Found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {tasks.length === 0
                    ? 'Click "+ New Study Task" above to add assignments or study goals for your 5 semester subjects.'
                    : 'No tasks match the active filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 min-w-0 ${
                        isDone
                          ? 'bg-white/[0.04] border-white/10 text-slate-400'
                          : 'bg-white/[0.08] border-white/20 text-white hover:bg-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTask(task)}
                          type="button"
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_#38bdf8]'
                              : 'border-2 border-slate-400 hover:border-cyan-400'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium break-words leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400 font-mono min-w-0">
                            <span className="text-cyan-300 font-bold shrink-0">{task.courseCode}</span>
                            <span>·</span>
                            <span className="shrink-0 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              {task.dueDate}
                            </span>
                            <span>·</span>
                            <span className="shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.duration || `${task.estimatedMinutes}m`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Priority Pill */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg shrink-0 font-semibold ${
                            task.priority === 'Priority 1'
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                              : task.priority === 'Priority 2'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                              : task.priority === 'Notes'
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/30'
                          }`}
                        >
                          {task.priority || 'Regular'}
                        </span>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditForm(task)}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          type="button"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete Task"
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
        </div>

        {/* Right Column: 5 Real Enrolled Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              3rd Semester Modules ({subjects.length})
            </h3>
            <span className="text-xs text-cyan-300 font-mono">Preloaded</span>
          </div>

          <div className="space-y-3">
            {subjects.map((course) => {
              const courseTasks = tasks.filter(
                (t) => t.courseCode === course.name || t.courseCode === course.code
              );
              const coursePending = courseTasks.filter((t) => t.status !== 'completed').length;
              const isSelected = selectedSubjectFilter === course.name;

              return (
                <div
                  key={course.id || course.name}
                  onClick={() =>
                    setSelectedSubjectFilter(isSelected ? 'All' : course.name)
                  }
                  className={`glass-card rounded-3xl p-5 border transition-all cursor-pointer border-l-4 ${
                    course.color || 'border-l-cyan-400'
                  } ${
                    isSelected
                      ? 'border-cyan-400/60 bg-white/[0.12] shadow-lg'
                      : 'border-white/20 hover:border-white/30'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
                      {course.code || course.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">
                      {courseTasks.length} task{courseTasks.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white break-words">{course.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/10">
                    <span>{course.status || 'Core Subject'}</span>
                    <span className="font-mono text-cyan-300">
                      {coursePending > 0 ? `${coursePending} pending` : 'All clear'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
