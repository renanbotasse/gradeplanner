import type { IconPreferencesRepository } from '@/application/icon/ports/IconPreferencesRepository';
import { IconService } from '@/application/icon/services/IconService';
import { buildAppIconVariant, type AppIconVariant } from '@/domain/icon/AppIconVariant';
import type { IconTheme } from '@/domain/icon/IconTheme';

export class ChangeAppIconUseCase {
  constructor(
    private readonly repository: IconPreferencesRepository,
    private readonly iconService: IconService,
  ) {}

  async execute(theme: IconTheme): Promise<AppIconVariant> {
    const variant = buildAppIconVariant(theme);
    await this.repository.saveSelectedIconTheme(theme);
    // Launcher icon switching can fail or hang when a native alias is missing.
    // Keep UI preference updates responsive by applying launcher icon asynchronously.
    void this.iconService.applyLauncherIcon(variant);
    return variant;
  }
}
