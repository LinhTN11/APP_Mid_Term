import {Book, BookErrors, BookInput, CATEGORIES, Category} from '../types/book';

let generatedId = 0;

export function validateBook(input: BookInput, borrowed = 0): BookErrors {
  const errors: BookErrors = {};
  if (!input.title.trim()) {
    errors.title = 'Vui lòng nhập tên sách.';
  }
  if (!input.author.trim()) {
    errors.author = 'Vui lòng nhập tên tác giả.';
  }
  if (!CATEGORIES.includes(input.category)) {
    errors.category = 'Vui lòng chọn thể loại hợp lệ.';
  }

  const yearText = input.year.trim();
  const year = Number(yearText);
  if (!/^\d+$/.test(yearText) || !Number.isSafeInteger(year)) {
    errors.year = 'Năm xuất bản phải là số nguyên hợp lệ.';
  } else if (year < 1900 || year > new Date().getFullYear()) {
    errors.year = `Năm xuất bản phải từ 1900 đến ${new Date().getFullYear()}.`;
  }

  const quantityText = input.quantity.trim();
  const quantity = Number(quantityText);
  if (!/^\d+$/.test(quantityText) || !Number.isSafeInteger(quantity)) {
    errors.quantity = 'Số lượng phải là số nguyên hợp lệ.';
  } else if (quantity < 1) {
    errors.quantity = 'Số lượng phải lớn hơn 0.';
  } else if (quantity < borrowed) {
    errors.quantity = 'Số lượng không được ít hơn số sách đang mượn.';
  }
  return errors;
}

function requireValid(input: BookInput, borrowed = 0): Omit<Book, 'id' | 'borrowed'> {
  const errors = validateBook(input, borrowed);
  if (Object.keys(errors).length) {
    throw new Error(Object.values(errors).join(' '));
  }
  return {
    title: input.title.trim(),
    author: input.author.trim(),
    category: input.category,
    year: Number(input.year.trim()),
    quantity: Number(input.quantity.trim()),
  };
}

export function createBook(input: BookInput): Book {
  const values = requireValid(input);
  generatedId += 1;
  return {
    id: `book-${Date.now()}-${generatedId}-${Math.random().toString(36).slice(2, 8)}`,
    ...values,
    borrowed: 0,
  };
}

export function updateBook(book: Book, input: BookInput): Book {
  return {...book, ...requireValid(input, book.borrowed)};
}

export function borrowBook(book: Book): Book {
  if (book.borrowed >= book.quantity) {
    throw new Error('Sách đã được mượn hết.');
  }
  return {...book, borrowed: book.borrowed + 1};
}

export function returnBook(book: Book): Book {
  if (book.borrowed <= 0) {
    throw new Error('Không có sách đang mượn để trả.');
  }
  return {...book, borrowed: book.borrowed - 1};
}

export function deleteBook(books: Book[], id: string): Book[] {
  const book = books.find(item => item.id === id);
  if (!book) {
    throw new Error('Không tìm thấy sách cần xoá.');
  }
  if (book.borrowed > 0) {
    throw new Error('Không thể xoá sách đang được mượn.');
  }
  return books.filter(item => item.id !== id);
}

export function filterBooks(
  books: Book[],
  query: string,
  category: Category | 'Tất cả',
): Book[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  return books.filter(book => {
    const matchesCategory = category === 'Tất cả' || book.category === category;
    const matchesQuery =
      !normalizedQuery ||
      book.title.toLocaleLowerCase('vi').includes(normalizedQuery) ||
      book.author.toLocaleLowerCase('vi').includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}
