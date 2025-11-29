// Admin dashboard page

import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard | Z Smoke Shop Admin',
  description: 'Admin dashboard for Z Smoke Shop management system',
  robots: 'noindex, nofollow',
};

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardClient />
    </AdminLayout>
  );
}
