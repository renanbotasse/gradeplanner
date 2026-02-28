import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from '@rneui/themed';

import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface SectionCardProps extends PropsWithChildren {
  title: string;
}

export const SectionCard = ({ title, children }: SectionCardProps) => (
  <SectionCardContent title={title}>{children}</SectionCardContent>
);

const SectionCardContent = ({ title, children }: SectionCardProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card containerStyle={styles.card}>
      <Text h4 style={styles.title}>
        {title}
      </Text>
      {children}
    </Card>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
  card: {
    borderRadius: athenaRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    shadowColor: colors.shadow.dark,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    marginBottom: 12,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  });
