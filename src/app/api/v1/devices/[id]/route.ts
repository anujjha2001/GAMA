import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = "default-user-profile-id"; // TODO: real auth
    const id = params.id;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.deviceConnection.findUnique({
      where: { id }
    });

    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ success: false, error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.deviceConnection.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(`[PATCH /api/v1/devices/${params.id}] Error:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update device' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = "default-user-profile-id"; // TODO: real auth
    const id = params.id;

    // Verify ownership
    const existing = await prisma.deviceConnection.findUnique({
      where: { id }
    });

    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ success: false, error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.deviceConnection.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/v1/devices/${params.id}] Error:`, error);
    return NextResponse.json({ success: false, error: 'Failed to delete device' }, { status: 500 });
  }
}
