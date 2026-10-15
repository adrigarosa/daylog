import { randomUUID } from 'expo-crypto';
import { count } from 'drizzle-orm';
import type { DB } from '../database';
import { categories, keywords } from '../schema';
import { DEFAULT_CATEGORIES } from './categories';
import { DEFAULT_KEYWORDS } from './keywords';

export async function runSeed(db: DB): Promise<void> {
  const [{ value: catCount }] = await db.select({ value: count() }).from(categories);
  if (catCount > 0) return;

  await db.insert(categories).values(DEFAULT_CATEGORIES);

  const keywordRows = DEFAULT_KEYWORDS.map((k) => ({
    id: randomUUID(),
    keyword: k.keyword,
    categoryId: k.categoryId,
    isSystem: true as boolean,
  }));

  const CHUNK = 50;
  for (let i = 0; i < keywordRows.length; i += CHUNK) {
    await db.insert(keywords).values(keywordRows.slice(i, i + CHUNK));
  }
}
