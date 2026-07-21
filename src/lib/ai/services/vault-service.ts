import { prisma } from '@/lib/prisma';
import { groqClient } from '../client';
import { deleteFromVault } from '@/lib/supabase/vault-storage';
// Mock DOM classes for Node.js environment to satisfy pdf-parse runtime dependencies
if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).DOMMatrix) {
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  if (!(globalThis as any).ImageData) {
    (globalThis as any).ImageData = class ImageData {};
  }
  if (!(globalThis as any).Path2D) {
    (globalThis as any).Path2D = class Path2D {};
  }
}

const pdfModuleName = 'pdf-parse';
const pdf = require(pdfModuleName);

export interface ParseResult {
  title: string;
  category: string;
  reportDate: string;
  hospital: string;
  doctor: string;
  overallHealthScore: number;
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  abnormalValues: any;
  normalValues: any;
  recommendations: any;
  doctorQuestions: any;
  followUpActions: any;
  dietPlan: any;
  exercisePlan: any;
  supplements: any;
  hydrationAdvice: any;
  sleepAdvice: any;
  confidence: number;
}

export class VaultService {
  /**
   * Run OCR on image files using Groq Multimodal Vision
   */
  static async ocrImageWithGroq(buffer: Buffer, mimeType: string): Promise<string> {
    console.log(`[VaultService] Running Groq Vision OCR for mimeType: ${mimeType}`);
    try {
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const response = await groqClient.chat.completions.create({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract and return ALL readable text, biomarkers, metrics, ranges, patient/hospital details from this medical report. Output only the extracted plain text.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        temperature: 0.1
      });

      const extractedText = response.choices[0]?.message?.content || '';
      if (!extractedText.trim()) {
        throw new Error('Groq Vision returned empty text.');
      }
      return extractedText;
    } catch (err: any) {
      console.error('[VaultService] OCR failed:', err.message || err);
      throw new Error(`OCR Extraction Failed: ${err.message || err}`);
    }
  }

  /**
   * Run the AI Analysis on the extracted document text
   */
  static async analyzeDocument(userId: string, docId: string, docTitle: string, fileBuffer: Buffer, mimeType: string = 'application/pdf') {
    console.log(`[VaultService] Starting AI analysis pipeline for: ${docTitle} (${docId})`);
    
    let extractedText = '';

    try {
      // Step 1: Text Extraction Stage
      if (mimeType.includes('pdf')) {
        console.log(`[VaultService] PDF detected. Running pdf-parse...`);
        await prisma.medicalDocument.update({
          where: { id: docId },
          data: { status: 'scanning', processingStatus: 'EXTRACTING_TEXT' }
        });
        
        let parsed: any;
        if (pdf && pdf.PDFParse) {
          console.log('[VaultService] Instantiating PDFParse class using Uint8Array...');
          const parser = new pdf.PDFParse(new Uint8Array(fileBuffer));
          parsed = await parser.getText();
        } else {
          const pdfParser = typeof pdf === 'function' ? pdf : pdf.default;
          if (typeof pdfParser !== 'function') {
            throw new Error('PDF parsing library was loaded but could not find a valid constructor or parser function.');
          }
          parsed = await pdfParser(fileBuffer);
        }
        
        extractedText = parsed.text || '';
        
        if (extractedText.trim().length < 50) {
          console.log(`[VaultService] PDF text content too short (${extractedText.trim().length} chars). Scanned PDF suspected.`);
          throw new Error('PDF has no extractable digital text layer (scanned PDF). Please upload an image format (PNG/JPEG) of this report to run optical character recognition (OCR).');
        }
      } else if (mimeType.includes('image') || mimeType.includes('png') || mimeType.includes('jpeg') || mimeType.includes('webp')) {
        // Step 2: OCR Stage
        await prisma.medicalDocument.update({
          where: { id: docId },
          data: { status: 'scanning', processingStatus: 'RUNNING_OCR' }
        });
        extractedText = await this.ocrImageWithGroq(fileBuffer, mimeType);
      } else {
        // Text files or fallbacks
        extractedText = fileBuffer.toString('utf-8');
      }

      // Validate Extracted Text
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Invalid or unreadable document content. No text could be extracted.');
      }

      console.log(`[VaultService] Text extraction successful. Total characters: ${extractedText.length}`);

      // Step 3: LLM Analysis Stage
      await prisma.medicalDocument.update({
        where: { id: docId },
        data: { processingStatus: 'ANALYZING' }
      });

      const systemPrompt = `You are a Principal AI Health & Biomarker Intelligence Agent.
Analyze the medical report content below. Extract all relevant medical biomarkers, abnormal values, normal values, health scores, and formulate educational plans (diet, exercise, supplements, hydration, sleep, follow-up actions).
You MUST respond with a valid JSON object ONLY. Do not wrap the JSON in markdown code blocks. Do not add any text before or after the JSON.

Expected JSON schema:
{
  "title": "Cleaned up title of the report (e.g. Complete Blood Count)",
  "category": "One of: Blood Report, CBC, Vitamin Report, Thyroid Report, MRI, CT Scan, X-Ray, Prescription, Doctor Notes, Medical Bills, ECG, Urine Test, Liver Function Test, Kidney Function Test, Heart Reports, Genetic Reports, Vaccination Records, Health Insurance, Other",
  "reportDate": "YYYY-MM-DD format (extract from text, or use today's date if not found)",
  "hospital": "Name of hospital/lab (extract, or use 'Unknown Lab')",
  "doctor": "Name of doctor (extract, or use 'Unknown Doctor')",
  "overallHealthScore": 85, // integer 0-100 indicating general health state based on values
  "summary": "High-fidelity clinical summary of the findings",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "abnormalValues": [
    { "marker": "LDL Cholesterol", "value": "145 mg/dL", "range": "<100 mg/dL", "severity": "Borderline High", "explanation": "Increases cardiovascular risk." }
  ],
  "normalValues": [
    { "marker": "HDL Cholesterol", "value": "50 mg/dL", "range": ">40 mg/dL" }
  ],
  "recommendations": [
    "Increase dietary soluble fiber to bind cholesterol.",
    "Perform 150 minutes of weekly Zone 2 cardio."
  ],
  "doctorQuestions": [
    "Should we check ApoB or Lp(a) levels?",
    "Is my thyroid function contributing to these lipid levels?"
  ],
  "followUpActions": [
    { "testName": "Lipid Panel Retest", "intervalDays": 90, "status": "Scheduled" }
  ],
  "dietPlan": {
    "breakfast": "Oatmeal with chia seeds and walnuts",
    "lunch": "Grilled salmon salad with olive oil dressing",
    "dinner": "Lentil soup with spinach and broccoli",
    "snacks": "Apple slices with almond butter",
    "waterGoalMl": 3000,
    "calories": 2000,
    "proteinG": 120,
    "carbsG": 180,
    "fatG": 65,
    "fiberG": 30,
    "micronutrients": ["Omega-3s", "Soluble Fiber", "Potassium"],
    "foodsToAvoid": ["Trans fats", "Refined sugars", "Salty chips"],
    "foodsToIncrease": ["Wild-caught salmon", "Chia seeds", "Avocado"],
    "groceryList": ["Oats", "Chia seeds", "Walnuts", "Salmon", "Spinach", "Avocado", "Lentils"]
  },
  "exercisePlan": {
    "dailyHabits": ["Take a 10-minute walk after meals"],
    "workoutSuggestions": ["30-min cycling in Zone 2 cardiovascular zone", "Strength training twice a week"],
    "walkingGoalSteps": 10000,
    "weeklyGoals": ["3 Zone 2 cardiovascular workouts", "2 resistance sessions"]
  },
  "supplements": [
    { "name": "Omega-3 Fish Oil", "dosage": "1000mg daily", "reason": "Supports healthy blood lipid levels" }
  ],
  "hydrationAdvice": {
    "targetMl": 3000,
    "guidelines": "Drink 500ml upon waking, and maintain consistent intake throughout the day."
  },
  "sleepAdvice": {
    "targetHours": 8,
    "guidelines": "Maintain a cold, dark environment and avoid screens 1 hour before sleep."
  },
  "confidence": 0.95
}`;

      const userPrompt = `Document Filename: ${docTitle}
Extracted Text Content:
---
${extractedText}
---`;

      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0]?.message?.content || '{}';
      const result: ParseResult = JSON.parse(responseText);

      // Step 4: Saving Results Stage
      await prisma.medicalDocument.update({
        where: { id: docId },
        data: { processingStatus: 'SAVING_RESULTS' }
      });

      const reportDate = result.reportDate ? new Date(result.reportDate) : new Date();
      
      const analysis = await prisma.medicalReportAnalysis.create({
        data: {
          documentId: docId,
          userId: userId,
          overallHealthScore: result.overallHealthScore || 70,
          summary: result.summary || 'Analysis complete.',
          riskLevel: result.riskLevel || 'LOW',
          abnormalValues: result.abnormalValues || [],
          normalValues: result.normalValues || [],
          recommendations: result.recommendations || [],
          doctorQuestions: result.doctorQuestions || [],
          followUpActions: result.followUpActions || [],
          dietPlan: result.dietPlan || {},
          exercisePlan: result.exercisePlan || {},
          supplements: result.supplements || [],
          hydrationAdvice: result.hydrationAdvice || {},
          sleepAdvice: result.sleepAdvice || {},
          confidence: result.confidence || 0.9
        }
      });

      // Update Document Status to Completed
      await prisma.medicalDocument.update({
        where: { id: docId },
        data: {
          title: result.title || docTitle,
          category: result.category || 'Other',
          reportDate: reportDate,
          hospital: result.hospital || 'Unknown Lab',
          doctor: result.doctor || 'Unknown Doctor',
          status: 'analyzed',
          processingStatus: 'COMPLETED',
          summary: result.summary || '',
          aiAnalyzed: true
        }
      });

      // Create Medical Timeline Event
      await prisma.medicalTimeline.create({
        data: {
          userId: userId,
          documentId: docId,
          eventDate: reportDate,
          title: result.title || docTitle,
          description: `Analyzed document of category ${result.category || 'Other'} with score ${result.overallHealthScore || 70}/100.`,
          metadata: {
            riskLevel: result.riskLevel || 'LOW',
            overallHealthScore: result.overallHealthScore || 70,
            abnormalCount: Array.isArray(result.abnormalValues) ? result.abnormalValues.length : 0
          }
        }
      });

      // Save memory tags
      if (Array.isArray(result.abnormalValues)) {
        for (const item of result.abnormalValues.slice(0, 3)) {
          await prisma.memoryNode.create({
            data: {
              profileId: userId,
              label: `${item.marker}: ${item.value} (${item.severity})`,
              category: 'clinical',
              confidence: 0.95
            }
          }).catch(() => {});
        }
      }

      console.log(`[VaultService] Success parsing report ${docId}`);
      return { success: true, analysis };
    } catch (err: any) {
      console.error(`[VaultService] Error analyzing document ${docId}:`, err);
      
      await prisma.medicalDocument.update({
        where: { id: docId },
        data: { 
          status: 'failed', 
          processingStatus: 'FAILED',
          summary: err.message || 'Analysis failed.'
        }
      }).catch(() => {});

      throw err;
    }
  }

  /**
   * Delete Document
   */
  static async deleteDocument(userId: string, docId: string) {
    const doc = await prisma.medicalDocument.findFirst({
      where: { id: docId, userId }
    });

    if (!doc) {
      throw new Error('Document not found or unauthorized');
    }

    // Delete from Supabase Storage
    await deleteFromVault(doc.storagePath).catch((err) => {
      console.error('[VaultService] Failed to delete from Supabase storage:', err);
    });

    // Delete from DB (cascade handles relations)
    return await prisma.medicalDocument.delete({
      where: { id: docId }
    });
  }
}
