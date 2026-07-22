'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Wind, Droplets, Activity, Calendar, Moon, Watch, Bell, Zap,
  Sun, ShieldAlert, Sliders, Eye, Undo, Play, ChevronRight, Thermometer, Info, Scale,
  Volume2, Maximize2, Sparkles, Clock, Compass, Trophy, Plus, ChevronDown, Check, Apple
} from 'lucide-react';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';

export default function DigitalTwinPage() {
  const { steps, sleepHours, hrv, stressLevel, heartRate } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const [userName, setUserName] = React.useState('anuj');

  // Selected Health World state
  const [healthWorld, setHealthWorld] = React.useState<'thriving' | 'balanced' | 'struggling' | 'critical'>('thriving');

  React.useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem('gama_user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-[#00f0ff] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070709] text-[#eae3dc] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans">
      
      {/* Background cinematic warm/dark glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0a84ff]/5 blur-[150px] pointer-events-none" />

      {/* Header Portal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 z-10">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Body Twin</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Your AI-powered Living Reflection
          </p>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success('Audio feedback enabled')} 
            className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full hover:scale-105 transition-all text-neutral-300 hover:text-white cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => toast.success('Fullscreen mode')} 
            className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full hover:scale-105 transition-all text-neutral-300 hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 z-10 mb-6">

        {/* LEFT RAIL: Environment, Time of Day, Recovery Impact */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          
          {/* Environment Card */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg flex-1 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Environment</span>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-400">Atmosphere</span>
                <span className="text-xs font-black text-white flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-500" /> Sunny</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-neutral-400">Temperature</span>
                <span className="text-2xl font-black text-white">28°C</span>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>AQI 42 • Good</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1" />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Humidity 48%</span>
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] mt-1" />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Wind 10 km/h</span>
                  <span className="w-2 h-2 rounded-full bg-neutral-500 mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Time of Day Card */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg flex-1 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Time of Day</span>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-400">Status</span>
                <span className="text-xs font-black text-white">Golden Hour</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">6:42 PM</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Sunset 7:12 PM</span>
              </div>
            </div>
          </div>

          {/* Recovery Impact Card */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg flex-1 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Recovery Impact</span>
            
            <div className="flex items-center gap-6 mt-4">
              {/* Radial gauge mock */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="26" stroke="#00f0ff" strokeWidth="4" fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - 0.82)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-white">82</span>
                  <span className="text-[8px] text-neutral-500 uppercase font-black">Score</span>
                </div>
              </div>

              {/* Stats breakdown */}
              <div className="flex-1 space-y-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wide">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Sleep</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" /> Activity</span>
                  <span className="text-white">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#0a84ff]" /> Nutrition</span>
                  <span className="text-white">80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Stress</span>
                  <span className="text-white">72%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Hydration</span>
                  <span className="text-white">65%</span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-neutral-500 leading-relaxed mt-4 pt-3 border-t border-white/5">
              💡 Pro Tip: Improve hydration to boost your recovery score.
            </p>
          </div>

        </div>

        {/* CENTER PANEL: Warm Wood Scene with Boy on Swing */}
        <div className="lg:col-span-5 rounded-[40px] border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[560px] bg-black">
          
          {/* Main Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-85 z-0 pointer-events-none"
            style={{ backgroundImage: "url('/dashboard-bg-clean.png')" }}
          />

          {/* Top Overlay: Current Mood */}
          <div className="p-4 z-10 flex justify-center mt-4">
            <div className="px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-2 text-center text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Current Mood:</span>
              <span className="text-neutral-300">Calm • Positive</span>
              <span className="text-neutral-500 text-[9px] font-medium ml-2">Tap the world to interact 🖐️</span>
            </div>
          </div>

          {/* Bottom Selector Area */}
          <div className="p-6 bg-gradient-to-t from-black via-black/65 to-transparent z-10 flex flex-col gap-4">
            
            {/* Title & Selection */}
            <div>
              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Your Health World</span>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { key: 'thriving', label: 'Thriving', range: '76-100', img: '/dashboard-bg-clean.png' },
                  { key: 'balanced', label: 'Balanced', range: '51-75', img: '/dashboard-bg-clean.png' },
                  { key: 'struggling', label: 'Struggling', range: '26-50', img: '/dashboard-bg-clean.png' },
                  { key: 'critical', label: 'Critical', range: '0-25', img: '/dashboard-bg-clean.png' }
                ].map((world) => (
                  <button
                    key={world.key}
                    onClick={() => {
                      setHealthWorld(world.key as any);
                      toast.success(`Health environment shifted to ${world.label}`);
                    }}
                    className={`relative p-2.5 rounded-2xl overflow-hidden border text-left cursor-pointer transition-all ${healthWorld === world.key
                      ? 'border-[#00f0ff] bg-black/60 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'border-white/5 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    {/* Small preview block */}
                    <div 
                      className="h-8 rounded-lg bg-cover bg-center mb-1.5 opacity-50"
                      style={{ backgroundImage: `url('${world.img}')` }}
                    />
                    <div className="text-[9px] font-black text-white">{world.label}</div>
                    <div className="text-[8px] text-neutral-500 font-bold">{world.range}</div>
                    {healthWorld === world.key && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-[#00f0ff] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Customize World Button */}
            <button 
              onClick={() => toast.info('Customizing health environment assets...')}
              className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-[#eae3dc] rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer hover:bg-white/10"
            >
              Customize World
            </button>

          </div>

        </div>

        {/* RIGHT RAIL: Recovery Score, AURA Insight, Live Health Sync, AURA Coach, Interact & Improve */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          
          {/* Recovery Score & Trend */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Recovery Score</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white tracking-tight">82<span className="text-sm text-neutral-500">/100</span></span>
                  <span className="text-[10px] font-black uppercase text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-md">Good</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block">Trend (24h)</span>
                <span className="text-xs font-black text-[#00f0ff] mt-2 block">+12 Improving 📈</span>
              </div>
            </div>

            {/* AURA Insight */}
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-2.5">
              <div className="w-7 h-7 bg-[#0a84ff]/10 border border-[#0a84ff]/20 text-[#00f0ff] rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">AURA Insight</h4>
                <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                  Your body is recovering well. Keep your momentum going!
                </p>
                <button 
                  onClick={() => toast.info('Loading deep biological reports...')}
                  className="text-[9px] font-black text-[#00f0ff] uppercase tracking-wider flex items-center gap-0.5 mt-2 cursor-pointer"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Health Sync */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Live Health Sync</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0a84ff]/10 border border-[#0a84ff]/20 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] text-black font-semibold animate-pulse" />
                <span className="text-[8px] font-black text-[#00f0ff] uppercase tracking-wide">Sync active</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Heart Rate', value: '64 bpm', icon: Heart, color: 'text-rose-500' },
                { label: 'Stress Level', value: 'Low', icon: Zap, color: 'text-yellow-500' },
                { label: 'Energy Level', value: '78%', icon: Activity, color: 'text-[#00f0ff]' },
                { label: 'Sleep Quality', value: '85%', icon: Moon, color: 'text-purple-500' },
                { label: 'Hydration', value: '65%', icon: Droplets, color: 'text-sky-500' },
                { label: 'Steps Today', value: '7,842', icon: Trophy, color: 'text-[#0a84ff]' }
              ].map((metric, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 text-xs font-bold text-neutral-400">
                  <span className="flex items-center gap-2"><metric.icon className={`w-3.5 h-3.5 ${metric.color}`} /> {metric.label}</span>
                  <span className="text-white font-extrabold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AURA Coach & Interact */}
          <div className="rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg space-y-4">
            
            {/* AURA Coach */}
            <div className="flex items-start gap-3">
              {/* Profile/avatar mock */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0a84ff] flex items-center justify-center shrink-0 border border-white/10 shadow shadow-[#00f0ff]/30">
                <span className="text-xs font-black text-black">AI</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex-1">
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">AURA Coach</h4>
                <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                  Great job staying active! Consider a high-protein dinner to boost recovery.
                </p>
              </div>
            </div>

            {/* Interact & Improve */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Interact & Improve</span>
              <div className="space-y-2 mt-2">
                {[
                  { label: 'Breathing Exercise', duration: '5 min' },
                  { label: 'Guided Meditation', duration: '10 min' },
                  { label: 'Quick Recovery Boost', duration: '15 min' }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => toast.success(`Starting ${act.label}...`)}
                    className="w-full flex justify-between items-center p-2.5 bg-[#141416]/50 border border-white/5 hover:border-white/10 hover:bg-[#141416] rounded-xl text-left cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold text-neutral-300">{act.label}</span>
                    <span className="text-[9px] font-black uppercase text-[#00f0ff] bg-[#0a84ff]/10 px-2 py-0.5 rounded">{act.duration}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM LAYOUT: Timeline & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10">
        
        {/* Today's Journey Timeline */}
        <div className="lg:col-span-9 rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg">
          <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider">Today's Journey</span>
          
          {/* Horizontal Timeline */}
          <div className="relative flex justify-between items-center mt-6 px-4">
            
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-white/10 z-0" />
            
            {[
              { label: 'Workout', time: '8:00 AM', active: true, icon: Activity },
              { label: 'Meal', time: '12:30 PM', active: false, icon: Apple },
              { label: 'Rest', time: '3:00 PM', active: false, icon: Moon },
              { label: 'Meditate', time: '8:30 PM', active: false, icon: Brain },
              { label: 'Sleep', time: '10:30 PM', active: false, icon: Clock }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${step.active
                  ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  : 'bg-black border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black text-white block">{step.label}</span>
                  <span className="text-[9px] text-neutral-500 font-bold">{step.time}</span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Next Milestone */}
        <div className="lg:col-span-3 rounded-3xl bg-[#09090b]/80 border border-white/5 p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Next Milestone</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-bold">Achieve 90+ Recovery</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
