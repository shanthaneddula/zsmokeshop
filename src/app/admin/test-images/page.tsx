'use client';

import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ImageGallery from '../components/ImageGallery';

export default function TestImagesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpload = (images: any[]) => {
    console.log('Images uploaded:', images);
    setRefreshKey(prev => prev + 1); // Refresh gallery
  };

  const handleDelete = (image: any) => {
    console.log('Image deleted:', image);
    setRefreshKey(prev => prev + 1); // Refresh gallery
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Phase 3: Image Upload System Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing image upload, compression, and gallery functionality
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Image Upload with Compression
        </h2>
        <ImageUpload
          category="test"
          maxFiles={5}
          onUpload={handleUpload}
          onRemove={handleDelete}
        />
      </div>

      {/* Gallery Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Image Gallery
        </h2>
        <ImageGallery
          key={refreshKey}
          category="test"
          onDelete={handleDelete}
          selectable={true}
          onSelect={(image) => console.log('Selected:', image)}
        />
      </div>
    </div>
  );
}
