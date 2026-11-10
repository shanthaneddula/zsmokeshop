import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check maintenance mode (except for admin, login, maintenance pages, and API routes)
  if (!pathname.startsWith('/admin') &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/maintenance') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api/') &&
      !pathname.includes('favicon')) {
    try {
      // Fetch settings to check maintenance mode
      const settingsUrl = new URL('/api/admin/settings', request.url);
      const settingsResponse = await fetch(settingsUrl.toString(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (settingsResponse.ok) {
        const contentType = settingsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await settingsResponse.json();
          if (data?.data?.maintenanceMode === true || data?.maintenanceMode === true) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
          }
        }
      }
    } catch {
      // If settings fetch fails, allow normal access (fail open)
      // Silently fail - maintenance check should not break the site
    }
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
