import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { groqClient } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { docIds } = await request.json();
    if (!Array.isArray(docIds) || docIds.length < 2) {
      return NextResponse.json({ success: false, error: 'Please select at least two reports to compare.' }, { status: 400 });
    }

    // Retrieve documents and analyses
    const documents = await prisma.medicalDocument.findMany({
      where: {
        id: { in: docIds },
        userId: user.id
      },
      include: {
        analysis: true
      },
      orderBy: {
        reportDate: 'asc' // Oldest to newest
      }
    });

    if (documents.length < 2) {
      return NextResponse.json({ success: false, error: 'Could not find selected reports.' }, { status: 404 });
    }

    // Formulate a prompt for Groq to compare the health reports
    const comparisonContext = documents.map(doc => {
      const analysis = doc.analysis;
      return {
        title: doc.title,
        date: doc.reportDate ? doc.reportDate.toISOString().split('T')[0] : 'Unknown Date',
        healthScore: analysis?.overallHealthScore || 70,
        riskLevel: analysis?.riskLevel || 'LOW',
        abnormalValues: analysis?.abnormalValues || [],
        normalValues: analysis?.normalValues || [],
        summary: analysis?.summary || ''
      };
    });

    const systemPrompt = `You are a Senior AI Health Diagnostics Expert.
Your job is to compare the list of historical medical reports provided by the user (ordered chronologically from oldest to newest) and highlight changes, improvements, and regressions in biomarkers.

You must respond with a JSON object ONLY containing:
{
  "comparisons": [
    {
      "biomarker": "Vitamin D",
      "change": "↑ +18%",
      "status": "Improved" | "Stable" | "Regressed",
      "details": "Increased from 22 ng/mL to 26 ng/mL."
    }
  ],
  "summary": "Detailed overall comparative analysis of what improved or regressed and next steps."
}

Ensure you output valid JSON. Do not include markdown code block formatting.`;

    const userPrompt = `Compare the following historical reports:
${JSON.stringify(comparisonContext, null, 2)}`;

    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    const comparisonResult = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      comparison: comparisonResult
    });

  } catch (error: any) {
    console.error('[Vault Compare Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
