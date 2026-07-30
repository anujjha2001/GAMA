import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDeviceById } from '@/lib/devices/DeviceRegistry';

export async function POST(request: Request) {
  try {
    const profileId = "default-user-profile-id"; // TODO: real auth
    const body = await request.json();
    const { deviceId, authCode } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'deviceId is required' }, { status: 400 });
    }

    const registryEntry = getDeviceById(deviceId);
    if (!registryEntry) {
      return NextResponse.json({ success: false, error: 'Invalid deviceId' }, { status: 400 });
    }

    // Check if the user profile exists, if not create a mock one for dev
    let user = await prisma.userProfile.findUnique({ where: { id: profileId } });
    if (!user) {
      // Dev mode: Create a dummy user
      user = await prisma.userProfile.create({
        data: {
          id: profileId,
          userId: 'dev-user',
          email: 'dev@gama.app',
          role: 'user'
        }
      });
    }

    // Create the device connection
    const connection = await prisma.deviceConnection.upsert({
      where: {
        profileId_provider_deviceId: {
          profileId,
          provider: registryEntry.providerId || registryEntry.brand.toLowerCase(),
          deviceId: registryEntry.id
        }
      },
      update: {
        connectionStatus: 'HEALTHY',
        batteryLevel: 100, // Initial mock
        firmwareVersion: '1.0.0', // Initial mock
        lastSync: new Date()
      },
      create: {
        profileId,
        provider: registryEntry.providerId || registryEntry.brand.toLowerCase(),
        deviceId: registryEntry.id,
        brand: registryEntry.brand,
        modelName: registryEntry.model,
        connectionStatus: 'HEALTHY',
        batteryLevel: 100,
        firmwareVersion: '1.0.0',
        lastSync: new Date(),
        primaryFor: registryEntry.supportedMetrics.slice(0, 2), // Default primary
        capabilities: {
          create: registryEntry.supportedMetrics.map(metric => ({
            metricType: metric,
            isSupported: true
          }))
        }
      },
      include: {
        capabilities: true
      }
    });

    return NextResponse.json({ success: true, data: connection });
  } catch (error) {
    console.error('[POST /api/v1/devices/connect] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to connect device' }, { status: 500 });
  }
}
