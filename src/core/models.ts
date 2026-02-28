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

export type AvaliacaoStatus = 'planeada' | 'pendente' | 'avaliada';

// 6 estados de UC
export type UCStatus =
  | 'aprovado'
  | 'reprovado'
  | 'ok'
  | 'em_risco'
  | 'impossivel'
  | 'precisa_exame';

export interface AvaliacaoComponent {
  id: number;
  ucId: number;
  nome: string;
  tipo: AvaliacaoTipo;
  dataHora: string;
  peso: number;
  notaObtida: number | null;
  notaMaxima: number | null;
}

export interface UCGradeOverview {
  mediaParcial: number | null;
  projecao: number | null;
  notaNecessaria: number | null;
  pesosAvaliados: number;
  pesoRestante: number;
  pesoTotal: number;
}

export interface UCStatusResult {
  status: UCStatus;
  overview: UCGradeOverview;
}

export interface NeededScoreResult {
  notaNecessaria: number | null;
  estado: 'ja_aprovado' | 'em_jogo' | 'impossivel' | 'precisa_exame' | 'concluida';
}
