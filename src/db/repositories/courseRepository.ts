import { getDatabase } from '@/db/client';
import type { CursoRecord, GradeScale } from '@/db/types';
import { mapCurso } from '@/db/utils/mappers';

const CURSO_SELECT = `SELECT id, nome, instituicao,
  data_inicio AS dataInicio,
  data_fim_prevista AS dataFimPrevista,
  escala_notas AS escalaNatas,
  nota_minima_aprovacao AS notaMinimaAprovacao,
  total_semestres AS totalSemestres,
  total_ects AS totalEcts,
  ativo`;

type CursoRow = {
  id: number; nome: string; instituicao: string | null;
  dataInicio: string; dataFimPrevista: string | null;
  escalaNatas: string; notaMinimaAprovacao: number;
  totalSemestres: number | null; totalEcts: number | null; ativo: number;
};

type CursoInput = {
  nome: string;
  instituicao?: string | null;
  dataInicio: string;
  dataFimPrevista?: string | null;
  escalaNatas?: GradeScale;
  notaMinimaAprovacao?: number;
  totalSemestres?: number | null;
  totalEcts?: number | null;
};

export const courseRepository = {
  async listCursos(): Promise<CursoRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CursoRow>(
      `${CURSO_SELECT} FROM curso ORDER BY ativo DESC, nome ASC;`,
    );
    return rows.map(mapCurso);
  },

  async getActiveCurso(): Promise<CursoRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CursoRow>(
      `${CURSO_SELECT} FROM curso WHERE ativo = 1 LIMIT 1;`,
    );
    return row ? mapCurso(row) : null;
  },

  async createCurso(input: CursoInput): Promise<number> {
    const db = await getDatabase();
    await db.runAsync('UPDATE curso SET ativo = 0;');
    const result = await db.runAsync(
      `INSERT INTO curso (nome, instituicao, data_inicio, data_fim_prevista, escala_notas, nota_minima_aprovacao, total_semestres, total_ects, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);`,
      [
        input.nome,
        input.instituicao ?? null,
        input.dataInicio,
        input.dataFimPrevista ?? null,
        input.escalaNatas ?? '0-20',
        input.notaMinimaAprovacao ?? 10,
        input.totalSemestres ?? null,
        input.totalEcts ?? null,
      ],
    );
    return Number(result.lastInsertRowId);
  },

  async updateCurso(cursoId: number, input: CursoInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE curso SET
        nome = ?, instituicao = ?, data_inicio = ?,
        data_fim_prevista = ?, escala_notas = ?,
        nota_minima_aprovacao = ?, total_semestres = ?, total_ects = ?
       WHERE id = ?;`,
      [
        input.nome,
        input.instituicao ?? null,
        input.dataInicio,
        input.dataFimPrevista ?? null,
        input.escalaNatas ?? '0-20',
        input.notaMinimaAprovacao ?? 10,
        input.totalSemestres ?? null,
        input.totalEcts ?? null,
        cursoId,
      ],
    );
  },

  async setActiveCurso(cursoId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE curso SET ativo = 0;');
    await db.runAsync('UPDATE curso SET ativo = 1 WHERE id = ?;', [cursoId]);
  },

  async deleteCurso(cursoId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM curso WHERE id = ?;', [cursoId]);
    const remaining = await db.getFirstAsync<{ id: number }>('SELECT id FROM curso WHERE ativo = 1 LIMIT 1;');
    if (!remaining) {
      const any = await db.getFirstAsync<{ id: number }>('SELECT id FROM curso ORDER BY id DESC LIMIT 1;');
      if (any) {
        await db.runAsync('UPDATE curso SET ativo = 1 WHERE id = ?;', [any.id]);
      }
    }
  },
};
