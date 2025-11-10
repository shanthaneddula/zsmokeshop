import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { SettingsService } from '@/lib/settings-service';

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    
    return NextResponse.json({
      success: true,
      data: settings
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
    // Check authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📊 Settings PUT request body:', body);
    
    const updatedSettings = await SettingsService.updateSettings(body);
    
    return NextResponse.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business settings' },
      { status: 500 }
    );
  }
}
