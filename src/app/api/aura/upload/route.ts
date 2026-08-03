import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';



export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 1. Configurable Size Limit Validation (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // 2. Reject hazardous/unsupported types
    const fileType = file.type || '';
    const nameLower = file.name.toLowerCase();
    const isSupported = 
      fileType.startsWith('image/') ||
      fileType.startsWith('video/') ||
      fileType.includes('pdf') ||
      fileType.includes('csv') ||
      fileType.includes('text') ||
      nameLower.endsWith('.pdf') ||
      nameLower.endsWith('.csv') ||
      nameLower.endsWith('.txt');

    if (!isSupported) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported file type. Please upload images, videos, PDFs, CSVs, or text documents.'
      }, { status: 400 });
    }

    // 3. Simulated Virus Check & Processing Stage Delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save File with Serverless / Read-Only Filesystem Fallback
    let fileUrl = '';
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'aura');
      await fs.mkdir(uploadDir, { recursive: true });

      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, cleanFileName);
      await fs.writeFile(filePath, buffer);

      fileUrl = `/uploads/aura/${cleanFileName}`;
    } catch (writeErr) {
      console.warn('[Aura Upload] Local filesystem write failed (likely serverless/Vercel). Falling back to base64 Data URI.', writeErr);
      const base64Content = buffer.toString('base64');
      fileUrl = `data:${fileType || 'application/octet-stream'};base64,${base64Content}`;
    }

    // 4. File Type Classification & Text Extraction
    let classification = 'General File';
    let extractedText = '';

    if (nameLower.includes('food') || nameLower.includes('meal') || nameLower.includes('plate') || nameLower.includes('dinner') || nameLower.includes('lunch') || nameLower.includes('breakfast')) {
      classification = 'Food/Meal Photo';
    } else if (nameLower.includes('workout') || nameLower.includes('gym') || nameLower.includes('posture') || nameLower.includes('exercise') || nameLower.includes('form')) {
      classification = 'Workout/Fitness Media';
    } else if (nameLower.includes('blood') || nameLower.includes('medical') || nameLower.includes('report') || nameLower.includes('scan') || nameLower.includes('lab') || nameLower.includes('prescription')) {
      classification = 'Medical/Report/Prescription';
    } else if (nameLower.includes('label') || nameLower.includes('nutrition') || nameLower.includes('barcode')) {
      classification = 'Nutrition Label';
    }

    // Text parsing for PDF / CSV / Text
    if (fileType.includes('pdf') || nameLower.endsWith('.pdf')) {
      try {
        const pdfParser = require('pdf-parse');
        const parsed = await pdfParser(buffer);
        extractedText = parsed.text || '';
      } catch (err) {
        console.error('[Aura Upload] pdf-parse failed:', err);
      }
    } else if (fileType.includes('csv') || nameLower.endsWith('.csv') || fileType.includes('text') || nameLower.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      classification,
      extractedText: extractedText.trim()
    });

  } catch (error: any) {
    console.error('[Aura Upload API Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error during upload processing' }, { status: 500 });
  }
}
