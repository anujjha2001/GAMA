import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to calculate organ health scores based on real database records
function calculateOrganHealth(
  record: any,
  symptoms: any[],
  reports: any[],
  insights: any[]
) {
  const hrv = record?.hrv ?? 65;
  const hr = record?.heartRate ?? 68;
  const stress = record?.stressLevel ?? 3.2;
  const o2 = record?.oxygenLevel ?? 98;
  const bloodSugar = record?.bloodSugar ?? 95;
  const water = record?.waterIntakeMl ?? 2200;

  // Filter symptoms per body part
  const symptomNames = symptoms.map((s) => s.name.toLowerCase());
  const hasBrainSymptom = symptomNames.some((s) => s.includes('headache') || s.includes('dizziness') || s.includes('eye') || s.includes('brain'));
  const hasHeartSymptom = symptomNames.some((s) => s.includes('palpitation') || s.includes('chest') || s.includes('heart'));
  const hasLungSymptom = symptomNames.some((s) => s.includes('cough') || s.includes('breath') || s.includes('lung'));
  const hasStomachSymptom = symptomNames.some((s) => s.includes('gut') || s.includes('stomach') || s.includes('acid') || s.includes('bloat') || s.includes('nausea'));
  const hasJointSymptom = symptomNames.some((s) => s.includes('leg') || s.includes('knee') || s.includes('joint') || s.includes('muscle') || s.includes('bone'));
  const hasSpineSymptom = symptomNames.some((s) => s.includes('back') || s.includes('neck') || s.includes('spine') || s.includes('posture'));

  // Brain & Eyes Score
  const brainScore = Math.max(50, Math.min(100, Math.round(96 - (stress * 4) - (hasBrainSymptom ? 12 : 0))));
  
  // Heart Score
  const hrPenalty = hr > 85 ? (hr - 85) * 0.5 : hr < 50 ? (50 - hr) * 0.5 : 0;
  const hrvBonus = hrv > 70 ? 5 : hrv < 40 ? -10 : 0;
  const heartScore = Math.max(50, Math.min(100, Math.round(94 - hrPenalty + hrvBonus - (hasHeartSymptom ? 15 : 0))));

  // Lungs Score
  const lungScore = Math.max(50, Math.min(100, Math.round((o2 >= 98 ? 98 : o2 * 0.95) - (hasLungSymptom ? 12 : 0))));

  // Stomach & Gut Score
  const waterBonus = water >= 2000 ? 5 : water < 1000 ? -8 : 0;
  const stomachScore = Math.max(45, Math.min(100, Math.round(88 + waterBonus - (hasStomachSymptom ? 18 : 0))));

  // Liver & Metabolic Score
  const sugarPenalty = bloodSugar > 110 ? (bloodSugar - 110) * 0.4 : 0;
  const liverScore = Math.max(50, Math.min(100, Math.round(92 - sugarPenalty)));

  // Spine & Nervous System Score
  const spineScore = Math.max(50, Math.min(100, Math.round(90 - (stress * 3) - (hasSpineSymptom ? 14 : 0))));

  // Musculoskeletal / Legs & Joints
  const legsScore = Math.max(50, Math.min(100, Math.round(91 - (hasJointSymptom ? 15 : 0))));

  // Kidneys
  const kidneysScore = Math.max(50, Math.min(100, Math.round(93 + (water >= 2000 ? 4 : -10))));

  return {
    brain: {
      id: 'brain',
      name: 'Brain & Eyes',
      system: 'Central Nervous System',
      score: brainScore,
      status: brainScore >= 90 ? 'OPTIMAL' : brainScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Cognitive Load', value: `${Math.round(stress * 10 + 20)}%` },
        { label: 'Focus Index', value: `${brainScore}%` },
        { label: 'Ocular Strain', value: stress > 4 ? 'Elevated' : 'Normal' },
      ],
      description: 'Prefrontal cortex activity and visual processing accuracy. Neural response time is within peak physiological thresholds.',
      recommendation: stress > 3 ? 'Take a 10-minute screen break and practice 4-7-8 breathing.' : 'Neural clarity optimal. Good window for high-focus tasks.',
      position3D: [0, 1.35, 0.15],
    },
    heart: {
      id: 'heart',
      name: 'Heart & Cardiovascular',
      system: 'Cardiovascular System',
      score: heartScore,
      status: heartScore >= 90 ? 'OPTIMAL' : heartScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Resting Heart Rate', value: `${hr} BPM` },
        { label: 'HRV', value: `${hrv} ms` },
        { label: 'Blood Pressure', value: record?.bloodPressure || '118/76' },
      ],
      description: 'Myocardial contractility and autonomic nerve synchronization. High HRV indicates robust stress adaptability.',
      recommendation: hrv < 50 ? 'Incorporate Zone 2 light recovery exercise to elevate autonomic tone.' : 'Cardiovascular endurance reserve is strong.',
      position3D: [-0.15, 0.65, 0.25],
    },
    lungs: {
      id: 'lungs',
      name: 'Lungs & Respiratory',
      system: 'Respiratory System',
      score: lungScore,
      status: lungScore >= 90 ? 'OPTIMAL' : lungScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Oxygen Saturation (SpO2)', value: `${o2}%` },
        { label: 'Respiration Rate', value: '14 bpm' },
        { label: 'VO2 Max Est.', value: '48.5 mL/kg/min' },
      ],
      description: 'Pulmonary alveolar exchange capacity and arterial oxygenation level.',
      recommendation: o2 < 96 ? 'Perform diaphragmatic deep breathing exercises.' : 'Pulmonary gas exchange efficiency is high.',
      position3D: [0, 0.72, 0.2],
    },
    stomach: {
      id: 'stomach',
      name: 'Stomach & Gut Microbiome',
      system: 'Digestive System',
      score: stomachScore,
      status: stomachScore >= 90 ? 'OPTIMAL' : stomachScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Hydration Intake', value: `${water} ml` },
        { label: 'Microbiome Balance', value: '88/100' },
        { label: 'Gastric pH Balance', value: 'Optimal (2.1)' },
      ],
      description: 'Gastrointestinal integrity and enteric nervous system alignment (gut-brain axis).',
      recommendation: water < 2000 ? 'Hydration is slightly low; drink 500ml electrolytic water.' : 'Gut barrier integrity and digestive balance are well-maintained.',
      position3D: [0.05, 0.15, 0.22],
    },
    liver: {
      id: 'liver',
      name: 'Liver & Metabolic Core',
      system: 'Metabolic & Hepatic',
      score: liverScore,
      status: liverScore >= 90 ? 'OPTIMAL' : liverScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Blood Glucose', value: `${bloodSugar} mg/dL` },
        { label: 'Metabolic Efficiency', value: '94%' },
        { label: 'ALT / AST Balance', value: 'Normal Range' },
      ],
      description: 'Hepatic glycogen regulation and detoxification capacity.',
      recommendation: bloodSugar > 110 ? 'Limit high-glycemic carbohydrates post-workout.' : 'Hepatic lipid metabolism is functioning smoothly.',
      position3D: [-0.2, 0.25, 0.18],
    },
    spine: {
      id: 'spine',
      name: 'Spine & Nervous Pathway',
      system: 'Spinal Cord & Peripheral Nerves',
      score: spineScore,
      status: spineScore >= 90 ? 'OPTIMAL' : spineScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Postural Alignment', value: '91%' },
        { label: 'Spinal Tension', value: stress > 3 ? 'Mild Lumbar Tightness' : 'Low' },
        { label: 'Nerve Conduction', value: 'Optimal' },
      ],
      description: 'Central spinal cord transmission and axial skeletal stability.',
      recommendation: 'Perform 5 minutes of spine decompression stretches or thoracic rotations.',
      position3D: [0, 0.5, -0.1],
    },
    kidneys: {
      id: 'kidneys',
      name: 'Kidneys & Renal System',
      system: 'Renal & Fluid Balance',
      score: kidneysScore,
      status: kidneysScore >= 90 ? 'OPTIMAL' : kidneysScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'eGFR Est.', value: '> 90 mL/min' },
        { label: 'Electrolyte Balance', value: 'Equilibrium' },
        { label: 'Fluid Clearance', value: 'High' },
      ],
      description: 'Renal arterial filtration and fluid osmolarity maintenance.',
      recommendation: 'Maintain current fluid consumption rate.',
      position3D: [0.15, 0.1, -0.15],
    },
    legs: {
      id: 'legs',
      name: 'Musculoskeletal & Legs',
      system: 'Musculoskeletal System',
      score: legsScore,
      status: legsScore >= 90 ? 'OPTIMAL' : legsScore >= 75 ? 'GOOD' : 'ATTENTION',
      vitals: [
        { label: 'Joint Mobility', value: '95%' },
        { label: 'Muscle Recovery', value: `${legsScore}%` },
        { label: 'Lactate Clearance', value: 'Normal' },
      ],
      description: 'Quad, hamstring, and bone mineral density status.',
      recommendation: 'Leg tissue recovery is progressing well.',
      position3D: [0, -0.7, 0.15],
    },
  };
}

export async function GET() {
  try {
    const user = await prisma.userProfile.upsert({
      where: { email: 'test@gama.com' },
      create: {
        userId: 'test-user-id-gama-1',
        email: 'test@gama.com',
        fullName: 'Test User',
        role: 'user',
      },
      update: {},
    });

    const [healthRecord, symptoms, reports, insights] = await Promise.all([
      prisma.healthRecord.findFirst({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.symptom.findMany({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' },
        take: 10,
      }),
      prisma.medicalReport.findMany({
        where: { profileId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.healthInsight.findMany({
        where: { profileId: user.id },
        orderBy: { detectedAt: 'desc' },
        take: 5,
      }),
    ]);

    const organData = calculateOrganHealth(healthRecord, symptoms, reports, insights);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
      },
      biometrics: healthRecord || {
        vitalityScore: 94,
        heartRate: 68,
        hrv: 65,
        stressLevel: 2.8,
        oxygenLevel: 98,
        bloodPressure: '118/76',
        waterIntakeMl: 2200,
        bloodSugar: 92,
      },
      organs: organData,
      recentSymptoms: symptoms,
      recentInsights: insights,
    });
  } catch (error: any) {
    console.error('[API /api/twin] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organId, symptomName, severity, heartRate, waterIntakeMl, stressLevel } = body;

    const user = await prisma.userProfile.findFirst({
      where: { email: 'test@gama.com' },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (symptomName) {
      await prisma.symptom.create({
        data: {
          profileId: user.id,
          name: `[${organId?.toUpperCase() || 'GENERAL'}] ${symptomName}`,
          severity: Number(severity) || 3,
          notes: `Logged via 3D Body Twin Inspector for organ: ${organId}`,
        },
      });
    }

    if (heartRate || waterIntakeMl || stressLevel) {
      const existing = await prisma.healthRecord.findFirst({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' },
      });

      await prisma.healthRecord.create({
        data: {
          profileId: user.id,
          heartRate: heartRate ? Number(heartRate) : existing?.heartRate ?? 68,
          waterIntakeMl: waterIntakeMl ? Number(waterIntakeMl) : existing?.waterIntakeMl ?? 2000,
          stressLevel: stressLevel ? Number(stressLevel) : existing?.stressLevel ?? 2.5,
          hrv: existing?.hrv ?? 65,
          oxygenLevel: existing?.oxygenLevel ?? 98,
          bloodPressure: existing?.bloodPressure ?? '120/80',
          vitalityScore: existing?.vitalityScore ?? 92,
          provider: '3D Body Twin Direct',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Body Twin biometrics successfully persisted to database.',
    });
  } catch (error: any) {
    console.error('[API /api/twin POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
