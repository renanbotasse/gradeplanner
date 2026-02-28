import { describe, expect, it } from 'vitest';

import { EventDateTime } from '@/domain/calendar/value-objects/EventDateTime';

describe('EventDateTime', () => {
  it('rejects empty datetime', () => {
    const result = EventDateTime.create('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_DATETIME_INVALID');
    }
  });

  it('rejects invalid datetime', () => {
    const result = EventDateTime.create('not-a-date');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_DATETIME_INVALID');
    }
  });

  it('normalizes valid datetime to ISO format', () => {
    const raw = '2026-03-18T10:30:00';
    const result = EventDateTime.create(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.iso).toBe(new Date(raw).toISOString());
    }
  });
});
