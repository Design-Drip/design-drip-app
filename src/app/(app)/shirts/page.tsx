
import { FilterSidebar } from '@/components/filter/FilterSidebar'
import { ProductGrid } from '@/components/products/ProductGrid'
import { products } from '@/lib/data/products'
import React from 'react'

function ShirtsPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 lg:w-72 shrink-0">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Design Your Own T-Shirt</h1>
            <p className="text-gray-600">Choose from our wide range of styles and colors</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{products.length}</span> products
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">Sort by:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}

export default ShirtsPage