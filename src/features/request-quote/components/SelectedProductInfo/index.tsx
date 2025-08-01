'use client'

import { ColorPanel, ProductColor } from '@/components/products/ColorPanel';
import { ProductImageDisplay } from '@/components/products/ProductImageDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Package, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form';

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
    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0] : null
    )

    const { control, setValue, watch } = useFormContext();

    useEffect(() => {
        if (product?.colors && product.colors.length > 0) {
            const firstColor = product.colors[0];
            setSelectedColor(firstColor);

            setValue('product.selectedColorId', firstColor.id);
        } else {
            setSelectedColor(null);
            setValue('product.selectedColorId', '');
        }
    }, [product, setValue]);

    const handleColorSelect = (color: ProductColor) => {
        setSelectedColor(color);

        setValue(`product.selectedColorId`, color.id)

        if (Array.isArray(color.sizes)) {
            color.sizes.forEach((sizeObj: any) => {
                const fieldName = `product.quantityBySize.${color.id}.${sizeObj.size}`;
                setValue(fieldName, 0);
            })
        }
    };

    const getSizeByColor = (): string[] => {
        if (!selectedColor) return [];

        return Array.isArray(selectedColor.sizes) ? selectedColor.sizes.map((sizeObj: any) => sizeObj.size) : [];
    }

    const getFieldName = (colorId: string, size: string) =>
        `product.quantityBySize.${colorId}.${size}`

    const sizeFields = getSizeByColor().map(size => `product.quantityBySize.${selectedColor?.id}.${size}`);
    const quantities = useWatch({ control, name: sizeFields });

    const totalQuantity = React.useMemo(() => {
        return quantities.reduce((total, q) => total + (Number(q) || 0), 0);
    }, [quantities]);

    useEffect(() => {
        setValue('product.quantity', totalQuantity, {
            shouldValidate: false,
            shouldDirty: false
        });
    }, [totalQuantity, setValue]);

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
                                <h3 className='font-semibold mb-4'>Product sizing & quantity:</h3>
                                <ul className='flex gap-x-4'>
                                    {getSizeByColor().map((size) => (
                                        <li key={size} className='flex items-center'>
                                            <span className='inline-block pr-2'>{size}</span>
                                            <Controller
                                                name={getFieldName(selectedColor.id, size)}
                                                control={control}
                                                defaultValue={0}
                                                render={({ field }) => (
                                                    <Input
                                                        type='number'
                                                        min={0}
                                                        value={field.value}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                        className='w-24'
                                                    />
                                                )}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SelectedProductInfo