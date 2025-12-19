// Timesheet Page

import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import TimesheetClient from './timesheet-client';

export const metadata: Metadata = {
  title: 'My Timesheet | Z Smoke Shop Admin',
  description: 'Track your work hours and attendance',
  robots: 'noindex, nofollow',
};

export default function TimesheetPage() {
  return (
    <AdminLayout>
      <TimesheetClient />
    </AdminLayout>
  );
}
