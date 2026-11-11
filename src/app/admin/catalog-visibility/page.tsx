import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import CatalogVisibilityClient from './catalog-visibility-client';

export const metadata: Metadata = {
  title: 'Catalog Visibility | Admin - Z Smoke Shop',
  robots: { index: false, follow: false },
};

export default function CatalogVisibilityPage() {
  return (
    <AdminLayout>
      <CatalogVisibilityClient />
    </AdminLayout>
  );
}
