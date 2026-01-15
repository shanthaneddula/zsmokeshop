import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Localhost testing domains - map to test tenant domain
const LOCALHOST_DOMAINS = [
  'localhost:3001',
  'localhost:3000',
  'localhost',
  '127.0.0.1:3001',
  '127.0.0.1:3000',
  '127.0.0.1',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract domain from request
  const host = request.headers.get('host') || '';
  
  // Handle localhost during development
  let domain = host;
  if (LOCALHOST_DOMAINS.includes(host)) {
    // For localhost, use test domain
    domain = 'joessmokeshop.local';
  } else {
    // Remove www prefix if present
    domain = host.replace(/^www\./, '');
  }

  // Check maintenance mode (except for admin, login, maintenance pages, and settings API)
  if (!pathname.startsWith('/admin') && 
      !pathname.startsWith('/login') && 
      !pathname.startsWith('/maintenance') &&
      !pathname.startsWith('/_next') &&
      pathname !== '/api/admin/settings' &&
      !pathname.startsWith('/api/admin/auth')) {
    try {
      // Fetch settings to check maintenance mode
      const settingsUrl = new URL('/api/admin/settings', request.url);
      const settingsResponse = await fetch(settingsUrl.toString(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        if (data?.data?.maintenanceMode === true || data?.maintenanceMode === true) {
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    } catch (error) {
      // If settings fetch fails, allow normal access (fail open)
      console.error('Maintenance check failed:', error);
    }
  }

  // Pass domain in header for API routes to lookup tenant
  // (Can't use Prisma in Edge Runtime middleware)
  const response = NextResponse.next();
  response.headers.set('x-forwarded-domain', domain);

  return response;
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
