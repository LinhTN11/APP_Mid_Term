export const CATEGORIES = [
  'Giáo trình',
  'Tiểu thuyết',
  'Khoa học',
  'Thiếu nhi',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Book = {
  id: string;
  title: string;
  author: string;
  category: Category;
  year: number;
  quantity: number;
  borrowed: number;
};

export type BookInput = {
  title: string;
  author: string;
  category: Category;
  year: string;
  quantity: string;
};

export type BookErrors = Partial<Record<keyof BookInput, string>>;
