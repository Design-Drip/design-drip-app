"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { categories, colorCategories } from "@/lib/data/products";

interface FilterSidebarProps {
  onFilterChange?: (filters: Record<string, unknown>) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const popularSizes = ["S", "M", "L", "XL", "2XL", "3XL"];

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      }
      return [...prev, color];
    });
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      }
      return [...prev, size];
    });
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Categories</h2>

        {/* Search */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Search</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Filter</h3>

          {/* Category */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">category</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center">
                  <Checkbox
                    id={`category-${category.name}`}
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={() => handleCategoryChange(category.name)}
                  />
                  <label
                    htmlFor={`category-${category.name}`}
                    className="ml-2 text-sm font-medium text-gray-700 flex-1"
                  >
                    {category.name}
                  </label>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">size</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {popularSizes.map((size) => (
                <div key={size} className="flex items-center">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => handleSizeChange(size)}
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
            <button className="text-xs text-red-600 font-medium">
              View all sizes
            </button>
          </div>

          {/* Color */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">color</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {colorCategories.map((color) => (
                <div key={color.name} className="flex items-center">
                  <Checkbox
                    id={`color-${color.name}`}
                    checked={selectedColors.includes(color.name)}
                    onCheckedChange={() => handleColorChange(color.name)}
                  />
                  <label
                    htmlFor={`color-${color.name}`}
                    className="ml-2 text-sm font-medium text-gray-700 flex-1"
                  >
                    {color.name}
                  </label>
                  <span className="text-xs text-gray-500">({color.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">price</h4>
            <div className="px-2">
              <Slider
                defaultValue={[0, 100]}
                max={100}
                step={1}
                value={priceRange}
                onValueChange={setPriceRange}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
