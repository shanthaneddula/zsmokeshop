import { NextResponse } from 'next/server';
import { SettingsService } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { maintenanceMode } = await SettingsService.getMaintenanceStatus();
    return NextResponse.json(
      { maintenanceMode },
      {
        headers: {
          'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error reading maintenance status:', error);
    return NextResponse.json(
      { maintenanceMode: false },
      { status: 500 }
    );
  }
}
