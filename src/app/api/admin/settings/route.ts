import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');

export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);
    
    return NextResponse.json({
      success: true,
      data: config.businessSettings || {
        locations: [],
        reviewSettings: {
          enableGoogleReviews: true,
          enableYelpReviews: true,
          enableAppleReviews: true,
          autoRefreshInterval: 24
        }
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
    const body = await request.json();
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);
    
    // Update business settings
    config.businessSettings = {
      ...config.businessSettings,
      ...body
    };
    
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    return NextResponse.json({
      success: true,
      data: config.businessSettings
    });
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business settings' },
      { status: 500 }
    );
  }
}
