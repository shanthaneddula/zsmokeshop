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
    console.log('🔐 Settings PUT - Token check:', token ? `${token.substring(0, 20)}...` : 'none');
    
    if (!token) {
      console.log('❌ Settings PUT - No token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required - no token' },
        { status: 401 }
      );
    }
    
    const verificationResult = verifyToken(token);
    console.log('🔐 Settings PUT - Token verification result:', verificationResult);
    
    if (!verificationResult) {
      console.log('❌ Settings PUT - Token verification failed');
      return NextResponse.json(
        { success: false, error: 'Authentication required - invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📊 Settings PUT request body:', body);
    
    const updatedSettings = await SettingsService.updateSettings(body);
    console.log('📊 Settings updated successfully:', updatedSettings);
    
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
