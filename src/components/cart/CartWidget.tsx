"use client"
import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface CartWidgetProps {
    itemCount: number
}

export default function CartWidget({ itemCount }: CartWidgetProps) {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push('/cart')}
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            <ShoppingCart className="h-5 w-5" />
            <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-bold rounded-full p-0 min-w-[20px]"
            >
                {itemCount}
            </Badge>
        </Button>
    )
}
