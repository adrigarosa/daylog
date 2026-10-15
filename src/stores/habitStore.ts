import { Platform } from 'react-native';
import { create } from 'zustand';
import dayjs from 'dayjs';
import { db } from '@db/database';
import { createHabitConfigRepository } from '@repositories/habitConfigRepository';
import { createEntryRepository } from '@repositories/entryRepository';
import type { HabitConfig } from '@t/index';
import type { EntryRow } from '@db/schema';
import { calculateStreak, type StreakResult } from '@utils/streakCalculator';
import { TODAY } from '@utils/dateUtils';
import {
  MOCK_HABIT_CONFIGS,
  MOCK_ENTRIES,
  MOCK_HABIT_DONE_DATES,
} from '@db/mockData';

const IS_WEB = Platform.OS === 'web';
const habitRepo = IS_WEB ? null : createHabitConfigRepository(db);
const entryRepo = IS_WEB ? null : createEntryRepository(db);

export interface QuickLog {
  entryId: string;
  habitConfigId: string;
  date: string;
  done: boolean;
}

interface HabitState {
  habitConfigs: HabitConfig[];
  quickLogs: QuickLog[];   // today's quick-log entries
  loaded: boolean;

  load: () => Promise<void>;
  reload: () => Promise<void>;
  loadQuickLogsForDate: (date: string) => Promise<void>;

  toggleQuickLog: (habitConfigId: string, habitName: string, date: string) => Promise<void>;

  createHabit: (input: Omit<HabitConfig, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, input: Partial<Omit<HabitConfig, 'id' | 'createdAt'>>) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  getStreakResult: (habitConfigId: string) => Promise<StreakResult>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habitConfigs: [],
  quickLogs: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    await get().reload();
  },

  reload: async () => {
    if (IS_WEB) {
      set({ habitConfigs: MOCK_HABIT_CONFIGS, loaded: true });
      return;
    }
    const configs = await habitRepo!.findAll();
    set({ habitConfigs: configs, loaded: true });
  },

  loadQuickLogsForDate: async (date) => {
    if (IS_WEB) {
      // Derive quick-logs from mock entries
      const logs: QuickLog[] = MOCK_ENTRIES
        .filter((e) => e.type === 'habit' && e.habitConfigId && e.date === date)
        .map((e) => ({
          entryId: e.id,
          habitConfigId: e.habitConfigId!,
          date: e.date,
          done: e.habitDone === true,
        }));
      set({ quickLogs: logs });
      return;
    }
    const activeConfigs = get().habitConfigs.filter((h) => h.isActive);
    const logs: QuickLog[] = [];
    for (const cfg of activeConfigs) {
      const entry = await entryRepo!.findHabitQuickLog(cfg.id, date);
      if (entry) {
        logs.push({ entryId: entry.id, habitConfigId: cfg.id, date, done: entry.habitDone === true });
      }
    }
    set({ quickLogs: logs });
  },

  toggleQuickLog: async (habitConfigId, habitName, date) => {
    if (IS_WEB) {
      // Optimistic update in web preview
      set((state) => {
        const existing = state.quickLogs.find((l) => l.habitConfigId === habitConfigId);
        if (existing) {
          return {
            quickLogs: state.quickLogs.map((l) =>
              l.habitConfigId === habitConfigId ? { ...l, done: !l.done } : l,
            ),
          };
        }
        return {
          quickLogs: [
            ...state.quickLogs,
            { entryId: `mock_${habitConfigId}`, habitConfigId, date, done: true },
          ],
        };
      });
      return;
    }

    const existing = await entryRepo!.findHabitQuickLog(habitConfigId, date);
    if (existing) {
      await entryRepo!.updateHabitDone(existing.id, !existing.habitDone);
      set((state) => ({
        quickLogs: state.quickLogs.map((l) =>
          l.habitConfigId === habitConfigId ? { ...l, done: !existing.habitDone } : l,
        ),
      }));
    } else {
      const row = await entryRepo!.create({
        type: 'habit',
        title: habitName,
        date,
        habitDone: true,
        habitConfigId,
      });
      set((state) => ({
        quickLogs: [
          ...state.quickLogs,
          { entryId: row.id, habitConfigId, date, done: true },
        ],
      }));
    }
  },

  createHabit: async (input) => {
    if (IS_WEB) return;
    await habitRepo!.create({
      name: input.name,
      description: input.description ?? undefined,
      categoryIds: input.categoryIds,
      keywords: input.keywords,
      color: input.color ?? undefined,
    });
    await get().reload();
  },

  updateHabit: async (id, input) => {
    if (IS_WEB) return;
    await habitRepo!.update(id, {
      name: input.name,
      description: input.description ?? undefined,
      categoryIds: input.categoryIds,
      keywords: input.keywords,
      color: input.color ?? undefined,
      isActive: input.isActive,
    });
    await get().reload();
  },

  toggleActive: async (id, isActive) => {
    if (IS_WEB) {
      set((state) => ({
        habitConfigs: state.habitConfigs.map((h) =>
          h.id === id ? { ...h, isActive } : h,
        ),
      }));
      return;
    }
    await habitRepo!.setActive(id, isActive);
    await get().reload();
  },

  deleteHabit: async (id) => {
    if (IS_WEB) {
      set((state) => ({ habitConfigs: state.habitConfigs.filter((h) => h.id !== id) }));
      return;
    }
    await habitRepo!.remove(id);
    await get().reload();
  },

  getStreakResult: async (habitConfigId) => {
    if (IS_WEB) {
      const dates = MOCK_HABIT_DONE_DATES[habitConfigId] ?? [];
      return calculateStreak(dates);
    }
    const dates = await entryRepo!.findHabitDoneDates(habitConfigId);
    return calculateStreak(dates);
  },
}));
