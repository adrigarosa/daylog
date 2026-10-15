export type EntryType = 'task' | 'fact' | 'note' | 'habit';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  status: TaskStatus | null;
  habitDone: boolean | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isSystem: boolean;
  sortOrder: number;
}

export interface EntryCategory {
  entryId: string;
  categoryId: string;
  autoTagged: boolean;
}

export interface Keyword {
  id: string;
  keyword: string;
  categoryId: string;
  isSystem: boolean;
}

export interface HabitConfig {
  id: string;
  name: string;
  description: string | null;
  categoryIds: string[];
  keywords: string[];
  color: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface EntryWithCategories extends Entry {
  categories: Category[];
}

export interface CategorySuggestion {
  category: Category;
  matchedKeywords: string[];
  confidence: number;
}

export interface DayStats {
  date: string;
  totalEntries: number;
  completedTasks: number;
  pendingTasks: number;
  habitsCompleted: number;
  categoryBreakdown: Record<string, number>;
}

export interface PeriodReport {
  startDate: string;
  endDate: string;
  totalEntries: number;
  byType: Record<EntryType, number>;
  byCategory: Record<string, number>;
  taskCompletionRate: number;
  habitCompletionRate: number;
  topCategories: Array<{ category: Category; count: number }>;
}
