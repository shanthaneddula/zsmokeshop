'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProduct } from '@/types/admin';
import { ProductForm } from '../../../components/ProductForm';

interface EditProductClientProps {
  productId: string;
}

export function EditProductClient({ productId }: EditProductClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data.data);
      } else if (response.status === 404) {
        setError('Product not found');
      } else {
        throw new Error('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleSubmit = async (productData: Partial<AdminProduct>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error instanceof Error ? error.message : 'Failed to update product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
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
          <span className="text-gray-900 dark:text-white">Edit Product</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-900 dark:border-white p-12 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
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
          <span className="text-gray-900 dark:text-white">Edit Product</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-900 dark:border-white p-12 text-center">
          <div className="text-red-600 mb-4">{error || 'Product not found'}</div>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
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
        <span className="text-gray-900 dark:text-white">Edit Product</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-wide">Edit Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update product details for &ldquo;{product.name}&rdquo;
        </p>
      </div>

      {/* Product Form */}
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
