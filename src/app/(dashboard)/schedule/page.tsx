'use client';

import * as React from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, Plus,
  MapPin, Clock, Calendar, AlertCircle,
  Zap, Brain, ShieldAlert, Thermometer, Droplets, Sun, Wind
} from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API error');
  return res.json();
});

interface ScheduleBlock {
  id?: string;
  title: string;
  category: 'WORKOUT' | 'NUTRITION' | 'RECOVERY' | 'DEEP_WORK' | 'SLEEP' | 'MEDICINE' | 'TRAVEL' | 'GENERAL';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  purpose: string;
  priority: number;
  energyCost: number;
  recoveryCost: number;
  healthImpact: string;
  aiReasoning: string;
  confidenceScore: number;
}

export default function SchedulePage() {
  const { data, error, mutate } = useSWR('/api/v1/schedule', fetcher);
  const [selectedTask, setSelectedTask] = React.useState<ScheduleBlock | null>(null);
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (error || (data && !data.success)) return <div className="p-10 text-rose-500 font-mono">SYSTEM ERROR: FAILED TO LOAD HEALTH OS SCHEDULE.</div>;
  if (!data || !data.blocks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400 font-medium">Calibrating Circadian Clock Loops...</span>
      </div>
    );
  }

  const { blocks, decisionLog, predictions, habits, weather, kpis } = data;

  const getCategoryColor = (category: ScheduleBlock['category']) => {
    switch (category) {
      case 'WORKOUT': return 'bg-[#402a15] border-[#664320] text-[#ffb74d]';
      case 'RECOVERY': return 'bg-[#15343d] border-[#1f5866] text-[#4dd0e1]';
      case 'DEEP_WORK': return 'bg-[#1e2530] border-[#2e3745] text-[#90a4ae]';
      case 'NUTRITION': return 'bg-[#1b3a1e] border-[#295c2e] text-[#66bb6a]';
      default: return 'bg-[#161719] border-[#25272a] text-[#a3a3a3]';
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Top Banner Navigation */}
      <div className="relative rounded-[32px] overflow-hidden bg-black/35 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center min-h-[120px] border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
            AURA Chronobiological Health OS
          </span>
          <h1 className="text-whitexl font-bold tracking-tight">GAMA Health Planner</h1>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-neutral-300">
            {currentTime.toLocaleTimeString()}
          </span>
          <button
            onClick={() => {
              mutate();
              toast.success('AI Optimizer re-simulated schedule loops.');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Re-Optimize</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Burnout Risk</span>
          <span className="text-2xl font-black text-white mt-1 block">{(predictions.burnoutRisk * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Focus Capacity</span>
          <span className="text-2xl font-black text-sky-400 mt-1 block">{predictions.focusCapacity}/100</span>
        </div>
        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Prediction Accuracy</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{(kpis.predictionAccuracy * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">AI Decisions Today</span>
          <span className="text-2xl font-black text-white mt-1 block">{kpis.decisionsToday} Adjustments</span>
        </div>
      </div>

      {/* Live Timeline & Weather Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Real-Time Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-lg font-bold tracking-wide text-neutral-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" /> Circadian Timeline
            </h2>

            <div className="space-y-4">
              {blocks.map((block: ScheduleBlock, idx: number) => {
                const isCurrent = idx === 1; // Simulated current activity
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedTask(block)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${getCategoryColor(block.category)} ${isCurrent ? 'ring-2 ring-brand' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono opacity-85">
                          {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isCurrent && <span className="px-2 py-0.5 bg-white text-black font-semibold text-black text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse">Live</span>}
                      </div>
                      <h3 className="text-base font-bold mt-1">{block.title}</h3>
                      <p className="text-xs opacity-75 mt-0.5">{block.purpose}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono block opacity-90">Energy Cost: {block.energyCost}</span>
                      <span className="text-[10px] font-mono block opacity-90">Confidence: {(block.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Environmental Intelligence & Habits */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-lg font-bold tracking-wide text-neutral-200 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" /> Live Environment
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-neutral-300" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Temp</span>
                  <span className="text-sm font-bold">{weather.tempC}°C</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">AQI</span>
                  <span className="text-sm font-bold">{weather.aqi} (Poor)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Hydration targets increased by +900ml due to high temperature and heavy humidity factors.</p>
            </div>
          </div>

          {/* Habit Pattern Alerts */}
          <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-lg font-bold tracking-wide text-neutral-200 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" /> Habit Intelligence
            </h2>
            <div className="space-y-3">
              {habits.map((h: any, idx: number) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                  <span className="text-[10px] text-purple-400 font-bold block mb-1">Pattern Detected</span>
                  <p className="text-neutral-200">{h.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Explainability Drawer Overlay */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-md bg-black/90 border-l border-white/10 h-full p-8 overflow-y-auto space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-400">AURA Decision Trace</span>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div>
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                  {selectedTask.category}
                </span>
                <h2 className="text-2xl font-black mt-3">{selectedTask.title}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-neutral-500 block">Orchestrator Explanation</span>
                  <p className="text-sm font-semibold text-neutral-200 mt-1 leading-relaxed">{selectedTask.aiReasoning}</p>
                </div>

                <div>
                  <span className="text-xs text-neutral-500 block">Expected Health Benefit</span>
                  <p className="text-sm text-neutral-300 mt-1">{selectedTask.healthImpact}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-xs text-neutral-500">Confidence Score</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">{(selectedTask.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Scheduled Duration</span>
                    <span className="text-lg font-black text-white mt-1 block">{selectedTask.durationMinutes} minutes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
