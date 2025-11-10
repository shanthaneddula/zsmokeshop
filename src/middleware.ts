// Middleware for admin route protection (Edge Runtime compatible)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // Simple token presence check (detailed verification moved to route handlers)
      const token = request.cookies.get('admin-token')?.value;
      if (token) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    
    // Check authentication for all other admin routes
    const token = request.cookies.get('admin-token')?.value;
    const allCookies = request.cookies.toString();
    console.log('🔍 Middleware - Checking admin route:', request.url);
    console.log('🍪 Middleware - All cookies:', allCookies);
    console.log('🍪 Middleware - Admin token found:', !!token);
    console.log('🔑 Middleware - Token value:', token ? `${token.substring(0, 20)}...` : 'none');
    
    if (!token) {
      console.log('❌ Middleware - No token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Note: Token verification moved to individual route handlers to avoid Edge Runtime issues
    console.log('✅ Middleware - Token present, allowing access');
    
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin routes:
     * - /admin
     * - /admin/login
     * - /admin/products
     * - /admin/categories
     * - etc.
     */
    '/admin/:path*',
  ],
};
