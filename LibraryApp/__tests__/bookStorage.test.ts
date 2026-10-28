jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import {
  BOOKS_STORAGE_KEY,
  createBookWriter,
  loadBooks,
  parseStoredBooks,
  StorageAdapter,
} from '../src/data/bookStorage';
import {SEED_BOOKS} from '../src/data/seedBooks';
import {Book} from '../src/types/book';

function memoryStorage(initial: string | null = null): StorageAdapter & {
  value: string | null;
  writes: string[];
} {
  return {
    value: initial,
    writes: [],
    async getItem() {
      return this.value;
    },
    async setItem(_key, value) {
      this.writes.push(value);
      this.value = value;
    },
  };
}

describe('book storage', () => {
  test('seeds once only when storage has no value', async () => {
    const storage = memoryStorage();
    const first = await loadBooks(storage);
    const second = await loadBooks(storage);
    expect(first).toHaveLength(5);
    expect(second).toEqual(first);
    expect(storage.writes).toHaveLength(1);
    expect(storage.writes[0]).toBe(JSON.stringify(SEED_BOOKS));
  });

  test('preserves an intentionally empty saved list', async () => {
    const storage = memoryStorage('[]');
    await expect(loadBooks(storage)).resolves.toEqual([]);
    expect(storage.writes).toHaveLength(0);
  });

  test('rejects malformed JSON and invalid book schemas', async () => {
    expect(() => parseStoredBooks('{')).toThrow('lỗi định dạng');
    expect(() => parseStoredBooks('[{"id":"x"}]')).toThrow('không hợp lệ');

    const storage = memoryStorage('{');
    await expect(loadBooks(storage)).rejects.toThrow('lỗi định dạng');
    expect(storage.writes).toHaveLength(0);
  });

  test('rejects unsafe persisted quantity and borrowed counters', () => {
    const unsafeQuantity = {
      ...SEED_BOOKS[0],
      quantity: Number.MAX_SAFE_INTEGER + 1,
      borrowed: 0,
    };
    const unsafeBorrowed = {
      ...SEED_BOOKS[0],
      quantity: Number.MAX_SAFE_INTEGER + 3,
      borrowed: Number.MAX_SAFE_INTEGER + 1,
    };

    expect(() => parseStoredBooks(JSON.stringify([unsafeQuantity]))).toThrow('không hợp lệ');
    expect(() => parseStoredBooks(JSON.stringify([unsafeBorrowed]))).toThrow('không hợp lệ');
  });

  test('trims stored titles and authors when loading valid records', () => {
    const stored = [{...SEED_BOOKS[0], title: '  Dế Mèn  ', author: ' Tô Hoài '}];
    expect(parseStoredBooks(JSON.stringify(stored))[0]).toMatchObject({
      title: 'Dế Mèn',
      author: 'Tô Hoài',
    });
  });

  test('does not overwrite storage when reading fails', async () => {
    const storage: StorageAdapter = {
      async getItem() {
        throw new Error('read failed');
      },
      async setItem() {
        throw new Error('must not write');
      },
    };
    await expect(loadBooks(storage)).rejects.toThrow('read failed');
  });

  test('serializes write snapshots in enqueue order', async () => {
    const storage = memoryStorage();
    const writer = createBookWriter(storage);
    const first: Book[] = [SEED_BOOKS[0]];
    const second: Book[] = [SEED_BOOKS[0], SEED_BOOKS[1]];
    const firstWrite = writer.enqueue(first);
    const secondWrite = writer.enqueue(second);
    await Promise.all([firstWrite, secondWrite]);
    expect(storage.writes).toEqual([JSON.stringify(first), JSON.stringify(second)]);
    expect(storage.value).toBe(JSON.stringify(second));
    expect(BOOKS_STORAGE_KEY).toBe('@library/books');
  });

  test('continues the write queue after an earlier write fails', async () => {
    const snapshots: string[] = [];
    const storage: StorageAdapter = {
      async getItem() {
        return null;
      },
      async setItem(_key, value) {
        snapshots.push(value);
        if (snapshots.length === 1) {
          throw new Error('disk full');
        }
      },
    };
    const writer = createBookWriter(storage);
    await expect(writer.enqueue([SEED_BOOKS[0]])).rejects.toThrow('disk full');
    await expect(writer.enqueue([SEED_BOOKS[1]])).resolves.toBeUndefined();
    expect(snapshots).toEqual([JSON.stringify([SEED_BOOKS[0]]), JSON.stringify([SEED_BOOKS[1]])]);
  });
});
