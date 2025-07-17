import * as React from "react";
import { Package, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TableProducts } from "@/features/admin/components/TableProducts";
import { AddProductButton } from "@/features/admin/components/AddProductButton";
import { ProductFilters } from "@/features/admin/components/ProductFilters";
import { CategoriesManager } from "@/features/admin/components/CategoriesManager";
import { getProducts } from "./_actions";
import { getCategories } from "../categories/_actions";

export interface Product {
  id: string;
  name: string;
  description?: string;
  default_price: number;
  isActive: boolean;
  categories: string[];
  imagesCount: number;
  variantsCount: number;
  createdAt: number;
  updatedAt: number;
}

export default async function ProductsManagementPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    category?: string;
  };
}) {
  // Get the search and status parameters
  const searchTerm = searchParams.search || "";
  const statusFilter = searchParams.status || "all";
  const categoryFilter = searchParams.category || "all";

  // Fetch products
  const products = await getProducts();

  // Fetch categories
  const categories = await getCategories();

  // Filter products based on search term, status, and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    const matchesCategory =
      categoryFilter === "all" ||
      product.categories.some(
        (category) => category.toLowerCase() === categoryFilter.toLowerCase()
      );

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Count by status
  const activeCount = products.filter((product) => product.isActive).length;
  const inactiveCount = products.filter((product) => !product.isActive).length;

  // Get unique categories for filtering
  const uniqueCategories = Array.from(
    new Set(products.flatMap((product) => product.categories))
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Product Management
          </h2>
          <p className="text-muted-foreground">
            Create, edit, and manage store products
          </p>
        </div>
        <AddProductButton />
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inactiveCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Client component for filters */}
          <ProductFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            uniqueCategories={uniqueCategories}
          />

          <TableProducts products={filteredProducts} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManager initialCategories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
