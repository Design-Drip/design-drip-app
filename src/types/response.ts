export type ListResponse<T = any> = {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
};
