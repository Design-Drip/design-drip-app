'use client'

import React from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'

interface CartItemProps {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    quantity: number
    size: string
    color: string
    designType?: string
    selected: boolean
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemove: (id: string) => void,
    onToggleSelect: (id: string) => void
}

export default function CartItem({
    id,
    name,
    price,
    originalPrice,
    image,
    quantity,
    size,
    color,
    designType,
    selected,
    onUpdateQuantity,
    onRemove,
    onToggleSelect
}: CartItemProps) {
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            onUpdateQuantity(id, newQuantity)
        }
    }

    const quantityEachSize = [
        {
            size: 'S',
            quantity: 1,
        },
        {
            size: 'M',
            quantity: 1,
        },
        {
            size: 'L',
            quantity: 1,
        },
    ]

    const totalPrice = quantityEachSize.reduce((sum, item) => sum + (item.quantity * price), 0)

    return (
        <Card className="flex items-start gap-4 p-4 rounded-xl hover:shadow-md transition-shadow">

            <div className='flex items-center pt-2'>
                <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleSelect(id)}
                    className='w-5 h-5'
                />
            </div>

            {/* Product Image */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">
                            {name}
                        </h3>

                        {/* Product Attributes */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <p>Color:</p>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {color}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <p>
                                Size:
                            </p>
                            {quantityEachSize.map((item) => (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {item.size} (x{item.quantity})
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(id)}
                        className="text-gray-400 hover:text-red-500 p-1 h-auto"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Unit Price */}
                <div className="mt-2 text-xs text-gray-500">
                    ${price.toFixed(2)} each
                </div>

                {/* Price and Quantity */}
                <div className="flex justify-end items-center mt-3">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">
                            ${totalPrice.toFixed(2)}
                        </span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-sm text-gray-400 line-through">
                                ${(originalPrice * quantity).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </Card>
    )
}