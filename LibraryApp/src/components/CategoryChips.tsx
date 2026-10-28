import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {CATEGORIES, Category} from '../types/book';
import {colors, radius, spacing} from '../theme';

type Props = {
  value: Category | 'Tất cả';
  onChange: (value: Category | 'Tất cả') => void;
  includeAll?: boolean;
  error?: string;
};

export default function CategoryChips({value, onChange, includeAll = false, error}: Props) {
  const options: Array<Category | 'Tất cả'> = includeAll ? ['Tất cả', ...CATEGORIES] : [...CATEGORIES];
  return (
    <View>
      <View style={styles.wrap}>
        {options.map(category => {
          const selected = value === category;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected}}
              accessibilityLabel={`Thể loại ${category}`}
              key={category}
              onPress={() => onChange(category)}
              testID={`category-chip-${category}`}
              style={({pressed}) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
              <Text style={[styles.text, selected && styles.selectedText]}>{category}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  chip: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface},
  selected: {backgroundColor: colors.primary, borderColor: colors.primary},
  pressed: {opacity: 0.7},
  text: {color: colors.muted, fontSize: 13, fontWeight: '600'},
  selectedText: {color: colors.surface},
  error: {marginTop: spacing.xs, color: colors.danger, fontSize: 12},
});
