import type { IconPreferencesRepository } from '@/application/icon/ports/IconPreferencesRepository';
import { buildAppIconVariant, type AppIconVariant } from '@/domain/icon/AppIconVariant';
import { DEFAULT_ICON_THEME } from '@/domain/icon/IconTheme';

export class GetSelectedIconUseCase {
  constructor(private readonly repository: IconPreferencesRepository) {}

  async execute(): Promise<AppIconVariant> {
    const selectedTheme = await this.repository.getSelectedIconTheme();
    return buildAppIconVariant(selectedTheme ?? DEFAULT_ICON_THEME);
  }
}
