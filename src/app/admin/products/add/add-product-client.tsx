'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProduct } from '@/types/admin';
import { ProductForm } from '../../components/ProductForm';
import { BarcodeScanner } from '@/components/admin/BarcodeScanner';

export function AddProductClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeScanResult, setBarcodeScanResult] = useState<{
    found: boolean;
    product?: AdminProduct;
    barcode?: string;
  } | null>(null);

  const handleBarcodeSearch = async (barcode: string) => {
    try {
      const response = await fetch(`/api/admin/products/barcode?barcode=${encodeURIComponent(barcode)}`);
      const data = await response.json();
      
      if (data.success) {
        setBarcodeScanResult({
          found: data.found,
          product: data.data?.product,
          barcode: barcode
        });
      } else {
        alert(data.error || 'Failed to search barcode');
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      alert('Failed to search barcode. Please try again.');
    }
    setShowBarcodeScanner(false);
  };

  const handleSubmit = async (productData: Partial<AdminProduct>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">Add New Product</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new product for your inventory
          </p>
        </div>
        
        {/* Quick Barcode Scan Button */}
        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wide text-sm rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" 
            />
          </svg>
          Scan Barcode
        </button>
      </div>

      {/* Barcode Scan Result Alert */}
      {barcodeScanResult && (
        <div className={`p-4 rounded-lg ${
          barcodeScanResult.found 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {barcodeScanResult.found ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-green-800 dark:text-green-200">Product Found!</span>
                </div>
                <button
                  onClick={() => setBarcodeScanResult(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                <strong>{barcodeScanResult.product?.name}</strong> (Barcode: {barcodeScanResult.barcode})
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => router.push(`/admin/products/edit/${barcodeScanResult.product?.id}`)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => setBarcodeScanResult(null)}
                  className="px-3 py-1 border border-green-600 text-green-700 dark:text-green-300 text-sm font-medium rounded hover:bg-green-50 dark:hover:bg-green-900/30"
                >
                  Add New Anyway
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-bold text-yellow-800 dark:text-yellow-200">Product Not Found</span>
                </div>
                <button
                  onClick={() => setBarcodeScanResult(null)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                No product found with barcode: <strong className="font-mono">{barcodeScanResult.barcode}</strong>
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Fill out the form below to add this product. The barcode has been pre-filled.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Product Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        initialBarcode={barcodeScanResult?.found === false ? barcodeScanResult.barcode : undefined}
      />
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeSearch}
        title="Quick Product Lookup"
      />
    </div>
  );
}
