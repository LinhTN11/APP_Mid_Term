import React from 'react';
import {Pressable, StyleProp, StyleSheet, Text, ViewStyle} from 'react-native';
import {colors, radius, spacing} from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  testID,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{disabled}}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel, variant === 'quiet' && styles.quietLabel, variant === 'danger' && styles.dangerLabel, disabled && styles.disabledLabel]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {backgroundColor: colors.primary, borderColor: colors.primary},
  secondary: {backgroundColor: colors.surface, borderColor: colors.border},
  quiet: {backgroundColor: 'transparent', borderColor: 'transparent'},
  danger: {backgroundColor: colors.surface, borderColor: colors.danger},
  disabled: {backgroundColor: colors.disabled, borderColor: colors.disabled},
  pressed: {opacity: 0.76, transform: [{scale: 0.985}]},
  label: {color: colors.surface, fontSize: 15, fontWeight: '700'},
  secondaryLabel: {color: colors.primary},
  quietLabel: {color: colors.primary},
  dangerLabel: {color: colors.danger},
  disabledLabel: {color: '#778079'},
});
