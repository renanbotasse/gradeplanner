import { getDatabase } from '@/db/client';
import type { GradeScale, UserProfileRecord } from '@/db/types';
import { fromBool, mapUserProfile } from '@/db/utils/mappers';

export const profileRepository = {
  async initializeDefaults(): Promise<void> {
    const db = await getDatabase();
    const profile = await db.getFirstAsync<{ id: number }>('SELECT id FROM user_profile WHERE id = 1;');
    if (!profile) {
      await db.runAsync(
        `INSERT INTO user_profile (id, name, photo_uri) VALUES (1, ?, ?);`,
        ['Student', null],
      );
    }
  },

  async getUserProfile(): Promise<UserProfileRecord> {
    await this.initializeDefaults();
    const db = await getDatabase();

    const row = await db.getFirstAsync<{
      id: number;
      name: string;
      photoUri: string | null;
      escalaNatasPadrao: string;
      notaMinimaPadrao: number;
      fusoHorario: string;
      notificacoesAtivas: number;
      idioma: string;
      formatoData: string;
      tema: string;
    }>(
      `SELECT
        id, name, photo_uri AS photoUri,
        escala_notas_padrao AS escalaNatasPadrao,
        nota_minima_padrao AS notaMinimaPadrao,
        fuso_horario AS fusoHorario,
        notificacoes_ativas AS notificacoesAtivas,
        idioma, formato_data AS formatoData, tema
       FROM user_profile WHERE id = 1;`,
    );

    if (!row) {
      return {
        id: 1,
        name: 'Student',
        photoUri: null,
        escalaNatasPadrao: '0-20',
        notaMinimaPadrao: 10,
        fusoHorario: 'Europe/Lisbon',
        notificacoesAtivas: true,
        idioma: 'pt',
        formatoData: 'DD/MM/YYYY',
        tema: 'auto',
      };
    }

    return mapUserProfile(row);
  },

  async upsertUserProfile(input: Partial<Omit<UserProfileRecord, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO user_profile (id, name, photo_uri, escala_notas_padrao, nota_minima_padrao, fuso_horario, notificacoes_ativas, idioma, formato_data, tema)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = COALESCE(excluded.name, name),
         photo_uri = COALESCE(excluded.photo_uri, photo_uri),
         escala_notas_padrao = COALESCE(excluded.escala_notas_padrao, escala_notas_padrao),
         nota_minima_padrao = COALESCE(excluded.nota_minima_padrao, nota_minima_padrao),
         fuso_horario = COALESCE(excluded.fuso_horario, fuso_horario),
         notificacoes_ativas = COALESCE(excluded.notificacoes_ativas, notificacoes_ativas),
         idioma = COALESCE(excluded.idioma, idioma),
         formato_data = COALESCE(excluded.formato_data, formato_data),
         tema = COALESCE(excluded.tema, tema);`,
      [
        input.name ?? 'Student',
        input.photoUri ?? null,
        (input.escalaNatasPadrao as GradeScale) ?? '0-20',
        input.notaMinimaPadrao ?? 10,
        input.fusoHorario ?? 'Europe/Lisbon',
        input.notificacoesAtivas !== undefined ? fromBool(input.notificacoesAtivas) : 1,
        input.idioma ?? 'pt',
        input.formatoData ?? 'DD/MM/YYYY',
        input.tema ?? 'auto',
      ],
    );
  },
};
