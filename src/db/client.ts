import * as SQLite from 'expo-sqlite';

import { databaseVersion, migrationSql } from '@/db/schema';

const dbPromise = SQLite.openDatabaseAsync('grade_planner.db');
let initialized = false;

const dropAllTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
  );
  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table.name};`);
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await dbPromise;

  if (!initialized) {
    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const currentVersion = versionRow?.user_version ?? 0;

    if (currentVersion < 2) {
      // Full recreate for old schema (before version 2)
      await dropAllTables(db);
      await db.execAsync(migrationSql);
      await db.execAsync(`PRAGMA user_version = ${databaseVersion};`);
    } else if (currentVersion < databaseVersion) {
      // Incremental migrations (preserve existing data)
      let v = currentVersion;
      if (v < 3) {
        await db.execAsync(`ALTER TABLE uc ADD COLUMN icon TEXT NOT NULL DEFAULT 'functions';`);
        v = 3;
      }
      if (v < 4) {
        await db.execAsync(`ALTER TABLE event ADD COLUMN tipo TEXT NOT NULL DEFAULT 'evento';`);
        v = 4;
      }
      await db.execAsync(`PRAGMA user_version = ${v};`);
    }

    initialized = true;
  }

  return db;
};

export const runInTransaction = async (callback: (db: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> => {
  const db = await getDatabase();

  await db.execAsync('BEGIN TRANSACTION;');

  try {
    await callback(db);
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
};
