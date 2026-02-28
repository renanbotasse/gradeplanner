import { describe, expect, it } from 'vitest';

import type {
  CalendarEventRepository,
  PersistCalendarEventInput,
} from '@/application/calendar/ports/CalendarEventRepository';
import { CreateCalendarEventUseCase } from '@/application/calendar/use-cases/CreateCalendarEventUseCase';
import { UpdateCalendarEventUseCase } from '@/application/calendar/use-cases/UpdateCalendarEventUseCase';

class InMemoryCalendarEventRepository implements CalendarEventRepository {
  private autoIncrement = 1;
  private readonly events = new Map<number, PersistCalendarEventInput>();

  async create(input: PersistCalendarEventInput): Promise<number> {
    const id = this.autoIncrement++;
    this.events.set(id, { ...input });
    return id;
  }

  async update(eventId: number, input: PersistCalendarEventInput): Promise<void> {
    if (!this.events.has(eventId)) {
      throw new Error('Event not found');
    }
    this.events.set(eventId, { ...input });
  }

  getById(eventId: number): PersistCalendarEventInput | null {
    return this.events.get(eventId) ?? null;
  }
}

describe('Calendar event flow integration', () => {
  it('creates and updates an event through application use cases', async () => {
    const repository = new InMemoryCalendarEventRepository();
    const createEvent = new CreateCalendarEventUseCase(repository);
    const updateEvent = new UpdateCalendarEventUseCase(repository);

    const createResult = await createEvent.execute({
      title: '  Entrega Sprint  ',
      dateTime: '2026-03-15T09:00:00',
      ucId: 10,
      semesterId: 2,
      tipo: 'atividade',
      priority: 'medium',
      notes: '  Preparar documentacao  ',
    });

    expect(createResult.ok).toBe(true);
    if (!createResult.ok) return;

    const created = repository.getById(createResult.value.eventId);
    expect(created).not.toBeNull();
    expect(created).toEqual({
      title: 'Entrega Sprint',
      dateTimeISO: new Date('2026-03-15T09:00:00').toISOString(),
      ucId: 10,
      semesterId: 2,
      tipo: 'atividade',
      priority: 'medium',
      notes: 'Preparar documentacao',
    });

    const updateResult = await updateEvent.execute({
      eventId: createResult.value.eventId,
      title: '  Entrega Sprint final  ',
      dateTime: '2026-03-16T11:30:00',
      ucId: null,
      semesterId: 2,
      tipo: 'evento',
      priority: 'high',
      notes: '  ',
    });

    expect(updateResult.ok).toBe(true);

    const updated = repository.getById(createResult.value.eventId);
    expect(updated).not.toBeNull();
    expect(updated).toEqual({
      title: 'Entrega Sprint final',
      dateTimeISO: new Date('2026-03-16T11:30:00').toISOString(),
      ucId: null,
      semesterId: 2,
      tipo: 'evento',
      priority: 'high',
      notes: null,
    });
  });

  it('propagates persistence error when updating a missing event', async () => {
    const repository = new InMemoryCalendarEventRepository();
    const updateEvent = new UpdateCalendarEventUseCase(repository);

    const result = await updateEvent.execute({
      eventId: 999,
      title: 'Evento orfao',
      dateTime: '2026-03-20T10:00:00',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_PERSISTENCE_FAILED');
    }
  });
});
