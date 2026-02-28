import type { TextStyle, ViewStyle } from 'react-native';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export const componentSize = {
  inputHeight: 46,
  buttonHeight: 46,
  buttonHeightLg: 54,
  chipHeight: 34,
  touchMin: 40,
} as const;

const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeight.extrabold,
  } satisfies TextStyle,
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeight.extrabold,
  } satisfies TextStyle,
  h3: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: fontWeight.extrabold,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeight.regular,
  } satisfies TextStyle,
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeight.bold,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeight.medium,
  } satisfies TextStyle,
  overline: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: fontWeight.bold,
  } satisfies TextStyle,
} as const;

export const withAlpha = (hexColor: string, alpha: number): string => {
  const normalized = hexColor.replace('#', '').trim();
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  const parse = (value: string): number => parseInt(value, 16);

  if (normalized.length === 3) {
    const r = parse(`${normalized[0]}${normalized[0]}`);
    const g = parse(`${normalized[1]}${normalized[1]}`);
    const b = parse(`${normalized[2]}${normalized[2]}`);
    return `rgba(${r},${g},${b},${clampedAlpha})`;
  }

  if (normalized.length === 6) {
    const r = parse(normalized.slice(0, 2));
    const g = parse(normalized.slice(2, 4));
    const b = parse(normalized.slice(4, 6));
    return `rgba(${r},${g},${b},${clampedAlpha})`;
  }

  return hexColor;
};

export interface ElevationColors {
  shadow: {
    soft: string;
    dark: string;
  };
}

export const createElevation = (colors: ElevationColors): Record<'none' | 'sm' | 'md' | 'lg', ViewStyle> => ({
  none: {
    elevation: 0,
  },
  sm: {
    shadowColor: colors.shadow.soft,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow.soft,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lg: {
    shadowColor: colors.shadow.dark,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
