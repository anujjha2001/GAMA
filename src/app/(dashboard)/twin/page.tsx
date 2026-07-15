'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useHealthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Heart, Brain, Wind, Droplets, Dna, Activity, Calendar, Moon, Watch, Search, Bell, AlertTriangle, ArrowRight, Zap
} from 'lucide-react';
import { BodyHologram } from '@/components/twin/BodyHologram';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DigitalTwinPage() {
  const [mounted, setMounted] = React.useState(false);
  const [activeSystemId, setActiveSystemId] = React.useState('nervous');
  const { steps, sleepHours, hrv, stressLevel, heartRate, user } = useHealthStore();

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Mock data for charts
  const nutritionData = [
    { name: 'Protein', value: 30, color: '#3b82f6' },
    { name: 'Fats', value: 20, color: '#a855f7' },
    { name: 'Fiber', value: 15, color: '#f59e0b' },
    { name: 'Carbs', value: 35, color: '#06b6d4' }
  ];

  const activityData = [
    { day: 'Mon', steps: 4000 },
    { day: 'Tue', steps: 6000 },
    { day: 'Wed', steps: 5500 },
    { day: 'Thu', steps: 8000 },
    { day: 'Fri', steps: 4500 },
    { day: 'Sat', steps: 9000 },
    { day: 'Sun', steps: 5000 }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] w-full max-w-[1600px] mx-auto text-white">

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">Good Evenning, {user?.name || 'AURA User'} <span className="text-xl"></span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Anything..."
              className="bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <button className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

        {/* COLUMN 1: Health Analytics (Span 3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Health<br />Analytics</h2>
            <div className="px-3 py-1 bg-black/40 border border-white/10 rounded-full flex items-center gap-2 text-xs text-neutral-400">
              <Calendar className="w-3 h-3" /> Today, 20 May
            </div>
          </div>

          {/* Vital Signs Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-300">Vital Signs</h3>
              <button className="text-xs text-cyan-400 hover:text-cyan-300">View All</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Heart Rate */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between aspect-square hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center mb-2 text-violet-400">
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{heartRate}</span>
                    <span className="text-[10px] text-neutral-400 mb-1">bpm</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Heart Rate</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between aspect-square hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2 text-cyan-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">120/80</span>
                    <span className="text-[10px] text-neutral-400 mb-1">mmHg</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Blood Pressure</span>
                </div>
              </div>

              {/* Blood Oxygen */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between aspect-square hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">98%</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Blood Oxygen</span>
                </div>
              </div>

              {/* Resting Heart Rate */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between aspect-square hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 text-amber-400">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">60</span>
                    <span className="text-[10px] text-neutral-400 mb-1">BPM</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Resting Heart Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Insight */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex-1 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full" />
            <h3 className="text-sm font-semibold text-neutral-300 mb-4">Nutrition Insight</h3>

            <div className="flex items-center gap-6 mb-4">
              <div className="w-24 h-24 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutritionData}
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {nutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold">1800</span>
                  <span className="text-[8px] text-neutral-400">Kcal</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <span className="text-[10px] text-neutral-400 block mb-1">Calories Consumed Today</span>
                {nutritionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-300">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-auto w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium flex items-center justify-between transition-colors border border-white/5">
              View Full Nutrition <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COLUMN 2: Body Overview (Span 5) */}
        <div className="lg:col-span-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] relative overflow-hidden flex flex-col min-h-[600px]">

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

          {/* Header */}
          <div className="p-6 flex items-start justify-between absolute top-0 left-0 right-0 z-10">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">Body Overview <Activity className="w-4 h-4 text-cyan-500" /></h2>
              <p className="text-[10px] text-neutral-400">Real-time Health Scan</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-cyan-400">Live</span>
              <span className="text-[10px] text-neutral-400">All System Normal</span>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 relative w-full h-full">

            {/* Floating Buttons Around the Body */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              {/* Left Side Buttons */}
              <div className="absolute left-6 top-1/3 space-y-12">
                <button onClick={() => setActiveSystemId('cardiovascular')} className={`pointer-events-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${activeSystemId === 'cardiovascular' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'}`}>
                  <Heart className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveSystemId('respiratory')} className={`pointer-events-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${activeSystemId === 'respiratory' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'}`}>
                  <Wind className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveSystemId('metabolic')} className={`pointer-events-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${activeSystemId === 'metabolic' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'}`}>
                  <Droplets className="w-4 h-4" />
                </button>
              </div>

              {/* Right Side Buttons */}
              <div className="absolute right-6 top-1/4 space-y-16">
                <button onClick={() => setActiveSystemId('nervous')} className={`pointer-events-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${activeSystemId === 'nervous' ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'}`}>
                  <Brain className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveSystemId('musculoskeletal')} className={`pointer-events-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${activeSystemId === 'musculoskeletal' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-black/50 border-white/10 text-neutral-400 hover:text-white'}`}>
                  <Dna className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Canvas
              camera={{ position: [0, 0, 4.5], fov: 45 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} color="#d26907ff" />
              <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#000000ff" />

              <BodyHologram
                activeSystem={activeSystemId}
                stressLevel={stressLevel}
                heartRate={heartRate}
                hrv={hrv}
                showPedestal={true}
              />

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.2}
                maxPolarAngle={Math.PI / 1.8}
              />
            </Canvas>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <span className="text-[10px] text-neutral-500 tracking-widest font-mono">LAST SCAN : TODAY, 8:30 PM</span>
          </div>
        </div>

        {/* COLUMN 3: Right Activities (Span 4) */}
        <div className="lg:col-span-4 space-y-5 flex flex-col">

          {/* Profile Card */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full overflow-hidden p-0.5">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold">{user?.name || 'AURA User'}</h3>
                <p className="text-[10px] text-neutral-400">Male • 23 Years</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
            </div>
          </div>

          {/* Upcoming Appointment / AURA Analysis */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-5">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold mb-4">
              <Zap className="w-4 h-4 text-cyan-400" /> AURA Intelligence
            </div>
            <h4 className="text-sm font-bold mb-1">Cardiology Consultation</h4>
            <p className="text-[10px] text-neutral-400 mb-4">Jun 20, 2026 • 12:00 PM</p>
            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center justify-between border border-white/5 transition-colors">
              Schedule Follow-up <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Recent Activities (Steps Chart) */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recent Activities
              </h3>
              <span className="text-xs font-bold text-cyan-400">{steps.toLocaleString()} Steps</span>
            </div>

            <div className="h-28 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="steps" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={8}>
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#06b6d4' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} dy={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Analysis */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Moon className="w-4 h-4" /> Sleep
              </h3>
              <span className="text-xs font-bold">{sleepHours}h 30m</span>
            </div>

            {/* Stacked bar visual */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-4">
              <div className="h-full bg-indigo-500" style={{ width: '35%' }} />
              <div className="h-full bg-cyan-400" style={{ width: '45%' }} />
              <div className="h-full bg-amber-400" style={{ width: '20%' }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> <span className="text-neutral-400">Deep Sleep</span></div>
                <span className="font-medium">2h 15min</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> <span className="text-neutral-400">Light Sleep</span></div>
                <span className="font-medium">4h 45min</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> <span className="text-neutral-400">REM Sleep</span></div>
                <span className="font-medium">1h 30min</span>
              </div>
            </div>
          </div>

          {/* Emergency Services */}
          <div className="bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border border-violet-500/30 rounded-3xl p-5 mt-auto flex flex-col justify-between relative overflow-hidden group hover:border-violet-400/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/20 blur-2xl rounded-full" />
            <div>
              <h3 className="text-base font-bold mb-1 flex items-center gap-2">Emergency Services <AlertTriangle className="w-4 h-4 text-rose-400" /></h3>
              <p className="text-[10px] text-violet-200">We're here for you 24/7</p>
            </div>
            <button className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-white/10">
              Contact Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
