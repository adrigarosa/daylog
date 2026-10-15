import { eq } from 'drizzle-orm';
import type { DB } from '@db/database';
import { settings } from '@db/schema';
import type { ThemeMode } from '@t/index';

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: string;
  fontSize: 'small' | 'normal' | 'large';
}

const DEFAULTS: AppSettings = {
  themeMode: 'system',
  accentColor: '#6C63FF',
  fontSize: 'normal',
};

export function createSettingsRepository(db: DB) {
  async function get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!rows[0]) return DEFAULTS[key];
    return JSON.parse(rows[0].value) as AppSettings[K];
  }

  async function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } });
  }

  async function getAll(): Promise<AppSettings> {
    const rows = await db.select().from(settings);
    const result = { ...DEFAULTS };
    for (const row of rows) {
      const k = row.key as keyof AppSettings;
      if (k in result) {
        (result as Record<string, unknown>)[k] = JSON.parse(row.value);
      }
    }
    return result;
  }

  return { get, set, getAll };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
