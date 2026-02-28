import { CalendarEvent } from '@/domain/calendar/entities/CalendarEvent';
import { CalendarDomainError } from '@/domain/calendar/errors/CalendarDomainError';
import { EventDateTime } from '@/domain/calendar/value-objects/EventDateTime';
import { EventTitle } from '@/domain/calendar/value-objects/EventTitle';
import type { SaveCalendarEventCommand } from '@/application/calendar/dtos/EventCommands';
import type { CalendarEventRepository } from '@/application/calendar/ports/CalendarEventRepository';
import { err, ok, type Result } from '@/shared/result';

export interface CreateCalendarEventResult {
  eventId: number;
}

export class CreateCalendarEventUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  async execute(command: SaveCalendarEventCommand): Promise<Result<CreateCalendarEventResult, CalendarDomainError>> {
    const title = EventTitle.create(command.title);
    if (!title.ok) return err(title.error);

    const dateTime = EventDateTime.create(command.dateTime);
    if (!dateTime.ok) return err(dateTime.error);

    const event = new CalendarEvent({
      title: title.value.value,
      dateTimeISO: dateTime.value.iso,
      ucId: command.ucId ?? null,
      semesterId: command.semesterId ?? null,
      tipo: command.tipo ?? 'evento',
      priority: command.priority ?? 'medium',
      notes: command.notes?.trim() || null,
    });
    const { id: _ignoredId, ...persistenceInput } = event.toPersistence();

    try {
      const eventId = await this.repository.create(persistenceInput);
      return ok({ eventId });
    } catch {
      return err(new CalendarDomainError('EVENT_PERSISTENCE_FAILED', 'Não foi possível guardar o evento.'));
    }
  }
}
