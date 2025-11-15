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
        formData.append('folder', 'store-photos');

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
              url: uploadData.url,
              title: '',
              description: '',
              status: 'active',
            }),
          });

          if (createResponse.ok) {
            await fetchPhotos();
          }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Store Photos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage photos that appear in the gallery section on your homepage
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <label className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
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
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {selectedPhotos.length === photos.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPhotos.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Store Photos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload photos to showcase your store on the homepage
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group relative"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.id)}
                    onChange={() => handleSelectPhoto(photo.id)}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      photo.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {photo.status}
                  </span>
                </div>

                {/* Photo */}
                <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
                  <OptimizedImage
                    src={photo.url}
                    alt={photo.title || 'Store photo'}
                    context="card"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Photo Info */}
                <div className="p-4">
                  {photo.title && (
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {photo.title}
                    </h3>
                  )}
                  {photo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {photo.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPhoto(photo)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(photo.id, photo.status)}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      title={photo.status === 'active' ? 'Hide' : 'Show'}
                    >
                      {photo.status === 'active' ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Photo
                  </h2>
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Photo Preview */}
                  <div className="relative h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={editingPhoto.url}
                      alt={editTitle || 'Store photo'}
                      context="preview"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g., Store Front"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
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
