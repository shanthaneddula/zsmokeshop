import { Metadata } from 'next';
import AdminLayout from '../../components/AdminLayout';
import { AddCategoryClient } from './add-category-client';

export const metadata: Metadata = {
  title: 'Add Category | Admin - Z Smoke Shop',
  description: 'Add a new category to Z Smoke Shop'
};

export default function AddCategoryPage() {
  return (
    <AdminLayout>
      <AddCategoryClient />
    </AdminLayout>
  );
}
