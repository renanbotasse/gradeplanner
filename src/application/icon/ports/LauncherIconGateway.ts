import type { AppIconVariant } from '@/domain/icon/AppIconVariant';

export interface LauncherIconGateway {
  apply(variant: AppIconVariant): Promise<boolean>;
}
