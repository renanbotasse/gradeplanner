import { IconTheme } from '@/domain/icon/IconTheme';

export interface AppIconVariantProps {
  theme: IconTheme;
  launcherIconAlias: string;
  headerAssetId: string;
}

export class AppIconVariant {
  constructor(private readonly props: AppIconVariantProps) {}

  get theme(): IconTheme {
    return this.props.theme;
  }

  get launcherIconAlias(): string {
    return this.props.launcherIconAlias;
  }

  get headerAssetId(): string {
    return this.props.headerAssetId;
  }
}

const variantByTheme: Record<IconTheme, AppIconVariantProps> = {
  [IconTheme.DARK_PURPLE]: {
    theme: IconTheme.DARK_PURPLE,
    launcherIconAlias: 'companionDarkPurple',
    headerAssetId: 'companion-dark-purple',
  },
  [IconTheme.LIGHT_PURPLE]: {
    theme: IconTheme.LIGHT_PURPLE,
    launcherIconAlias: 'companionLightPurple',
    headerAssetId: 'companion-light-purple',
  },
  [IconTheme.MONOCHROME]: {
    theme: IconTheme.MONOCHROME,
    launcherIconAlias: 'companionMonochrome',
    headerAssetId: 'companion-monochrome',
  },
  [IconTheme.GREEN]: {
    theme: IconTheme.GREEN,
    launcherIconAlias: 'companionGreen',
    headerAssetId: 'companion-green',
  },
};

export const buildAppIconVariant = (theme: IconTheme): AppIconVariant =>
  new AppIconVariant(variantByTheme[theme] ?? variantByTheme[IconTheme.DARK_PURPLE]);
