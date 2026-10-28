import {
  borrowBook,
  createBook,
  deleteBook,
  filterBooks,
  returnBook,
  updateBook,
  validateBook,
} from '../src/domain/books';
import {BookInput} from '../src/types/book';

const input: BookInput = {
  title: '  Dế Mèn  ',
  author: 'Tô Hoài',
  category: 'Thiếu nhi',
  year: '1941',
  quantity: '3',
};

describe('book domain', () => {
  test('validates year and quantity boundaries', () => {
    expect(validateBook({...input, year: '1899'}).year).toBeTruthy();
    expect(validateBook({...input, year: String(new Date().getFullYear() + 1)}).year).toBeTruthy();
    expect(validateBook({...input, year: 'NaN'}).year).toBeTruthy();
    expect(validateBook({...input, year: '1941.5'}).year).toBeTruthy();
    expect(validateBook({...input, quantity: '2'}, 3).quantity).toBeTruthy();
    expect(validateBook({...input, quantity: 'NaN'}).quantity).toBeTruthy();
    expect(validateBook({...input, quantity: '2.5'}).quantity).toBeTruthy();
    expect(validateBook({...input, quantity: '0'}).quantity).toBeTruthy();
  });

  test('rejects empty and whitespace-only names', () => {
    expect(validateBook({...input, title: '   '}).title).toBeTruthy();
    expect(validateBook({...input, author: ''}).author).toBeTruthy();
  });

  test('trims names, creates unique ids, and edits without changing identity or borrowed count', () => {
    const first = createBook(input);
    const second = createBook(input);
    expect(first.title).toBe('Dế Mèn');
    expect(first.author).toBe('Tô Hoài');
    expect(first.id).not.toBe(second.id);

    const borrowed = {...first, borrowed: 2};
    const edited = updateBook(borrowed, {...input, title: '  Dế Mèn mới  ', quantity: '3'});
    expect(edited).toMatchObject({id: first.id, borrowed: 2, title: 'Dế Mèn mới'});
  });

  test('enforces lending and return boundaries', () => {
    const book = {...createBook(input), borrowed: 3};
    expect(() => borrowBook(book)).toThrow('Sách đã được mượn hết.');
    expect(returnBook({...book, borrowed: 1}).borrowed).toBe(0);
    expect(() => returnBook({...book, borrowed: 0})).toThrow('Không có sách đang mượn');
  });

  test('prevents deleting borrowed books and removes available books', () => {
    const available = createBook(input);
    const borrowed = {...createBook(input), borrowed: 1};
    expect(() => deleteBook([borrowed], borrowed.id)).toThrow('Không thể xoá');
    expect(deleteBook([available, borrowed], available.id)).toEqual([borrowed]);
  });

  test('searches title or author case-insensitively and combines category filter', () => {
    const book = createBook(input);
    expect(filterBooks([book], 'TÔ HOÀI', 'Thiếu nhi')).toHaveLength(1);
    expect(filterBooks([book], 'TÔ HOÀI', 'Khoa học')).toHaveLength(0);
    expect(filterBooks([book], 'dẾ mÈn', 'Tất cả')).toHaveLength(1);
  });
});
