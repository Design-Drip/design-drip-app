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
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface OrderFiltersProps {
  searchTerm: string;
  statusFilter: string;
}

export function OrderFilters({ searchTerm, statusFilter }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchTerm);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Function to create a new URL with updated search parameters
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when searching
      if (name === "search") {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  // Update URL when debounced search value changes
  useEffect(() => {
    const queryString = createQueryString("search", debouncedSearchValue);
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  }, [debouncedSearchValue, createQueryString, router, pathname]);

  // Handlers for each filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    const queryString = createQueryString("status", value);
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Input
        placeholder="Search by Order ID."
        className="md:w-1/2"
        value={searchValue}
        onChange={handleSearchChange}
      />
      <div className="flex gap-2 flex-1 md:justify-end">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
