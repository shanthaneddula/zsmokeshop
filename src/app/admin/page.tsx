// Admin redirect page - redirects to appropriate dashboard

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // This page will be caught by middleware and redirect to login if not authenticated
  // If authenticated, middleware passes through and we redirect to dashboard
  redirect('/admin/dashboard');
}
