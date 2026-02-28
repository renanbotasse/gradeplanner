import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { evaluatePassFail } from '@/core/grading/evaluatePassFail';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { AvaliacaoTipo, GradeScale } from '@/db/types';
import { queryKeys } from '@/features/queryKeys';

// ─── Semesters ───────────────────────────────────────────────────────────────

export const useSemesters = (cursoId?: number) =>
  useQuery({
    queryKey: queryKeys.semesters(cursoId),
    queryFn: () => athenaRepository.listSemesters(cursoId),
  });

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      cursoId?: number | null;
      title: string;
      startDate: string;
      endDate: string;
      notes?: string | null;
      metaMedia?: number | null;
      metaEcts?: number | null;
    }) => athenaRepository.createSemester(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ semesterId, input }: {
      semesterId: number;
      input: { title: string; startDate: string; endDate: string; notes?: string | null; metaMedia?: number | null; metaEcts?: number | null };
    }) => athenaRepository.updateSemester(semesterId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (semesterId: number) => athenaRepository.deleteSemester(semesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['ucs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// ─── UCs ─────────────────────────────────────────────────────────────────────

export const useUCsBySemester = (semesterId: number) =>
  useQuery({
    queryKey: queryKeys.ucs(semesterId),
    queryFn: () => athenaRepository.listUCsBySemester(semesterId),
  });

export const useUC = (ucId: number) =>
  useQuery({
    queryKey: queryKeys.uc(ucId),
    queryFn: () => athenaRepository.getUCById(ucId),
  });

export const useCreateUC = (semesterId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      icon?: string;
      ects?: number;
      professores?: string[];
      notes?: string | null;
      escalaNatas?: GradeScale | null;
      notaMinimaAprovacao?: number | null;
      temExameRecurso?: boolean;
      pesoMinProva?: number | null;
      linkUc?: string | null;
    }) => athenaRepository.createUC({ semesterId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ucs(semesterId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateUC = (semesterId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ucId, input }: {
      ucId: number;
      input: {
        name: string;
        icon?: string;
        ects?: number;
        professores?: string[];
        notes?: string | null;
        escalaNatas?: GradeScale | null;
        notaMinimaAprovacao?: number | null;
        temExameRecurso?: boolean;
        pesoMinProva?: number | null;
        linkUc?: string | null;
      };
    }) => athenaRepository.updateUC(ucId, input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ucs(semesterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.uc(vars.ucId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucStatus(vars.ucId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteUC = (semesterId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ucId: number) => athenaRepository.deleteUC(ucId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ucs(semesterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.semesterInsights(semesterId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// ─── Avaliações ───────────────────────────────────────────────────────────────

export const useAvaliacoes = (ucId: number) =>
  useQuery({
    queryKey: queryKeys.avaliacoes(ucId),
    queryFn: () => athenaRepository.listAvaliacoesByUC(ucId),
  });

export const useCreateAvaliacao = (ucId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
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
    }) => athenaRepository.createAvaliacao({ ucId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avaliacoes(ucId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucStatus(ucId) });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateAvaliacao = (ucId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ avaliacaoId, input }: {
      avaliacaoId: number;
      input: {
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
    }) => athenaRepository.updateAvaliacao(avaliacaoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avaliacoes(ucId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucStatus(ucId) });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateAvaliacaoNota = (ucId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ avaliacaoId, notaObtida }: { avaliacaoId: number; notaObtida: number | null }) =>
      athenaRepository.updateAvaliacaoNota(avaliacaoId, notaObtida),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avaliacoes(ucId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucStatus(ucId) });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteAvaliacao = (ucId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avaliacaoId: number) => athenaRepository.deleteAvaliacao(avaliacaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avaliacoes(ucId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucStatus(ucId) });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUCEvents = (ucId: number) =>
  useQuery({
    queryKey: ['events', 'uc', ucId],
    queryFn: () => athenaRepository.listEventsByUC(ucId),
  });

// ─── UC Status ────────────────────────────────────────────────────────────────

export const useUCStatus = (ucId: number) =>
  useQuery({
    queryKey: queryKeys.ucStatus(ucId),
    queryFn: async () => {
      const { avaliacoes, notaMinima, notaMaximaEscala, temExameRecurso } =
        await athenaRepository.getUCGradeInfo(ucId);
      const coreAvaliacoes = avaliacoes.map((a) => ({
        id: a.id,
        ucId: a.ucId,
        nome: a.nome,
        tipo: a.tipo,
        dataHora: a.dataHora,
        peso: a.peso,
        notaObtida: a.notaObtida,
        notaMaxima: a.notaMaxima,
      }));
      return evaluatePassFail(coreAvaliacoes, notaMinima, notaMaximaEscala, temExameRecurso);
    },
  });

// ─── Semester Insights ────────────────────────────────────────────────────────

export const useSemesterInsights = (semesterId: number) =>
  useQuery({
    queryKey: queryKeys.semesterInsights(semesterId),
    queryFn: () => athenaRepository.getSemesterInsights(semesterId),
  });
