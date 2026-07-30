import { NextResponse } from 'next/server';
import { getAllAvailableDevices, getDevicesByCategory } from '@/lib/devices/DeviceRegistry';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let devices = [];
    if (category) {
      devices = getDevicesByCategory(category as any);
    } else {
      devices = getAllAvailableDevices();
    }
    
    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    console.error('[GET /api/v1/providers] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch providers' }, { status: 500 });
  }
}
