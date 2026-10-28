import AsyncStorage from '@react-native-async-storage/async-storage';
import {Book, CATEGORIES} from '../types/book';
import {SEED_BOOKS} from './seedBooks';

export const BOOKS_STORAGE_KEY = '@library/books';

export type StorageAdapter = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

export function isBook(value: unknown): value is Book {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<Book>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.author === 'string' &&
    candidate.author.trim().length > 0 &&
    CATEGORIES.includes(candidate.category as (typeof CATEGORIES)[number]) &&
    Number.isSafeInteger(candidate.year) &&
    candidate.year! >= 1900 &&
    candidate.year! <= new Date().getFullYear() &&
    Number.isSafeInteger(candidate.quantity) &&
    candidate.quantity! > 0 &&
    Number.isSafeInteger(candidate.borrowed) &&
    candidate.borrowed! >= 0 &&
    candidate.borrowed! <= candidate.quantity!
  );
}

export function parseStoredBooks(raw: string): Book[] {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('Dữ liệu sách bị lỗi định dạng. Vui lòng thử tải lại.');
  }
  if (
    !Array.isArray(value) ||
    !value.every(isBook) ||
    new Set(value.map(book => book.id)).size !== value.length
  ) {
    throw new Error('Dữ liệu sách không hợp lệ. Vui lòng thử tải lại.');
  }
  return value.map(book => ({
    ...book,
    title: book.title.trim(),
    author: book.author.trim(),
  }));
}

export async function loadBooks(
  storage: StorageAdapter = AsyncStorage,
): Promise<Book[]> {
  const raw = await storage.getItem(BOOKS_STORAGE_KEY);
  if (raw === null) {
    const seedSnapshot = JSON.stringify(SEED_BOOKS);
    await storage.setItem(BOOKS_STORAGE_KEY, seedSnapshot);
    return SEED_BOOKS.map(book => ({...book}));
  }
  return parseStoredBooks(raw);
}

export function createBookWriter(storage: StorageAdapter = AsyncStorage) {
  let queue = Promise.resolve();
  return {
    enqueue(books: Book[]): Promise<void> {
      const snapshot = JSON.stringify(books);
      const write = queue.then(() => storage.setItem(BOOKS_STORAGE_KEY, snapshot));
      queue = write.catch(() => undefined);
      return write;
    },
  };
}

