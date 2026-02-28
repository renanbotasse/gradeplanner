import { describe, expect, it } from 'vitest';

import { EventTitle } from '@/domain/calendar/value-objects/EventTitle';

describe('EventTitle', () => {
  it('rejects empty title', () => {
    const result = EventTitle.create('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_TITLE_EMPTY');
    }
  });

  it('rejects title longer than 120 chars', () => {
    const result = EventTitle.create('a'.repeat(121));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EVENT_TITLE_TOO_LONG');
    }
  });

  it('normalizes and accepts valid title', () => {
    const result = EventTitle.create('  Entrega final do projeto  ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe('Entrega final do projeto');
    }
  });
});
