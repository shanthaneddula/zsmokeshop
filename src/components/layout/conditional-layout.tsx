'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import AnnouncementBar from './announcement-bar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're in admin or login routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname.startsWith('/login');
  
  // Don't show public header/footer for admin or login pages
  const showPublicLayout = !isAdminRoute && !isLoginRoute;

  if (!showPublicLayout) {
    // Admin and login routes handle their own layout
    return <>{children}</>;
  }

  // Public routes get the full header/footer layout
  return (
    <>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}
