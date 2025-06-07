"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";

interface ProductFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  uniqueCategories: string[];
}

export function ProductFilters({
  searchTerm,
  statusFilter,
  categoryFilter,
  uniqueCategories,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Function to create a new URL with updated search parameters
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // Handlers for each filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`${pathname}?${createQueryString("search", e.target.value)}`);
  };

  const handleStatusChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("status", value)}`);
  };

  const handleCategoryChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("category", value)}`);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {" "}
      <Input
        placeholder="Search products..."
        className="md:w-1/3"
        defaultValue={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="flex gap-2 flex-1 md:justify-end">
        <Select defaultValue={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {" "}
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {uniqueCategories.length > 0 && (
          <Select
            defaultValue={categoryFilter}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
