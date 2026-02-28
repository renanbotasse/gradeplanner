import type { AvaliacaoComponent, NeededScoreResult } from '@/core/models';

/**
 * Calcula a nota necessária no restante para passar (spec §3.3).
 *
 *   pesoRestante = 100 - pesosAvaliados
 *   pontosNecessariosTotal = notaMinima × 100
 *   pontosQueFaltam = pontosNecessariosTotal - notaPonderada
 *   notaNecessariaNoRestante = pontosQueFaltam / pesoRestante
 */
export const computeNeededScore = (
  avaliacoes: AvaliacaoComponent[],
  notaMinima: number,
  notaMaxima: number,
  temExameRecurso: boolean,
): NeededScoreResult => {
  const avaliadas = avaliacoes.filter((a) => a.notaObtida !== null);
  const pesosAvaliados = avaliadas.reduce((acc, a) => acc + a.peso, 0);
  const notaPonderada = avaliadas.reduce((acc, a) => acc + (a.notaObtida ?? 0) * a.peso, 0);
  const pesoRestante = Math.max(0, 100 - pesosAvaliados);

  if (pesoRestante <= 0) {
    const media = pesosAvaliados > 0 ? notaPonderada / pesosAvaliados : 0;
    return {
      notaNecessaria: null,
      estado: media >= notaMinima ? 'ja_aprovado' : 'concluida',
    };
  }

  const pontosNecessariosTotal = notaMinima * 100;
  const pontosQueFaltam = pontosNecessariosTotal - notaPonderada;
  const notaNecessaria = pontosQueFaltam / pesoRestante;

  if (notaNecessaria <= 0) {
    return { notaNecessaria: 0, estado: 'ja_aprovado' };
  }

  if (notaNecessaria > notaMaxima) {
    return {
      notaNecessaria,
      estado: temExameRecurso ? 'precisa_exame' : 'impossivel',
    };
  }

  return { notaNecessaria, estado: 'em_jogo' };
};
