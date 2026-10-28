import React from 'react';
import {StyleSheet, TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import AppButton from '../src/components/AppButton';
import BookCard from '../src/components/BookCard';
import CategoryChips from '../src/components/CategoryChips';
import FormField from '../src/components/FormField';
import {SEED_BOOKS} from '../src/data/seedBooks';
import {colors} from '../src/theme';

test('book card exposes its stable id and book summary', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<BookCard book={SEED_BOOKS[0]} onPress={jest.fn()} onLongPress={jest.fn()} />);
  });
  expect(tree?.root.findByProps({testID: `book-card-${SEED_BOOKS[0].id}`})).toBeTruthy();
  expect(tree?.root.findByProps({children: SEED_BOOKS[0].title})).toBeTruthy();
});

test('category chips indicate selection and report a deliberate selection', async () => {
  const onChange = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<CategoryChips value="Tất cả" onChange={onChange} includeAll />);
  });
  const selectedChip = tree?.root.findByProps({testID: 'category-chip-Tất cả'});
  expect(selectedChip?.props.accessibilityState.selected).toBe(true);
  await ReactTestRenderer.act(() => selectedChip?.props.onPress());
  expect(onChange).toHaveBeenCalledWith('Tất cả');
});

test('disabled action communicates its state and field error uses the danger border', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <>
        <AppButton title="Cho mượn" onPress={jest.fn()} disabled testID="lend-book-button" />
        <FormField label="Năm xuất bản" value="18a" onChangeText={jest.fn()} error="Năm xuất bản không hợp lệ." testID="book-year-input" />
      </>,
    );
  });
  expect(tree?.root.findByProps({testID: 'lend-book-button'}).props.disabled).toBe(true);
  const input = tree?.root.findAllByType(TextInput)[0];
  expect(input).toBeTruthy();
  expect(StyleSheet.flatten(input?.props.style)?.borderColor).toBe(colors.danger);
  expect(input?.props.accessibilityHint).toContain('Năm xuất bản không hợp lệ.');
  expect(tree?.root.findByProps({children: 'Năm xuất bản không hợp lệ.'})).toBeTruthy();
});
