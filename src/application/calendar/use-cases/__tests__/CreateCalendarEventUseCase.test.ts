import { describe, expect, it } from 'vitest';

import type {
  CalendarEventRepository,
  PersistCalendarEventInput,
} from '@/application/calendar/ports/CalendarEventRepository';
import { CreateCalendarEventUseCase } from '@/application/calendar/use-cases/CreateCalendarEventUseCase';

class CreateSpyCalendarEventRepository implements CalendarEventRepository {
  public readonly createdInputs: PersistCalendarEventInput[] = [];

  constructor(
    private readonly createImpl: (input: PersistCalendarEventInput) => Promise<number> = async () => 1,
  ) {}

  async create(input: PersistCalendarEventInput): Promise<number> {
    this.createdInputs.push(input);
    return this.createImpl(input);
  }

  async update(): Promise<void> {
    throw new Error('Not used by this test.');
  }
}

describe('CreateCalendarEventUseCase', () => {
  it('returns validation error when title is empty', async () => {
    const repository = new CreateSpyCalendarEventRepository();
    const useCase = new CreateCalendarEventUseCase(repository);

    const result = await useCase.execute({
      title: '   ',
      dateTime: '2026-03-10T09:00:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_TITLE_EMPTY');
    }
    expect(repository.createdInputs).toHaveLength(0);
  });

  it('creates event with normalized fields and default values', async () => {
    const repository = new CreateSpyCalendarEventRepository(async () => 77);
    const useCase = new CreateCalendarEventUseCase(repository);

    const rawDateTime = '2026-03-10T09:30:00';
    const result = await useCase.execute({
      title: '  Entrega final  ',
      dateTime: rawDateTime,
      ucId: 5,
      notes: '  Revisar anexos  ',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.eventId).toBe(77);
    expect(repository.createdInputs).toHaveLength(1);
    expect(repository.createdInputs[0]).toEqual({
      title: 'Entrega final',
      dateTimeISO: new Date(rawDateTime).toISOString(),
      ucId: 5,
      semesterId: null,
      tipo: 'evento',
      priority: 'medium',
      notes: 'Revisar anexos',
    });
  });

  it('returns persistence error when repository create fails', async () => {
    const repository = new CreateSpyCalendarEventRepository(async () => {
      throw new Error('db unavailable');
    });
    const useCase = new CreateCalendarEventUseCase(repository);

    const result = await useCase.execute({
      title: 'Evento valido',
      dateTime: '2026-03-10T10:00:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_PERSISTENCE_FAILED');
    }
  });
});
