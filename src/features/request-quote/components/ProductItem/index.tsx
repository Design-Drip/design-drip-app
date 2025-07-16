import { ColorPanel, ProductColor } from '@/components/products/ColorPanel'
import { ProductImageDisplay } from '@/components/products/ProductImageDisplay'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React, { useState } from 'react'

interface ProductItemProps {
    product: any;
    onSelect?: (product: any) => void;
    isSelected?: boolean;
}

const ProductItem = ({ product, onSelect, isSelected }: ProductItemProps) => {
    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0] : null
    )

    const handleColorSelect = (color: ProductColor) => {
        setSelectedColor(color);
    };

    const handleSelectProduct = () => {
        if (onSelect) {
            const productWithColor = {
                ...product,
                selectedColor: selectedColor,
            };
            onSelect(productWithColor);
        }
    }

    return (
        <div className='grid grid-cols-2 gap-4 border-b-2 border-gray-400'>
            <ProductImageDisplay
                colors={product.colors}
                selectedColor={selectedColor}
                className="mb-4 rounded-lg overflow-hidden bg-gray-100"
            />
            <div>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                <div>
                    <h3 className='text-sm font-medium mb-2'>Color</h3>
                    <ColorPanel
                        colors={product.colors}
                        selectedColor={selectedColor}
                        onColorSelect={handleColorSelect}
                        size='sm'
                    />
                </div>
                <div className='mt-4'>
                    <Button
                        className=""
                        onClick={handleSelectProduct}
                    >
                        {isSelected ? (
                            <div className='flex items-center gap-2'>
                                <Check className='h-4 w-4' />
                                <span>Selected</span>
                            </div>
                        ) : (
                            'Select product'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProductItem