'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Brain, Wind, Droplets, ShieldAlert, Sparkles as SparkleIcon, Sliders, Info, Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Custom 3D Cybernetic Organ Representation using Canvas
function CyberOrganPoints({ activeOrgan }: { activeOrgan: string }) {
  const pointsRef = React.useRef<THREE.Points>(null);

  // Generate coordinate clouds mimicking organ nodes
  const [positions, colorArray] = React.useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    // Primary Colors for different organs
    const colorsMap: Record<string, THREE.Color> = {
      brain: new THREE.Color('#a855f7'), // Purple
      heart: new THREE.Color('#f97316'), // Orange
      lungs: new THREE.Color('#06b6d4'), // Cyan
      gut: new THREE.Color('#10b981'), // Green
      kidneys: new THREE.Color('#eab308'), // Yellow
    };

    const baseCol = colorsMap[activeOrgan] || new THREE.Color('#3b82f6');

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;

      if (activeOrgan === 'brain') {
        // Double hemisphere sphere shape
        const hemi = Math.random() > 0.5 ? 1 : -1;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 0.5 + Math.random() * 0.3;
        x = r * Math.sin(phi) * Math.cos(theta) + (hemi * 0.15);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.7 + 0.8;
        z = r * Math.cos(phi) * 0.7;
      } else if (activeOrgan === 'heart') {
        // Tapered heart cloud shape
        const theta = Math.random() * Math.PI * 2;
        const r = 0.4 + Math.random() * 0.45;
        x = Math.sin(theta) * r * 1.1;
        y = (Math.random() - 0.5) * 1.2;
        z = Math.cos(theta) * r;
        if (y < 0) {
          x *= (1 + y * 0.4);
          z *= (1 + y * 0.4);
        }
      } else if (activeOrgan === 'lungs') {
        // Dual lobe cylinders
        const side = Math.random() > 0.5 ? 1 : -1;
        const theta = Math.random() * Math.PI * 2;
        const r = 0.25 + Math.random() * 0.25;
        x = Math.cos(theta) * r + (side * 0.45);
        y = (Math.random() - 0.5) * 1.3 - 0.1;
        z = Math.sin(theta) * r;
      } else {
        // Gut/General: organic spiral cloud
        const theta = i * 0.15;
        const r = 0.15 + i * 0.0012;
        x = Math.cos(theta) * r;
        y = -0.5 + (i / count) * 0.8;
        z = Math.sin(theta) * r;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color variation
      const colVar = baseCol.clone().multiplyScalar(0.75 + Math.random() * 0.5);
      cols[i * 3] = colVar.r;
      cols[i * 3 + 1] = colVar.g;
      cols[i * 3 + 2] = colVar.b;
    }

    return [pos, cols];
  }, [activeOrgan]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.25;
    // Add physiological pulse contraction
    const pulseFactor = 1.0 + Math.sin(time * 3.5) * 0.025;
    pointsRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colorArray} stride={3}>
      <PointMaterial
        vertexColors
        transparent
        size={0.065}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

interface OrganData {
  id: string;
  name: string;
  score: number;
  status: 'optimal' | 'moderate' | 'action required';
  icon: any;
  insights: string[];
  recommendation: string;
}

export default function DigitalTwinPage() {
  const [mounted, setMounted] = React.useState(false);
  const [activeOrganId, setActiveOrganId] = React.useState('heart');
  const { steps, sleepHours, hrv, stressLevel, heartRate } = useHealthStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Organ datasets computed from wearable states
  const heartScore = Math.min(100, Math.max(30, Math.round(100 - (stressLevel * 8) - (heartRate - 60))));
  const brainScore = Math.min(100, Math.max(30, Math.round((sleepHours / 8) * 60 + (80 - stressLevel * 10))));
  const lungsScore = Math.min(100, Math.max(40, Math.round(hrv * 0.8 + 30)));
  const gutScore = Math.min(100, Math.max(50, Math.round(steps / 250 + 40)));

  const organs: OrganData[] = [
    {
      id: 'brain',
      name: 'Nervous & Cognitive System',
      score: brainScore,
      status: brainScore > 80 ? 'optimal' : brainScore > 65 ? 'moderate' : 'action required',
      icon: Brain,
      insights: [
        'Deep sleep latency: 18 minutes (optimal)',
        'Cognitive load peak: 14:00 - 16:30',
        'REM phase duration: 1.15 hours'
      ],
      recommendation: 'Alpha-wave stimulation suggested at 21:30 to counteract elevated stress levels.'
    },
    {
      id: 'heart',
      name: 'Cardiovascular Network',
      score: heartScore,
      status: heartScore > 80 ? 'optimal' : heartScore > 60 ? 'moderate' : 'action required',
      icon: Heart,
      insights: [
        `Resting Heart Rate: ${heartRate} BPM`,
        `Heart Rate Variability (HRV): ${hrv} ms`,
        'Endothelial shear stress: low'
      ],
      recommendation: 'Targeted Zone 2 aerobic recovery run (30 min) today to optimize blood pressure resonance.'
    },
    {
      id: 'lungs',
      name: 'Respiratory Exchange',
      score: lungsScore,
      status: lungsScore > 80 ? 'optimal' : lungsScore > 60 ? 'moderate' : 'action required',
      icon: Wind,
      insights: [
        'Oxygen saturation (SpO2): 98.4% average',
        'Respiration rate: 12.8 breaths/min',
        'Autonomic breathing pattern: balanced'
      ],
      recommendation: 'Perform 3 cycles of Box Breathing (4s inhale, 4s hold, 4s exhale, 4s hold) to stabilize parasympathetic drive.'
    },
    {
      id: 'gut',
      name: 'Metabolic & Digestive Core',
      score: gutScore,
      status: gutScore > 80 ? 'optimal' : gutScore > 65 ? 'moderate' : 'action required',
      icon: Droplets,
      insights: [
        'Glycemic variability index: stable',
        `Physical metabolic offset: +${(steps * 0.045).toFixed(0)} kcal`,
        'Prebiotic nutrient balance: moderate'
      ],
      recommendation: 'Consume prebiotic whole grains at next meal window to feed active gut microbiome strain.'
    }
  ];

  const activeOrgan = organs.find(o => o.id === activeOrganId) || organs[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden glass-panel p-6 md:p-8 flex flex-col justify-between min-h-[160px] border border-border">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> 3D Epigenetic Coordinate Map
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Digital Twin Profile</h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Real-time cybernetic rendering of your physiological systems. Select an organ segment to isolate telemetry analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Organ Selector Menu */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Biological Systems</h3>
          <div className="space-y-2">
            {organs.map((organ) => {
              const isActive = organ.id === activeOrganId;
              const Icon = organ.icon;
              return (
                <button
                  key={organ.id}
                  onClick={() => setActiveOrganId(organ.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive 
                      ? 'bg-card border-cyan-500/30 shadow-md ring-1 ring-cyan-500/20' 
                      : 'bg-card/40 border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                      isActive 
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' 
                        : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{organ.name.split(' & ')[0]}</h4>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        organ.status === 'optimal' 
                          ? 'text-emerald-500' 
                          : organ.status === 'moderate' 
                          ? 'text-amber-500' 
                          : 'text-rose-500'
                      }`}>
                        {organ.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold">{organ.score}</span>
                    <span className="text-[8px] text-muted-foreground block font-bold uppercase">Score</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive 3D Cybernetic Display */}
        <div className="lg:col-span-5 rounded-[32px] glass-panel border border-border h-[400px] lg:h-auto min-h-[350px] relative overflow-hidden flex items-center justify-center bg-black/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-35" />
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 backdrop-blur-md rounded-full text-[9px] font-bold text-cyan-500 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Resonator Active
          </div>

          <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0.1, 2.2], fov: 45 }} className="w-full h-full">
              <ambientLight intensity={1.5} />
              <pointLight position={[10, 10, 10]} intensity={2.0} color="#06b6d4" />
              <directionalLight position={[5, 10, 5]} intensity={1.5} />
              <CyberOrganPoints activeOrgan={activeOrganId} />
              <Sparkles count={50} scale={2} size={2} speed={0.4} color="#06b6d4" />
            </Canvas>
          </div>
        </div>

        {/* Detailed Organ Telemetry */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOrgan.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] glass-panel p-6 border border-border space-y-6 flex flex-col justify-between h-full"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest">System details</span>
                  <h2 className="text-lg font-bold mt-0.5">{activeOrgan.name}</h2>
                </div>

                {/* Score Dial mockup */}
                <div className="p-4 bg-muted/40 border border-border rounded-[24px] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Organ Efficiency</span>
                    <h3 className="text-2xl font-black text-cyan-500">{activeOrgan.score}%</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider ${
                    activeOrgan.status === 'optimal'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : activeOrgan.status === 'moderate'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {activeOrgan.status}
                  </span>
                </div>

                {/* Biological Insights list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Biometrics Extracted
                  </h4>
                  <div className="space-y-2">
                    {activeOrgan.insights.map((insight, idx) => (
                      <div key={idx} className="text-xs py-2 px-3 bg-card/50 border border-border rounded-xl">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="border-t border-border pt-4 mt-6">
                <span className="text-[9px] font-bold text-violet-500 uppercase tracking-widest flex items-center gap-1">
                  <SparkleIcon className="w-3 h-3" /> AURA Recommendation
                </span>
                <p className="text-[11px] leading-relaxed text-muted-foreground mt-1 bg-violet-500/5 border border-violet-500/10 p-3.5 rounded-[18px]">
                  {activeOrgan.recommendation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
