import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Book, BookInput} from '../types/book';
import {
  borrowBook,
  createBook,
  deleteBook,
  returnBook,
  updateBook,
} from '../domain/books';
import {createBookWriter, loadBooks} from '../data/bookStorage';

export type LibraryValue = {
  books: Book[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  addBook(input: BookInput): Book;
  editBook(id: string, input: BookInput): void;
  removeBook(id: string): void;
  lendBook(id: string): void;
  receiveBook(id: string): void;
  retry(): void;
};

const LibraryContext = createContext<LibraryValue | undefined>(undefined);

export function LibraryProvider({children}: PropsWithChildren) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const booksRef = useRef<Book[]>([]);
  const hydratedRef = useRef(false);
  const pendingWritesRef = useRef(0);
  const latestWriteRef = useRef(0);
  const writerRef = useRef(createBookWriter());

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedBooks = await loadBooks();
      booksRef.current = storedBooks;
      setBooks(storedBooks);
      hydratedRef.current = true;
      setError(null);
    } catch (cause) {
      hydratedRef.current = false;
      setError(cause instanceof Error ? cause.message : 'Không thể tải dữ liệu sách.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const persist = useCallback((snapshot: Book[]) => {
    const writeId = ++latestWriteRef.current;
    pendingWritesRef.current += 1;
    setSaving(true);
    writerRef.current
      .enqueue(snapshot)
      .then(() => {
        if (writeId === latestWriteRef.current) {
          setError(null);
        }
      })
      .catch(cause => {
        setError(cause instanceof Error ? cause.message : 'Không thể lưu dữ liệu sách.');
      })
      .finally(() => {
        pendingWritesRef.current -= 1;
        setSaving(pendingWritesRef.current > 0);
      });
  }, []);

  const commitBooks = useCallback(
    (nextBooks: Book[]) => {
      booksRef.current = nextBooks;
      setBooks(nextBooks);
      persist(nextBooks);
    },
    [persist],
  );

  const ensureReady = useCallback(() => {
    if (!hydratedRef.current || loading) {
      throw new Error('Dữ liệu thư viện chưa sẵn sàng. Vui lòng thử lại sau.');
    }
  }, [loading]);

  const addBook = useCallback(
    (input: BookInput) => {
      ensureReady();
      const book = createBook(input);
      commitBooks([...booksRef.current, book]);
      return book;
    },
    [commitBooks, ensureReady],
  );

  const editBook = useCallback(
    (id: string, input: BookInput) => {
      ensureReady();
      const current = booksRef.current;
      const existing = current.find(book => book.id === id);
      if (!existing) {
        throw new Error('Không tìm thấy sách cần sửa.');
      }
      const updated = updateBook(existing, input);
      commitBooks(current.map(book => (book.id === id ? updated : book)));
    },
    [commitBooks, ensureReady],
  );

  const removeBook = useCallback(
    (id: string) => {
      ensureReady();
      commitBooks(deleteBook(booksRef.current, id));
    },
    [commitBooks, ensureReady],
  );

  const lendBook = useCallback(
    (id: string) => {
      ensureReady();
      const current = booksRef.current;
      const existing = current.find(book => book.id === id);
      if (!existing) {
        throw new Error('Không tìm thấy sách cần cho mượn.');
      }
      const updated = borrowBook(existing);
      commitBooks(current.map(book => (book.id === id ? updated : book)));
    },
    [commitBooks, ensureReady],
  );

  const receiveBook = useCallback(
    (id: string) => {
      ensureReady();
      const current = booksRef.current;
      const existing = current.find(book => book.id === id);
      if (!existing) {
        throw new Error('Không tìm thấy sách cần nhận trả.');
      }
      const updated = returnBook(existing);
      commitBooks(current.map(book => (book.id === id ? updated : book)));
    },
    [commitBooks, ensureReady],
  );

  const retry = useCallback(() => {
    if (hydratedRef.current) {
      persist(booksRef.current);
      return;
    }
    hydrate();
  }, [hydrate, persist]);

  const value = useMemo(
    () => ({books, loading, error, saving, addBook, editBook, removeBook, lendBook, receiveBook, retry}),
    [books, loading, error, saving, addBook, editBook, removeBook, lendBook, receiveBook, retry],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const value = useContext(LibraryContext);
  if (!value) {
    throw new Error('useLibrary phải được dùng bên trong LibraryProvider.');
  }
  return value;
}
