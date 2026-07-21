'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Wind, Droplets, Activity, Calendar, Moon, Watch, Bell, Zap,
  Sun, ShieldAlert, Sliders, Eye, Undo, Play, ChevronRight, Thermometer, Info, Scale
} from 'lucide-react';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';
import { CentralWorldStore, WorldState } from '@/features/twin/world-state';
import { WorldEngine } from '@/features/twin/world-engine';
import { EnvironmentEngine } from '@/features/twin/environment-engine';
import { OrganHealthEngine, OrganHealthData } from '@/features/twin/organ-health-engine';
import { SimulationEngine, SimulationMetrics } from '@/features/twin/simulation-engine';
import dynamic from 'next/dynamic';

const BodyTwinModel = dynamic(() => import('@/components/twin/BodyTwinModel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-black/20 rounded-[40px]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white animate-spin" />
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Syncing Hologram...</span>
      </div>
    </div>
  )
});

export default function DigitalTwinPage() {
  const { steps, sleepHours, hrv, stressLevel, heartRate } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const [userName, setUserName] = React.useState('AURA User');

  // Living World State
  const [worldState, setWorldState] = React.useState<WorldState>(CentralWorldStore.getState());
  const [activeLayer, setActiveLayer] = React.useState<string>('Recovery Layer');
  const [selectedOrgan, setSelectedOrgan] = React.useState<string | null>(null);
  const [activeOrganData, setActiveOrganData] = React.useState<OrganHealthData | null>(null);

  // Future simulation state
  const [activeSimulation, setActiveSimulation] = React.useState<string | null>(null);
  const [simulatedMetrics, setSimulatedMetrics] = React.useState<SimulationMetrics | null>(null);

  // Timeline Date scrubbing
  const [selectedTimelineDate, setSelectedTimelineDate] = React.useState<string>('Today');

  React.useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem('gama_user_name');
    if (storedName) {
      setUserName(storedName);
    }

    // Initial sync
    WorldEngine.syncWithHealth(85, stressLevel, 78, sleepHours);

    const unsubscribe = CentralWorldStore.subscribe((state) => {
      setWorldState(state);
    });

    return () => unsubscribe();
  }, [stressLevel, sleepHours]);

  if (!mounted) return null;

  const handleSelectOrgan = (organ: string) => {
    setSelectedOrgan(organ);
    const organInfo = OrganHealthEngine.getOrganHealth(organ, {
      recoveryScore: simulatedMetrics?.recoveryScore ?? worldState.recoveryScore,
      stressLevel: simulatedMetrics?.stressLevel ?? worldState.stressLevel,
      hydrationLevel: simulatedMetrics?.hydrationLevel ?? worldState.hydrationLevel,
      sleepHours: simulatedMetrics?.sleepHours ?? worldState.sleepHours
    });
    setActiveOrganData(organInfo);
    toast.info(`Zooming focus to the ${organ}. System metrics loaded.`);
  };

  const handleTriggerSimulation = (scenarioId: string) => {
    if (activeSimulation === scenarioId) {
      // Clear simulation
      setActiveSimulation(null);
      setSimulatedMetrics(null);
      if (selectedOrgan) {
        handleSelectOrgan(selectedOrgan); // Refresh data with live values
      }
      toast.success('Simulation cleared. Restored live telemetry.');
      return;
    }

    setActiveSimulation(scenarioId);
    const simulationResult = SimulationEngine.simulateScenario(scenarioId, {
      recoveryScore: worldState.recoveryScore,
      stressLevel: worldState.stressLevel,
      hydrationLevel: worldState.hydrationLevel,
      sleepHours: worldState.sleepHours
    });
    setSimulatedMetrics(simulationResult);

    // Refresh organ data if open
    if (selectedOrgan) {
      const organInfo = OrganHealthEngine.getOrganHealth(selectedOrgan, {
        recoveryScore: simulationResult.recoveryScore,
        stressLevel: simulationResult.stressLevel,
        hydrationLevel: simulationResult.hydrationLevel,
        sleepHours: simulationResult.sleepHours
      });
      setActiveOrganData(organInfo);
    }
    toast.success(`Simulation active: ${scenarioId.replace('_', ' ')}`);
  };

  // Replay timeline
  const handleTimelineScrub = (dateKey: string) => {
    setSelectedTimelineDate(dateKey);
    let mockBiometrics = { recoveryScore: 85, stressLevel: 2, hydrationLevel: 78, sleepHours: 7.5 };

    if (dateKey === 'Yesterday') {
      mockBiometrics = { recoveryScore: 78, stressLevel: 5, hydrationLevel: 70, sleepHours: 6.2 };
    } else if (dateKey === 'Last Week') {
      mockBiometrics = { recoveryScore: 92, stressLevel: 1, hydrationLevel: 85, sleepHours: 8.4 };
    } else if (dateKey === 'Last Month') {
      mockBiometrics = { recoveryScore: 65, stressLevel: 7, hydrationLevel: 62, sleepHours: 5.8 };
    }

    WorldEngine.syncWithHealth(mockBiometrics.recoveryScore, mockBiometrics.stressLevel, mockBiometrics.hydrationLevel, mockBiometrics.sleepHours);

    // Update currently opened organ data
    if (selectedOrgan) {
      const organInfo = OrganHealthEngine.getOrganHealth(selectedOrgan, mockBiometrics);
      setActiveOrganData(organInfo);
    }
    toast.info(`Time Machine: Simulating biological state from ${dateKey}.`);
  };

  const layers = [
    'Recovery Layer', 'Cardiovascular', 'Nervous System', 'Respiratory',
    'Muscular', 'Skeletal', 'Digestive', 'Metabolism', 'Energy Flow'
  ];

  const simulatedOrLive = (key: keyof SimulationMetrics, liveVal: any) => {
    if (simulatedMetrics && key in simulatedMetrics) {
      return simulatedMetrics[key];
    }
    return liveVal;
  };

  // Biometrics derived
  const displayRecovery = simulatedOrLive('recoveryScore', worldState.recoveryScore) as number;
  const displayStress = simulatedOrLive('stressLevel', worldState.stressLevel) as number;
  const displayHydration = simulatedOrLive('hydrationLevel', worldState.hydrationLevel) as number;
  const displaySleepHours = simulatedOrLive('sleepHours', worldState.sleepHours) as number;
  const displayHRV = simulatedOrLive('hrv', hrv) as number;
  const displayHeartRate = simulatedOrLive('heartRate', heartRate) as number;
  const displayBodyBattery = simulatedOrLive('bodyBattery', Math.max(10, 100 - displayStress * 8)) as number;
  const displayProductivity = simulatedOrLive('productivity', 85 - displayStress * 4) as number;

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#eae3dc] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans">

      {/* Background cinematic warm glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] rounded-full bg-[#3a2010]/10 blur-[180px] pointer-events-none" />

      {/* Header Portal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 z-10">
        <div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white text-black font-semibold animate-pulse" /> Living digital organism
          </span>
          <h1 className="text-whitexl font-black text-white tracking-tight mt-1">AURA Biological Twin</h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Real-time biometric projection, cellular energy telemetry, and future health simulation.
          </p>
        </div>

        {/* Timeline Machine Scrub */}
        <div className="flex items-center bg-[#181311] border border-[#2a201a] rounded-full p-1 self-stretch md:self-auto shadow-inner">
          {['Today', 'Yesterday', 'Last Week', 'Last Month'].map((dt) => (
            <button
              key={dt}
              onClick={() => handleTimelineScrub(dt)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedTimelineDate === dt
                  ? 'bg-white text-black font-semibold text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'text-neutral-400 hover:text-[#eae3dc]'
                }`}
            >
              {dt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 z-10">

        {/* Left Biometrics Rail */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-start">

          {/* Recovery Indicator (Large) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-xl rounded-full" />
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Biological Recovery</span>
              <span className="px-2 py-0.5 bg-white/5 text-neutral-300 rounded-md font-bold text-[10px] tracking-wide">
                {displayRecovery > 80 ? 'Optimal' : displayRecovery > 50 ? 'Resting' : 'Strained'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-whitexl font-black text-white tracking-tighter">{displayRecovery}</span>
              <span className="text-sm text-neutral-400 font-bold">%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand to-brand-hover h-full rounded-full transition-all duration-500"
                style={{ width: `${displayRecovery}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              HRV variance indicates high parasympathetic readiness. Aerobic performance capacity is high.
            </p>
          </motion.div>

          {/* Core Biometrics Grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* Stress */}
            <div className="bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] rounded-3xl p-4 flex flex-col justify-between aspect-square relative group hover:border-[#3e2b1f] transition-all shadow-lg">
              <div className="w-8 h-8 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-300 border border-white/10">
                <Zap className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <span className="text-whitexl font-black text-white">{displayStress}</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-bold uppercase tracking-wider">Stress (0-10)</span>
              </div>
            </div>

            {/* HRV */}
            <div className="bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] rounded-3xl p-4 flex flex-col justify-between aspect-square relative group hover:border-[#3e2b1f] transition-all shadow-lg">
              <div className="w-8 h-8 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-300 border border-white/10">
                <Heart className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <span className="text-whitexl font-black text-white">{displayHRV}</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-bold uppercase tracking-wider">HRV (ms)</span>
              </div>
            </div>

            {/* Sleep */}
            <div className="bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] rounded-3xl p-4 flex flex-col justify-between aspect-square relative group hover:border-[#3e2b1f] transition-all shadow-lg">
              <div className="w-8 h-8 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-300 border border-white/10">
                <Moon className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <span className="text-whitexl font-black text-white">{displaySleepHours}h</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-bold uppercase tracking-wider">Sleep</span>
              </div>
            </div>

            {/* Hydration */}
            <div className="bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] rounded-3xl p-4 flex flex-col justify-between aspect-square relative group hover:border-[#3e2b1f] transition-all shadow-lg">
              <div className="w-8 h-8 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-300 border border-white/10">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <span className="text-whitexl font-black text-white">{displayHydration}%</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-bold uppercase tracking-wider">Water</span>
              </div>
            </div>

          </div>

          {/* Physical Profile Summary Layout (Matches Age / Height / Weight design of Screen 3) */}
          <div className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-5 shadow-lg">
            <div className="grid grid-cols-3 gap-2 text-center relative">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Age (yr)</span>
                <span className="text-2xl font-black text-white mt-1">28</span>
              </div>
              <div className="absolute left-[33%] top-2 bottom-2 w-[1px] bg-[#2c1e15]" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Height (cm)</span>
                <span className="text-2xl font-black text-white mt-1">182</span>
              </div>
              <div className="absolute left-[66%] top-2 bottom-2 w-[1px] bg-[#2c1e15]" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Weight (kg)</span>
                <span className="text-2xl font-black text-white mt-1">76.5</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2c1e15] text-center">
              <p className="text-[9px] text-neutral-300 font-bold uppercase tracking-wider">
                ✓ System Ready & Fully Synced
              </p>
            </div>
          </div>

        </div>

        {/* Center Widescreen 3D Canvas Area */}
        <div className="lg:col-span-5 bg-black/90 backdrop-blur-xl border border-white/5 rounded-[40px] relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[600px] hover:border-white/20/10 transition-all duration-300">

          {/* Radial amber backdrop for 3D model */}
          <div className="absolute top-[20%] left-[10%] right-[10%] bottom-[20%] bg-gradient-radial from-brand/5 via-transparent to-transparent pointer-events-none" />

          {/* Layer switcher tab list */}
          <div className="p-4 z-20 flex flex-wrap gap-1.5 justify-center bg-black/50 border-b border-white/5">
            {layers.map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${activeLayer === layer
                    ? 'bg-white text-black font-semibold text-black border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                    : 'bg-neutral-900/40 text-neutral-400 hover:text-white border-transparent hover:border-white/10'
                  }`}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Living Digital Human R3F Canvas Container */}
          <div className="flex-1 relative w-full h-full min-h-[350px]">
            <BodyTwinModel
              layer={activeLayer}
              recoveryScore={displayRecovery}
              stressLevel={displayStress}
              selectedOrgan={selectedOrgan}
              onSelectOrgan={handleSelectOrgan}
              heartRate={displayHeartRate}
            />

            {/* Floating visual hints on R3F interactive zones */}
            <div className="absolute bottom-6 right-6 z-20 bg-[#161210]/90 border border-[#2c1e15] px-3.5 py-2 rounded-2xl flex items-center gap-2 pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-white text-black font-semibold animate-ping" />
              <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-wider">Tap organ hotspots to diagnostic</span>
            </div>
          </div>

          {/* Environmental weather/time status overlay */}
          <div className="p-4 bg-[#14100e]/50 border-t border-[#2c1e15]/40 z-20 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-neutral-300" /> Noon Ambient Sunlight
            </span>
            <span>Reflective Material Shimmer active</span>
          </div>

        </div>

        {/* Right Rails & Simulators */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">

          {/* Heart Rate / Live Telemetry Card */}
          <div className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 text-neutral-300 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{displayHeartRate} BPM</h3>
                <p className="text-[10px] text-neutral-400">Live Heart Rate Telemetry</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/20/25 px-2.5 py-0.5 rounded-full text-neutral-300 text-[9px] font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-white text-black font-semibold rounded-full animate-ping" /> Live Sync
            </div>
          </div>

          {/* Future Scenario Simulator Console */}
          <div className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-6 flex-1 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-black tracking-widest text-white uppercase block">AI Scenario Sandbox</span>
              <h3 className="text-base font-bold text-white mt-1">Predictive Biometric Simulator</h3>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                Trigger mock behaviors below. GAMA will rebuild the digital human state to visualize health forecasts.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                {[
                  { id: 'sleep_deprived', label: '4h Sleep Debt' },
                  { id: 'run_10k', label: 'Run 10 KM' },
                  { id: 'skip_workout', label: 'Skip Training' },
                  { id: 'hydrate_3l', label: 'Drink 3L Water' },
                  { id: 'junk_food', label: 'High Sugar Meal' },
                  { id: 'meditate_20', label: 'Meditate 20 Min' }
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleTriggerSimulation(sc.id)}
                    className={`p-2.5 rounded-2xl text-[10px] font-bold tracking-wide transition-all text-left cursor-pointer border ${activeSimulation === sc.id
                        ? 'bg-white text-black font-semibold text-black border-white/20 font-extrabold shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                        : 'bg-[#1a1412] text-neutral-300 hover:text-white border-[#2c1e15]/60 hover:border-white/20/25'
                      }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Predict Result */}
            {activeSimulation && simulatedMetrics && (
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest block">Simulation Active</span>
                <p className="text-[10px] text-neutral-200 leading-relaxed">{simulatedMetrics.explanation}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-white/20/10">
                  <div>
                    <span className="text-neutral-400">Recovery:</span> <span className="font-bold text-white">{simulatedMetrics.recoveryScore}%</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Stress:</span> <span className="font-bold text-white">{simulatedMetrics.stressLevel}/10</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick AI Coaching Note */}
          <div className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-5 flex items-start gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-white/5 text-neutral-300 flex items-center justify-center shrink-0 border border-white/10">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AURA Dynamic Tip</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                Your circadian window opens at 9:30 PM. Decrease screen exposure and avoid intense visual stimulation.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* AURA Slide-Out Health Drawer */}
      <AnimatePresence>
        {selectedOrgan && activeOrganData && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrgan(null)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-[#0e0b0a] border-l border-[#2c1e15] shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                    Organ Diagnostic Portal
                  </span>
                  <button
                    onClick={() => setSelectedOrgan(null)}
                    className="p-1.5 hover:bg-[#1a1412] rounded-full text-neutral-400 hover:text-white cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">{activeOrganData.name}</h2>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Status: <span className="text-white font-bold">{activeOrganData.status}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-white">{activeOrganData.score}</span>
                    <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mt-0.5">Health Index</span>
                  </div>
                </div>

                {/* Diagnostic Details */}
                <div className="space-y-4 pt-4 border-t border-[#2c1e15]">

                  {/* Explanation */}
                  <div className="bg-[#181311] rounded-2xl p-4 border border-[#2c1e15]">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-neutral-300" /> AURA Assessment
                    </h4>
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{activeOrganData.prediction}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2c1e15] text-[9px] text-neutral-500 font-bold uppercase">
                      <span>Prediction Confidence</span>
                      <span className="text-neutral-300">{activeOrganData.confidenceScore}%</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-300">Recommendations</h4>
                    {activeOrganData.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-400 leading-relaxed bg-[#14100e]/50 border border-[#2c1e15]/50 p-3 rounded-xl">
                        <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Habits & Risks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Supporting Habits</h5>
                      <ul className="text-[10px] text-neutral-400 list-disc list-inside space-y-1">
                        {activeOrganData.habits.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Potential Risks</h5>
                      <ul className="text-[10px] text-rose-400/80 list-disc list-inside space-y-1">
                        {activeOrganData.risks.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              {/* Consultation Prep Notes */}
              <div className="mt-8 pt-6 border-t border-[#2c1e15] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300">Doctor Consultation Prep Notes</h4>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{activeOrganData.doctorPrepNotes}</p>
                </div>
                <button
                  onClick={() => toast.success('Diagnostic summary package generated and synced to Secure Vault.')}
                  className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(249,115,22,0.35)]"
                >
                  <ShieldAlert className="w-4 h-4" /> Package Summary for Vault
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
