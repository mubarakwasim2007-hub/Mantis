import Dexie, { Table } from 'dexie';

export interface Subject {
  id?: number;
  name: string;
  code: string;
  instructor?: string;
  priority: 'High' | 'Medium' | 'Low';
  targetHours: number;
  color?: string;
  lab?: string;
  nextClass?: string;
  status?: string;
}

export interface Task {
  id?: number;
  subjectId?: number;
  courseCode?: string;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'Priority 1' | 'Priority 2' | 'Notes' | 'Regular';
  urgency: 'high' | 'medium' | 'low';
  dueDate: string;
  duration?: string;
  estimatedMinutes: number;
  actualMinutes: number;
}

export interface Habit {
  id?: number;
  title: string;
  category: 'Academic' | 'Wellness' | 'Lab Skills';
  frequency: 'daily' | 'weekdays' | 'weekly';
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  timeEstimate?: string;
  createdAt: string;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
}

export interface Goal {
  id?: number;
  title: string;
  category: 'Current' | 'Short-term' | 'Long-term';
  status: 'Near Completion' | 'On Track' | 'In Progress' | 'Research Phase';
  statusColor?: string;
  targetDate: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  milestones?: { id: string; title: string; done: boolean }[];
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface StudySession {
  id?: number;
  subjectId?: number;
  courseCode?: string;
  date: string; // 'YYYY-MM-DD'
  minutesSpent: number;
  plannedMinutes?: number;
  notes?: string;
}

export class MantisDatabase extends Dexie {
  subjects!: Table<Subject, number>;
  tasks!: Table<Task, number>;
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;
  goals!: Table<Goal, number>;
  notes!: Table<Note, number>;
  studySessions!: Table<StudySession, number>;

  constructor() {
    super('MantisDB');
    this.version(1).stores({
      subjects: '++id, name, priority, targetHours',
      tasks: '++id, subjectId, title, status, priority, urgency, dueDate, estimatedMinutes, actualMinutes',
      habits: '++id, title, frequency, targetDays, currentStreak, bestStreak, createdAt',
      habitLogs: '++id, habitId, date, completed, [habitId+date]',
      goals: '++id, title, category, status, targetDate, progress, priority',
      notes: '++id, title, content, updatedAt',
      studySessions: '++id, subjectId, date, minutesSpent',
    });
  }
}

export const db = new MantisDatabase();
