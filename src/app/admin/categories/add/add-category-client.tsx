'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCategory } from '@/types/admin';
import { CategoryForm } from '../../components/CategoryForm';

export function AddCategoryClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (categoryData: Partial<AdminCategory>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await response.json();
        router.push('/admin/categories');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : 'Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/categories');
  };

  return (
    <div className="p-6 sm:p-8">
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
        <span className="text-gray-900 dark:text-white">Add Category</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Add New Category</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new product category
        </p>
      </div>

      {/* Category Form */}
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
      </div>
    </div>
  );
}
