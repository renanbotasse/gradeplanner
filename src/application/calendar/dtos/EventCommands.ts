import type { CalendarEventPriority, CalendarEventType } from '@/domain/calendar/types';

export interface SaveCalendarEventCommand {
  title: string;
  dateTime: string;
  ucId?: number | null;
  semesterId?: number | null;
  tipo?: CalendarEventType;
  priority?: CalendarEventPriority;
  notes?: string | null;
}

export interface UpdateCalendarEventCommand extends SaveCalendarEventCommand {
  eventId: number;
}
