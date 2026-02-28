import type * as SQLite from 'expo-sqlite';

import type {
  CalendarEventRepository,
  PersistCalendarEventInput,
} from '@/application/calendar/ports/CalendarEventRepository';
import { getDatabase, runInTransaction } from '@/db/client';

export class SQLiteCalendarEventRepository implements CalendarEventRepository {
  async create(input: PersistCalendarEventInput): Promise<number> {
    let createdEventId = 0;

    await runInTransaction(async (db) => {
      const semesterId = await this.resolveSemesterId(db, input.ucId, input.semesterId);
      const result = await db.runAsync(
        `INSERT INTO event (semester_id, uc_id, title, date_time, priority, completed, notes, tipo)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?);`,
        [
          semesterId,
          input.ucId,
          input.title,
          input.dateTimeISO,
          input.priority,
          input.notes,
          input.tipo,
        ],
      );

      createdEventId = Number(result.lastInsertRowId);
    });

    return createdEventId;
  }

  async update(eventId: number, input: PersistCalendarEventInput): Promise<void> {
    await runInTransaction(async (db) => {
      const existing = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM event WHERE id = ?;',
        [eventId],
      );

      if (!existing) {
        throw new Error(`Event ${eventId} not found`);
      }

      const semesterId = await this.resolveSemesterId(db, input.ucId, input.semesterId);

      await db.runAsync(
        `UPDATE event
         SET title = ?, date_time = ?, uc_id = ?, semester_id = ?, tipo = ?, notes = ?, priority = ?
         WHERE id = ?;`,
        [
          input.title,
          input.dateTimeISO,
          input.ucId,
          semesterId,
          input.tipo,
          input.notes,
          input.priority,
          eventId,
        ],
      );
    });
  }

  private async resolveSemesterId(
    db: SQLite.SQLiteDatabase,
    ucId: number | null,
    requestedSemesterId: number | null,
  ): Promise<number | null> {
    if (!ucId) return requestedSemesterId;

    const uc = await db.getFirstAsync<{ semesterId: number | null }>(
      'SELECT semester_id AS semesterId FROM uc WHERE id = ?;',
      [ucId],
    );

    if (!uc) {
      throw new Error(`UC ${ucId} not found`);
    }

    if (uc.semesterId !== null) {
      return uc.semesterId;
    }

    return requestedSemesterId;
  }
}
