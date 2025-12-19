import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import { StorePhotosClient } from './store-photos-client';

export const metadata: Metadata = {
  title: 'Store Photos | Admin - Z Smoke Shop',
  description: 'Manage store photos for the gallery section',
};

export default function StorePhotosPage() {
  return (
    <AdminLayout>
      <StorePhotosClient />
    </AdminLayout>
  );
}
