import { getDatabase } from '@/db/client';
import type { EventPriority, EventRecord, EventTipo } from '@/db/types';
import { fromBool, mapEvent } from '@/db/utils/mappers';

const EVENT_SELECT = `SELECT id, semester_id AS semesterId, uc_id AS ucId,
  title, date_time AS dateTime, priority, completed, notes, tipo`;

type EventRow = {
  id: number; semesterId: number | null; ucId: number | null;
  title: string; dateTime: string; priority: string; completed: number; notes: string | null; tipo: string | null;
};

export const eventRepository = {
  async listEventsInRange(startISO: string, endISO: string, filters?: { semesterId?: number; ucId?: number }): Promise<EventRecord[]> {
    const db = await getDatabase();
    const conditions = ['date_time >= ?', 'date_time <= ?'];
    const params: Array<string | number> = [startISO, endISO];

    if (filters?.semesterId) {
      conditions.push('semester_id = ?');
      params.push(filters.semesterId);
    }
    if (filters?.ucId) {
      conditions.push('uc_id = ?');
      params.push(filters.ucId);
    }

    const rows = await db.getAllAsync<EventRow>(
      `${EVENT_SELECT} FROM event WHERE ${conditions.join(' AND ')} ORDER BY date_time ASC;`,
      params,
    );
    return rows.map(mapEvent);
  },

  async listEventsByDate(dateISO: string): Promise<EventRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<EventRow>(
      `${EVENT_SELECT} FROM event WHERE date(date_time) = date(?) ORDER BY date_time ASC;`,
      [dateISO],
    );
    return rows.map(mapEvent);
  },

  async getEventById(eventId: number): Promise<EventRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<EventRow>(
      `${EVENT_SELECT} FROM event WHERE id = ? LIMIT 1;`,
      [eventId],
    );
    return row ? mapEvent(row) : null;
  },

  async createManualEvent(input: {
    semesterId?: number | null;
    ucId?: number | null;
    title: string;
    dateTime: string;
    priority?: EventPriority;
    tipo?: EventTipo;
    notes?: string | null;
  }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO event (semester_id, uc_id, title, date_time, priority, completed, notes, tipo)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?);`,
      [
        input.semesterId ?? null,
        input.ucId ?? null,
        input.title,
        input.dateTime,
        input.priority ?? 'medium',
        input.notes ?? null,
        input.tipo ?? 'evento',
      ],
    );
  },

  async updateEvent(eventId: number, input: {
    title: string;
    dateTime: string;
    ucId?: number | null;
    semesterId?: number | null;
    tipo: EventTipo;
    notes?: string | null;
  }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE event SET title = ?, date_time = ?, uc_id = ?, semester_id = ?, tipo = ?, notes = ? WHERE id = ?;`,
      [input.title, input.dateTime, input.ucId ?? null, input.semesterId ?? null, input.tipo, input.notes ?? null, eventId],
    );
  },

  async toggleEventCompleted(eventId: number, completed: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE event SET completed = ? WHERE id = ?;', [fromBool(completed), eventId]);
  },

  async deleteEvent(eventId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM event WHERE id = ?;', [eventId]);
  },

  async listEventsByUC(ucId: number): Promise<EventRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<EventRow>(
      `${EVENT_SELECT} FROM event WHERE uc_id = ? ORDER BY date_time ASC;`,
      [ucId],
    );
    return rows.map(mapEvent);
  },
};
