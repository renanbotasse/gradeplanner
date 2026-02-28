import { calculateGradeOverview } from '@/core/grading/calculateFinalGrade';
import { computeNeededScore } from '@/core/grading/computeNeededScore';
import type { AvaliacaoComponent, UCStatus, UCStatusResult } from '@/core/models';

/**
 * Avalia o estado de aprovação de uma UC com base em 6 estados (spec §3.4).
 *
 * Se pesoRestante = 0:
 *   média >= notaMinima → 'aprovado'
 *   média < notaMinima  → 'reprovado'
 * Se pesoRestante > 0:
 *   notaNecessaria <= 0       → 'aprovado' (já garantido)
 *   notaNecessaria <= max*0.7 → 'ok'
 *   notaNecessaria <= max     → 'em_risco'
 *   notaNecessaria > max AND tem_exame_recurso  → 'precisa_exame'
 *   notaNecessaria > max AND !tem_exame_recurso → 'impossivel'
 */
export const evaluatePassFail = (
  avaliacoes: AvaliacaoComponent[],
  notaMinima: number,
  notaMaxima: number,
  temExameRecurso: boolean,
): UCStatusResult => {
  const overview = calculateGradeOverview(avaliacoes);
  const needed = computeNeededScore(avaliacoes, notaMinima, notaMaxima, temExameRecurso);

  const fullOverview = { ...overview, notaNecessaria: needed.notaNecessaria };

  let status: UCStatus;

  if (overview.pesoRestante <= 0) {
    const media = overview.pesosAvaliados > 0
      ? avaliacoes.filter(a => a.notaObtida !== null).reduce((acc, a) => acc + (a.notaObtida ?? 0) * a.peso, 0) / overview.pesosAvaliados
      : 0;
    status = media >= notaMinima ? 'aprovado' : 'reprovado';
  } else {
    const nn = needed.notaNecessaria ?? 0;
    if (nn <= 0) {
      status = 'aprovado';
    } else if (nn <= notaMaxima * 0.7) {
      status = 'ok';
    } else if (nn <= notaMaxima) {
      status = 'em_risco';
    } else if (temExameRecurso) {
      status = 'precisa_exame';
    } else {
      status = 'impossivel';
    }
  }

  return { status, overview: fullOverview };
};
