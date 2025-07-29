"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestQuoteFiltersProps {
    searchTerm: string;
    statusFilter: string;
    typeFilter: string;
}

export function RequestQuoteFilters({
    searchTerm,
    statusFilter,
    typeFilter,
}: RequestQuoteFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilters = (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== "all") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to first page when filters change
        params.delete("pageNum");

        const queryString = params.toString();
        router.push(`/admin/request-quotes${queryString ? `?${queryString}` : ""}`);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;
        updateFilters({ search });
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all";

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="search"
                        placeholder="Search by name, email, or company..."
                        defaultValue={searchTerm}
                        className="pl-10"
                    />
                </div>
            </form>

            {/* Status Filter */}
            <Select
                value={statusFilter}
                onValueChange={(value) => updateFilters({ status: value })}
            >
                <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
                value={typeFilter}
                onValueChange={(value) => updateFilters({ type: value })}
            >
                <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="product">Product Quotes</SelectItem>
                    <SelectItem value="custom">Custom Quotes</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}