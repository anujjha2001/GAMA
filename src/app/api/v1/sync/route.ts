import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const profileId = "default-user-profile-id"; // TODO: auth
    
    // Fetch active/recent jobs
    const jobs = await prisma.syncJob.findMany({
      where: { profileId },
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    
    // Fetch connections to determine provider health
    const connections = await prisma.deviceConnection.findMany({
      where: { profileId }
    });
    
    // Map connections to provider health
    const providers = connections.map(conn => ({
      name: conn.brand || conn.provider,
      status: conn.connectionStatus === 'HEALTHY' ? 'Healthy' : 'Warning',
      latency: Math.floor(Math.random() * 200 + 50) + 'ms', // Mocked latency for now, would be stored in health metrics
      lastSync: conn.lastSync ? new Date(conn.lastSync).toLocaleTimeString() : 'Never',
      oauth: conn.connectionStatus === 'HEALTHY' ? 'Connected' : 'Expiring Soon',
      webhook: 'Healthy',
      color: conn.connectionStatus === 'HEALTHY' ? 'emerald' : 'amber'
    }));

    return NextResponse.json({ success: true, data: { jobs, providers } });
  } catch (error) {
    console.error('[GET /api/v1/sync] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sync status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profileId = "default-user-profile-id";
    const body = await request.json();
    
    const newJob = await prisma.syncJob.create({
      data: {
        profileId,
        provider: body.provider || 'all',
        status: 'PENDING',
        startedAt: new Date()
      }
    });
    
    // In a real system, this would queue a background worker.
    // For now, we simulate async processing for the UI
    setTimeout(async () => {
      await prisma.syncJob.update({
        where: { id: newJob.id },
        data: { status: 'RUNNING' }
      });
      setTimeout(async () => {
        await prisma.syncJob.update({
          where: { id: newJob.id },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
      }, 3000);
    }, 1000);
    
    return NextResponse.json({ success: true, data: newJob });
  } catch (error) {
    console.error('[POST /api/v1/sync] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to start sync' }, { status: 500 });
  }
}
