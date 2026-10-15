import type { EntryType } from '@t/index';

export type RootTabParamList = {
  Journal: undefined;
  Calendar: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type JournalStackParamList = {
  Today: undefined;
  AddEditEntry: { entryId?: string; type?: EntryType; date?: string } | undefined;
  EntryDetail: { entryId: string };
};

export type CalendarStackParamList = {
  CalendarView: undefined;
  DayDetail: { date: string };
};

export type AnalyticsStackParamList = {
  AnalyticsOverview: undefined;
  ReportDetail: { period: 'week' | 'month' | 'year'; startDate: string };
  CategoryDetail: { categoryId: string; startDate: string; endDate: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Categories: undefined;
  CategoryDetail: { categoryId?: string };
  Keywords: { categoryId: string };
  HabitsConfig: undefined;
  HabitDetail: { habitId?: string };
  ThemeSettings: undefined;
};
