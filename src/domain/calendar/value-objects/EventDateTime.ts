import { CalendarDomainError } from '@/domain/calendar/errors/CalendarDomainError';
import { err, ok, type Result } from '@/shared/result';

export class EventDateTime {
  private constructor(public readonly iso: string) {}

  static create(rawIso: string): Result<EventDateTime, CalendarDomainError> {
    if (!rawIso.trim()) {
      return err(new CalendarDomainError('EVENT_DATETIME_INVALID', 'A data e hora do evento é obrigatória.'));
    }

    const date = new Date(rawIso);
    if (Number.isNaN(date.getTime())) {
      return err(new CalendarDomainError('EVENT_DATETIME_INVALID', 'A data e hora do evento é inválida.'));
    }

    return ok(new EventDateTime(date.toISOString()));
  }
}
