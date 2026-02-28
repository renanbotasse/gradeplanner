import type { CalendarEventPriority, CalendarEventType } from '@/domain/calendar/types';

export interface PersistCalendarEventInput {
  title: string;
  dateTimeISO: string;
  ucId: number | null;
  semesterId: number | null;
  tipo: CalendarEventType;
  priority: CalendarEventPriority;
  notes: string | null;
}

export interface CalendarEventRepository {
  create(input: PersistCalendarEventInput): Promise<number>;
  update(eventId: number, input: PersistCalendarEventInput): Promise<void>;
}
