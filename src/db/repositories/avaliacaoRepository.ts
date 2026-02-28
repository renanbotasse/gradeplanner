import { getDatabase } from '@/db/client';
import type { AvaliacaoRecord, AvaliacaoTipo, DeadlineItem } from '@/db/types';
import { fromBool, mapAvaliacao } from '@/db/utils/mappers';

const AVALIACAO_SELECT = `SELECT id, uc_id AS ucId, nome, tipo,
  data_hora AS dataHora, peso,
  nota_obtida AS notaObtida,
  nota_maxima AS notaMaxima,
  lembrete_ativo AS lembreteAtivo,
  lembrete_antecedencia AS lembreteAntecedencia,
  anexo_url AS anexoUrl,
  notas`;

const AVALIACAO_WITH_UC_SELECT = `SELECT a.id, a.uc_id AS ucId, a.nome, a.tipo,
  a.data_hora AS dataHora, a.peso,
  a.nota_obtida AS notaObtida,
  a.nota_maxima AS notaMaxima,
  a.lembrete_ativo AS lembreteAtivo,
  a.lembrete_antecedencia AS lembreteAntecedencia,
  a.anexo_url AS anexoUrl,
  a.notas,
  uc.name AS ucNome,
  uc.semester_id AS semesterId`;

type AvaliacaoRow = {
  id: number; ucId: number; nome: string; tipo: string;
  dataHora: string; peso: number; notaObtida: number | null;
  notaMaxima: number | null; lembreteAtivo: number;
  lembreteAntecedencia: string | null; anexoUrl: string | null; notas: string | null;
};

type AvaliacaoWithUCRow = AvaliacaoRow & { ucNome: string; semesterId: number };

type AvaliacaoInput = {
  nome: string;
  tipo: AvaliacaoTipo;
  dataHora: string;
  peso: number;
  notaObtida?: number | null;
  notaMaxima?: number | null;
  lembreteAtivo?: boolean;
  lembreteAntecedencia?: number[] | null;
  anexoUrl?: string | null;
  notas?: string | null;
};

export const avaliacaoRepository = {
  async listAvaliacoesByUC(ucId: number): Promise<AvaliacaoRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AvaliacaoRow>(
      `${AVALIACAO_SELECT} FROM avaliacao WHERE uc_id = ? ORDER BY data_hora ASC;`,
      [ucId],
    );
    return rows.map(mapAvaliacao);
  },

  async getAvaliacaoById(avaliacaoId: number): Promise<AvaliacaoRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AvaliacaoRow>(
      `${AVALIACAO_SELECT} FROM avaliacao WHERE id = ?;`,
      [avaliacaoId],
    );
    return row ? mapAvaliacao(row) : null;
  },

  async listUpcomingAvaliacoes(limit?: number): Promise<Array<AvaliacaoRecord & { ucNome: string; semesterId: number }>> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const rows = await db.getAllAsync<AvaliacaoWithUCRow>(
      `${AVALIACAO_WITH_UC_SELECT}
       FROM avaliacao a
       JOIN uc ON uc.id = a.uc_id
       WHERE a.data_hora >= ?
       ORDER BY a.data_hora ASC
       ${limit ? `LIMIT ${limit}` : ''};`,
      [now],
    );
    return rows.map((row) => ({ ...mapAvaliacao(row), ucNome: row.ucNome, semesterId: row.semesterId }));
  },

  async listPendingAvaliacoes(): Promise<Array<AvaliacaoRecord & { ucNome: string; semesterId: number }>> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const rows = await db.getAllAsync<AvaliacaoWithUCRow>(
      `${AVALIACAO_WITH_UC_SELECT}
       FROM avaliacao a
       JOIN uc ON uc.id = a.uc_id
       WHERE a.data_hora < ? AND a.nota_obtida IS NULL
       ORDER BY a.data_hora DESC;`,
      [now],
    );
    return rows.map((row) => ({ ...mapAvaliacao(row), ucNome: row.ucNome, semesterId: row.semesterId }));
  },

  async listTodayAvaliacoes(): Promise<Array<AvaliacaoRecord & { ucNome: string; semesterId: number }>> {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const rows = await db.getAllAsync<AvaliacaoWithUCRow>(
      `${AVALIACAO_WITH_UC_SELECT}
       FROM avaliacao a
       JOIN uc ON uc.id = a.uc_id
       WHERE date(a.data_hora) = ?
       ORDER BY a.data_hora ASC;`,
      [today],
    );
    return rows.map((row) => ({ ...mapAvaliacao(row), ucNome: row.ucNome, semesterId: row.semesterId }));
  },

  async listAvaliacoesByDateRange(startISO: string, endISO: string): Promise<Array<AvaliacaoRecord & { ucNome: string; semesterId: number }>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AvaliacaoWithUCRow>(
      `${AVALIACAO_WITH_UC_SELECT}
       FROM avaliacao a
       JOIN uc ON uc.id = a.uc_id
       WHERE a.data_hora >= ? AND a.data_hora <= ?
       ORDER BY a.data_hora ASC;`,
      [startISO, endISO],
    );
    return rows.map((row) => ({ ...mapAvaliacao(row), ucNome: row.ucNome, semesterId: row.semesterId }));
  },

  async listUpcomingDeadlines(): Promise<DeadlineItem[]> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const rows = await db.getAllAsync<{
      source: string; sourceId: number; title: string; subtitle: string;
      ucName: string | null; dateTime: string; ucId: number | null; semesterId: number | null; eventTipo: string | null;
    }>(
      `SELECT 'avaliacao' AS source, a.id AS sourceId, a.nome AS title, u.name AS subtitle, u.name AS ucName,
              a.data_hora AS dateTime, a.uc_id AS ucId, u.semester_id AS semesterId, a.tipo AS eventTipo
       FROM avaliacao a JOIN uc u ON u.id = a.uc_id WHERE a.data_hora >= ?
       UNION ALL
       SELECT 'event' AS source, e.id AS sourceId, e.title AS title,
              CASE e.tipo WHEN 'avaliacao' THEN 'Avaliação' WHEN 'atividade' THEN 'Atividade' ELSE 'Evento' END AS subtitle,
              u.name AS ucName, e.date_time AS dateTime, e.uc_id AS ucId, NULL AS semesterId, e.tipo AS eventTipo
       FROM event e LEFT JOIN uc u ON u.id = e.uc_id WHERE e.date_time >= ?
       ORDER BY dateTime ASC;`,
      [now, now],
    );
    return rows.map((row) => ({
      id: `${row.source}-${row.sourceId}`,
      source: row.source as 'avaliacao' | 'event',
      title: row.title,
      subtitle: row.subtitle,
      ucName: row.ucName,
      dateTime: row.dateTime,
      ucId: row.ucId,
      semesterId: row.semesterId,
      avaliacaoId: row.source === 'avaliacao' ? row.sourceId : null,
      eventId: row.source === 'event' ? row.sourceId : null,
      eventTipo: row.eventTipo,
    }));
  },

  async listTodayDeadlines(): Promise<DeadlineItem[]> {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const rows = await db.getAllAsync<{
      source: string; sourceId: number; title: string; subtitle: string;
      ucName: string | null; dateTime: string; ucId: number | null; semesterId: number | null; eventTipo: string | null;
    }>(
      `SELECT 'avaliacao' AS source, a.id AS sourceId, a.nome AS title, u.name AS subtitle, u.name AS ucName,
              a.data_hora AS dateTime, a.uc_id AS ucId, u.semester_id AS semesterId, a.tipo AS eventTipo
       FROM avaliacao a JOIN uc u ON u.id = a.uc_id WHERE date(a.data_hora) = ?
       UNION ALL
       SELECT 'event' AS source, e.id AS sourceId, e.title AS title,
              CASE e.tipo WHEN 'avaliacao' THEN 'Avaliação' WHEN 'atividade' THEN 'Atividade' ELSE 'Evento' END AS subtitle,
              u.name AS ucName, e.date_time AS dateTime, e.uc_id AS ucId, NULL AS semesterId, e.tipo AS eventTipo
       FROM event e LEFT JOIN uc u ON u.id = e.uc_id WHERE date(e.date_time) = ?
       ORDER BY dateTime ASC;`,
      [today, today],
    );
    return rows.map((row) => ({
      id: `${row.source}-${row.sourceId}`,
      source: row.source as 'avaliacao' | 'event',
      title: row.title,
      subtitle: row.subtitle,
      ucName: row.ucName,
      dateTime: row.dateTime,
      ucId: row.ucId,
      semesterId: row.semesterId,
      avaliacaoId: row.source === 'avaliacao' ? row.sourceId : null,
      eventId: row.source === 'event' ? row.sourceId : null,
      eventTipo: row.eventTipo,
    }));
  },

  async createAvaliacao(input: { ucId: number } & AvaliacaoInput): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO avaliacao (uc_id, nome, tipo, data_hora, peso, nota_obtida, nota_maxima, lembrete_ativo, lembrete_antecedencia, anexo_url, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.ucId,
        input.nome,
        input.tipo,
        input.dataHora,
        input.peso,
        input.notaObtida ?? null,
        input.notaMaxima ?? null,
        fromBool(input.lembreteAtivo ?? false),
        input.lembreteAntecedencia?.length ? JSON.stringify(input.lembreteAntecedencia) : null,
        input.anexoUrl ?? null,
        input.notas ?? null,
      ],
    );
    return Number(result.lastInsertRowId);
  },

  async updateAvaliacao(avaliacaoId: number, input: AvaliacaoInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE avaliacao SET
        nome = ?, tipo = ?, data_hora = ?, peso = ?,
        nota_obtida = ?, nota_maxima = ?,
        lembrete_ativo = ?, lembrete_antecedencia = ?,
        anexo_url = ?, notas = ?
       WHERE id = ?;`,
      [
        input.nome,
        input.tipo,
        input.dataHora,
        input.peso,
        input.notaObtida ?? null,
        input.notaMaxima ?? null,
        fromBool(input.lembreteAtivo ?? false),
        input.lembreteAntecedencia?.length ? JSON.stringify(input.lembreteAntecedencia) : null,
        input.anexoUrl ?? null,
        input.notas ?? null,
        avaliacaoId,
      ],
    );
  },

  async updateAvaliacaoNota(avaliacaoId: number, notaObtida: number | null): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE avaliacao SET nota_obtida = ? WHERE id = ?;', [notaObtida, avaliacaoId]);
  },

  async deleteAvaliacao(avaliacaoId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM avaliacao WHERE id = ?;', [avaliacaoId]);
  },
};
