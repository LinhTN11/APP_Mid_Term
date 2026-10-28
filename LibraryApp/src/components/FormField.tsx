import React from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
import {colors, radius, spacing} from '../theme';

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  testID: string;
};

export default function FormField({label, value, onChangeText, error, testID, ...inputProps}: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={error ? [inputProps.accessibilityHint, error].filter(Boolean).join(' ') : inputProps.accessibilityHint}
        value={value}
        onChangeText={onChangeText}
        testID={testID}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {gap: spacing.xs},
  label: {color: colors.text, fontSize: 14, fontWeight: '700'},
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {borderColor: colors.danger, borderWidth: 1.5},
  error: {color: colors.danger, fontSize: 12, lineHeight: 17},
});
