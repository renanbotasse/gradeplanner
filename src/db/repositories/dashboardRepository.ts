import type { DashboardData, SemesterStatus } from '@/db/types';
import { mapSemesterStatus } from '@/db/utils/mappers';
import { avaliacaoRepository } from './avaliacaoRepository';
import { courseRepository } from './courseRepository';
import { semesterRepository } from './semesterRepository';
import { ucRepository } from './ucRepository';

export const dashboardRepository = {
  async getDashboardData(): Promise<DashboardData> {
    const curso = await courseRepository.getActiveCurso();
    if (!curso) {
      return {
        curso: null,
        semesterAtual: null,
        semesterStatus: null,
        mediaAtual: null,
        mediaCurso: null,
        proximaAvaliacao: null,
        ucSummary: { aprovadas: 0, emRisco: 0, impossiveis: 0 },
      };
    }

    const semesters = await semesterRepository.listSemesters(curso.id);
    const semesterAtual = semesters.find((s) => mapSemesterStatus(s.startDate, s.endDate) === 'atual') ?? null;
    const semesterStatus = semesterAtual ? 'atual' as SemesterStatus : null;

    const proximaAvaliacao = (await avaliacaoRepository.listUpcomingAvaliacoes(1))[0] ?? null;

    let mediaAtual: number | null = null;
    if (semesterAtual) {
      const insights = await dashboardRepository.getSemesterInsights(semesterAtual.id);
      mediaAtual = insights.semesterAverage;
    }

    let mediaCurso: number | null = null;
    if (semesters.length > 0) {
      const allInsights = await Promise.all(semesters.map((s) => dashboardRepository.getSemesterInsights(s.id)));
      const validAverages = allInsights.map((i) => i.semesterAverage).filter((a): a is number => a !== null);
      if (validAverages.length > 0) {
        mediaCurso = validAverages.reduce((acc, v) => acc + v, 0) / validAverages.length;
      }
    }

    return {
      curso,
      semesterAtual,
      semesterStatus,
      mediaAtual,
      mediaCurso,
      proximaAvaliacao,
      ucSummary: { aprovadas: 0, emRisco: 0, impossiveis: 0 },
    };
  },

  async getSemesterInsights(semesterId: number): Promise<{
    semesterAverage: number | null;
    totalEcts: number;
    approvedEcts: number;
  }> {
    const ucs = await ucRepository.listUCsBySemester(semesterId);
    if (!ucs.length) return { semesterAverage: null, totalEcts: 0, approvedEcts: 0 };

    const totalEcts = ucs.reduce((acc, uc) => acc + uc.ects, 0);
    let approvedCount = 0;
    let gradeSum = 0;
    let approvedEcts = 0;

    for (const uc of ucs) {
      const avaliacoes = await avaliacaoRepository.listAvaliacoesByUC(uc.id);
      const withGrade = avaliacoes.filter((a) => a.notaObtida !== null);
      if (!withGrade.length) continue;

      const pesosAvaliados = withGrade.reduce((acc, a) => acc + a.peso, 0);
      const notaPonderada = withGrade.reduce((acc, a) => acc + (a.notaObtida ?? 0) * a.peso, 0);
      const media = pesosAvaliados > 0 ? notaPonderada / pesosAvaliados : 0;

      const notaMinima = uc.notaMinimaAprovacao ?? 10;
      const pesoRestante = 100 - avaliacoes.reduce((acc, a) => acc + a.peso, 0);

      if (pesoRestante <= 0 && media >= notaMinima) {
        approvedCount += 1;
        gradeSum += media;
        approvedEcts += uc.ects;
      }
    }

    return {
      semesterAverage: approvedCount ? gradeSum / approvedCount : null,
      totalEcts,
      approvedEcts,
    };
  },
};
