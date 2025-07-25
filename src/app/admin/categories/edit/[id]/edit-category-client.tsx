'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCategory } from '@/types/admin';
import { CategoryForm } from '../../../components/CategoryForm';

interface EditCategoryClientProps {
  categoryId: string;
}

export function EditCategoryClient({ categoryId }: EditCategoryClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCategory(data.data);
      } else if (response.status === 404) {
        setError('Category not found');
      } else {
        throw new Error('Failed to fetch category');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category');
    } finally {
      setIsLoadingCategory(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const handleSubmit = async (categoryData: Partial<AdminCategory>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        router.push('/admin/categories');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to update category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  if (isLoadingCategory) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>Admin</span>
          <span className="mx-2">›</span>
          <span 
            onClick={() => router.push('/admin/categories')}
            className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
          >
            Categories
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-white">Edit Category</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-900 dark:border-white p-12 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading category...</div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>Admin</span>
          <span className="mx-2">›</span>
          <span 
            onClick={() => router.push('/admin/categories')}
            className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
          >
            Categories
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-white">Edit Category</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-900 dark:border-white p-12 text-center">
          <div className="text-red-600 mb-4">{error || 'Category not found'}</div>
          <button
            onClick={() => router.push('/admin/categories')}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-900 dark:border-white font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Back to Categories
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
          onClick={() => router.push('/admin/categories')}
          className="cursor-pointer hover:text-gray-900 dark:hover:text-white"
        >
          Categories
        </span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 dark:text-white">Edit Category</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-wide">Edit Category</h1>
        <p className="text-red-600 dark:text-red-400">Category not found or you don&apos;t have permission to edit it.</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update category details for &quot;{category.name}&quot;
        </p>
      </div>

      {/* Category Form */}
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
