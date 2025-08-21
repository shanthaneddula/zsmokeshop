'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ProductImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  disabled?: boolean;
}

export default function ProductImageUpload({
  currentImage,
  onImageUpload,
  isUploading = false,
  disabled = false
}: ProductImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const removeImage = () => {
    // For now, we'll just clear the current image
    // In a full implementation, you might want to call an onRemove callback
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      {currentImage && (
        <div className="relative">
          <div className="relative w-full h-48 border border-gray-900 dark:border-white">
            <OptimizedImage
              src={currentImage}
              alt="Product image"
              context="preview"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600'
        } ${
          disabled || isUploading
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-900 dark:hover:border-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Uploading image...
              </p>
            </>
          ) : (
            <>
              {currentImage ? (
                <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
              )}
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {currentImage ? 'Replace Image' : 'Upload Product Image'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports JPEG, PNG, WebP • Max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p>• Recommended size: 800x800px or larger</p>
        <p>• Images will be automatically optimized for web</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
      </div>
    </div>
  );
}
