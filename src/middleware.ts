// Middleware for admin route protection (Edge Runtime compatible)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page (now handled at /login, not /admin/login)
    // If someone tries to access /admin/login, redirect to /login
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check authentication for all admin routes
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      console.log('❌ Middleware - No token, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
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
