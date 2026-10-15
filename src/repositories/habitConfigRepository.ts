import { eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import dayjs from 'dayjs';
import type { DB } from '@db/database';
import { habitsConfig } from '@db/schema';
import type { HabitConfigRow, NewHabitConfig } from '@db/schema';
import type { HabitConfig } from '@t/index';

export interface CreateHabitConfigInput {
  name: string;
  description?: string;
  categoryIds?: string[];
  keywords?: string[];
  color?: string;
}

function rowToHabit(row: HabitConfigRow): HabitConfig {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    categoryIds: JSON.parse(row.categoryIds) as string[],
    keywords: JSON.parse(row.keywords) as string[],
    color: row.color,
    isActive: row.isActive ?? true,
    createdAt: row.createdAt,
  };
}

export function createHabitConfigRepository(db: DB) {
  async function findAll(): Promise<HabitConfig[]> {
    const rows = await db.select().from(habitsConfig);
    return rows.map(rowToHabit);
  }

  async function findActive(): Promise<HabitConfig[]> {
    const rows = await db.select().from(habitsConfig).where(eq(habitsConfig.isActive, true));
    return rows.map(rowToHabit);
  }

  async function findById(id: string): Promise<HabitConfig | undefined> {
    const rows = await db.select().from(habitsConfig).where(eq(habitsConfig.id, id)).limit(1);
    return rows[0] ? rowToHabit(rows[0]) : undefined;
  }

  async function create(input: CreateHabitConfigInput): Promise<HabitConfig> {
    const newHabit: NewHabitConfig = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      categoryIds: JSON.stringify(input.categoryIds ?? []),
      keywords: JSON.stringify(input.keywords ?? []),
      color: input.color ?? null,
      isActive: true,
      createdAt: dayjs().toISOString(),
    };
    await db.insert(habitsConfig).values(newHabit);
    return rowToHabit(newHabit as HabitConfigRow);
  }

  async function update(id: string, input: Partial<CreateHabitConfigInput> & { isActive?: boolean }): Promise<void> {
    const patch: Partial<HabitConfigRow> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.categoryIds !== undefined) patch.categoryIds = JSON.stringify(input.categoryIds);
    if (input.keywords !== undefined) patch.keywords = JSON.stringify(input.keywords);
    if (input.color !== undefined) patch.color = input.color;
    if (input.isActive !== undefined) patch.isActive = input.isActive;
    await db.update(habitsConfig).set(patch).where(eq(habitsConfig.id, id));
  }

  async function setActive(id: string, isActive: boolean): Promise<void> {
    await db.update(habitsConfig).set({ isActive }).where(eq(habitsConfig.id, id));
  }

  async function remove(id: string): Promise<void> {
    await db.delete(habitsConfig).where(eq(habitsConfig.id, id));
  }

  return { findAll, findActive, findById, create, update, setActive, remove };
}

export type HabitConfigRepository = ReturnType<typeof createHabitConfigRepository>;
