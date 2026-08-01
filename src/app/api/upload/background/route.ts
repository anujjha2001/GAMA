import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    
    // In local development, we allow the upload even if there is no strict Supabase session.
    // In production, we require a valid user.
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Validate size (e.g. 50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and add random suffix
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${randomSuffix}-${originalName}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'backgrounds');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // directory already exists, ignore
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/backgrounds/${fileName}`;

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload background' }, { status: 500 });
  }
}
