import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { SettingsService } from '@/lib/settings-service';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required - no token' },
        { status: 401 }
      ),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required - invalid token' },
        { status: 401 }
      ),
    };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const settings = await SettingsService.getSettings();

    return NextResponse.json({
      success: true,
      data: settings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error reading business settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read business settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const updatedSettings = await SettingsService.updateSettings(body);

    return NextResponse.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('❌ Error updating business settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business settings' },
      { status: 500 }
    );
  }
}
