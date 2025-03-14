export type Page<T> = {
  items: T[];
  total: number;
  pages: number;
  size: number;
  page: number;
};
