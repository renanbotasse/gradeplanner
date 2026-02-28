import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { radius, spacing, typography, iconSize, componentSize } from '@/ui/theme/foundation';

export type AthenaThemeMode = 'light' | 'dark';

export interface AthenaColors {
  primary: {
    300: string;
    400: string;
    500: string;
    600: string;
  };
  background: {
    base: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onPrimary: string;
  };
  border: {
    default: string;
  };
  success: {
    base: string;
    soft: string;
  };
  info: {
    base: string;
    soft: string;
  };
  warning: {
    base: string;
    soft: string;
  };
  danger: {
    base: string;
    soft: string;
  };
  event: {
    base: string;
    soft: string;
  };
  progress: {
    track: string;
    fill: string;
  };
  toggle: {
    on: string;
    off: string;
  };
  shadow: {
    soft: string;
    dark: string;
  };
  overlay: {
    scrim: string;
  };
}

export const athenaPalettes: Record<AthenaThemeMode, AthenaColors> = {
  light: {
    primary: {
      300: '#A99BFF',
      400: '#8B75FF',
      500: '#6C4DFF',
      600: '#5A3FE6',
    },
    background: {
      base: '#F6F7FB',
      surface: '#FFFFFF',
      elevated: '#F0F2F8',
    },
    text: {
      primary: '#1C1F2A',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      onPrimary: '#FFFFFF',
    },
    border: {
      default: '#E3E6F0',
    },
    success: {
      base: '#22C55E',
      soft: '#DCFCE7',
    },
    info: {
      base: '#3B82F6',
      soft: '#DBEAFE',
    },
    warning: {
      base: '#F59E0B',
      soft: '#FEF3C7',
    },
    danger: {
      base: '#EF4444',
      soft: '#FEE2E2',
    },
    event: {
      base: '#16A34A',
      soft: '#DCFCE7',
    },
    progress: {
      track: '#E5E7EB',
      fill: '#6C4DFF',
    },
    toggle: {
      on: '#6C4DFF',
      off: '#D1D5DB',
    },
    shadow: {
      soft: 'rgba(16, 24, 40, 0.05)',
      dark: 'rgba(0,0,0,0.4)',
    },
    overlay: {
      scrim: 'rgba(0,0,0,0.45)',
    },
  },
  dark: {
    primary: {
      300: '#A99BFF',
      400: '#8B75FF',
      500: '#6C4DFF',
      600: '#6C4DFF',
    },
    background: {
      base: '#0F1117',
      surface: '#181A23',
      elevated: '#1F2230',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
      onPrimary: '#FFFFFF',
    },
    border: {
      default: '#2A2E3D',
    },
    success: {
      base: '#22C55E',
      soft: 'rgba(34,197,94,0.15)',
    },
    info: {
      base: '#3B82F6',
      soft: 'rgba(59,130,246,0.15)',
    },
    warning: {
      base: '#F59E0B',
      soft: 'rgba(245,158,11,0.15)',
    },
    danger: {
      base: '#EF4444',
      soft: 'rgba(239,68,68,0.15)',
    },
    event: {
      base: '#22C55E',
      soft: 'rgba(34,197,94,0.12)',
    },
    progress: {
      track: '#2A2E3D',
      fill: '#8B75FF',
    },
    toggle: {
      on: '#8B75FF',
      off: '#3A3F55',
    },
    shadow: {
      soft: 'rgba(16, 24, 40, 0.05)',
      dark: 'rgba(0,0,0,0.4)',
    },
    overlay: {
      scrim: 'rgba(0,0,0,0.5)',
    },
  },
};

interface AthenaThemeContextValue {
  mode: AthenaThemeMode;
  colors: AthenaColors;
  setMode: (mode: AthenaThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const themeStorageKey = '@athena_theme_mode';

const AthenaThemeContext = createContext<AthenaThemeContextValue | null>(null);

export const AthenaThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setModeState] = useState<AthenaThemeMode>('light');

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(themeStorageKey);
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored);
        }
      } catch (error) {
        console.error('Failed to load saved theme mode:', error);
      }
    };

    void load();
  }, []);

  const setMode = async (nextMode: AthenaThemeMode) => {
    setModeState(nextMode);
    try {
      await AsyncStorage.setItem(themeStorageKey, nextMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const toggleMode = async () => {
    const nextMode: AthenaThemeMode = mode === 'light' ? 'dark' : 'light';
    await setMode(nextMode);
  };

  const value = useMemo<AthenaThemeContextValue>(
    () => ({
      mode,
      colors: athenaPalettes[mode],
      setMode,
      toggleMode,
    }),
    [mode],
  );

  return <AthenaThemeContext.Provider value={value}>{children}</AthenaThemeContext.Provider>;
};

export const useAthenaTheme = (): AthenaThemeContextValue => {
  const context = useContext(AthenaThemeContext);

  if (!context) {
    throw new Error('useAthenaTheme must be used within AthenaThemeProvider.');
  }

  return context;
};

export const athenaRadius = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  pill: radius.pill,
};

export const athenaSpacing = spacing;
export const athenaTypography = typography;
export const athenaIconSize = iconSize;
export const athenaComponentSize = componentSize;
