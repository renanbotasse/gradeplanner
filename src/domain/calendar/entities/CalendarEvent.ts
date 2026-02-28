import type { CalendarEventPriority, CalendarEventType } from '@/domain/calendar/types';

export interface CalendarEventProps {
  id?: number;
  title: string;
  dateTimeISO: string;
  ucId: number | null;
  semesterId: number | null;
  tipo: CalendarEventType;
  priority: CalendarEventPriority;
  notes: string | null;
}

export class CalendarEvent {
  constructor(private readonly props: CalendarEventProps) {}

  get id(): number | undefined {
    return this.props.id;
  }

  toPersistence(): CalendarEventProps {
    return {
      ...this.props,
      notes: this.props.notes?.trim() ? this.props.notes.trim() : null,
    };
  }
}
