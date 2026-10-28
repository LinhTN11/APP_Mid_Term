import React, {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Book} from '../types/book';
import {colors, radius, shadow, spacing} from '../theme';

type Props = {
  book: Book;
  onPress: () => void;
  onLongPress: () => void;
};

function BookCard({book, onPress, onLongPress}: Props) {
  const remaining = book.quantity - book.borrowed;
  const outOfStock = remaining === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title}, ${book.author}, ${outOfStock ? 'hết sách' : `còn ${remaining} cuốn`}. Nhấn để xem chi tiết, nhấn giữ để xoá.`}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      testID={`book-card-${book.id}`}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          {outOfStock ? (
            <View style={styles.outBadge}><Text style={styles.outText}>Hết sách</Text></View>
          ) : null}
        </View>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        <View style={styles.meta}>
          <Text style={styles.category}>{book.category}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.availability}>{remaining}/{book.quantity} cuốn còn</Text>
        </View>
      </View>
      <Text style={styles.chevron} accessibilityElementsHidden>›</Text>
    </Pressable>
  );
}

export default memo(BookCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow,
  },
  pressed: {opacity: 0.78, transform: [{scale: 0.99}]},
  copy: {flex: 1, gap: spacing.xs},
  heading: {flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm},
  title: {flex: 1, color: colors.text, fontSize: 19, lineHeight: 25, fontFamily: 'serif', fontWeight: '600'},
  author: {color: colors.muted, fontSize: 14},
  meta: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs},
  category: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  dot: {color: colors.muted},
  availability: {color: colors.muted, fontSize: 12},
  outBadge: {backgroundColor: '#FBE9E5', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5},
  outText: {color: colors.danger, fontSize: 11, fontWeight: '700'},
  chevron: {color: colors.muted, fontSize: 27, paddingLeft: spacing.sm},
});
