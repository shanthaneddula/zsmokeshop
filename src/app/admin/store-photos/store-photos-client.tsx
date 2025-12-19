'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Upload, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';

interface StorePhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export function StorePhotosClient() {
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<StorePhoto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/store-photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching store photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Upload image to your storage service
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'store-photos');

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          
          // Create store photo entry
          const createResponse = await fetch('/api/admin/store-photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: uploadData.data.url,
              title: '',
              description: '',
              status: 'active',
            }),
          });

          if (createResponse.ok) {
            await fetchPhotos();
          } else {
            const errorData = await createResponse.json();
            console.error('Failed to create store photo entry:', errorData);
            alert(`Failed to save photo: ${errorData.error || 'Unknown error'}`);
          }
        } else {
          const errorData = await uploadResponse.json();
          console.error('Upload failed:', errorData);
          alert(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload some photos');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleToggleStatus = async (photoId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/admin/store-photos/${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Error toggling photo status:', error);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/admin/store-photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPhotos.length} photo(s)?`)) return;

    try {
      const response = await fetch('/api/admin/store-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPhotos }),
      });

      if (response.ok) {
        setSelectedPhotos([]);
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Error bulk deleting photos:', error);
    }
  };

  const handleEditPhoto = (photo: StorePhoto) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title || '');
    setEditDescription(photo.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    try {
      const response = await fetch(`/api/admin/store-photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (response.ok) {
        setEditingPhoto(null);
        setEditTitle('');
        setEditDescription('');
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPhotos(
      selectedPhotos.length === photos.length ? [] : photos.map(p => p.id)
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-1 sm:mb-2">
            Store Photos
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage photos that appear in the gallery section on your homepage
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              {/* Upload Button */}
              <label className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black hover:bg-gray-800 active:bg-gray-900 text-white uppercase font-bold tracking-wide text-xs sm:text-sm rounded cursor-pointer transition-colors">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* Select All */}
              {photos.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 uppercase font-medium text-xs sm:text-sm tracking-wide rounded transition-colors"
                >
                  {selectedPhotos.length === photos.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedPhotos.length > 0 && (
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {selectedPhotos.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 hover:bg-black active:bg-gray-800 text-white uppercase font-bold text-xs sm:text-sm tracking-wide rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-black"></div>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-12 text-center">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-1 sm:mb-2">
              No Store Photos
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Upload photos to showcase your store on the homepage
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden group relative"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.id)}
                    onChange={() => handleSelectPhoto(photo.id)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 text-black focus:ring-black"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                      photo.status === 'active'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {photo.status}
                  </span>
                </div>

                {/* Photo */}
                <div className="relative h-32 sm:h-48 lg:h-64 bg-gray-100 dark:bg-gray-700">
                  <OptimizedImage
                    src={photo.url}
                    alt={photo.title || 'Store photo'}
                    context="card"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Photo Info */}
                <div className="p-2 sm:p-3 lg:p-4">
                  {photo.title && (
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
                      {photo.title}
                    </h3>
                  )}
                  {photo.description && (
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                      {photo.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEditPhoto(photo)}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm bg-black hover:bg-gray-800 active:bg-gray-900 text-white uppercase font-bold tracking-wide transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(photo.id, photo.status)}
                      className="p-1.5 sm:p-2 text-xs sm:text-sm border-2 border-gray-300 hover:border-black active:bg-gray-50 dark:border-gray-600 dark:hover:border-white text-gray-700 dark:text-gray-300 transition-colors"
                      title={photo.status === 'active' ? 'Hide' : 'Show'}
                    >
                      {photo.status === 'active' ? (
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 sm:p-2 text-xs sm:text-sm bg-gray-800 hover:bg-black active:bg-gray-900 dark:bg-gray-900 dark:hover:bg-black text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                    Edit Photo
                  </h2>
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Photo Preview */}
                  <div className="relative h-40 sm:h-56 lg:h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                    <OptimizedImage
                      src={editingPhoto.url}
                      alt={editTitle || 'Store photo'}
                      context="preview"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g., Store Front"
                      className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black hover:bg-gray-800 active:bg-gray-900 text-white uppercase font-bold tracking-wide text-xs sm:text-sm transition-colors"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 hover:border-black active:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-white text-gray-900 dark:text-white uppercase font-bold tracking-wide text-xs sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
