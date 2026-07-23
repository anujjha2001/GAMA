'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, RefreshCw, Layers, Sparkles, Sliders, Heart, Brain, Wind, Flame, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
const InteractiveBodyTwin3D = dynamic(() => import('@/components/twin/InteractiveBodyTwin3D').then((m) => m.InteractiveBodyTwin3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] md:h-[620px] rounded-3xl bg-[#050508] border border-white/10 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#00f0ff] rounded-full animate-spin" />
    </div>
  ),
});
import { OrganInspectorPanel, OrganData } from '@/components/twin/OrganInspectorPanel';
import { SimulationEngine } from '@/features/twin/simulation-engine';
import { toast } from 'sonner';

export default function BodyTwinPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganData | null>(null);
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [activeScenario, setActiveScenario] = useState<string>('equilibrium');
  const [simulationMetrics, setSimulationMetrics] = useState<any>(null);

  const fetchTwinData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/twin');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error('Failed to fetch body twin telemetry');
      }
    } catch (err) {
      toast.error('Error connecting to live database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, []);

  const handleScenarioChange = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    if (scenarioId === 'equilibrium') {
      setSimulationMetrics(null);
      toast.info('Returned to Live Equilibrium.');
      return;
    }

    const currentVitals = {
      recoveryScore: data?.biometrics?.vitalityScore ?? 92,
      stressLevel: data?.biometrics?.stressLevel ?? 2.5,
      hydrationLevel: 85,
      sleepHours: 7.5,
    };

    const simulated = SimulationEngine.simulateScenario(scenarioId, currentVitals);
    setSimulationMetrics(simulated);
    toast.success(`Simulation active: ${scenarioId.replace('_', ' ').toUpperCase()}`);
  };

  const organs: Record<string, OrganData> = data?.organs ?? {};

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 md:p-8 space-y-6">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#00f0ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff2a85]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#09090b]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              Live Database Connected
            </span>
            <span className="text-xs text-neutral-400 font-semibold">• Real-Time Organ Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1.5 flex items-center gap-3">
            3D Digital Body Twin
            <Activity className="w-6 h-6 text-[#00f0ff]" />
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={fetchTwinData}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#00f0ff] ${loading ? 'animate-spin' : ''}`} />
            Sync Vitals
          </button>
        </div>
      </div>

      {/* System Filter Tabs & Scenario Bar */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#09090b]/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
        {/* System Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Systems' },
            { id: 'cardiovascular', label: 'Cardiovascular' },
            { id: 'nervous', label: 'Nervous System' },
            { id: 'digestive', label: 'Digestive & Gut' },
            { id: 'musculoskeletal', label: 'Musculoskeletal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSystemFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                systemFilter === tab.id
                  ? 'bg-[#00f0ff] text-black border-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-white/5 text-neutral-300 hover:text-white border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Simulation Trigger Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 shrink-0">Simulate:</span>
          {[
            { id: 'equilibrium', label: 'Live Equilibrium' },
            { id: 'sleep_deprived', label: 'Sleep Deprived' },
            { id: 'run_10k', label: '10K Cardio Run' },
            { id: 'hydrate_3l', label: '3L Hydration' },
            { id: 'meditate_20', label: '20m Meditation' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleScenarioChange(sc.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap border transition-all cursor-pointer ${
                activeScenario === sc.id
                  ? 'bg-[#ff2a85] text-white border-white shadow-[0_0_12px_rgba(255,42,133,0.5)]'
                  : 'bg-white/5 text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Alert Banner if Active */}
      {simulationMetrics && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#ff2a85]/20 via-[#09090b] to-[#00f0ff]/20 border border-[#ff2a85]/40 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative z-10"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#ff2a85] shrink-0" />
            <div>
              <span className="font-black text-[#ff2a85] uppercase tracking-wider text-[10px]">AURA Biological Simulation Running</span>
              <p className="text-neutral-200 text-xs mt-0.5">{simulationMetrics.explanation}</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-mono shrink-0">
            <div>HRV: <span className="text-[#00f0ff] font-bold">{simulationMetrics.hrv} ms</span></div>
            <div>HR: <span className="text-[#ff2a85] font-bold">{simulationMetrics.heartRate} BPM</span></div>
            <div>Bio-Age: <span className="text-emerald-400 font-bold">{simulationMetrics.biologicalAgeOffset > 0 ? `+${simulationMetrics.biologicalAgeOffset}` : simulationMetrics.biologicalAgeOffset} yrs</span></div>
          </div>
        </motion.div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* 3D Canvas Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <InteractiveBodyTwin3D
            organs={organs}
            selectedOrgan={selectedOrgan}
            onSelectOrgan={setSelectedOrgan}
            systemFilter={systemFilter}
          />
        </div>

        {/* Inspector Panel or Organ Summary Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedOrgan ? (
            <OrganInspectorPanel
              organ={selectedOrgan}
              onClose={() => setSelectedOrgan(null)}
              onRefreshData={fetchTwinData}
            />
          ) : (
            <div className="bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Full Anatomy Telemetry</h3>
                  <p className="text-xs text-neutral-400">Click any organ in 3D to zoom & inspect</p>
                </div>
                <Sparkles className="w-5 h-5 text-[#00f0ff]" />
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                {Object.values(organs).map((organ) => (
                  <div
                    key={organ.id}
                    onClick={() => setSelectedOrgan(organ)}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#00f0ff] group-hover:scale-125 transition-all shadow-[0_0_10px_#00f0ff]" />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors">{organ.name}</div>
                        <div className="text-[10px] text-neutral-400">{organ.system}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-black text-white">{organ.score}%</div>
                      <span className="text-neutral-500 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
