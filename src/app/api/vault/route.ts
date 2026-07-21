import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { uploadToVault, getVaultSignedUrl } from '@/lib/supabase/vault-storage';
import { VaultService } from '@/lib/ai/services/vault-service';

export const maxDuration = 60; // 60 seconds timeout allowed

// GET /api/vault
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';

    const whereClause: any = {
      userId: user.id
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { hospital: { contains: search, mode: 'insensitive' } },
        { doctor: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const orderBy: any = {};
    if (sortBy === 'newest') {
      orderBy.reportDate = 'desc';
    } else if (sortBy === 'oldest') {
      orderBy.reportDate = 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const docs = await prisma.medicalDocument.findMany({
      where: whereClause,
      orderBy,
      include: {
        analysis: true
      }
    });

    // Generate short-lived signed URLs for the client to preview/download
    const docsWithSignedUrls = await Promise.all(
      docs.map(async (doc) => {
        let signedUrl = '';
        try {
          signedUrl = await getVaultSignedUrl(doc.storagePath, 3600); // 1 hour expiration
        } catch (err) {
          console.error(`Error generating signed URL for ${doc.title}:`, err);
        }
        return {
          ...doc,
          fileUrl: signedUrl || doc.fileUrl
        };
      })
    );

    return NextResponse.json({ success: true, documents: docsWithSignedUrls });
  } catch (error: any) {
    console.error('[Vault GET Route Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/vault
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string || 'Other';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configurable Max Upload Size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Clean up filename and create storagepath
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${Date.now()}_${cleanFileName}`;

    console.log(`[Vault POST] Uploading ${cleanFileName} to Supabase...`);

    // 1. Upload to Supabase Storage
    await uploadToVault(storagePath, buffer, file.type);

    // 2. Create entry in Prisma
    const doc = await prisma.medicalDocument.create({
      data: {
        userId: user.id,
        title: file.name.split('.')[0] || 'Medical Report',
        category,
        fileUrl: '', // Will be dynamically generated with signed URLs
        storagePath,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        mimeType: file.type,
        status: 'scanning',
        processingStatus: 'PENDING'
      }
    });

    // 3. Trigger analysis in background
    VaultService.analyzeDocument(user.id, doc.id, file.name, buffer, file.type)
      .then(() => {
        console.log(`[Vault POST] Completed async report analysis for ${doc.id}`);
      })
      .catch((err) => {
        console.error(`[Vault POST] Async analysis failed for ${doc.id}:`, err);
      });

    return NextResponse.json({
      success: true,
      document: doc
    });

  } catch (error: any) {
    console.error('[Vault POST Route Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
