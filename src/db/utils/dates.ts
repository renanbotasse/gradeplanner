export const addDays = (base: Date, days: number): Date => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

export const toDateOnlyString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toDateTimeIso = (base: Date, dayOffset: number, hour: number, minute: number): string => {
  const date = addDays(base, dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
