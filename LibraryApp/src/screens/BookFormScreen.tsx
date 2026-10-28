import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import CategoryChips from '../components/CategoryChips';
import FormField from '../components/FormField';
import StorageBanner from '../components/StorageBanner';
import {validateBook} from '../domain/books';
import {RootStackParamList} from '../navigation/types';
import {useLibrary} from '../state/LibraryContext';
import {BookErrors, BookInput, CATEGORIES} from '../types/book';
import {colors, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookForm'>;

function emptyInput(): BookInput {
  return {title: '', author: '', category: CATEGORIES[0], year: '', quantity: '1'};
}

export default function BookFormScreen({navigation, route}: Props) {
  const {books, loading, error, saving, retry, addBook, editBook} = useLibrary();
  const insets = useSafeAreaInsets();
  const bookId = route.params?.bookId;
  const book = bookId ? books.find(item => item.id === bookId) : undefined;
  const isEditing = Boolean(bookId);
  const [form, setForm] = useState<BookInput>(() => book ? {
    title: book.title,
    author: book.author,
    category: book.category,
    year: String(book.year),
    quantity: String(book.quantity),
  } : emptyInput());
  const [errors, setErrors] = useState<BookErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const blocked = Boolean(error && books.length === 0);

  useEffect(() => {
    if (book) {
      setForm({title: book.title, author: book.author, category: book.category, year: String(book.year), quantity: String(book.quantity)});
    }
  }, [book]);

  const updateField = <K extends keyof BookInput>(field: K, value: BookInput[K]) => {
    setForm(current => ({...current, [field]: value}));
    setErrors(current => ({...current, [field]: undefined}));
    setSubmitError(null);
  };

  const save = () => {
    const nextErrors = validateBook(form, book?.borrowed ?? 0);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Vui lòng kiểm tra lại các thông tin được đánh dấu.');
      return;
    }
    try {
      if (isEditing) {
        if (!book) {
          setSubmitError('Không tìm thấy sách cần sửa. Hãy quay lại danh sách và thử lại.');
          return;
        }
        editBook(book.id, form);
      } else {
        addBook(form);
      }
      navigation.goBack();
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Không thể lưu thông tin sách.');
    }
  };

  if (loading || blocked || (isEditing && !book)) {
    return (
      <View style={styles.state}>
        <StorageBanner error={error} saving={saving} onRetry={retry} />
        <Text style={styles.stateTitle}>{loading ? 'Đang tải dữ liệu sách…' : 'Chưa thể mở biểu mẫu'}</Text>
        <Text style={styles.stateCopy}>{isEditing && !book && !loading ? 'Sách này không còn trong thư viện.' : 'Hãy tải dữ liệu thành công trước khi thêm hoặc sửa sách.'}</Text>
        {blocked ? <AppButton title="Tải lại thư viện" onPress={retry} /> : <AppButton title="Quay lại" onPress={() => navigation.goBack()} variant="secondary" />}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, spacing.xl)}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StorageBanner error={error} saving={saving} onRetry={retry} />
        <Text style={styles.intro}>{isEditing ? 'Cập nhật thông tin cuốn sách trong thư viện.' : 'Lưu lại thông tin để dễ dàng theo dõi từng lượt mượn trả.'}</Text>
        {submitError ? <Text accessibilityRole="alert" style={styles.submitError}>{submitError}</Text> : null}
        <FormField
          label="Tên sách"
          value={form.title}
          onChangeText={value => updateField('title', value)}
          error={errors.title}
          testID="book-title-input"
          placeholder="Ví dụ: Dế Mèn phiêu lưu ký"
          autoCapitalize="sentences"
          returnKeyType="next"
        />
        <FormField
          label="Tác giả"
          value={form.author}
          onChangeText={value => updateField('author', value)}
          error={errors.author}
          testID="book-author-input"
          placeholder="Nhập tên tác giả"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <View style={styles.categoryGroup}>
          <Text style={styles.fieldLabel}>Thể loại</Text>
          <CategoryChips value={form.category} onChange={value => updateField('category', value as BookInput['category'])} error={errors.category} />
        </View>
        <View style={styles.numberRow}>
          <View style={styles.numberField}><FormField
            label="Năm xuất bản"
            value={form.year}
            onChangeText={value => updateField('year', value)}
            error={errors.year}
            testID="book-year-input"
            placeholder="2020"
            keyboardType="number-pad"
            returnKeyType="next"
          /></View>
          <View style={styles.numberField}><FormField
            label="Số lượng"
            value={form.quantity}
            onChangeText={value => updateField('quantity', value)}
            error={errors.quantity}
            testID="book-quantity-input"
            placeholder="1"
            keyboardType="number-pad"
            returnKeyType="done"
          /></View>
        </View>
        {book && book.borrowed > 0 ? <Text style={styles.borrowedNote}>Đang có {book.borrowed} cuốn được mượn. Số lượng không thể thấp hơn mức này.</Text> : null}
        <AppButton
          title={isEditing ? 'Lưu thay đổi' : 'Thêm vào thư viện'}
          onPress={save}
          disabled={blocked}
          testID="save-book-button"
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  keyboard: {flex: 1},
  content: {padding: spacing.md, gap: spacing.md},
  intro: {color: colors.muted, fontSize: 14, lineHeight: 21},
  submitError: {color: colors.danger, backgroundColor: '#FBE9E5', padding: spacing.sm, borderRadius: 8, fontSize: 13},
  categoryGroup: {gap: spacing.sm},
  fieldLabel: {color: colors.text, fontSize: 14, fontWeight: '700'},
  numberRow: {flexDirection: 'row', gap: spacing.sm},
  numberField: {flex: 1, minWidth: 0},
  borrowedNote: {color: colors.muted, fontSize: 12, lineHeight: 18},
  saveButton: {marginTop: spacing.sm},
  state: {flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md},
  stateTitle: {color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center'},
  stateCopy: {color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center'},
});
