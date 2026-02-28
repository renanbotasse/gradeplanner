let currentDateLocale = 'pt-PT';

export const setDateLocale = (locale: string): void => {
  currentDateLocale = locale;
};

export const toDateOnly = (iso: string): string => iso.slice(0, 10);

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) {
    return '-';
  }

  try {
    return new Date(iso).toLocaleDateString(currentDateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) {
    return '-';
  }

  try {
    return new Date(iso).toLocaleString(currentDateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const monthBounds = (base: Date): { start: string; end: string } => {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};
