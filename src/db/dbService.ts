import { db, Subject, Task, Habit, HabitLog, Goal, Note, StudySession } from './db.ts';

// Dynamic current date in 'YYYY-MM-DD' format
export const getTodayDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getFormattedDate = getTodayDateString;

// The 5 real subjects for Mohammed Wasim M (B.Tech Biomedical Engineering, 2nd Year, 3rd Sem)
export const REAL_INITIAL_SUBJECTS: Omit<Subject, 'id'>[] = [
  {
    name: 'EEC',
    code: 'EEC',
    priority: 'High',
    targetHours: 4,
    color: 'border-l-cyan-400',
    status: 'Core Subject',
  },
  {
    name: 'DLMS',
    code: 'DLMS',
    priority: 'High',
    targetHours: 4,
    color: 'border-l-indigo-400',
    status: 'Core Subject',
  },
  {
    name: 'Signals and Systems',
    code: 'Signals and Systems',
    priority: 'High',
    targetHours: 4,
    color: 'border-l-blue-400',
    status: 'Core Subject',
  },
  {
    name: 'Maths',
    code: 'Maths',
    priority: 'High',
    targetHours: 4,
    color: 'border-l-emerald-400',
    status: 'Engineering Mathematics',
  },
  {
    name: 'Medical Physics',
    code: 'Medical Physics',
    priority: 'High',
    targetHours: 4,
    color: 'border-l-amber-400',
    status: 'Biomedical Core',
  },
];

const CLEANUP_KEY = 'mantis_db_clean_real_user_v3';

let seedPromise: Promise<void> | null = null;

/**
 * Initializes the database:
 * 1. Purges any historical mock / test / fake data from previous sessions.
 * 2. Seeds ONLY the five real subjects.
 * 3. Keeps tasks, habits, goals, notes, and study sessions completely clean for real user entries.
 */
export function seedDefaultData(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      await db.open();

      const alreadyCleaned = localStorage.getItem(CLEANUP_KEY);

      if (!alreadyCleaned) {
        // Complete purge of any mock/demo data from IndexedDB
        await db.transaction(
          'rw',
          [db.subjects, db.tasks, db.habits, db.habitLogs, db.goals, db.notes, db.studySessions],
          async () => {
            await db.subjects.clear();
            await db.tasks.clear();
            await db.habits.clear();
            await db.habitLogs.clear();
            await db.goals.clear();
            await db.notes.clear();
            await db.studySessions.clear();

            // Insert ONLY the 5 real subjects
            await db.subjects.bulkAdd(REAL_INITIAL_SUBJECTS);
          }
        );
        localStorage.setItem(CLEANUP_KEY, 'true');
        return;
      }

      // If already cleaned, verify the 5 real subjects are present if subjects table is empty
      const subjectCount = await db.subjects.count();
      if (subjectCount === 0) {
        await db.subjects.bulkAdd(REAL_INITIAL_SUBJECTS);
      }
    } catch (err) {
      console.warn('Database initialization note:', err);
    }
  })();

  return seedPromise;
}

// Auto-seed safely on script load
seedDefaultData();

// -------------------------------------------------------------
// Subjects Service
// -------------------------------------------------------------
export async function getSubjects(): Promise<Subject[]> {
  await seedDefaultData();
  return db.subjects.toArray();
}

export async function addSubject(subject: Omit<Subject, 'id'>): Promise<number> {
  return db.subjects.add(subject);
}

export async function deleteSubject(id: number): Promise<void> {
  await db.subjects.delete(id);
  await db.tasks.where('subjectId').equals(id).delete();
}

// -------------------------------------------------------------
// Tasks Service
// -------------------------------------------------------------
export async function getTasks(): Promise<Task[]> {
  await seedDefaultData();
  return db.tasks.toArray();
}

export async function addTask(task: Omit<Task, 'id'>): Promise<number> {
  return db.tasks.add(task);
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<number> {
  return db.tasks.update(id, updates);
}

export async function updateTaskStatus(
  id: number,
  status: 'pending' | 'completed' | 'in_progress'
): Promise<number> {
  return db.tasks.update(id, {
    status,
    actualMinutes: status === 'completed' ? 45 : 0,
  });
}

export async function deleteTask(id: number): Promise<void> {
  return db.tasks.delete(id);
}

// -------------------------------------------------------------
// Habits & Logs Service
// -------------------------------------------------------------
export async function getHabits(): Promise<Habit[]> {
  await seedDefaultData();
  return db.habits.toArray();
}

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<number> {
  return db.habits.add(habit);
}

export async function deleteHabit(id: number): Promise<void> {
  await db.habits.delete(id);
  await db.habitLogs.where('habitId').equals(id).delete();
}

export async function getHabitLogsForDate(date: string = getTodayDateString()): Promise<HabitLog[]> {
  await seedDefaultData();
  return db.habitLogs.where('date').equals(date).toArray();
}

export async function toggleHabitLog(habitId: number, date: string = getTodayDateString()): Promise<boolean> {
  const existing = await db.habitLogs
    .where('habitId')
    .equals(habitId)
    .filter((log) => log.date === date)
    .first();

  let nextCompleted = true;
  if (existing && existing.id) {
    nextCompleted = !existing.completed;
    await db.habitLogs.update(existing.id, { completed: nextCompleted });
  } else {
    await db.habitLogs.add({
      habitId,
      date,
      completed: true,
    });
    nextCompleted = true;
  }

  // Update real streak based on consecutive completion
  const habit = await db.habits.get(habitId);
  if (habit) {
    const allLogs = await db.habitLogs.where('habitId').equals(habitId).toArray();
    const completedDates = new Set(allLogs.filter((l) => l.completed).map((l) => l.date));

    // Calculate consecutive days leading up to today
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = getTodayDateString(checkDate);
      if (completedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const newBest = Math.max(habit.bestStreak || 0, streak);
    await db.habits.update(habitId, {
      currentStreak: streak,
      bestStreak: newBest,
    });
  }

  return nextCompleted;
}

// -------------------------------------------------------------
// Goals Service
// -------------------------------------------------------------
export async function getGoals(): Promise<Goal[]> {
  await seedDefaultData();
  return db.goals.toArray();
}

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<number> {
  return db.goals.add(goal);
}

export async function updateGoalProgress(id: number, progress: number): Promise<number> {
  const boundedProgress = Math.min(100, Math.max(0, progress));
  const status: Goal['status'] =
    boundedProgress >= 90 ? 'Near Completion' : boundedProgress >= 60 ? 'On Track' : 'In Progress';
  return db.goals.update(id, { progress: boundedProgress, status });
}

export async function toggleGoalMilestone(goalId: number, milestoneId: string): Promise<void> {
  const goal = await db.goals.get(goalId);
  if (!goal || !goal.milestones) return;

  const updatedMilestones = goal.milestones.map((m) =>
    m.id === milestoneId ? { ...m, done: !m.done } : m
  );
  const doneCount = updatedMilestones.filter((m) => m.done).length;
  const newProgress = Math.round((doneCount / updatedMilestones.length) * 100);
  const status: Goal['status'] =
    newProgress >= 90 ? 'Near Completion' : newProgress >= 60 ? 'On Track' : 'In Progress';

  await db.goals.update(goalId, {
    milestones: updatedMilestones,
    progress: newProgress,
    status,
  });
}

export async function deleteGoal(id: number): Promise<void> {
  return db.goals.delete(id);
}

// -------------------------------------------------------------
// Notes Service
// -------------------------------------------------------------
export async function getNotes(): Promise<Note[]> {
  await seedDefaultData();
  return db.notes.toArray();
}

export async function saveNote(note: Partial<Note> & { title: string; content: string }): Promise<number> {
  const now = new Date();
  const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (note.id) {
    await db.notes.update(note.id, {
      ...note,
      updatedAt: dateStr,
    });
    return note.id;
  } else {
    return db.notes.add({
      title: note.title,
      content: note.content,
      category: note.category || 'General',
      updatedAt: dateStr,
    });
  }
}

export async function deleteNote(id: number): Promise<void> {
  return db.notes.delete(id);
}

// -------------------------------------------------------------
// Study Sessions Service
// -------------------------------------------------------------
export async function getStudySessions(): Promise<StudySession[]> {
  await seedDefaultData();
  return db.studySessions.toArray();
}

export async function addStudySession(session: Omit<StudySession, 'id'>): Promise<number> {
  return db.studySessions.add(session);
}

export async function getTodayStudyStats(date: string = getTodayDateString()): Promise<{ plannedHours: number; actualHours: number }> {
  await seedDefaultData();
  const sessions = await db.studySessions.where('date').equals(date).toArray();
  const actualMinutes = sessions.reduce((sum, s) => sum + (s.minutesSpent || 0), 0);
  const plannedMinutes = sessions.reduce((sum, s) => sum + (s.plannedMinutes || 0), 0);

  return {
    actualHours: Number((actualMinutes / 60).toFixed(1)),
    plannedHours: Number((plannedMinutes / 60).toFixed(1)),
  };
}
