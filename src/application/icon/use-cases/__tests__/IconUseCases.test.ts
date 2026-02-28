import { describe, expect, it, vi } from 'vitest';

import type { IconPreferencesRepository } from '@/application/icon/ports/IconPreferencesRepository';
import type { LauncherIconGateway } from '@/application/icon/ports/LauncherIconGateway';
import { IconService } from '@/application/icon/services/IconService';
import { ChangeAppIconUseCase } from '@/application/icon/use-cases/ChangeAppIconUseCase';
import { GetSelectedIconUseCase } from '@/application/icon/use-cases/GetSelectedIconUseCase';
import { DEFAULT_ICON_THEME, IconTheme } from '@/domain/icon/IconTheme';

class InMemoryIconPreferencesRepository implements IconPreferencesRepository {
  constructor(private theme: IconTheme | null = null) {}

  async getSelectedIconTheme(): Promise<IconTheme | null> {
    return this.theme;
  }

  async saveSelectedIconTheme(theme: IconTheme): Promise<void> {
    this.theme = theme;
  }
}

describe('Icon use cases', () => {
  it('returns default icon theme when nothing is persisted', async () => {
    const repository = new InMemoryIconPreferencesRepository(null);
    const useCase = new GetSelectedIconUseCase(repository);

    const variant = await useCase.execute();
    expect(variant.theme).toBe(DEFAULT_ICON_THEME);
  });

  it('changes icon and persists selected theme', async () => {
    const repository = new InMemoryIconPreferencesRepository();
    const gateway: LauncherIconGateway = {
      apply: vi.fn(async () => true),
    };
    const service = new IconService(gateway);
    const useCase = new ChangeAppIconUseCase(repository, service);

    const variant = await useCase.execute(IconTheme.MONOCHROME);
    expect(variant.theme).toBe(IconTheme.MONOCHROME);
    expect(await repository.getSelectedIconTheme()).toBe(IconTheme.MONOCHROME);
    expect(gateway.apply).toHaveBeenCalledTimes(1);
  });

  it('does not block preference update if launcher icon apply hangs', async () => {
    const repository = new InMemoryIconPreferencesRepository();
    const gateway: LauncherIconGateway = {
      apply: vi.fn(
        () =>
          new Promise<boolean>(() => {
            // Intentionally pending promise.
          }),
      ),
    };
    const service = new IconService(gateway);
    const useCase = new ChangeAppIconUseCase(repository, service);

    const variant = await useCase.execute(IconTheme.GREEN);
    expect(variant.theme).toBe(IconTheme.GREEN);
    expect(await repository.getSelectedIconTheme()).toBe(IconTheme.GREEN);
    expect(gateway.apply).toHaveBeenCalledTimes(1);
  });
});
