'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProduct } from '@/types/admin';
import { ProductForm } from '../../components/ProductForm';

export function AddProductClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData: Partial<AdminProduct>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error instanceof Error ? error.message : 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span>Admin</span>
        <span className="mx-2">›</span>
        <span 
          onClick={() => router.push('/admin/products')}
          className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
        >
          Products
        </span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 dark:text-white">Add Product</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Add New Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new product for your inventory
        </p>
      </div>

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
      </div>
    </div>
  );
}
