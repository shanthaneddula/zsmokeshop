import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import { ProductsClient } from './products-client';

export const metadata: Metadata = {
  title: 'Products | Admin - Z Smoke Shop',
  description: 'Manage products for Z Smoke Shop'
};

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductsClient />
    </AdminLayout>
  );
}
