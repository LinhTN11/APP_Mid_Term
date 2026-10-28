import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput} from 'react-native';
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn()},
}));
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookListScreen from '../src/screens/BookListScreen';
import BookDetailScreen from '../src/screens/BookDetailScreen';
import BookFormScreen, {calculateKeyboardVerticalOffset} from '../src/screens/BookFormScreen';
import {LibraryProvider} from '../src/state/LibraryContext';

jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react-native');
  const ReactRuntime = require('react');
  const SafeAreaView = ReactRuntime.forwardRef((props: {children?: unknown; onLayout?: (...args: unknown[]) => void; style?: unknown; testID?: string}, ref: unknown) => {
    ReactRuntime.useImperativeHandle(ref, () => ({
      measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) => callback(0, 56, 360, 692),
    }));
    return ReactRuntime.createElement(ReactNative.View, {onLayout: props.onLayout, style: props.style, testID: props.testID}, props.children);
  });
  return {
    SafeAreaView,
    useSafeAreaInsets: () => ({top: 52, bottom: 0, left: 0, right: 0}),
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
  expect(calculateKeyboardVerticalOffset(56, 52, 'android')).toBe(108);
  expect(calculateKeyboardVerticalOffset(56, 52, 'ios')).toBe(56);
  const tree = await renderScreen(<BookFormScreen navigation={navigation as never} route={{key: 'form', name: 'BookForm'} as never} />);
  const root = tree.root.findByProps({testID: 'book-form-root'});
  await ReactTestRenderer.act(() => root.props.onLayout({}));
  const keyboardView = tree.root.findByType(KeyboardAvoidingView);
  expect(keyboardView.props.behavior).toBe(Platform.OS === 'ios' ? 'padding' : 'height');
  expect(keyboardView.props.keyboardVerticalOffset).toBe(calculateKeyboardVerticalOffset(56, 52, Platform.OS));
  await ReactTestRenderer.act(() => tree.root.findByProps({testID: 'save-book-button'}).props.onPress());
  expect(tree.root.findAllByType(TextInput).length).toBe(4);
  expect(tree.root.findAllByType(TextInput).some(input => String(input.props.accessibilityHint).includes('Vui lòng nhập tên sách.'))).toBe(true);
  expect(tree.root.findByProps({children: 'Vui lòng nhập tên tác giả.'})).toBeTruthy();
  expect(navigation.goBack).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => tree.unmount());
});

test('valid save blurs the IME and waits for keyboard hide before leaving the form', async () => {
  const isVisible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(jest.fn());
  let keyboardDidHide: (() => void) | undefined;
  const removeListener = jest.fn();
  const addListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, listener) => {
    if (eventName === 'keyboardDidHide') {
      keyboardDidHide = listener as () => void;
    }
    return {remove: removeListener} as never;
  });
  const tree = await renderScreen(<BookFormScreen navigation={navigation as never} route={{key: 'form', name: 'BookForm'} as never} />);
  const fields = tree.root.findAllByType(TextInput);
  const values = ['Sách hợp lệ', 'Tác giả', '2020', '2'];
  for (let index = 0; index < fields.length; index += 1) {
    await ReactTestRenderer.act(() => fields[index].props.onChangeText(values[index]));
  }
  await ReactTestRenderer.act(() => tree.root.findByProps({testID: 'save-book-button'}).props.onPress());
  expect(dismiss).toHaveBeenCalled();
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(keyboardDidHide).toBeDefined();
  await ReactTestRenderer.act(async () => {
    keyboardDidHide?.();
    await new Promise(resolve => setTimeout(resolve, 5));
  });
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  expect(removeListener).toHaveBeenCalled();
  isVisible.mockRestore();
  dismiss.mockRestore();
  addListener.mockRestore();
  ReactTestRenderer.act(() => tree.unmount());
});

test('valid save blurs an already hidden IME before navigating and prevents duplicate submits', async () => {
  const isVisible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(jest.fn());
  const tree = await renderScreen(<BookFormScreen navigation={navigation as never} route={{key: 'form', name: 'BookForm'} as never} />);
  const fields = tree.root.findAllByType(TextInput);
  const values = ['Sách hợp lệ', 'Tác giả', '2020', '2'];
  for (let index = 0; index < fields.length; index += 1) {
    await ReactTestRenderer.act(() => fields[index].props.onChangeText(values[index]));
  }
  const save = tree.root.findByProps({testID: 'save-book-button'}).props.onPress;
  await ReactTestRenderer.act(() => { save(); save(); });
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(tree.root.findByProps({testID: 'save-book-button'}).props.disabled).toBe(true);
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  expect(dismiss.mock.invocationCallOrder[0]).toBeLessThan(navigation.goBack.mock.invocationCallOrder[0]);
  await ReactTestRenderer.act(async () => { await new Promise(resolve => setTimeout(resolve, 5)); });
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  isVisible.mockRestore();
  dismiss.mockRestore();
  ReactTestRenderer.act(() => tree.unmount());
});

test('focused numeric fields scroll the form to its end after viewport changes and keyboard shows', async () => {
  let keyboardDidShow: (() => void) | undefined;
  const removeListener = jest.fn();
  const addListener = jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, listener) => {
    if (eventName === 'keyboardDidShow') {
      keyboardDidShow = listener as () => void;
    }
    return {remove: removeListener} as never;
  });
  const tree = await renderScreen(<BookFormScreen navigation={navigation as never} route={{key: 'form', name: 'BookForm'} as never} />);
  const scrollView = tree.root.findByType(ScrollView);
  const scrollToEnd = jest.spyOn(scrollView.instance, 'scrollToEnd');
  const quantityInput = tree.root.findAllByType(TextInput).find(input => input.props.testID === 'book-quantity-input');
  await ReactTestRenderer.act(() => quantityInput?.props.onFocus());
  await ReactTestRenderer.act(() => scrollView.props.onLayout({}));
  await ReactTestRenderer.act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
  expect(scrollToEnd).toHaveBeenCalledWith({animated: true});
  await ReactTestRenderer.act(async () => {
    keyboardDidShow?.();
    await new Promise(resolve => setTimeout(resolve, 10));
  });
  expect(scrollToEnd.mock.calls.length).toBeGreaterThanOrEqual(2);
  ReactTestRenderer.act(() => tree.unmount());
  scrollToEnd.mockRestore();
  addListener.mockRestore();
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

test('real detail screen shows a storage write error and retry saves the latest provider snapshot', async () => {
  storage.getItem.mockResolvedValue(JSON.stringify([
    {id: 'retry-book', title: 'Sách thử lại', author: 'Tác giả', category: 'Khoa học', year: 2020, quantity: 3, borrowed: 0},
  ]));
  const attemptedSnapshots: string[] = [];
  storage.setItem.mockImplementation(async (_key, value) => {
    attemptedSnapshots.push(value);
    if (attemptedSnapshots.length <= 2) {
      throw new Error('Không thể ghi vào kho lưu trữ.');
    }
  });
  const tree = await renderScreen(<BookDetailScreen navigation={navigation as never} route={{key: 'detail', name: 'BookDetail', params: {bookId: 'retry-book'}} as never} />);
  const lend = tree.root.findByProps({testID: 'lend-book-button'}).props.onPress;
  await ReactTestRenderer.act(async () => {
    lend();
    lend();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree.root.findByProps({testID: 'storage-error-banner'})).toBeTruthy();
  expect(tree.root.findByProps({children: 'Không thể ghi vào kho lưu trữ.'})).toBeTruthy();
  expect(JSON.parse(attemptedSnapshots[0])[0].borrowed).toBe(1);

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({testID: 'storage-retry-button'}).props.onPress();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(JSON.parse(attemptedSnapshots.at(-1)!)[0].borrowed).toBe(2);
  expect(tree.root.findAllByProps({testID: 'storage-error-banner'})).toHaveLength(0);
  ReactTestRenderer.act(() => tree.unmount());
});
