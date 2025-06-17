export const ProductSort = [
  "newest",
  "oldest",
  "price_high",
  "price_low",
] as const;

export type ProductSortType = (typeof ProductSort)[number];
