'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { CATEGORY_TEMPLATE } from '@/constants/size'

interface DesignTemplateFiltersProps {
    searchTerm: string
    selectedCategory: string
    selectedStatus: string
    onSearchChange: (value: string) => void
    onCategoryChange: (value: string) => void
    onStatusChange: (value: string) => void
}

export default function DesignTemplateFilters({
    searchTerm,
    selectedCategory,
    selectedStatus,
    onSearchChange,
    onCategoryChange,
    onStatusChange,
}: DesignTemplateFiltersProps) {
    const categories = ['all', ...CATEGORY_TEMPLATE]
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
    ]

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}