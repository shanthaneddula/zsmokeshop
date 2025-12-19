import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import { UsersClient } from './users-client';

export const metadata: Metadata = {
  title: 'User Management | Admin - Z Smoke Shop',
  description: 'Manage employee users and permissions',
};

export default function UsersPage() {
  return (
    <AdminLayout>
      <UsersClient />
    </AdminLayout>
  );
}
