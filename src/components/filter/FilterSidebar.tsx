"use client";

import { useMemo } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FIXED_SIZES } from "@/constants/size";
import { useProductsQueryStore } from "@/features/products/store/useProductsQueryStore";
import {
  getCategoriesQuery,
  getColorsQuery,
} from "@/features/products/services/queries";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/price";

interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  // Get filter states and actions from store
  const {
    search,
    categories: selectedCategories,
    sizes: selectedSizes,
    colors: selectedColors,
    minPrice,
    maxPrice,
    setSearch,
    toggleCategory,
    toggleSize,
    toggleColor,
    setPriceRange,
    resetFilters,
  } = useProductsQueryStore();

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery(
    getCategoriesQuery()
  );

  const { data: colorsData, isLoading: isLoadingColors } = useQuery(
    getColorsQuery()
  );

  const categories = useMemo(() => {
    return categoriesData?.categories || [];
  }, [categoriesData]);

  const colors = useMemo(() => {
    return colorsData?.colors || [];
  }, [colorsData]);

  const priceRange = useMemo(() => {
    return [minPrice || 0, maxPrice || 100];
  }, [minPrice, maxPrice]);

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange(min, max);
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  // Handle search changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <aside className={`w-full md:w-64 lg:w-72 bg-white ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-8"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Search</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products"
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={search}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {search && (
              <button
                className="absolute right-3 top-2.5"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Filter</h3>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap gap-1">
              {selectedCategories.map((cat) => (
                <Badge
                  key={`badge-cat-${cat}`}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleCategory(cat)}
                >
                  {cat.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedSizes.map((size) => (
                <Badge
                  key={`badge-size-${size}`}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedColors.map((color) => (
                <Badge
                  key={`badge-color-${color}`}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleColor(color)}
                >
                  {color}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Category */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Category</h4>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">
                  Loading categories...
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.some(
                        (cat) => cat.id === category.id
                      )}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm font-medium text-gray-700 flex-1"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No categories available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Size */}
          {/* <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Size</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {FIXED_SIZES.map((size) => (
                <div key={size} className="flex items-center">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => toggleSize(size)}
                  />
                  <label
                    htmlFor={`size-${size}`}
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div> */}

          {/* Color */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Color</h4>
            {isLoadingColors ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading colors...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {colors.map((color) => (
                  <div key={color.color} className="flex items-center">
                    <Checkbox
                      id={`color-${color.color}`}
                      checked={selectedColors.includes(color.color)}
                      onCheckedChange={() => toggleColor(color.color)}
                    />
                    <label
                      htmlFor={`color-${color.color}`}
                      className="ml-2 text-sm font-medium text-gray-700 flex-1 flex items-center gap-2"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{
                          backgroundColor: color.color_value || "#ffffff",
                        }}
                      />
                      {color.color}
                    </label>
                    <span className="text-xs text-gray-500">
                      ({color.count})
                    </span>
                  </div>
                ))}
                {colors.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No colors available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Price</h4>
            <div className="px-2">
              <Slider
                defaultValue={[0, 10000000]}
                max={10000000}
                step={1}
                value={priceRange as [number, number]}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
