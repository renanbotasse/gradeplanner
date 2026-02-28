import type { AvaliacaoComponent, UCGradeOverview } from '@/core/models';

/**
 * Calcula a visão geral de notas de uma UC com base nas avaliações.
 *
 * Média Parcial (spec §3.1):
 *   pesosAvaliados = Σ peso_i  para i com notaObtida != null
 *   notaPonderada  = Σ (nota_i × peso_i)  para i com notaObtida != null
 *   mediaParcial   = notaPonderada / pesosAvaliados
 *
 * Projeção (spec §3.2):
 *   pesoRestante = 100 - pesosAvaliados
 *   projecao = (notaPonderada + (notaHipotetica × pesoRestante)) / 100
 */
export const calculateGradeOverview = (
  avaliacoes: AvaliacaoComponent[],
  notaHipotetica?: number,
): UCGradeOverview => {
  const pesoTotal = avaliacoes.reduce((acc, a) => acc + a.peso, 0);
  const avaliadas = avaliacoes.filter((a) => a.notaObtida !== null);

  const pesosAvaliados = avaliadas.reduce((acc, a) => acc + a.peso, 0);
  const notaPonderada = avaliadas.reduce((acc, a) => acc + (a.notaObtida ?? 0) * a.peso, 0);

  const mediaParcial = pesosAvaliados > 0 ? notaPonderada / pesosAvaliados : null;

  const pesoRestante = Math.max(0, 100 - pesosAvaliados);

  let projecao: number | null = null;
  if (notaHipotetica !== undefined && pesoRestante > 0) {
    projecao = (notaPonderada + notaHipotetica * pesoRestante) / 100;
  } else if (pesosAvaliados > 0) {
    projecao = notaPonderada / 100;
  }

  return {
    mediaParcial,
    projecao,
    notaNecessaria: null,
    pesosAvaliados,
    pesoRestante,
    pesoTotal,
  };
};
