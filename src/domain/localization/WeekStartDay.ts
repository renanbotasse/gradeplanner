export enum WeekStartDay {
  SUNDAY = 0,
  MONDAY = 1,
}

export const DEFAULT_WEEK_START_DAY = WeekStartDay.MONDAY;

export const AVAILABLE_WEEK_START_DAYS: WeekStartDay[] = [
  WeekStartDay.SUNDAY,
  WeekStartDay.MONDAY,
];
