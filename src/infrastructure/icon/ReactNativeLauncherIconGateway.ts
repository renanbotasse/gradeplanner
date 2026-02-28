import { Platform } from 'react-native';
import DynamicAppIcon from 'react-native-dynamic-app-icon';

import type { LauncherIconGateway } from '@/application/icon/ports/LauncherIconGateway';
import type { AppIconVariant } from '@/domain/icon/AppIconVariant';

type DynamicAppIconModule = {
  setAppIcon?: (key: string | null) => Promise<void> | void;
  supportsDynamicAppIcon?: () => Promise<boolean>;
};

export class ReactNativeLauncherIconGateway implements LauncherIconGateway {
  private dynamicAppIcon = DynamicAppIcon as DynamicAppIconModule;

  async apply(variant: AppIconVariant): Promise<boolean> {
    if (!this.dynamicAppIcon || typeof this.dynamicAppIcon.setAppIcon !== 'function') {
      return false;
    }

    // iOS is supported by the library directly. Android requires activity-alias
    // native setup, so the call may fail on environments without native config.
    if (Platform.OS === 'android') {
      return false;
    }

    if (typeof this.dynamicAppIcon.supportsDynamicAppIcon === 'function') {
      const supported = await this.dynamicAppIcon.supportsDynamicAppIcon();
      if (!supported) return false;
    }

    await this.dynamicAppIcon.setAppIcon?.(variant.launcherIconAlias);
    return true;
  }
}
