import { Metadata } from 'next';
import AdminLayout from '../../../components/AdminLayout';
import { EditProductClient } from './edit-product-client';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Edit Product | Admin - Z Smoke Shop',
  description: 'Edit product details'
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <EditProductClient productId={id} />
    </AdminLayout>
  );
}
