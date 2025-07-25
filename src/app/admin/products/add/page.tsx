import { Metadata } from 'next';
import AdminLayout from '../../components/AdminLayout';
import { AddProductClient } from './add-product-client';

export const metadata: Metadata = {
  title: 'Add Product | Admin - Z Smoke Shop',
  description: 'Add a new product to Z Smoke Shop'
};

export default function AddProductPage() {
  return (
    <AdminLayout>
      <AddProductClient />
    </AdminLayout>
  );
}
