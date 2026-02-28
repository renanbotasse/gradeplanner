import { ScrollView, Text, View } from 'react-native';
import { withAlpha } from '@/ui/theme/foundation';
import type { AthenaColors } from '@/ui/theme/tokens';

export const ITEM_H = 44;
const VISIBLE = 3;
export const PICKER_H = ITEM_H * VISIBLE;

export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface TimeColumnProps {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  colors: AthenaColors;
}

export const TimeColumn = ({ items, value, onChange, colors }: TimeColumnProps) => {
  const selectedIndex = items.indexOf(value);
  const initialOffset = Math.max(0, selectedIndex) * ITEM_H;
  const styles = timeColumnStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentOffset={{ x: 0, y: initialOffset }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          const clamped = Math.max(0, Math.min(items.length - 1, index));
          onChange(items[clamped] ?? value);
        }}
        onScrollEndDrag={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          const clamped = Math.max(0, Math.min(items.length - 1, index));
          onChange(items[clamped] ?? value);
        }}
      >
        {items.map((item) => (
          <View key={item} style={styles.item}>
            <Text style={[styles.itemText, item === value && styles.itemTextSelected]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.selectionBar} />
    </View>
  );
};

const timeColumnStyles = (colors: AthenaColors) => ({
  container: { height: PICKER_H, width: 56, overflow: 'hidden' as const, position: 'relative' as const },
  item: { height: ITEM_H, justifyContent: 'center' as const, alignItems: 'center' as const },
  itemText: { fontSize: 22, fontWeight: '500' as const, color: colors.text.tertiary },
  itemTextSelected: { fontSize: 24, fontWeight: '800' as const, color: colors.text.primary },
  selectionBar: {
    position: 'absolute' as const,
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: withAlpha(colors.primary[600], 0.07),
  },
});
