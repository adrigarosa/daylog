import { sqliteTable, text, integer, primaryKey, unique } from 'drizzle-orm/sqlite-core';

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'task' | 'fact' | 'note' | 'habit'
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // YYYY-MM-DD
  status: text('status'), // 'todo'|'in_progress'|'completed'|'cancelled' — only for tasks
  habitDone: integer('habit_done', { mode: 'boolean' }), // only for habits
  habitConfigId: text('habit_config_id'), // links entry to a habitsConfig row
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const entryCategories = sqliteTable(
  'entry_categories',
  {
    entryId: text('entry_id').notNull(),
    categoryId: text('category_id').notNull(),
    autoTagged: integer('auto_tagged', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.categoryId] })],
);

export const keywords = sqliteTable(
  'keywords',
  {
    id: text('id').primaryKey(),
    keyword: text('keyword').notNull(),
    categoryId: text('category_id').notNull(),
    isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [unique().on(t.keyword, t.categoryId)],
);

export const habitsConfig = sqliteTable('habits_config', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryIds: text('category_ids').notNull().default('[]'),
  keywords: text('keywords').notNull().default('[]'),
  color: text('color'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type EntryRow = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type KeywordRow = typeof keywords.$inferSelect;
export type NewKeyword = typeof keywords.$inferInsert;
export type HabitConfigRow = typeof habitsConfig.$inferSelect;
export type NewHabitConfig = typeof habitsConfig.$inferInsert;
export type SettingRow = typeof settings.$inferSelect;
