'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Radio } from 'lucide-react';
import dynamic from 'next/dynamic';

const HealthOrb3D = dynamic(() => import('@/components/shared/health-orb-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <div className="h-48 w-48 rounded-full bg-cyan-500/10 animate-pulse blur-xl" />
    </div>
  ),
});

export function TwinView() {
  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* Main Grid: Left metrics, Center 3D Heart, Right metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
        
        {/* Left Side: Vitality Core KPI */}
        <div className="lg:col-span-3 space-y-6 z-10">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[32px] space-y-6 shadow-xl"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Vitality Core</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-white">94.2</span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">%g/L</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Metabolic efficiency is at peak levels for current circadian cycle.
              </p>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Regen Index</span>
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
              <div className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-bold text-white">88%</span>
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Stable</span>
                </div>
                <p className="text-[10px] text-white/50 font-light">
                  System recovery predicted 12% faster than baseline.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Center: 3D Heart Model */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0 }}
            className="w-full max-w-[500px] aspect-square"
          >
            <HealthOrb3D />
          </motion.div>
        </div>

        {/* Right Side: Sync status & Bio-Feedback */}
        <div className="lg:col-span-3 space-y-6 z-10">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[32px] space-y-6 shadow-xl"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Bio-Resonance</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-white">Active</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Synchronize your autonomic nervous system with live bio-feedback.
              </p>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Network Latency</span>
                <Radio className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Real-time Latency: <span className="text-white font-extrabold">0.04ms</span>. Bio-Sensors active and synchronizing.
              </p>
            </div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
