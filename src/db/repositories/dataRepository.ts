import type { SQLiteBindValue } from 'expo-sqlite';
import { getDatabase, runInTransaction } from '@/db/client';
import { exportTableNames } from '@/db/schema';
import type { AvaliacaoTipo, EventTipo } from '@/db/types';
import { clearAcademicOrder, clearImportOrder } from '@/db/utils/constants';
import { fromBool } from '@/db/utils/mappers';
import { addDays, toDateOnlyString, toDateTimeIso } from '@/db/utils/dates';

export const dataRepository = {
  async clearAcademicData(): Promise<void> {
    await runInTransaction(async (db) => {
      for (const table of clearAcademicOrder) {
        await db.runAsync(`DELETE FROM ${table};`);
      }
    });
  },

  async seedMockData(): Promise<void> {
    const now = new Date();
    const currentStart = toDateOnlyString(addDays(now, -45));
    const currentEnd = toDateOnlyString(addDays(now, 95));
    const pastStart = toDateOnlyString(addDays(now, -280));
    const pastEnd = toDateOnlyString(addDays(now, -120));

    await runInTransaction(async (db) => {
      for (const table of clearAcademicOrder) {
        await db.runAsync(`DELETE FROM ${table};`);
      }

      const cursoResult = await db.runAsync(
        `INSERT INTO curso (nome, instituicao, data_inicio, data_fim_prevista, escala_notas, nota_minima_aprovacao, total_semestres, total_ects, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        ['LEI - UAb', 'Universidade Aberta', pastStart, currentEnd, '0-20', 10, 6, 180],
      );
      const cursoId = Number(cursoResult.lastInsertRowId);

      const pastSemesterResult = await db.runAsync(
        `INSERT INTO semester (curso_id, title, start_date, end_date, notes, meta_media, meta_ects)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [cursoId, '1.º Semestre - 1.º Ano', pastStart, pastEnd, 'Semestre concluído', 14, 30],
      );
      const pastSemesterId = Number(pastSemesterResult.lastInsertRowId);

      const currentSemesterResult = await db.runAsync(
        `INSERT INTO semester (curso_id, title, start_date, end_date, notes, meta_media, meta_ects)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [cursoId, '2.º Semestre - 1.º Ano', currentStart, currentEnd, 'Semestre atual', 15, 30],
      );
      const currentSemesterId = Number(currentSemesterResult.lastInsertRowId);

      const insertUc = async (input: {
        semesterId: number;
        name: string;
        icon: string;
        ects: number;
        notes?: string;
      }): Promise<number> => {
        const result = await db.runAsync(
          `INSERT INTO uc (semester_id, name, icon, ects, professores, notes, escala_notas, nota_minima_aprovacao, tem_exame_recurso, peso_minimo_prova, link_uc)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            input.semesterId, input.name, input.icon, input.ects,
            JSON.stringify(['Docente Responsável']), input.notes ?? null,
            '0-20', 10, 0, null, null,
          ],
        );
        return Number(result.lastInsertRowId);
      };

      const ucAlg = await insertUc({ semesterId: currentSemesterId, name: 'Algoritmos e Estruturas de Dados', icon: 'code', ects: 6 });
      const ucBd = await insertUc({ semesterId: currentSemesterId, name: 'Bases de Dados', icon: 'storage', ects: 6 });
      const ucEs = await insertUc({ semesterId: currentSemesterId, name: 'Engenharia de Software', icon: 'build', ects: 7 });
      const ucMd = await insertUc({ semesterId: currentSemesterId, name: 'Matemática Discreta', icon: 'functions', ects: 5 });
      const ucPast = await insertUc({ semesterId: pastSemesterId, name: 'Programação I', icon: 'terminal', ects: 6, notes: 'UC concluída' });

      const insertAvaliacao = async (input: {
        ucId: number;
        nome: string;
        tipo: AvaliacaoTipo;
        dayOffset: number;
        hour: number;
        minute: number;
        peso: number;
        notaObtida?: number | null;
        notas?: string | null;
      }): Promise<void> => {
        await db.runAsync(
          `INSERT INTO avaliacao (uc_id, nome, tipo, data_hora, peso, nota_obtida, nota_maxima, lembrete_ativo, lembrete_antecedencia, anexo_url, notas)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            input.ucId, input.nome, input.tipo,
            toDateTimeIso(now, input.dayOffset, input.hour, input.minute),
            input.peso, input.notaObtida ?? null, 20, 1,
            JSON.stringify([1440]), null, input.notas ?? null,
          ],
        );
      };

      await insertAvaliacao({ ucId: ucAlg, nome: 'Mini-teste 1', tipo: 'avaliacao', dayOffset: -14, hour: 10, minute: 0, peso: 20, notaObtida: 15 });
      await insertAvaliacao({ ucId: ucAlg, nome: 'Projeto intermédio', tipo: 'atividade', dayOffset: 2, hour: 23, minute: 0, peso: 30 });
      await insertAvaliacao({ ucId: ucAlg, nome: 'Exame final', tipo: 'avaliacao', dayOffset: 21, hour: 9, minute: 0, peso: 50 });

      await insertAvaliacao({ ucId: ucBd, nome: 'Ficha SQL', tipo: 'atividade', dayOffset: -8, hour: 18, minute: 0, peso: 20, notaObtida: 16 });
      await insertAvaliacao({ ucId: ucBd, nome: 'Trabalho prático', tipo: 'avaliacao', dayOffset: 5, hour: 23, minute: 30, peso: 35 });
      await insertAvaliacao({ ucId: ucBd, nome: 'Teste', tipo: 'avaliacao', dayOffset: 16, hour: 10, minute: 0, peso: 45 });

      await insertAvaliacao({ ucId: ucEs, nome: 'Sprint review', tipo: 'evento', dayOffset: 1, hour: 14, minute: 0, peso: 15, notas: 'Apresentação em grupo' });
      await insertAvaliacao({ ucId: ucEs, nome: 'Entrega final', tipo: 'atividade', dayOffset: 7, hour: 23, minute: 55, peso: 35 });
      await insertAvaliacao({ ucId: ucEs, nome: 'Prova escrita', tipo: 'avaliacao', dayOffset: 20, hour: 9, minute: 30, peso: 50 });

      await insertAvaliacao({ ucId: ucMd, nome: 'Questionário 1', tipo: 'avaliacao', dayOffset: -20, hour: 11, minute: 0, peso: 25, notaObtida: 13 });
      await insertAvaliacao({ ucId: ucMd, nome: 'Questionário 2', tipo: 'avaliacao', dayOffset: 3, hour: 11, minute: 0, peso: 25 });
      await insertAvaliacao({ ucId: ucMd, nome: 'Exame', tipo: 'avaliacao', dayOffset: 24, hour: 9, minute: 0, peso: 50 });

      await insertAvaliacao({ ucId: ucPast, nome: 'Projeto final', tipo: 'avaliacao', dayOffset: -160, hour: 9, minute: 0, peso: 100, notaObtida: 17 });

      const insertEvent = async (input: {
        semesterId?: number | null;
        ucId?: number | null;
        title: string;
        tipo: EventTipo;
        dayOffset: number;
        hour: number;
        minute: number;
        completed?: boolean;
        notes?: string;
      }): Promise<void> => {
        await db.runAsync(
          `INSERT INTO event (semester_id, uc_id, title, date_time, priority, completed, notes, tipo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            input.semesterId ?? null, input.ucId ?? null, input.title,
            toDateTimeIso(now, input.dayOffset, input.hour, input.minute),
            'medium', fromBool(input.completed ?? false), input.notes ?? null, input.tipo,
          ],
        );
      };

      await insertEvent({ semesterId: currentSemesterId, title: 'Workshop de Carreira', tipo: 'evento', dayOffset: 2, hour: 18, minute: 30, notes: 'Auditório principal' });
      await insertEvent({ semesterId: currentSemesterId, ucId: ucEs, title: 'Reunião de projeto', tipo: 'atividade', dayOffset: 4, hour: 17, minute: 0 });
      await insertEvent({ semesterId: pastSemesterId, title: 'Fecho do semestre anterior', tipo: 'evento', dayOffset: -130, hour: 12, minute: 0, completed: true });
    });
  },

  async exportToJson(): Promise<string> {
    const db = await getDatabase();
    const data: Record<string, unknown[]> = {};
    for (const table of exportTableNames) {
      data[table] = await db.getAllAsync(`SELECT * FROM ${table};`);
    }
    return JSON.stringify({ app: 'ValkeyGradeGate', version: 2, exportedAt: new Date().toISOString(), data }, null, 2);
  },

  async importFromJson(rawJson: string): Promise<void> {
    const parsed = JSON.parse(rawJson) as { data?: Record<string, Array<Record<string, unknown>>> };
    if (!parsed.data) throw new Error('Invalid import file.');

    await runInTransaction(async (db) => {
      await db.execAsync('PRAGMA foreign_keys = OFF;');
      for (const table of clearImportOrder) {
        await db.runAsync(`DELETE FROM ${table};`);
      }
      for (const table of exportTableNames) {
        const rows = parsed.data?.[table] ?? [];
        for (const row of rows) {
          const columns = Object.keys(row);
          if (!columns.length) continue;
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map((col) => row[col] ?? null) as SQLiteBindValue[];
          await db.runAsync(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders});`, ...values);
        }
      }
      await db.execAsync('PRAGMA foreign_keys = ON;');
    });
  },
};
