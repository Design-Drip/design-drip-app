'use client'

import React, { useState } from 'react'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import CartItem from '@/components/cart/CartItem'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

// Mock data cho demo
const mockCartItems = [
    {
        id: '1',
        name: 'Custom T-Shirt Design #1',
        price: 29.99,
        originalPrice: 35.99,
        image: '/api/placeholder/300/300',
        quantity: 2,
        size: 'L',
        color: 'Black',
        designType: 'Custom'
    },
    {
        id: '2',
        name: 'Vintage Style Hoodie',
        price: 49.99,
        image: '/api/placeholder/300/300',
        quantity: 1,
        size: 'M',
        color: 'Navy Blue',
        designType: 'Template'
    },
    {
        id: '3',
        name: 'Minimalist Logo Tee',
        price: 24.99,
        originalPrice: 29.99,
        image: '/api/placeholder/300/300',
        quantity: 3,
        size: 'S',
        color: 'White',
        designType: 'Logo'
    }
]

export default function Cart() {
    const addSelectedStatusToCartItem = mockCartItems.map((item) => ({
        ...item,
        selected: false,
    }))

    const [cartItems, setCartItems] = useState(addSelectedStatusToCartItem)
    const [subTotal, setSubTotal] = useState(0);

    const handleUpdateQuantity = (id: string, quantity: number) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        )
    }

    const handleRemoveItem = (id: string) => {
        setCartItems(items => items.filter(item => item.id !== id))
    }

    const handleToggleSelect = (id: string) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            )
        )
    }

    const handleSelectAll = () => {
        const allSelected = cartItems.every(item => item.selected)
        setCartItems(items =>
            items.map(item => ({ ...item, selected: !allSelected }))
        )
    }

    //Calculate total for each item is selected 
    const selectedItems = cartItems.filter(item => item.selected)
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = subtotal > 50 ? 0 : 5.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected)
    const hasSelectedItems = cartItems.some(item => item.selected)

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    </div>

                    {/* Empty Cart */}
                    <div className="bg-white rounded-xl p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <Link href="/design">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Start Designing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-2">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                <div className='flex justify-center items-center mb-8'>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <span className="text-sm text-gray-500">({cartItems.length} items)</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className='lg:col-span-2'>
                        {/* Select All */}
                        <div className="flex items-center gap-3 mb-4 p-4 bg-white rounded-xl border border-gray-100">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={handleSelectAll}
                                className="w-5 h-5"
                            />
                            <span className="font-medium text-gray-900">
                                Select All ({selectedItems.length}/{cartItems.length})
                            </span>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.id}
                                    {...item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="rounded-xl p-6 sticky top-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {shipping > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                                    </p>
                                </div>
                            )}

                            <Button
                                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3"
                                disabled={!hasSelectedItems}
                            >
                                Proceed to Checkout
                            </Button>

                            <div className="mt-4 text-center">
                                <Link href="/design">
                                    <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900">
                                        Continue Designing
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}