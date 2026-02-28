import { useQuery } from '@tanstack/react-query';

import { athenaRepository } from '@/db/repositories/athenaRepository';
import { queryKeys } from '@/features/queryKeys';

export const useUpcomingAvaliacoes = (limit?: number) =>
  useQuery({
    queryKey: queryKeys.upcomingAvaliacoes,
    queryFn: () => athenaRepository.listUpcomingAvaliacoes(limit),
  });

export const usePendingAvaliacoes = () =>
  useQuery({
    queryKey: queryKeys.pendingAvaliacoes,
    queryFn: () => athenaRepository.listPendingAvaliacoes(),
  });

export const useTodayAvaliacoes = () =>
  useQuery({
    queryKey: queryKeys.todayAvaliacoes,
    queryFn: () => athenaRepository.listTodayAvaliacoes(),
  });

// ─── Deadline hooks (avaliacoes + events merged) ──────────────────────────────

export const useUpcomingDeadlines = () =>
  useQuery({
    queryKey: queryKeys.upcomingDeadlines,
    queryFn: () => athenaRepository.listUpcomingDeadlines(),
  });

export const useTodayDeadlines = () =>
  useQuery({
    queryKey: queryKeys.todayDeadlines,
    queryFn: () => athenaRepository.listTodayDeadlines(),
  });
