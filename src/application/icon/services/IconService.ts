import type { LauncherIconGateway } from '@/application/icon/ports/LauncherIconGateway';
import type { AppIconVariant } from '@/domain/icon/AppIconVariant';

export class IconService {
  constructor(private readonly launcherGateway: LauncherIconGateway) {}

  async applyLauncherIcon(variant: AppIconVariant): Promise<boolean> {
    try {
      return await this.launcherGateway.apply(variant);
    } catch {
      return false;
    }
  }
}
