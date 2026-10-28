import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from '../theme';
import AppButton from './AppButton';

type Props = {error: string | null; saving: boolean; onRetry: () => void};

export default function StorageBanner({error, saving, onRetry}: Props) {
  if (error) {
    return (
      <View accessibilityRole="alert" style={styles.errorBox} testID="storage-error-banner">
        <Text style={styles.title}>Chưa lưu được dữ liệu</Text>
        <Text style={styles.message}>{error}</Text>
        <AppButton title="Thử lại" onPress={onRetry} variant="quiet" testID="storage-retry-button" style={styles.retry} />
      </View>
    );
  }
  if (saving) {
    return <View accessibilityLiveRegion="polite" style={styles.savingBox}><Text style={styles.savingText}>Đang lưu thay đổi…</Text></View>;
  }
  return null;
}

const styles = StyleSheet.create({
  errorBox: {backgroundColor: '#FBE9E5', borderColor: '#E8B9AC', borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, gap: spacing.xs},
  title: {color: colors.danger, fontSize: 14, fontWeight: '700'},
  message: {color: colors.text, fontSize: 13, lineHeight: 19},
  retry: {alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: spacing.sm},
  savingBox: {backgroundColor: '#E8EFEA', borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  savingText: {color: colors.primary, fontSize: 12, fontWeight: '600'},
});
