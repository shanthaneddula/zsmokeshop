import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Settings | Z Smoke Shop Admin',
  description: 'Manage store settings, compliance, and system configuration',
};

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsClient />
    </AdminLayout>
  );
}
