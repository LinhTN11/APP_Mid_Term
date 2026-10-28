import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import StorageBanner from '../components/StorageBanner';
import {RootStackParamList} from '../navigation/types';
import {useLibrary} from '../state/LibraryContext';
import {colors, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen({navigation, route}: Props) {
  const {books, loading, error, saving, retry, lendBook, receiveBook} = useLibrary();
  const insets = useSafeAreaInsets();
  const book = books.find(item => item.id === route.params.bookId);

  if (loading || (error && books.length === 0)) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right']}>
        <View style={styles.state}>
          <StorageBanner error={error} saving={saving} onRetry={retry} />
          <Text style={styles.stateTitle}>{loading ? 'Đang tải sách…' : 'Chưa thể mở sách'}</Text>
          <AppButton title="Thử lại" onPress={retry} testID="detail-retry-button" />
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right']}>
        <View style={styles.state} testID="book-not-found">
          <Text style={styles.stateTitle}>Không tìm thấy sách này</Text>
          <Text style={styles.stateCopy}>Sách có thể đã bị xoá khỏi thư viện.</Text>
          <AppButton title="Về danh sách" onPress={() => navigation.popToTop()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = book.quantity - book.borrowed;
  const blocked = Boolean(error && books.length === 0);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, spacing.lg)}]} showsVerticalScrollIndicator={false}>
        <StorageBanner error={error} saving={saving} onRetry={retry} />
        <Text style={styles.eyebrow}>{book.category.toLocaleUpperCase('vi')}</Text>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>Tác giả · {book.author}</Text>

        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityLabel}>SỐ CUỐN CÓ THỂ MƯỢN</Text>
          <View style={styles.availabilityRow}>
            <Text style={styles.remaining}>{remaining}</Text>
            <Text style={styles.ofTotal}>/ {book.quantity} cuốn</Text>
            {remaining === 0 ? <Text style={styles.outBadge}>Hết sách</Text> : null}
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${Math.max(0, Math.min(100, (remaining / book.quantity) * 100))}%`}]} /></View>
          <Text style={styles.borrowedNote}>Đang được mượn: {book.borrowed} cuốn</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Thể loại" value={book.category} />
          <InfoRow label="Năm xuất bản" value={String(book.year)} />
          <InfoRow label="Tổng số lượng" value={`${book.quantity} cuốn`} />
          <InfoRow label="Đang cho mượn" value={`${book.borrowed} cuốn`} last />
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Cho mượn"
            onPress={() => {
              try {
                lendBook(book.id);
              } catch (cause) {
                Alert.alert('Không thể cho mượn', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
              }
            }}
            disabled={remaining <= 0 || blocked}
            testID="lend-book-button"
            style={styles.action}
          />
          <AppButton
            title="Nhận trả"
            onPress={() => {
              try {
                receiveBook(book.id);
              } catch (cause) {
                Alert.alert('Không thể nhận trả', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
              }
            }}
            disabled={book.borrowed <= 0 || blocked}
            variant="secondary"
            testID="return-book-button"
            style={styles.action}
          />
        </View>
        <AppButton
          title="Sửa thông tin sách"
          onPress={() => navigation.navigate('BookForm', {bookId: book.id})}
          disabled={blocked}
          variant="quiet"
          testID="edit-book-button"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({label, value, last = false}: {label: string; value: string; last?: boolean}) {
  return <View style={[styles.infoRow, last && styles.infoRowLast]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md, gap: spacing.md},
  eyebrow: {color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: spacing.md},
  title: {fontFamily: 'serif', color: colors.text, fontSize: 32, lineHeight: 39, fontWeight: '700'},
  author: {color: colors.muted, fontSize: 16, marginTop: -spacing.sm},
  availabilityCard: {backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, ...shadow},
  availabilityLabel: {color: '#C7D7CD', fontSize: 10, fontWeight: '800', letterSpacing: 1},
  availabilityRow: {flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: spacing.sm},
  remaining: {color: colors.surface, fontSize: 42, lineHeight: 48, fontWeight: '800'},
  ofTotal: {color: '#E1E9E3', fontSize: 14},
  outBadge: {color: '#FFE4DB', backgroundColor: '#754234', fontSize: 11, fontWeight: '700', overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs},
  progressTrack: {height: 5, backgroundColor: '#587563', borderRadius: radius.pill, marginTop: spacing.md},
  progressFill: {height: 5, borderRadius: radius.pill, backgroundColor: '#E7B59E'},
  borrowedNote: {color: '#D9E3DC', fontSize: 12, marginTop: spacing.sm},
  infoCard: {backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, ...shadow},
  infoRow: {minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md},
  infoRowLast: {borderBottomWidth: 0},
  infoLabel: {color: colors.muted, fontSize: 14},
  infoValue: {color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'right'},
  actions: {flexDirection: 'row', gap: spacing.sm},
  action: {flex: 1, paddingHorizontal: spacing.sm},
  state: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.lg},
  stateTitle: {color: colors.text, fontSize: 20, textAlign: 'center', fontWeight: '700'},
  stateCopy: {color: colors.muted, fontSize: 14, textAlign: 'center'},
});
