import { eq, and, desc, between, inArray } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import dayjs from 'dayjs';
import type { DB } from '@db/database';
import { entries, entryCategories } from '@db/schema';
import type { NewEntry, EntryRow } from '@db/schema';
import type { EntryType, TaskStatus } from '@t/index';

export interface CreateEntryInput {
  type: EntryType;
  title: string;
  description?: string;
  date: string;
  status?: TaskStatus;
  habitDone?: boolean;
  habitConfigId?: string;
  categoryIds?: string[];
  autoTaggedCategoryIds?: string[];
}

export interface UpdateEntryInput {
  title?: string;
  description?: string;
  date?: string;
  status?: TaskStatus | null;
  habitDone?: boolean | null;
  habitConfigId?: string | null;
}

export function createEntryRepository(db: DB) {
  async function findByDate(date: string): Promise<EntryRow[]> {
    return db
      .select()
      .from(entries)
      .where(and(eq(entries.date, date), eq(entries.isDeleted, false)))
      .orderBy(entries.createdAt);
  }

  async function findByDateRange(startDate: string, endDate: string): Promise<EntryRow[]> {
    return db
      .select()
      .from(entries)
      .where(
        and(
          between(entries.date, startDate, endDate),
          eq(entries.isDeleted, false),
        ),
      )
      .orderBy(desc(entries.date), entries.createdAt);
  }

  async function findById(id: string): Promise<EntryRow | undefined> {
    const rows = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, id), eq(entries.isDeleted, false)))
      .limit(1);
    return rows[0];
  }

  async function findByType(type: EntryType, startDate?: string, endDate?: string): Promise<EntryRow[]> {
    const conditions = [eq(entries.type, type), eq(entries.isDeleted, false)];
    if (startDate && endDate) {
      conditions.push(between(entries.date, startDate, endDate));
    }
    return db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.date), entries.createdAt);
  }

  async function create(input: CreateEntryInput): Promise<EntryRow> {
    const id = randomUUID();
    const now = dayjs().toISOString();

    const newEntry: NewEntry = {
      id,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      status: input.status ?? null,
      habitDone: input.habitDone ?? null,
      habitConfigId: input.habitConfigId ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    await db.insert(entries).values(newEntry);

    if (input.categoryIds?.length || input.autoTaggedCategoryIds?.length) {
      const manualIds = input.categoryIds ?? [];
      const autoIds = (input.autoTaggedCategoryIds ?? []).filter((id) => !manualIds.includes(id));
      const catRows = [
        ...manualIds.map((cid) => ({ entryId: id, categoryId: cid, autoTagged: false })),
        ...autoIds.map((cid) => ({ entryId: id, categoryId: cid, autoTagged: true })),
      ];
      if (catRows.length) {
        await db.insert(entryCategories).values(catRows);
      }
    }

    return newEntry as EntryRow;
  }

  async function update(id: string, input: UpdateEntryInput): Promise<void> {
    const updatedAt = dayjs().toISOString();
    await db
      .update(entries)
      .set({ ...input, updatedAt })
      .where(eq(entries.id, id));
  }

  async function updateStatus(id: string, status: TaskStatus): Promise<void> {
    await update(id, { status });
  }

  async function updateHabitDone(id: string, done: boolean): Promise<void> {
    await update(id, { habitDone: done });
  }

  async function softDelete(id: string): Promise<void> {
    await db
      .update(entries)
      .set({ isDeleted: true, updatedAt: dayjs().toISOString() })
      .where(eq(entries.id, id));
  }

  async function updateCategories(entryId: string, categoryIds: string[], autoTaggedIds: string[] = []): Promise<void> {
    await db.delete(entryCategories).where(eq(entryCategories.entryId, entryId));
    const allIds = Array.from(new Set([...categoryIds, ...autoTaggedIds]));
    if (allIds.length === 0) return;
    const rows = allIds.map((cid) => ({
      entryId,
      categoryId: cid,
      autoTagged: !categoryIds.includes(cid),
    }));
    await db.insert(entryCategories).values(rows);
  }

  async function findCategoryIdsByEntry(entryId: string): Promise<string[]> {
    const rows = await db
      .select({ categoryId: entryCategories.categoryId })
      .from(entryCategories)
      .where(eq(entryCategories.entryId, entryId));
    return rows.map((r) => r.categoryId);
  }

  // Returns dates where the habit was marked done — used for streak calculation
  async function findHabitDoneDates(habitConfigId: string): Promise<string[]> {
    const rows = await db
      .select({ date: entries.date })
      .from(entries)
      .where(
        and(
          eq(entries.habitConfigId, habitConfigId),
          eq(entries.habitDone, true),
          eq(entries.isDeleted, false),
        ),
      );
    return rows.map((r) => r.date);
  }

  // Find the quick-log entry for a habit on a specific date (if it exists)
  async function findHabitQuickLog(habitConfigId: string, date: string): Promise<EntryRow | undefined> {
    const rows = await db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.habitConfigId, habitConfigId),
          eq(entries.date, date),
          eq(entries.isDeleted, false),
        ),
      )
      .limit(1);
    return rows[0];
  }

  return {
    findByDate,
    findByDateRange,
    findById,
    findByType,
    create,
    update,
    updateStatus,
    updateHabitDone,
    softDelete,
    updateCategories,
    findCategoryIdsByEntry,
    findHabitDoneDates,
    findHabitQuickLog,
  };
}

export type EntryRepository = ReturnType<typeof createEntryRepository>;
