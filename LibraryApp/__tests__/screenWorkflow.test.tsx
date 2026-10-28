import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Alert, TextInput} from 'react-native';
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn()},
}));
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookListScreen from '../src/screens/BookListScreen';
import BookDetailScreen from '../src/screens/BookDetailScreen';
import BookFormScreen from '../src/screens/BookFormScreen';
import {LibraryProvider} from '../src/state/LibraryContext';

jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react-native');
  return {
    SafeAreaView: ({children}: {children: React.ReactNode}) => require('react').createElement(ReactNative.View, null, children),
    useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  };
});

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const navigation = {navigate: jest.fn(), popToTop: jest.fn(), goBack: jest.fn()};

beforeEach(() => {
  jest.clearAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

async function renderScreen(child: React.ReactNode) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<LibraryProvider>{child}</LibraryProvider>);
    await Promise.resolve();
  });
  return renderer;
}

test('form shows field-level validation and does not navigate on invalid submission', async () => {
  const tree = await renderScreen(<BookFormScreen navigation={navigation as never} route={{key: 'form', name: 'BookForm'} as never} />);
  await ReactTestRenderer.act(() => tree.root.findByProps({testID: 'save-book-button'}).props.onPress());
  expect(tree.root.findAllByType(TextInput).length).toBe(4);
  expect(tree.root.findAllByType(TextInput).some(input => String(input.props.accessibilityHint).includes('Vui lòng nhập tên sách.'))).toBe(true);
  expect(tree.root.findByProps({children: 'Vui lòng nhập tên tác giả.'})).toBeTruthy();
  expect(navigation.goBack).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => tree.unmount());
});

test('long press blocks delete for borrowed books and requires confirmation for eligible books', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  const tree = await renderScreen(<BookListScreen navigation={navigation as never} route={{key: 'list', name: 'BookList'} as never} />);
  await ReactTestRenderer.act(() => tree.root.findByProps({testID: 'book-card-seed-de-men'}).props.onLongPress());
  expect(alert).toHaveBeenCalledWith('Không thể xoá sách', expect.stringContaining('đang có cuốn được mượn'));
  await ReactTestRenderer.act(() => tree.root.findByProps({testID: 'book-card-seed-nha-gia-kim'}).props.onLongPress());
  const [, , buttons] = alert.mock.calls.at(-1)!;
  expect(buttons).toEqual(expect.arrayContaining([
    expect.objectContaining({text: 'Huỷ', style: 'cancel'}),
    expect.objectContaining({text: 'Xoá sách', style: 'destructive', onPress: expect.any(Function)}),
  ]));
  expect(storage.setItem).toHaveBeenCalledTimes(1); // only the first-run seed; no deletion before confirmation
  await ReactTestRenderer.act(async () => { (buttons as {onPress?: () => void}[])[1].onPress?.(); await Promise.resolve(); });
  expect(JSON.parse(storage.setItem.mock.calls.at(-1)![1]).some((book: {id: string}) => book.id === 'seed-nha-gia-kim')).toBe(false);
  ReactTestRenderer.act(() => tree.unmount());
  alert.mockRestore();
});

test('detail disables actions at both borrowing boundaries', async () => {
  storage.getItem.mockResolvedValue(JSON.stringify([
    {id: 'empty', title: 'Hết', author: 'A', category: 'Khoa học', year: 2020, quantity: 1, borrowed: 1},
    {id: 'available', title: 'Còn', author: 'B', category: 'Khoa học', year: 2020, quantity: 1, borrowed: 0},
  ]));
  const exhausted = await renderScreen(<BookDetailScreen navigation={navigation as never} route={{key: 'detail', name: 'BookDetail', params: {bookId: 'empty'}} as never} />);
  expect(exhausted.root.findByProps({testID: 'lend-book-button'}).props.disabled).toBe(true);
  expect(exhausted.root.findByProps({testID: 'return-book-button'}).props.disabled).toBe(false);
  ReactTestRenderer.act(() => exhausted.unmount());
  const available = await renderScreen(<BookDetailScreen navigation={navigation as never} route={{key: 'detail', name: 'BookDetail', params: {bookId: 'available'}} as never} />);
  expect(available.root.findByProps({testID: 'lend-book-button'}).props.disabled).toBe(false);
  expect(available.root.findByProps({testID: 'return-book-button'}).props.disabled).toBe(true);
  ReactTestRenderer.act(() => available.unmount());
});
