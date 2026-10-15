import { and, between, count, eq } from 'drizzle-orm';
import dayjs from 'dayjs';
import type { DB } from '@db/database';
import { entries, entryCategories } from '@db/schema';
import { TODAY, addDays } from '@utils/dateUtils';
import type { EntryType } from '@t/index';

export type PeriodKey = 'week' | 'month' | 'year';

export interface PeriodStats {
  startDate: string;
  endDate: string;
  totalEntries: number;
  byType: Partial<Record<EntryType, number>>;
  taskCompletionRate: number | null; // null = no tasks
  habitCompletionRate: number | null;
  byCategory: Array<{ categoryId: string; count: number }>;
  dailyCounts: Array<{ date: string; count: number }>;
}

export function getPeriodDates(period: PeriodKey): { startDate: string; endDate: string } {
  const today = TODAY();
  switch (period) {
    case 'week':
      return { startDate: addDays(today, -6), endDate: today };
    case 'month':
      return { startDate: dayjs(today).startOf('month').format('YYYY-MM-DD'), endDate: today };
    case 'year':
      return { startDate: dayjs(today).startOf('year').format('YYYY-MM-DD'), endDate: today };
  }
}

export async function computeStats(db: DB, startDate: string, endDate: string): Promise<PeriodStats> {
  const entryRows = await db
    .select({ type: entries.type, status: entries.status, habitDone: entries.habitDone })
    .from(entries)
    .where(and(between(entries.date, startDate, endDate), eq(entries.isDeleted, false)));

  const byType: Partial<Record<EntryType, number>> = {};
  let completedTasks = 0, eligibleTasks = 0, doneHabits = 0, totalHabits = 0;

  for (const row of entryRows) {
    const t = row.type as EntryType;
    byType[t] = (byType[t] ?? 0) + 1;
    if (t === 'task') {
      if (row.status !== 'cancelled') eligibleTasks++;
      if (row.status === 'completed') completedTasks++;
    }
    if (t === 'habit') {
      totalHabits++;
      if (row.habitDone) doneHabits++;
    }
  }

  const dailyRows = await db
    .select({ date: entries.date, cnt: count() })
    .from(entries)
    .where(and(between(entries.date, startDate, endDate), eq(entries.isDeleted, false)))
    .groupBy(entries.date)
    .orderBy(entries.date);

  const catRows = await db
    .select({ categoryId: entryCategories.categoryId, cnt: count() })
    .from(entryCategories)
    .innerJoin(entries, eq(entryCategories.entryId, entries.id))
    .where(and(between(entries.date, startDate, endDate), eq(entries.isDeleted, false)))
    .groupBy(entryCategories.categoryId);

  return {
    startDate,
    endDate,
    totalEntries: entryRows.length,
    byType,
    taskCompletionRate: eligibleTasks > 0 ? completedTasks / eligibleTasks : null,
    habitCompletionRate: totalHabits > 0 ? doneHabits / totalHabits : null,
    byCategory: catRows.map((r) => ({ categoryId: r.categoryId, count: r.cnt })).sort((a, b) => b.count - a.count),
    dailyCounts: dailyRows.map((r) => ({ date: r.date, count: r.cnt })),
  };
}

// Returns all entries for a category in a period (for drill-down)
export async function getEntriesForCategory(
  db: DB,
  categoryId: string,
  startDate: string,
  endDate: string,
) {
  const rows = await db
    .select({ entryId: entryCategories.entryId })
    .from(entryCategories)
    .innerJoin(entries, eq(entryCategories.entryId, entries.id))
    .where(
      and(
        eq(entryCategories.categoryId, categoryId),
        between(entries.date, startDate, endDate),
        eq(entries.isDeleted, false),
      ),
    )
    .orderBy(entries.date);
  return rows.map((r) => r.entryId);
}
