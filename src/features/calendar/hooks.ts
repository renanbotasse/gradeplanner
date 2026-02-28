import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { appContainer } from '@/app/providers/container';
import type {
  SaveCalendarEventCommand,
  UpdateCalendarEventCommand,
} from '@/application/calendar/dtos/EventCommands';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import { queryKeys } from '@/features/queryKeys';

export const useEventsInRange = (startISO: string, endISO: string, filters?: { semesterId?: number; ucId?: number }) =>
  useQuery({
    queryKey: queryKeys.eventsInRange(startISO, endISO),
    queryFn: () => athenaRepository.listEventsInRange(startISO, endISO, filters),
  });

export const useEventsByDate = (dateISO: string) =>
  useQuery({
    queryKey: queryKeys.eventsByDate(dateISO),
    queryFn: () => athenaRepository.listEventsByDate(dateISO),
  });

export const useCalendarData = (month: string) =>
  useQuery({
    queryKey: queryKeys.calendarData(month),
    queryFn: async () => {
      const startISO = `${month}-01T00:00:00.000Z`;
      const endDate = new Date(`${month}-01`);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      const endISO = `${endDate.toISOString().split('T')[0]}T23:59:59.999Z`;

      const [avaliacoes, events] = await Promise.all([
        athenaRepository.listAvaliacoesByDateRange(startISO, endISO),
        athenaRepository.listEventsInRange(startISO, endISO),
      ]);

      return { avaliacoes, events };
    },
  });

export const useAllUCsWithSemester = () =>
  useQuery({
    queryKey: ['all_ucs_with_semester'],
    queryFn: () => athenaRepository.listAllUCsWithSemester(),
  });

export const useCreateManualEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveCalendarEventCommand) => {
      const result = await appContainer.calendar.createEventUseCase.execute(input);
      if (!result.ok) throw result.error;
      return result.value.eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['all_ucs_with_semester'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, input }: {
      eventId: number;
      input: Omit<UpdateCalendarEventCommand, 'eventId'>;
    }) => {
      const result = await appContainer.calendar.updateEventUseCase.execute({ eventId, ...input });
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useToggleEventCompleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, completed }: { eventId: number; completed: boolean }) =>
      athenaRepository.toggleEventCompleted(eventId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => athenaRepository.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};
