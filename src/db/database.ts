import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';
import { runMigrations } from './runMigrations';

const expo = openDatabaseSync('daylog.db', { enableChangeListener: true });
runMigrations(expo); // synchronous — DB is ready before any component renders
export const db = drizzle(expo, { schema });
export type DB = typeof db;
