'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';

interface UploadedImage {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  category: string;
  url: string;
  path: string;
}

interface ImageUploadProps {
  category?: string;
  maxFiles?: number;
  onUpload?: (images: UploadedImage[]) => void;
  onRemove?: (image: UploadedImage) => void;
  existingImages?: UploadedImage[];
  disabled?: boolean;
  className?: string;
}

interface CompressOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_COMPRESS_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'webp'
};

export default function ImageUpload({
  category = 'general',
  maxFiles = 5,
  onUpload,
  onRemove,
  existingImages = [],
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image using Canvas API
  const compressImage = useCallback((file: File, options: CompressOptions = DEFAULT_COMPRESS_OPTIONS): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const { maxWidth, maxHeight } = options;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${options.format}`,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          `image/${options.format}`,
          options.quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('category', category);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  }, [category, compressImage]);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - images.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);
    
    if (fileArray.length > remainingSlots) {
      setErrors(prev => [...prev, `Only ${remainingSlots} more files can be uploaded`]);
    }
    
    setUploading(true);
    setErrors([]);
    
    const uploadPromises = filesToUpload.map(async (file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + Math.random() * 30, 90)
          }));
        }, 200);
        
        const uploadedImage = await uploadFile(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);
        
        return uploadedImage;
      } catch (error: any) {
        setErrors(prev => [...prev, `Failed to upload ${file.name}: ${error.message}`]);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        return null;
      }
    });
    
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result): result is UploadedImage => result !== null);
    
    const newImages = [...images, ...successfulUploads];
    setImages(newImages);
    setUploading(false);
    
    if (onUpload && successfulUploads.length > 0) {
      onUpload(successfulUploads);
    }
  }, [disabled, maxFiles, images.length, uploadFile, onUpload]);

  // Remove image
  const removeImage = useCallback(async (image: UploadedImage) => {
    if (disabled) return;
    
    try {
      // Call delete API
      const response = await fetch(`/api/admin/upload?path=${encodeURIComponent(image.path)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const newImages = images.filter(img => img.fileName !== image.fileName);
        setImages(newImages);
        
        if (onRemove) {
          onRemove(image);
        }
      } else {
        const result = await response.json();
        setErrors(prev => [...prev, result.error || 'Failed to delete image']);
      }
    } catch (error: any) {
      setErrors(prev => [...prev, `Failed to delete image: ${error.message}`]);
    }
  }, [disabled, images, onRemove]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // File input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, WEBP up to 5MB ({maxFiles - images.length} remaining)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {fileId.split('-')[0]}
                </span>
                <span className="text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Upload Errors
              </h4>
              <ul className="mt-1 text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
              <button
                onClick={clearErrors}
                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Clear errors
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.fileName}
              className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.url}
                alt={image.originalName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image);
                  }}
                  disabled={disabled}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate" title={image.originalName}>
                  {image.originalName}
                </p>
                <p className="text-white/70 text-xs">
                  {(image.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            <span>{images.length} image{images.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-green-500" />
            <span>Auto-compressed to WebP</span>
          </div>
        </div>
      )}
    </div>
  );
}
