import { Platform } from 'react-native';
import { create } from 'zustand';
import { inArray } from 'drizzle-orm';
import { db } from '@db/database';
import { entryCategories, categories as categoriesTable } from '@db/schema';
import { createEntryRepository } from '@repositories/entryRepository';
import type { CreateEntryInput, UpdateEntryInput } from '@repositories/entryRepository';
import type { EntryType, TaskStatus } from '@t/index';
import type { CategoryRow, EntryRow } from '@db/schema';
import { TODAY } from '@utils/dateUtils';
import { MOCK_ENTRIES } from '@db/mockData';

const IS_WEB = Platform.OS === 'web';
const entryRepo = IS_WEB ? null : createEntryRepository(db);

export interface EntryWithCats extends Omit<EntryRow, 'type' | 'status'> {
  type: EntryType;
  status: TaskStatus | null;
  categories: CategoryRow[];
}

interface JournalState {
  entries: EntryWithCats[];
  selectedDate: string;
  loading: boolean;

  setDate: (date: string) => void;
  loadForDate: (date: string) => Promise<void>;
  refresh: () => Promise<void>;
  createEntry: (input: CreateEntryInput) => Promise<EntryRow>;
  updateEntry: (id: string, input: UpdateEntryInput) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  setHabitDone: (id: string, done: boolean) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateCategories: (entryId: string, categoryIds: string[]) => Promise<void>;
}

async function loadEntriesWithCats(date: string): Promise<EntryWithCats[]> {
  const rows = await entryRepo!.findByDate(date);
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const entCats = await db.select().from(entryCategories).where(inArray(entryCategories.entryId, ids));

  const catIds = [...new Set(entCats.map((ec) => ec.categoryId))];
  const cats =
    catIds.length > 0
      ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
      : [];

  const catMap = new Map(cats.map((c) => [c.id, c]));
  const entCatMap = new Map<string, CategoryRow[]>();
  for (const ec of entCats) {
    const list = entCatMap.get(ec.entryId) ?? [];
    const cat = catMap.get(ec.categoryId);
    if (cat) list.push(cat);
    entCatMap.set(ec.entryId, list);
  }

  return rows.map((r) => ({
    ...r,
    type: r.type as EntryType,
    status: r.status as TaskStatus | null,
    categories: entCatMap.get(r.id) ?? [],
  }));
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  selectedDate: TODAY(),
  loading: false,

  setDate: (date) => {
    set({ selectedDate: date });
    get().loadForDate(date);
  },

  loadForDate: async (date) => {
    if (IS_WEB) {
      set({ entries: MOCK_ENTRIES, loading: false, selectedDate: date });
      return;
    }
    set({ loading: true });
    try {
      const entries = await loadEntriesWithCats(date);
      set({ entries, loading: false, selectedDate: date });
    } catch {
      set({ loading: false });
    }
  },

  refresh: async () => {
    await get().loadForDate(get().selectedDate);
  },

  createEntry: async (input) => {
    if (IS_WEB) return {} as EntryRow;
    const row = await entryRepo!.create(input);
    await get().refresh();
    return row;
  },

  updateEntry: async (id, input) => {
    if (IS_WEB) return;
    await entryRepo!.update(id, input);
    await get().refresh();
  },

  setTaskStatus: async (id, status) => {
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, status } : e)),
    }));
    if (!IS_WEB) await entryRepo!.updateStatus(id, status);
  },

  setHabitDone: async (id, done) => {
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, habitDone: done } : e)),
    }));
    if (!IS_WEB) await entryRepo!.updateHabitDone(id, done);
  },

  deleteEntry: async (id) => {
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
    if (!IS_WEB) await entryRepo!.softDelete(id);
  },

  updateCategories: async (entryId, categoryIds) => {
    if (IS_WEB) return;
    await entryRepo!.updateCategories(entryId, categoryIds);
    await get().refresh();
  },
}));
