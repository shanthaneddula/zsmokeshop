import { Metadata } from 'next';
import AdminLayout from '../../../components/AdminLayout';
import { EditCategoryClient } from './edit-category-client';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Edit Category | Admin - Z Smoke Shop',
  description: 'Edit category details'
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <EditCategoryClient categoryId={id} />
    </AdminLayout>
  );
}
