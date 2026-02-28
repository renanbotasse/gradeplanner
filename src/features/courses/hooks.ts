import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { GradeScale } from '@/db/types';
import { queryKeys } from '@/features/queryKeys';

export const useCursos = () =>
  useQuery({
    queryKey: queryKeys.cursos,
    queryFn: () => athenaRepository.listCursos(),
  });

export const useActiveCurso = () =>
  useQuery({
    queryKey: queryKeys.activeCurso,
    queryFn: () => athenaRepository.getActiveCurso(),
  });

export const useCreateCurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      nome: string;
      instituicao?: string | null;
      dataInicio: string;
      dataFimPrevista?: string | null;
      escalaNatas?: GradeScale;
      notaMinimaAprovacao?: number;
      totalSemestres?: number | null;
      totalEcts?: number | null;
    }) => athenaRepository.createCurso(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cursos });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeCurso });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateCurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cursoId, input }: {
      cursoId: number;
      input: {
        nome: string;
        instituicao?: string | null;
        dataInicio: string;
        dataFimPrevista?: string | null;
        escalaNatas?: GradeScale;
        notaMinimaAprovacao?: number;
        totalSemestres?: number | null;
        totalEcts?: number | null;
      };
    }) => athenaRepository.updateCurso(cursoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cursos });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeCurso });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useSetActiveCurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cursoId: number) => athenaRepository.setActiveCurso(cursoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cursos });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeCurso });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });
};

export const useDeleteCurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cursoId: number) => athenaRepository.deleteCurso(cursoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cursos });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeCurso });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
