import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | Z Smoke Shop",
    template: "%s | Z Smoke Shop Admin",
  },
  description: "Z Smoke Shop Admin Management System",
  robots: "noindex, nofollow",
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  // Redirect to login if not authenticated (except for login page itself)
  if (!token) {
    redirect('/login');
  }

  return (
    // No Header/Footer for admin area - clean admin interface
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
