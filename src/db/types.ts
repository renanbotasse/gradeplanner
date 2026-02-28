export type GradeScale = '0-20' | '0-100' | '0-10';

export type AvaliacaoTipo =
  | 'avaliacao'
  | 'atividade'
  | 'evento'
  | 'prova'
  | 'trabalho'
  | 'quiz'
  | 'projeto'
  | 'participacao'
  | 'exame'
  | 'outro';

export type SemesterStatus = 'atual' | 'passado' | 'futuro';

export type EventPriority = 'low' | 'medium' | 'high';

export type EventTipo = 'avaliacao' | 'atividade' | 'evento';

export interface UserProfileRecord {
  id: number;
  name: string;
  photoUri: string | null;
  escalaNatasPadrao: GradeScale;
  notaMinimaPadrao: number;
  fusoHorario: string;
  notificacoesAtivas: boolean;
  idioma: string;
  formatoData: string;
  tema: string;
}

export interface CursoRecord {
  id: number;
  nome: string;
  instituicao: string | null;
  dataInicio: string;
  dataFimPrevista: string | null;
  escalaNatas: GradeScale;
  notaMinimaAprovacao: number;
  totalSemestres: number | null;
  totalEcts: number | null;
  ativo: boolean;
}

export interface SemesterRecord {
  id: number;
  cursoId: number | null;
  title: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  metaMedia: number | null;
  metaEcts: number | null;
}

export interface UCRecord {
  id: number;
  semesterId: number;
  name: string;
  icon: string;
  ects: number;
  professores: string[];
  notes: string | null;
  escalaNatas: GradeScale | null;
  notaMinimaAprovacao: number | null;
  temExameRecurso: boolean;
  pesoMinProva: number | null;
  linkUc: string | null;
}

export interface AvaliacaoRecord {
  id: number;
  ucId: number;
  nome: string;
  tipo: AvaliacaoTipo;
  dataHora: string;
  peso: number;
  notaObtida: number | null;
  notaMaxima: number | null;
  lembreteAtivo: boolean;
  lembreteAntecedencia: number[] | null;
  anexoUrl: string | null;
  notas: string | null;
}

export interface EventRecord {
  id: number;
  semesterId: number | null;
  ucId: number | null;
  title: string;
  dateTime: string;
  priority: EventPriority;
  completed: boolean;
  notes: string | null;
  tipo: EventTipo;
}

export interface DeadlineItem {
  id: string;                        // 'avaliacao-{id}' | 'event-{id}'
  source: 'avaliacao' | 'event';
  title: string;
  subtitle: string;                  // UC name (avaliacao) or tipo label (event)
  ucName: string | null;
  dateTime: string;
  ucId: number | null;
  semesterId: number | null;
  avaliacaoId: number | null;
  eventId: number | null;
  eventTipo: string | null;
}

export interface DashboardData {
  curso: CursoRecord | null;
  semesterAtual: SemesterRecord | null;
  semesterStatus: SemesterStatus | null;
  mediaAtual: number | null;
  mediaCurso: number | null;
  proximaAvaliacao: AvaliacaoRecord & { ucNome: string } | null;
  ucSummary: {
    aprovadas: number;
    emRisco: number;
    impossiveis: number;
  };
}
