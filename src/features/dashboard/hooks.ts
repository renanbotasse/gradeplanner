import { useQuery } from '@tanstack/react-query';

import { athenaRepository } from '@/db/repositories/athenaRepository';
import { queryKeys } from '@/features/queryKeys';

export const useDashboardData = () =>
  useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => athenaRepository.getDashboardData(),
  });
