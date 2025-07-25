'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Trash2, 
  Download, 
  Eye, 
  Calendar,
  FileImage,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

interface ImageInfo {
  fileName: string;
  size: number;
  created: string;
  modified: string;
  url: string;
  path: string;
}

interface ImageGalleryProps {
  category?: string;
  onSelect?: (image: ImageInfo) => void;
  onDelete?: (image: ImageInfo) => void;
  selectable?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'created' | 'modified';
type SortOrder = 'asc' | 'desc';

export default function ImageGallery({
  category = 'general',
  onSelect,
  onDelete,
  selectable = false,
  className = ''
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load images
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/upload?category=${encodeURIComponent(category)}`);
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data.images);
      } else {
        setError(result.error || 'Failed to load images');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Filter and sort images
  useEffect(() => {
    const filtered = images.filter(image =>
      image.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort images
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'created':
          aValue = new Date(a.created).getTime();
          bValue = new Date(b.created).getTime();
          break;
        case 'modified':
          aValue = new Date(a.modified).getTime();
          bValue = new Date(b.modified).getTime();
          break;
        default:
          aValue = a.fileName;
          bValue = b.fileName;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredImages(filtered);
  }, [images, searchTerm, sortBy, sortOrder]);

  // Load images on mount and category change
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Delete image
  const handleDelete = useCallback(async (image: ImageInfo) => {
    if (!confirm(`Are you sure you want to delete "${image.fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/upload?path=${encodeURIComponent(image.path)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.fileName !== image.fileName));
        if (onDelete) {
          onDelete(image);
        }
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete image');
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  }, [onDelete]);

  // Download image
  const handleDownload = useCallback((image: ImageInfo) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading images...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Loading Images
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              <button
                onClick={loadImages}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [SortBy, SortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="created-desc">Newest first</option>
            <option value="created-asc">Oldest first</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest first</option>
            <option value="size-asc">Smallest first</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredImages.length} of {images.length} images
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <button
          onClick={loadImages}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        >
          Refresh
        </button>
      </div>

      {/* Images */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No images found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload some images to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.fileName}
              className={`
                relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square
                ${selectable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}
              `}
              onClick={() => selectable && onSelect && onSelect(image)}
            >
              <img
                src={image.url}
                alt={image.fileName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                      setShowPreview(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate" title={image.fileName}>
                  {image.fileName}
                </p>
                <p className="text-white/70 text-xs">
                  {formatFileSize(image.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <div
              key={image.fileName}
              className={`
                flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                ${selectable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
              `}
              onClick={() => selectable && onSelect && onSelect(image)}
            >
              <img
                src={image.url}
                alt={image.fileName}
                className="w-16 h-16 object-cover rounded-lg"
                loading="lazy"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {image.fileName}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(image.size)}</span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(image.created)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(image);
                    setShowPreview(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image);
                  }}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {selectedImage.fileName}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.fileName}
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {formatFileSize(selectedImage.size)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {formatDate(selectedImage.created)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                {selectable && onSelect && (
                  <button
                    onClick={() => {
                      onSelect(selectedImage);
                      setShowPreview(false);
                    }}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Select Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
