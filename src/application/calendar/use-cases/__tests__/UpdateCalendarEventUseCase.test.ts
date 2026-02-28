import { describe, expect, it } from 'vitest';

import type {
  CalendarEventRepository,
  PersistCalendarEventInput,
} from '@/application/calendar/ports/CalendarEventRepository';
import { UpdateCalendarEventUseCase } from '@/application/calendar/use-cases/UpdateCalendarEventUseCase';

class UpdateSpyCalendarEventRepository implements CalendarEventRepository {
  public readonly updatedCalls: Array<{ eventId: number; input: PersistCalendarEventInput }> = [];

  constructor(
    private readonly updateImpl: (eventId: number, input: PersistCalendarEventInput) => Promise<void> = async () => {},
  ) {}

  async create(): Promise<number> {
    throw new Error('Not used by this test.');
  }

  async update(eventId: number, input: PersistCalendarEventInput): Promise<void> {
    this.updatedCalls.push({ eventId, input });
    return this.updateImpl(eventId, input);
  }
}

describe('UpdateCalendarEventUseCase', () => {
  it('returns not-found error when event id is invalid', async () => {
    const repository = new UpdateSpyCalendarEventRepository();
    const useCase = new UpdateCalendarEventUseCase(repository);

    const result = await useCase.execute({
      eventId: 0,
      title: 'Evento',
      dateTime: '2026-03-10T09:00:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_NOT_FOUND');
    }
    expect(repository.updatedCalls).toHaveLength(0);
  });

  it('updates event with normalized fields', async () => {
    const repository = new UpdateSpyCalendarEventRepository();
    const useCase = new UpdateCalendarEventUseCase(repository);

    const rawDateTime = '2026-03-12T14:20:00';
    const result = await useCase.execute({
      eventId: 12,
      title: '  Revisao final  ',
      dateTime: rawDateTime,
      tipo: 'avaliacao',
      priority: 'high',
      notes: '   ',
    });

    expect(result.ok).toBe(true);
    expect(repository.updatedCalls).toHaveLength(1);
    expect(repository.updatedCalls[0]).toEqual({
      eventId: 12,
      input: {
        title: 'Revisao final',
        dateTimeISO: new Date(rawDateTime).toISOString(),
        ucId: null,
        semesterId: null,
        tipo: 'avaliacao',
        priority: 'high',
        notes: null,
      },
    });
  });

  it('returns persistence error when repository update fails', async () => {
    const repository = new UpdateSpyCalendarEventRepository(async () => {
      throw new Error('write failed');
    });
    const useCase = new UpdateCalendarEventUseCase(repository);

    const result = await useCase.execute({
      eventId: 9,
      title: 'Evento valido',
      dateTime: '2026-03-20T10:00:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_PERSISTENCE_FAILED');
    }
  });
});
