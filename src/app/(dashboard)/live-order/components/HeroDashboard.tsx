'use client';

import { useHealthStore } from "@/lib/store";
import { motion } from "framer-motion";
import { BatteryCharging, Droplets, Flame, Target, CloudSun, CheckCircle2 } from "lucide-react";

export default function HeroDashboard({ recommendations = [] }: { recommendations?: any[] }) {
  const { hrv, sleepHours, weather, manualInputs } = useHealthStore();
  
  const recoveryScore = Math.min(100, Math.round((hrv / 100) * 50 + (sleepHours / 8) * 50));
  const hydration = manualInputs.waterIntakeMl || 1200;
  const caloriesLeft = 2400 - (manualInputs.activeCalories || 800);
  const protein = 85; // Example dynamic value

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Welcome & Global Stats */}
      <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-display font-medium text-white mb-2">Good Afternoon, Anuj</h2>
            <p className="text-slate-400">Your biology is optimized for a <span className="text-amber-400 font-medium">high-protein</span> meal right now.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/5">
            <CloudSun className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-white">{weather?.temp || 28}°C {weather?.condition || 'Clear'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Goal</span>
            </div>
            <span className="text-lg font-medium text-white">Lean Bulk</span>
          </div>
          
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Calories Left</span>
            </div>
            <span className="text-lg font-medium text-white">{caloriesLeft} <span className="text-sm text-slate-500">kcal</span></span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Hydration</span>
            </div>
            <span className="text-lg font-medium text-white">{hydration} <span className="text-sm text-slate-500">ml</span></span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-400">
              <BatteryCharging className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Recovery</span>
            </div>
            <span className="text-lg font-medium text-white">{recoveryScore}%</span>
          </div>
        </div>
      </div>

      {/* Aura Top Recommendation */}
      <div className="col-span-1 bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-white/10 rounded-[32px] p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Aura Top Pick</span>
          </div>
          
          <h3 className="text-2xl font-display font-medium text-white mb-2 leading-tight">
            {topRec ? topRec.name : "Analyzing Biology..."}
          </h3>
          <p className="text-sm text-slate-300 line-clamp-2 mb-6">
            {topRec ? topRec.description : "Aura is computing the optimal macro profile for your current state."}
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Heavy leg workout today demands protein</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Recovery below average ({recoveryScore}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
