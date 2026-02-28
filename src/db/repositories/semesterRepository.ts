import { getDatabase } from '@/db/client';
import type { SemesterRecord, SemesterStatus } from '@/db/types';
import { mapSemester, mapSemesterStatus } from '@/db/utils/mappers';

const SEMESTER_SELECT = `SELECT id, curso_id AS cursoId, title,
  start_date AS startDate, end_date AS endDate,
  notes, meta_media AS metaMedia, meta_ects AS metaEcts`;

type SemesterRow = {
  id: number; cursoId: number | null; title: string;
  startDate: string; endDate: string; notes: string | null;
  metaMedia: number | null; metaEcts: number | null;
};

export const semesterRepository = {
  async listSemesters(cursoId?: number): Promise<SemesterRecord[]> {
    const db = await getDatabase();
    const where = cursoId !== undefined ? 'WHERE curso_id = ?' : '';
    const params = cursoId !== undefined ? [cursoId] : [];
    const rows = await db.getAllAsync<SemesterRow>(
      `${SEMESTER_SELECT} FROM semester ${where} ORDER BY start_date DESC;`,
      params,
    );
    return rows.map(mapSemester);
  },

  async getSemesterById(semesterId: number): Promise<SemesterRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SemesterRow>(
      `${SEMESTER_SELECT} FROM semester WHERE id = ?;`,
      [semesterId],
    );
    return row ? mapSemester(row) : null;
  },

  getSemesterStatus(semester: SemesterRecord): SemesterStatus {
    return mapSemesterStatus(semester.startDate, semester.endDate);
  },

  async createSemester(input: {
    cursoId?: number | null;
    title: string;
    startDate: string;
    endDate: string;
    notes?: string | null;
    metaMedia?: number | null;
    metaEcts?: number | null;
  }): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO semester (curso_id, title, start_date, end_date, notes, meta_media, meta_ects)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        input.cursoId ?? null,
        input.title,
        input.startDate,
        input.endDate,
        input.notes ?? null,
        input.metaMedia ?? null,
        input.metaEcts ?? null,
      ],
    );
    return Number(result.lastInsertRowId);
  },

  async updateSemester(semesterId: number, input: {
    title: string;
    startDate: string;
    endDate: string;
    notes?: string | null;
    metaMedia?: number | null;
    metaEcts?: number | null;
  }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE semester
       SET title = ?, start_date = ?, end_date = ?, notes = ?, meta_media = ?, meta_ects = ?
       WHERE id = ?;`,
      [input.title, input.startDate, input.endDate, input.notes ?? null, input.metaMedia ?? null, input.metaEcts ?? null, semesterId],
    );
  },

  async deleteSemester(semesterId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM semester WHERE id = ?;', [semesterId]);
  },
};
