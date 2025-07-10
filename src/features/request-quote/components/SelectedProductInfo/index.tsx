import { ColorPanel, ProductColor } from '@/components/products/ColorPanel';
import { ProductImageDisplay } from '@/components/products/ProductImageDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Package, X } from 'lucide-react';
import React, { useState } from 'react'

interface SelectedProductInfoProps {
    product: any;
    onRemove?: () => void;
    className?: string;
}

const SelectedProductInfo: React.FC<SelectedProductInfoProps> = ({
    product,
    onRemove,
    className
}) => {
    console.log(product)

    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0] : null
    )

    const handleColorSelect = (color: ProductColor) => {
        setSelectedColor(color);
    };

    return (
        <Card className={cn("border-green-200 bg-green-50", className)}>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <CardTitle className='text-sm font-medium text-green-800 flex items-center gap-2'>
                        <Package className='h-4 w-4' />
                        Selected Product
                    </CardTitle>
                    {onRemove && (
                        <Button
                            variant="ghost"
                            size="sm"

                        >
                            <X className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className='pt-0'>
                <div className='space-x-3'>
                    <div className='flex gap-3'>
                        <div className='flex-shrink-0' style={{ width: '200px' }}>
                            <ProductImageDisplay
                                colors={product.colors}
                                selectedColor={selectedColor}
                                className="mb-4 rounded-lg overflow-hidden bg-gray-100"
                            />
                        </div>
                        <div>
                            <div className='mb-4'>
                                <h3 className='font-semibold'>Product Name:</h3>
                                <p>{product.name}</p>
                            </div>
                            <div className='mb-4'>
                                <h3 className=' mb-2 font-semibold'>Product Colors:</h3>
                                <ColorPanel
                                    colors={product.colors}
                                    selectedColor={selectedColor}
                                    onColorSelect={handleColorSelect}
                                    size='sm'
                                />
                            </div>
                            <div>
                                <h3 className='font-semibold'>Product sizing:</h3>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SelectedProductInfo