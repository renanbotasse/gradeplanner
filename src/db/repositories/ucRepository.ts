import { getDatabase } from '@/db/client';
import type { AvaliacaoRecord, GradeScale, SemesterStatus, UCRecord } from '@/db/types';
import { fromBool, mapSemesterStatus, mapUC } from '@/db/utils/mappers';
import { avaliacaoRepository } from './avaliacaoRepository';
import { courseRepository } from './courseRepository';

const UC_SELECT = `SELECT id, semester_id AS semesterId, name, icon, ects,
  professores, notes,
  escala_notas AS escalaNatas,
  nota_minima_aprovacao AS notaMinimaAprovacao,
  tem_exame_recurso AS temExameRecurso,
  peso_minimo_prova AS pesoMinProva,
  link_uc AS linkUc`;

type UCRow = {
  id: number; semesterId: number; name: string; icon: string | null; ects: number;
  professores: string | null; notes: string | null;
  escalaNatas: string | null; notaMinimaAprovacao: number | null;
  temExameRecurso: number; pesoMinProva: number | null; linkUc: string | null;
};

type UCInput = {
  name: string;
  icon?: string;
  ects?: number;
  professores?: string[];
  notes?: string | null;
  escalaNatas?: GradeScale | null;
  notaMinimaAprovacao?: number | null;
  temExameRecurso?: boolean;
  pesoMinProva?: number | null;
  linkUc?: string | null;
};

export const ucRepository = {
  async listUCsBySemester(semesterId: number): Promise<UCRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<UCRow>(
      `${UC_SELECT} FROM uc WHERE semester_id = ? ORDER BY name ASC;`,
      [semesterId],
    );
    return rows.map(mapUC);
  },

  async getUCById(ucId: number): Promise<UCRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<UCRow>(
      `${UC_SELECT} FROM uc WHERE id = ?;`,
      [ucId],
    );
    return row ? mapUC(row) : null;
  },

  async createUC(input: { semesterId: number } & UCInput): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO uc (semester_id, name, icon, ects, professores, notes, escala_notas, nota_minima_aprovacao, tem_exame_recurso, peso_minimo_prova, link_uc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.semesterId,
        input.name,
        input.icon ?? 'functions',
        input.ects ?? 0,
        input.professores?.length ? JSON.stringify(input.professores) : null,
        input.notes ?? null,
        input.escalaNatas ?? null,
        input.notaMinimaAprovacao ?? null,
        fromBool(input.temExameRecurso ?? false),
        input.pesoMinProva ?? null,
        input.linkUc ?? null,
      ],
    );
    return Number(result.lastInsertRowId);
  },

  async updateUC(ucId: number, input: UCInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE uc SET
        name = ?, icon = ?, ects = ?, professores = ?, notes = ?,
        escala_notas = ?, nota_minima_aprovacao = ?,
        tem_exame_recurso = ?, peso_minimo_prova = ?, link_uc = ?
       WHERE id = ?;`,
      [
        input.name,
        input.icon ?? 'functions',
        input.ects ?? 0,
        input.professores?.length ? JSON.stringify(input.professores) : null,
        input.notes ?? null,
        input.escalaNatas ?? null,
        input.notaMinimaAprovacao ?? null,
        fromBool(input.temExameRecurso ?? false),
        input.pesoMinProva ?? null,
        input.linkUc ?? null,
        ucId,
      ],
    );
  },

  async deleteUC(ucId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM uc WHERE id = ?;', [ucId]);
  },

  async listAllUCsWithSemester(): Promise<Array<UCRecord & { semesterTitle: string; semesterStatus: SemesterStatus }>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<UCRow & {
      semesterTitle: string; semesterStartDate: string; semesterEndDate: string;
    }>(
      `SELECT u.id, u.semester_id AS semesterId, u.name, u.icon, u.ects,
              u.professores, u.notes, u.escala_notas AS escalaNatas,
              u.nota_minima_aprovacao AS notaMinimaAprovacao,
              u.tem_exame_recurso AS temExameRecurso,
              u.peso_minimo_prova AS pesoMinProva, u.link_uc AS linkUc,
              s.title AS semesterTitle, s.start_date AS semesterStartDate, s.end_date AS semesterEndDate
       FROM uc u
       JOIN semester s ON u.semester_id = s.id
       ORDER BY s.start_date DESC, u.name ASC;`,
    );
    return rows.map((row) => ({
      ...mapUC(row),
      semesterTitle: row.semesterTitle,
      semesterStatus: mapSemesterStatus(row.semesterStartDate, row.semesterEndDate),
    }));
  },

  async getUCGradeInfo(ucId: number): Promise<{
    avaliacoes: AvaliacaoRecord[];
    notaMinima: number;
    notaMaximaEscala: number;
    temExameRecurso: boolean;
  }> {
    const [uc, avaliacoes] = await Promise.all([
      this.getUCById(ucId),
      avaliacaoRepository.listAvaliacoesByUC(ucId),
    ]);
    if (!uc) throw new Error(`UC ${ucId} not found`);

    let notaMinima = uc.notaMinimaAprovacao ?? 10;
    let notaMaximaEscala = 20;

    const escala = uc.escalaNatas;
    if (escala === '0-100') notaMaximaEscala = 100;
    else if (escala === '0-10') notaMaximaEscala = 10;

    if (!escala) {
      const curso = await courseRepository.getActiveCurso();
      if (curso) {
        if (!uc.notaMinimaAprovacao) notaMinima = curso.notaMinimaAprovacao;
        const cs = curso.escalaNatas;
        if (cs === '0-100') notaMaximaEscala = 100;
        else if (cs === '0-10') notaMaximaEscala = 10;
      }
    }

    return { avaliacoes, notaMinima, notaMaximaEscala, temExameRecurso: uc.temExameRecurso };
  },
};
