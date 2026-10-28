import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {getItem: jest.fn(), setItem: jest.fn()},
}));
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LibraryProvider, useLibrary} from '../src/state/LibraryContext';
import {BOOKS_STORAGE_KEY} from '../src/data/bookStorage';
import {SEED_BOOKS} from '../src/data/seedBooks';
import {Book, BookInput} from '../src/types/book';

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const initialInput: BookInput = {
  title: '  Mùa hè  ',
  author: '  An Nguyễn ',
  category: 'Tiểu thuyết',
  year: '2022',
  quantity: '3',
};

function Probe({onValue}: {onValue: (value: ReturnType<typeof useLibrary>) => void}) {
  const value = useLibrary();
  React.useEffect(() => onValue(value), [onValue, value]);
  return null;
}

function setup() {
  let value: ReturnType<typeof useLibrary> | undefined;
  const onValue = (next: ReturnType<typeof useLibrary>) => { value = next; };
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<LibraryProvider><Probe onValue={onValue} /></LibraryProvider>);
  });
  return {get value() { return value!; }, unmount: () => ReactTestRenderer.act(() => renderer.unmount())};
}

async function settle() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

test('hydrates seeds, performs add/edit/lend/return/remove, persists each snapshot, and remounts', async () => {
  const saved: string[] = [];
  storage.setItem.mockImplementation(async (_key, value) => { saved.push(value); });
  const first = setup();
  await settle();
  expect(first.value.loading).toBe(false);
  expect(first.value.books).toHaveLength(5);
  expect(JSON.parse(saved[0])).toHaveLength(SEED_BOOKS.length);

  let added: Book | undefined;
  ReactTestRenderer.act(() => { added = first.value.addBook(initialInput); });
  expect(added?.title).toBe('Mùa hè');
  ReactTestRenderer.act(() => { first.value.editBook(added!.id, {...initialInput, title: 'Mùa hè mới', quantity: '4'}); });
  ReactTestRenderer.act(() => { first.value.lendBook(added!.id); });
  ReactTestRenderer.act(() => { first.value.receiveBook(added!.id); });
  ReactTestRenderer.act(() => { first.value.removeBook(added!.id); });
  await settle();
  expect(saved.map(raw => JSON.parse(raw).length)).toEqual([5, 6, 6, 6, 6, 5]);
  expect(first.value.books.some(book => book.id === added?.id)).toBe(false);
  first.unmount();

  const persistedBooks = JSON.parse(saved.at(-1)!) as Book[];
  storage.getItem.mockResolvedValue(JSON.stringify(persistedBooks));
  const remounted = setup();
  await settle();
  expect(remounted.value.books).toEqual(persistedBooks);
  remounted.unmount();
});

test('preserves a saved empty list through remount without reseeding it', async () => {
  storage.getItem.mockResolvedValue('[]');
  const first = setup();
  await settle();
  expect(first.value.books).toEqual([]);
  expect(storage.setItem).not.toHaveBeenCalled();
  first.unmount();
  const second = setup();
  await settle();
  expect(second.value.books).toEqual([]);
  expect(storage.setItem).not.toHaveBeenCalled();
  second.unmount();
});

test('blocks mutations after rejected hydration and safely retries hydration', async () => {
  storage.getItem.mockRejectedValueOnce(new Error('Đọc thất bại')).mockResolvedValueOnce('[]');
  const instance = setup();
  await settle();
  expect(instance.value.error).toBe('Đọc thất bại');
  expect(() => instance.value.addBook(initialInput)).toThrow('chưa sẵn sàng');
  expect(storage.setItem).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => instance.value.retry());
  await settle();
  expect(instance.value.error).toBeNull();
  expect(instance.value.books).toEqual([]);
  expect(storage.setItem).not.toHaveBeenCalled();
  instance.unmount();
});

test('blocks mutations while hydration is unresolved', async () => {
  let resolveRead!: (value: string | null) => void;
  storage.getItem.mockReturnValueOnce(new Promise(resolve => { resolveRead = resolve; }));
  const instance = setup();
  expect(instance.value.loading).toBe(true);
  expect(() => instance.value.addBook(initialInput)).toThrow('chưa sẵn sàng');
  expect(storage.setItem).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => { resolveRead('[]'); await Promise.resolve(); });
  expect(instance.value.loading).toBe(false);
  expect(instance.value.books).toEqual([]);
  instance.unmount();
});

test('rapid mutations compose from the latest snapshot and queued storage writes stay ordered', async () => {
  storage.getItem.mockResolvedValue('[]');
  const firstWrite: {resolve?: () => void} = {};
  const writes: string[] = [];
  storage.setItem.mockImplementation((_key, value) => {
    writes.push(value);
    if (writes.length === 1) return new Promise<void>(resolve => { firstWrite.resolve = resolve; });
    return Promise.resolve();
  });
  const instance = setup();
  await settle();
  ReactTestRenderer.act(() => {
    instance.value.addBook(initialInput);
    instance.value.addBook({...initialInput, title: 'Sách thứ hai'});
  });
  expect(instance.value.books.map(book => book.title)).toEqual(['Mùa hè', 'Sách thứ hai']);
  await settle();
  expect(writes).toHaveLength(1);
  firstWrite.resolve?.();
  await settle();
  expect(writes.map(raw => (JSON.parse(raw) as Book[]).map(book => book.title))).toEqual([
    ['Mùa hè'], ['Mùa hè', 'Sách thứ hai'],
  ]);
  instance.unmount();
});

test('exposes write failures and retry persists the latest snapshot', async () => {
  storage.getItem.mockResolvedValue('[]');
  storage.setItem.mockRejectedValueOnce(new Error('Ghi thất bại')).mockResolvedValueOnce(undefined);
  const instance = setup();
  await settle();
  ReactTestRenderer.act(() => { instance.value.addBook(initialInput); });
  await settle();
  expect(instance.value.error).toBe('Ghi thất bại');
  ReactTestRenderer.act(() => { instance.value.addBook({...initialInput, title: 'Bản mới nhất'}); });
  ReactTestRenderer.act(() => instance.value.retry());
  await settle();
  expect(storage.setItem).toHaveBeenLastCalledWith(BOOKS_STORAGE_KEY, JSON.stringify(instance.value.books));
  expect(instance.value.error).toBeNull();
  instance.unmount();
});
