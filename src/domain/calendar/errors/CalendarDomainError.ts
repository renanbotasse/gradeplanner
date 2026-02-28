export type CalendarDomainErrorCode =
  | 'EVENT_TITLE_EMPTY'
  | 'EVENT_TITLE_TOO_LONG'
  | 'EVENT_DATETIME_INVALID'
  | 'EVENT_NOT_FOUND'
  | 'EVENT_PERSISTENCE_FAILED';

export class CalendarDomainError extends Error {
  constructor(
    public readonly code: CalendarDomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CalendarDomainError';
  }
}
