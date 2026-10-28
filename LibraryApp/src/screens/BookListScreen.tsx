import React, {useMemo, useState} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import BookCard from '../components/BookCard';
import CategoryChips from '../components/CategoryChips';
import StorageBanner from '../components/StorageBanner';
import {RootStackParamList} from '../navigation/types';
import {useLibrary} from '../state/LibraryContext';
import {colors, radius, spacing} from '../theme';
import {filterBooks} from '../domain/books';
import {Category} from '../types/book';

type Props = NativeStackScreenProps<RootStackParamList, 'BookList'>;

export default function BookListScreen({navigation}: Props) {
  const {books, loading, error, saving, retry, removeBook} = useLibrary();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'Tất cả'>('Tất cả');
  const filteredBooks = useMemo(() => filterBooks(books, query, category), [books, category, query]);
  const borrowedTotal = useMemo(() => books.reduce((sum, book) => sum + book.borrowed, 0), [books]);
  const hydrationBlocked = Boolean(error && books.length === 0);

  const confirmDelete = (bookId: string) => {
    const book = books.find(item => item.id === bookId);
    if (!book) {
      return;
    }
    if (book.borrowed > 0) {
      Alert.alert('Không thể xoá sách', 'Sách này đang có cuốn được mượn. Vui lòng nhận trả trước khi xoá.');
      return;
    }
    Alert.alert('Xoá sách khỏi thư viện?', `“${book.title}” sẽ bị xoá khỏi danh sách.`, [
      {text: 'Huỷ', style: 'cancel'},
      {text: 'Xoá sách', style: 'destructive', onPress: () => {
        try {
          removeBook(bookId);
        } catch (cause) {
          Alert.alert('Không thể xoá sách', cause instanceof Error ? cause.message : 'Vui lòng thử lại.');
        }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <View style={styles.body}>
        <View style={styles.summaryRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{books.length}</Text>
            <Text style={styles.statLabel}>đầu sách</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{borrowedTotal}</Text>
            <Text style={styles.statLabel}>cuốn đang mượn</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchMark} accessibilityElementsHidden>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm tên sách hoặc tác giả"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Tìm tên sách hoặc tác giả"
            testID="search-input"
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={styles.searchInput}
          />
          {query.length > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Xoá nội dung tìm kiếm" onPress={() => setQuery('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>Xoá</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>THỂ LOẠI</Text>
        <CategoryChips value={category} onChange={value => setCategory(value)} includeAll />

        <StorageBanner error={error} saving={saving} onRetry={retry} />

        {loading ? (
          <View style={styles.stateBox}><Text style={styles.stateTitle}>Đang mở thư viện</Text><Text style={styles.stateCopy}>Đang tải danh sách sách đã lưu.</Text></View>
        ) : hydrationBlocked ? (
          <View style={styles.stateBox} testID="library-load-error">
            <Text style={styles.stateTitle}>Chưa thể tải thư viện</Text>
            <Text style={styles.stateCopy}>Danh sách chưa được nạp an toàn. Hãy thử lại để tiếp tục.</Text>
            <AppButton title="Tải lại thư viện" onPress={retry} testID="library-load-retry-button" style={styles.stateButton} />
          </View>
        ) : books.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEyebrow}>BẮT ĐẦU TỪ ĐÂY</Text>
            <Text style={styles.stateTitle}>Thư viện của bạn đang trống</Text>
            <Text style={styles.stateCopy}>Thêm cuốn sách đầu tiên để theo dõi việc mượn và trả.</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEyebrow}>CHƯA TÌM THẤY</Text>
            <Text style={styles.stateTitle}>Không có sách phù hợp</Text>
            <Text style={styles.stateCopy}>Thử đổi từ khoá hoặc chọn lại thể loại.</Text>
            <AppButton title="Xoá bộ lọc" onPress={() => {setQuery(''); setCategory('Tất cả');}} variant="secondary" style={styles.stateButton} />
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={book => book.id}
            renderItem={({item}) => (
              <BookCard
                book={item}
                onPress={() => navigation.navigate('BookDetail', {bookId: item.id})}
                onLongPress={() => confirmDelete(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}

        <AppButton
          title="+ Thêm sách"
          onPress={() => navigation.navigate('BookForm')}
          disabled={loading || hydrationBlocked}
          testID="add-book-button"
          style={[styles.addButton, {marginBottom: Math.max(insets.bottom, spacing.sm)}]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  body: {flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm},
  summaryRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  statCard: {flex: 1, backgroundColor: '#E8EFEA', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  statValue: {color: colors.primary, fontSize: 23, fontWeight: '800'},
  statLabel: {color: colors.muted, fontSize: 12, marginTop: 1},
  searchWrap: {height: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.md},
  searchMark: {fontSize: 22, color: colors.muted, marginRight: spacing.sm},
  searchInput: {flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0},
  clearSearch: {minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs},
  clearSearchText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  sectionLabel: {color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.md, marginBottom: spacing.sm},
  list: {flex: 1, marginTop: spacing.md},
  listContent: {paddingBottom: spacing.md},
  stateBox: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md},
  stateEyebrow: {color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: spacing.sm},
  stateTitle: {color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: '700', textAlign: 'center'},
  stateCopy: {color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm},
  stateButton: {marginTop: spacing.md},
  addButton: {marginTop: spacing.sm},
});
