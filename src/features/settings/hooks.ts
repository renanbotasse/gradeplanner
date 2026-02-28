import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { GradeScale } from '@/db/types';
import { queryKeys } from '@/features/queryKeys';

const mockDataEnabledKey = '@gradeplanner/mock-data-enabled';
const mockDataBackupKey = '@gradeplanner/mock-data-backup';

export const useUserProfile = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => athenaRepository.getUserProfile(),
  });

export const useUserSettings = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => athenaRepository.getUserProfile(),
  });

export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; photoUri: string | null }) =>
      athenaRepository.upsertUserProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};

export const useSaveSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      escalaNatasPadrao?: GradeScale;
      notaMinimaPadrao?: number;
      fusoHorario?: string;
      notificacoesAtivas?: boolean;
      idioma?: string;
      formatoData?: string;
      tema?: string;
    }) => athenaRepository.upsertUserProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};

export const useMockDataMode = () =>
  useQuery({
    queryKey: queryKeys.mockDataMode,
    queryFn: async () => (await AsyncStorage.getItem(mockDataEnabledKey)) === '1',
    initialData: false,
  });

export const useToggleMockDataMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enable: boolean) => {
      const alreadyEnabled = (await AsyncStorage.getItem(mockDataEnabledKey)) === '1';
      if (alreadyEnabled === enable) return enable;

      if (enable) {
        const backup = await athenaRepository.exportToJson();
        await AsyncStorage.setItem(mockDataBackupKey, backup);
        await athenaRepository.seedMockData();
        await AsyncStorage.setItem(mockDataEnabledKey, '1');
        return true;
      }

      const backup = await AsyncStorage.getItem(mockDataBackupKey);
      if (backup) {
        await athenaRepository.importFromJson(backup);
        await AsyncStorage.removeItem(mockDataBackupKey);
      } else {
        await athenaRepository.clearAcademicData();
        await athenaRepository.initializeDefaults();
      }
      await AsyncStorage.setItem(mockDataEnabledKey, '0');
      return false;
    },
    onSuccess: async (enabled) => {
      queryClient.setQueryData(queryKeys.mockDataMode, enabled);
      await queryClient.invalidateQueries();
    },
  });
};
