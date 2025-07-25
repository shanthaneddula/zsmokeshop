// Middleware for admin route protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to dashboard
      const token = request.cookies.get('admin-token')?.value;
      if (token && verifyToken(token)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    
    // Check authentication for all other admin routes
    const token = request.cookies.get('admin-token')?.value;
    console.log('🔍 Middleware - Checking admin route:', request.url);
    console.log('🍪 Middleware - Token found:', !!token);
    console.log('🔑 Middleware - Token value:', token ? `${token.substring(0, 20)}...` : 'none');
    
    if (!token) {
      console.log('❌ Middleware - No token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verify token
    console.log('🔐 Middleware - Verifying token...');
    const user = verifyToken(token);
    console.log('👤 Middleware - User from token:', user);
    if (!user) {
      // Invalid token, redirect to login
      console.log('❌ Middleware - Token verification failed, redirecting to login');
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin-token');
      return response;
    }
    
    console.log('✅ Middleware - Authentication successful for user:', user.username);
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-user', JSON.stringify(user));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
