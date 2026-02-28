import type { ImageSourcePropType } from 'react-native';

import { IconTheme } from '@/domain/icon/IconTheme';

const companionDarkPurple = require('../../../../assets/icons/companion-dark-purple-v2.png');
const companionLightPurple = require('../../../../assets/icons/companion-light-purple-v2.png');
const companionMonochrome = require('../../../../assets/icons/companion-monochrome-v2.png');
const companionGreen = require('../../../../assets/icons/companion-green-v2.png');

export const getHeaderIconAsset = (theme: IconTheme | string): ImageSourcePropType => {
  switch (theme) {
    case IconTheme.DARK_PURPLE:
    case 'dark_purple':
    case 'companionDarkPurple':
      return companionDarkPurple;
    case IconTheme.MONOCHROME:
    case 'monochrome':
    case 'companionMonochrome':
      return companionMonochrome;
    case IconTheme.GREEN:
    case 'green':
    case 'companionGreen':
      return companionGreen;
    case IconTheme.LIGHT_PURPLE:
    case 'light_purple':
    case 'companionLightPurple':
    default:
      return companionLightPurple;
  }
};
