// Employee Dashboard Page

import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import EmployeeDashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'My Dashboard | Z Smoke Shop Admin',
  description: 'View your performance stats and recent activity',
  robots: 'noindex, nofollow',
};

export default function EmployeeDashboardPage() {
  return (
    <AdminLayout>
      <EmployeeDashboardClient />
    </AdminLayout>
  );
}
