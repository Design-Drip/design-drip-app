"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrderFilters({
  searchTerm,
  statusFilter,
}: {
  searchTerm: string;
  statusFilter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams?.toString());

    // Set the new search parameters
    if (localSearchTerm) {
      params.set("search", localSearchTerm);
    } else {
      params.delete("search");
    }

    if (localStatusFilter && localStatusFilter !== "all") {
      params.set("status", localStatusFilter);
    } else {
      params.delete("status");
    }

    // Always reset to page 1 when filters change
    params.set("pageNum", "1");

    const currentPath = pathname || "/admin/orders";
    const url = `${currentPath}?${params.toString()}`;

    console.log("Navigating to URL:", url);
    router.push(url);
  };

  const handleReset = () => {
    setLocalSearchTerm("");
    setLocalStatusFilter("all");

    const currentPath = pathname || "/admin/orders";
    const url = `${currentPath}?pageNum=1`;

    console.log("Resetting filters, navigating to:", url);
    router.push(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          placeholder="Search by Item name"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Select
          value={localStatusFilter}
          onValueChange={(value) => setLocalStatusFilter(value)}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="h-10">
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
