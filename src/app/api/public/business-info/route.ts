import { NextResponse } from 'next/server';
import { SettingsService } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await SettingsService.getPublicBusinessInfo();
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error reading public business info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read business info' },
      { status: 500 }
    );
  }
}
