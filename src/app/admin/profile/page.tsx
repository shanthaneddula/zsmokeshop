// User Profile Page

import { Metadata } from 'next';
import AdminLayout from '../components/AdminLayout';
import ProfileClient from './profile-client';

export const metadata: Metadata = {
  title: 'My Profile | Z Smoke Shop Admin',
  description: 'Manage your profile settings and preferences',
  robots: 'noindex, nofollow',
};

export default function ProfilePage() {
  return (
    <AdminLayout>
      <ProfileClient />
    </AdminLayout>
  );
}
