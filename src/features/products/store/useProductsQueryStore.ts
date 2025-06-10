import { ProductSortType } from "@/constants/sort";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProductCategory {
  id: string;
  name: string;
}

interface ProductsQueryState {
  // Filter options
  search: string;
  categories: ProductCategory[];
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;

  // Sort option
  sort: ProductSortType;
  page: number;
  limit: number;

  // Actions
  setSearch: (search: string) => void;
  setCategories: (categories: ProductCategory[]) => void;
  setSizes: (sizes: string[]) => void;
  setColors: (colors: string[]) => void;
  setPriceRange: (min: number | undefined, max: number | undefined) => void;
  setSort: (sort: ProductSortType) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
  toggleCategory: (category: ProductCategory) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
}

const initialState = {
  search: "",
  categories: [],
  sizes: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
  sort: "newest" as ProductSortType,
  page: 1,
  limit: 12,
};

export const useProductsQueryStore = create<ProductsQueryState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearch: (search) => set({ search, page: 1 }),
      setCategories: (categories) => set({ categories, page: 1 }),
      setSizes: (sizes) => set({ sizes, page: 1 }),
      setColors: (colors) => set({ colors, page: 1 }),
      setPriceRange: (minPrice, maxPrice) =>
        set({ minPrice, maxPrice, page: 1 }),
      setSort: (sort) => set({ sort }),
      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit }),

      resetFilters: () => set({ ...initialState }),

      toggleCategory: (category) =>
        set((state) => {
          const isInList = state.categories.some(
            (cat) => cat.id === category.id
          );
          return {
            categories: isInList
              ? state.categories.filter((cat) => cat.id !== category.id)
              : [...state.categories, category],
            page: 1,
          };
        }),

      toggleSize: (size) =>
        set((state) => {
          const isInList = state.sizes.includes(size);
          return {
            sizes: isInList
              ? state.sizes.filter((s) => s !== size)
              : [...state.sizes, size],
            page: 1,
          };
        }),

      toggleColor: (color) =>
        set((state) => {
          const isInList = state.colors.includes(color);
          return {
            colors: isInList
              ? state.colors.filter((c) => c !== color)
              : [...state.colors, color],
            page: 1,
          };
        }),
    }),
    {
      name: "products-query-store",
    }
  )
);
