export interface HabitItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  streak?: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  category: 'Priority' | 'Read' | 'Meditate' | 'Code Practice' | 'Notes';
  tag: string;
  tagColor: 'red' | 'green' | 'orange' | 'blue' | 'gray';
  count?: number;
  dueDate?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  progress: number; // 0 - 100
  color: string;
  target: string;
}

export interface StudyHourStat {
  day: string;
  planned: number;
  actual: number;
}
