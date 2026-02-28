import type {
  AvaliacaoRecord,
  AvaliacaoTipo,
  CursoRecord,
  EventPriority,
  EventRecord,
  EventTipo,
  GradeScale,
  SemesterRecord,
  SemesterStatus,
  UCRecord,
  UserProfileRecord,
} from '@/db/types';
import { fromBool, parseJson, toBool } from './converters';

export const mapSemesterStatus = (startDate: string, endDate: string): SemesterStatus => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'futuro';
  if (now > end) return 'passado';
  return 'atual';
};

export const mapUserProfile = (row: {
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
}): UserProfileRecord => ({
  id: row.id,
  name: row.name,
  photoUri: row.photoUri,
  escalaNatasPadrao: row.escalaNatasPadrao as GradeScale,
  notaMinimaPadrao: row.notaMinimaPadrao,
  fusoHorario: row.fusoHorario,
  notificacoesAtivas: toBool(row.notificacoesAtivas),
  idioma: row.idioma,
  formatoData: row.formatoData,
  tema: row.tema,
});

export const mapCurso = (row: {
  id: number;
  nome: string;
  instituicao: string | null;
  dataInicio: string;
  dataFimPrevista: string | null;
  escalaNatas: string;
  notaMinimaAprovacao: number;
  totalSemestres: number | null;
  totalEcts: number | null;
  ativo: number;
}): CursoRecord => ({
  id: row.id,
  nome: row.nome,
  instituicao: row.instituicao,
  dataInicio: row.dataInicio,
  dataFimPrevista: row.dataFimPrevista,
  escalaNatas: row.escalaNatas as GradeScale,
  notaMinimaAprovacao: row.notaMinimaAprovacao,
  totalSemestres: row.totalSemestres,
  totalEcts: row.totalEcts,
  ativo: toBool(row.ativo),
});

export const mapSemester = (row: {
  id: number;
  cursoId: number | null;
  title: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  metaMedia: number | null;
  metaEcts: number | null;
}): SemesterRecord => ({
  id: row.id,
  cursoId: row.cursoId,
  title: row.title,
  startDate: row.startDate,
  endDate: row.endDate,
  notes: row.notes,
  metaMedia: row.metaMedia,
  metaEcts: row.metaEcts,
});

export const mapUC = (row: {
  id: number;
  semesterId: number;
  name: string;
  icon: string | null;
  ects: number;
  professores: string | null;
  notes: string | null;
  escalaNatas: string | null;
  notaMinimaAprovacao: number | null;
  temExameRecurso: number;
  pesoMinProva: number | null;
  linkUc: string | null;
}): UCRecord => ({
  id: row.id,
  semesterId: row.semesterId,
  name: row.name,
  icon: row.icon ?? 'functions',
  ects: row.ects,
  professores: parseJson<string[]>(row.professores, []),
  notes: row.notes,
  escalaNatas: row.escalaNatas as GradeScale | null,
  notaMinimaAprovacao: row.notaMinimaAprovacao,
  temExameRecurso: toBool(row.temExameRecurso),
  pesoMinProva: row.pesoMinProva,
  linkUc: row.linkUc,
});

export const mapAvaliacao = (row: {
  id: number;
  ucId: number;
  nome: string;
  tipo: string;
  dataHora: string;
  peso: number;
  notaObtida: number | null;
  notaMaxima: number | null;
  lembreteAtivo: number;
  lembreteAntecedencia: string | null;
  anexoUrl: string | null;
  notas: string | null;
}): AvaliacaoRecord => ({
  id: row.id,
  ucId: row.ucId,
  nome: row.nome,
  tipo: row.tipo as AvaliacaoTipo,
  dataHora: row.dataHora,
  peso: row.peso,
  notaObtida: row.notaObtida,
  notaMaxima: row.notaMaxima,
  lembreteAtivo: toBool(row.lembreteAtivo),
  lembreteAntecedencia: parseJson<number[]>(row.lembreteAntecedencia, []) || null,
  anexoUrl: row.anexoUrl,
  notas: row.notas,
});

export const mapEvent = (row: {
  id: number;
  semesterId: number | null;
  ucId: number | null;
  title: string;
  dateTime: string;
  priority: string;
  completed: number;
  notes: string | null;
  tipo: string | null;
}): EventRecord => ({
  id: row.id,
  semesterId: row.semesterId,
  ucId: row.ucId,
  title: row.title,
  dateTime: row.dateTime,
  priority: row.priority as EventPriority,
  completed: toBool(row.completed),
  notes: row.notes,
  tipo: ((row.tipo ?? 'evento') as EventTipo),
});

// Re-export fromBool for use in repositories that need it
export { fromBool };
