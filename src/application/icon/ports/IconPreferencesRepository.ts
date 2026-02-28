import type { IconTheme } from '@/domain/icon/IconTheme';

export interface IconPreferencesRepository {
  getSelectedIconTheme(): Promise<IconTheme | null>;
  saveSelectedIconTheme(theme: IconTheme): Promise<void>;
}
