import { Metadata } from 'next';
import AdminLayout from '../../components/AdminLayout';
import { ActivityLogsClient } from './activity-logs-client';

export const metadata: Metadata = {
  title: 'Activity Logs | Admin - Z Smoke Shop',
  description: 'View all user activity and changes',
};

export default function ActivityLogsPage() {
  return (
    <AdminLayout>
      <ActivityLogsClient />
    </AdminLayout>
  );
}
