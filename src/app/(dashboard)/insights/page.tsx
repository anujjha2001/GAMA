'use client';

import * as React from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Activity, Thermometer, Wind, CheckCircle2, AlertTriangle, Cpu, Droplets, Zap } from 'lucide-react';
import { simulateAnomaly, resolveAnomaly } from './actions';

const inter = Inter({ subsets: ['latin'] });
const jbMono = JetBrains_Mono({ subsets: ['latin'] });

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InsightsHUD() {
  const { data, error, mutate } = useSWR('/api/insights', fetcher, {
    refreshInterval: 3000 // Poll every 3 seconds for real-time feel
  });

  const [isResolving, setIsResolving] = React.useState(false);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const activeAnomaly = data?.activeAnomaly;
  const telemetry = data?.telemetry;
  const history = data?.history || [];

  const isAlertActive = !!activeAnomaly;

  const handleSimulate = async () => {
    setIsSimulating(true);
    await simulateAnomaly();
    await mutate();
    setIsSimulating(false);
  };

  const handleResolve = async () => {
    if (!activeAnomaly) return;
    setIsResolving(true);
    await resolveAnomaly(activeAnomaly.id);
    await mutate();
    setIsResolving(false);
  };

  if (error) return <div className="p-10 text-rose-500 font-mono">SYSTEM ERROR: FAILED TO CONNECT TO DATABASE.</div>;

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 flex flex-col ${inter.className}`}>

      {/* 1. Global Header (Slim Top Bar) */}
      <header className="w-full h-12 bg-black/60 backdrop-blur-[12px] border border-white/10 rounded-2xl flex items-center justify-between px-6 mb-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: isAlertActive ? [1, 1.2, 1] : [1, 1.1, 1],
                opacity: isAlertActive ? [0.8, 1, 0.8] : [0.5, 0.8, 0.5]
              }}
              transition={{ repeat: Infinity, duration: isAlertActive ? 0.8 : 1.5 }}
              className={`w-2.5 h-2.5 rounded-full ${isAlertActive ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`}
            />
            <span className={`text-[10px] font-bold tracking-widest uppercase ${jbMono.className} ${isAlertActive ? 'text-rose-500' : 'text-emerald-500'}`}>
              System Heartbeat
            </span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className={`text-[10px] text-neutral-500 ${jbMono.className}`}>
            AURA ENGINE v4.2
          </span>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating || isAlertActive}
          className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isSimulating ? 'SIMULATING...' : '[ DEVELOPER: SIMULATE ANOMALY ]'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

        {/* 2. Active Event Hub (Center Stage) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <motion.div
            animate={{
              borderColor: isAlertActive ? 'rgba(244, 63, 94, 0.3)' : 'rgba(0, 0, 0, 0.1)',
              boxShadow: isAlertActive ? 'inset 0 0 60px rgba(244,63,94,0.05)' : 'inset 0 0 20px rgba(255,255,255,0.02)'
            }}
            className="flex-1 bg-black/40 backdrop-blur-[12px] border rounded-3xl p-8 relative overflow-hidden flex flex-col transition-colors duration-1000"
          >
            {/* Background Glow */}
            <motion.div
              animate={{ opacity: isAlertActive ? 0.15 : 0 }}
              className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-rose-500 blur-[100px] rounded-full pointer-events-none"
            />

            <AnimatePresence mode="wait">
              {isAlertActive ? (
                <motion.div
                  key="alert-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-rose-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-xs font-bold tracking-widest uppercase">Critical Anomaly Detected</span>
                      </div>
                      <h1 className="text-whitexl font-bold text-white">{activeAnomaly.title}</h1>
                    </div>
                    <div className={`px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 flex flex-col items-end ${jbMono.className}`}>
                      <span className="text-[10px] uppercase opacity-70">Impact Severity</span>
                      <span className="text-xl font-bold">94.2%</span>
                    </div>
                  </div>

                  {/* Visual Correlation Map */}
                  <div className="w-full h-32 border border-white/5 bg-white/5 rounded-2xl mb-8 flex items-center justify-between px-10 relative">
                    <div className="absolute top-1/2 left-10 right-10 h-[1px] bg-gradient-to-r from-rose-500/20 via-rose-500/50 to-rose-500/20 -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-black border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                        <Wind className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className={`text-[10px] font-bold text-rose-300 ${jbMono.className}`}>ENV: HIGH HEAT</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-black border border-rose-500/60 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                        <Activity className="w-6 h-6 text-rose-500" />
                      </div>
                      <span className={`text-[10px] font-bold text-rose-400 ${jbMono.className}`}>BIO: +12 BPM SHIFT</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.6)]">
                        <Droplets className="w-7 h-7 text-white" />
                      </div>
                      <span className={`text-[10px] font-bold text-rose-500 ${jbMono.className}`}>SYS: DEHYDRATION</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-black/60 border border-rose-500/20 rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-bold mb-3 text-rose-200">AURA Diagnostics</h3>
                    <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                      {activeAnomaly.message}
                    </p>
                    <div className="p-4 bg-rose-500/10 border-l-2 border-rose-500 rounded-r-xl">
                      <h4 className="text-[10px] font-bold uppercase text-rose-400 mb-1">Actionable Recommendation</h4>
                      <p className="text-xs text-rose-200">Consume 650ml of water infused with mineral electrolytes immediately. Rest in a cool environment for 15 minutes.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {isResolving ? 'STABILIZING SYSTEM...' : 'RESOLVE ANOMALY'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="healthy-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <Cpu className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Systems Nominal</h2>
                    <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                      AURA is actively monitoring your telemetry. No critical anomalies detected in the last 24 hours.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 4. Archive Log & Explainability */}
          <div className="lg:col-span-9 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-black/40 backdrop-blur-[12px] border border-white/10 rounded-3xl p-6 h-64 flex flex-col">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Diagnostic Archive Log</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {history.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-white/5 group hover:bg-white/5 rounded-lg px-3 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] text-neutral-500 ${jbMono.className}`}>
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">{event.title}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-[10px] ${jbMono.className} ${event.metadata?.impactType === 'positive' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                        {event.metadata?.impactValue || 'Logged'}
                      </span>
                      <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded border ${event.type === 'anomaly' ? 'border-rose-500/30 text-rose-500 bg-rose-500/10' :
                        event.type === 'resolution' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                          'border-white/10 text-neutral-400 bg-white/5'
                        }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && <div className="text-xs text-neutral-500 text-center mt-6">No historical data available.</div>}
              </div>
            </div>

            {/* Phase 2 Explainability Card */}
            <div className="flex-1 bg-black/40 backdrop-blur-[12px] border border-white/10 rounded-3xl p-6 h-64 flex flex-col relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
              </div>
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4 flex items-center gap-2 relative z-10">
                <Activity className="w-3.5 h-3.5 text-white" /> AI Explainability Matrix
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
                {(data?.insights || []).length > 0 ? (
                  data.insights.slice(0, 2).map((insight: any, i: number) => (
                    <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-white">{insight.summary?.headline || 'Insight'}</span>
                        <span className={`text-[9px] font-bold ${jbMono.className} text-neutral-300`}>{(insight.confidence * 100).toFixed(0)}% Conf</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed">{insight.summary?.explanation}</p>
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] uppercase font-bold text-white block mb-1">Suggested Action</span>
                        <span className="text-[10px] text-neutral-300">{insight.summary?.recommendations?.[0] || 'No action required.'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-white">Protein Intake Trend</span>
                      <span className={`text-[9px] font-bold ${jbMono.className} text-neutral-300`}>91% Conf</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">Protein intake averaged 42 g/day over the past week, below your goal of 90 g/day.</p>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[9px] uppercase font-bold text-white block mb-1">Suggested Action</span>
                      <span className="text-[10px] text-neutral-300">Include one protein-rich meal before 2 PM.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Biometric Telemetry Rail (Right Side) */}
        <div className="lg:col-span-3 bg-black/40 backdrop-blur-[12px] border border-white/10 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Live Telemetry</h3>
          </div>

          <TelemetryGauge
            label="HEART RATE"
            value={telemetry?.heartRate || 0}
            unit="BPM"
            trend="up"
            color="text-rose-500"
            graphColor="#f43f5e"
            isAlert={isAlertActive}
          />
          <TelemetryGauge
            label="HRV STATE"
            value={telemetry?.hrv || 0}
            unit="MS"
            trend="down"
            color="text-emerald-500"
            graphColor="#10b981"
          />
          <TelemetryGauge
            label="STRESS INDEX"
            value={telemetry?.stressLevel || 0}
            unit="/5"
            trend="flat"
            color="text-amber-500"
            graphColor="#f59e0b"
            isAlert={isAlertActive}
          />
          <TelemetryGauge
            label="CORE TEMP"
            value={36.8}
            unit="°C"
            trend="flat"
            color="text-cyan-500"
            graphColor="#06b6d4"
          />

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">
              <span>Database Sync</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
            <p className={`text-[9px] text-neutral-600 ${jbMono.className}`}>
              PostgreSQL Connected via Prisma<br />
              Polling: 3000ms Interval
            </p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}

// Mini component for the Telemetry Rail gauges
function TelemetryGauge({ label, value, unit, trend, color, graphColor, isAlert }: any) {
  // Simulate a live sparkline using SVG
  const generatePath = () => {
    let d = "M 0 20";
    let currY = 20;
    for (let x = 10; x <= 100; x += 10) {
      currY = isAlert ? 20 + (Math.random() * 20 - 15) : 20 + (Math.random() * 10 - 5);
      d += ` L ${x} ${Math.max(0, Math.min(40, currY))}`;
    }
    return d;
  };

  return (
    <div className={`p-4 rounded-2xl border transition-colors ${isAlert ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/5'}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">{label}</span>
        <span className={`text-[10px] ${jbMono.className} ${color}`}>{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '−'}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-bold ${jbMono.className} ${isAlert ? 'text-rose-500' : 'text-white'}`}>
          {value}<span className="text-xs text-neutral-500 ml-1">{unit}</span>
        </div>
        <svg width="100" height="40" className="opacity-70">
          <path d={generatePath()} fill="none" stroke={graphColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
