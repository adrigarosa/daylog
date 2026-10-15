import { eq, asc, count } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import type { DB } from '@db/database';
import { categories, keywords, entryCategories, entries } from '@db/schema';
import type { CategoryRow, KeywordRow, NewCategory } from '@db/schema';

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export function createCategoryRepository(db: DB) {
  async function findAll(): Promise<CategoryRow[]> {
    return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  async function findById(id: string): Promise<CategoryRow | undefined> {
    const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return rows[0];
  }

  async function create(input: CreateCategoryInput): Promise<CategoryRow> {
    const allCats = await findAll();
    const maxOrder = allCats.length > 0 ? Math.max(...allCats.map((c) => c.sortOrder)) : -1;
    const newCat: NewCategory = {
      id: randomUUID(),
      name: input.name,
      color: input.color,
      icon: input.icon,
      isSystem: false,
      sortOrder: maxOrder + 1,
    };
    await db.insert(categories).values(newCat);
    return newCat as CategoryRow;
  }

  async function update(id: string, input: Partial<Pick<CategoryRow, 'name' | 'color' | 'icon'>>): Promise<void> {
    await db.update(categories).set(input).where(eq(categories.id, id));
  }

  async function remove(id: string): Promise<void> {
    const cat = await findById(id);
    if (!cat || cat.isSystem) return;
    // cascade: clean up associations and keywords before deleting
    await db.delete(entryCategories).where(eq(entryCategories.categoryId, id));
    await db.delete(keywords).where(eq(keywords.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
  }

  async function getEntryCounts(): Promise<Map<string, number>> {
    const rows = await db
      .select({ categoryId: entryCategories.categoryId, cnt: count(entries.id) })
      .from(entryCategories)
      .innerJoin(entries, eq(entryCategories.entryId, entries.id))
      .where(eq(entries.isDeleted, false))
      .groupBy(entryCategories.categoryId);
    return new Map(rows.map((r) => [r.categoryId, r.cnt]));
  }

  async function findKeywordsByCategory(categoryId: string): Promise<KeywordRow[]> {
    return db.select().from(keywords).where(eq(keywords.categoryId, categoryId)).orderBy(asc(keywords.keyword));
  }

  async function findAllKeywords(): Promise<KeywordRow[]> {
    return db.select().from(keywords);
  }

  async function addKeyword(keyword: string, categoryId: string): Promise<void> {
    await db
      .insert(keywords)
      .values({ id: randomUUID(), keyword: keyword.toLowerCase().trim(), categoryId, isSystem: false })
      .onConflictDoNothing();
  }

  async function removeKeyword(keywordId: string): Promise<void> {
    // Allow removing any keyword (even system ones) — user knows what they're doing
    await db.delete(keywords).where(eq(keywords.id, keywordId));
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove,
    getEntryCounts,
    findKeywordsByCategory,
    findAllKeywords,
    addKeyword,
    removeKeyword,
  };
}

export type CategoryRepository = ReturnType<typeof createCategoryRepository>;
