import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { VaultService } from '@/lib/ai/services/vault-service';
import { getVaultSignedUrl } from '@/lib/supabase/vault-storage';
import { createClient } from '@/lib/supabase/server';

// GET /api/vault/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const doc = await prisma.medicalDocument.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        analysis: true
      }
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Generate fresh signed URL
    let signedUrl = '';
    try {
      signedUrl = await getVaultSignedUrl(doc.storagePath, 3600);
    } catch (err) {
      console.error(err);
    }

    return NextResponse.json({
      success: true,
      document: {
        ...doc,
        fileUrl: signedUrl || doc.fileUrl
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/vault/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await VaultService.deleteDocument(user.id, id);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/vault/[id] (Trigger re-analysis)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const doc = await prisma.medicalDocument.findFirst({
      where: { id, userId: user.id }
    });

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Download file from Supabase storage into buffer to re-analyze
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .download(doc.storagePath);

    if (error || !data) {
      throw new Error(`Failed to download document from storage for re-analysis: ${error?.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old analysis if exists to avoid unique constraint clash
    await prisma.medicalReportAnalysis.deleteMany({
      where: { documentId: doc.id }
    });

    // Run analysis synchronously or asynchronously
    const analysisResult = await VaultService.analyzeDocument(user.id, doc.id, doc.title, buffer);

    return NextResponse.json({
      success: true,
      analysis: analysisResult.analysis
    });
  } catch (error: any) {
    console.error('[Vault Re-analyze Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
