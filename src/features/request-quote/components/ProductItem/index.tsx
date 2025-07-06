import { ColorPanel, ProductColor } from '@/components/products/ColorPanel'
import { ProductImageDisplay } from '@/components/products/ProductImageDisplay'
import React, { useState } from 'react'

const ProductItem = ({ product }: any) => {
    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0] : null
    )

    const handleColorSelect = (color: ProductColor) => {
        setSelectedColor(color);
    };

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
            </div>
        </div>
    )
}

export default ProductItem