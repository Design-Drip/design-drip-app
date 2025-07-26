import React from 'react'
import ProductItem from '../ProductItem';

interface ProductListProps {
  products: any[];
  onProductSelect?: (product: any) => void;
  selectedProductId?: string;
}

const ProductList = ({ products, onProductSelect, selectedProductId }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 overflow-y-auto h-96 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product._id || index}
            product={product}
            onSelect={onProductSelect}
            isSelected={selectedProductId === product._id}
          />
        );
      })}
    </div>
  )
}

export default ProductList