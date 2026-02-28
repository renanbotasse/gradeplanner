import { CalendarDomainError } from '@/domain/calendar/errors/CalendarDomainError';
import { err, ok, type Result } from '@/shared/result';

export class EventTitle {
  private constructor(public readonly value: string) {}

  static create(raw: string): Result<EventTitle, CalendarDomainError> {
    const normalized = raw.trim();

    if (!normalized) {
      return err(new CalendarDomainError('EVENT_TITLE_EMPTY', 'O título do evento é obrigatório.'));
    }

    if (normalized.length > 120) {
      return err(new CalendarDomainError('EVENT_TITLE_TOO_LONG', 'O título do evento deve ter no máximo 120 caracteres.'));
    }

    return ok(new EventTitle(normalized));
  }
}
