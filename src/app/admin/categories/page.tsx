import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import { CategoriesClient } from './categories-client';

export const metadata: Metadata = {
  title: 'Categories | Admin - Z Smoke Shop',
  description: 'Manage categories for Z Smoke Shop'
};

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoriesClient />
    </AdminLayout>
  );
}
