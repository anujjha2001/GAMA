'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { Award, Info } from 'lucide-react';

const sleepVsAlcoholData = [
  { day: 'Mon', sleep: 80, alcohol: 0 },
  { day: 'Tue', sleep: 78, alcohol: 0.5 },
  { day: 'Wed', sleep: 82, alcohol: 0.2 },
  { day: 'Thu', sleep: 79, alcohol: 0.8 },
  { day: 'Fri', sleep: 55, alcohol: 2.5 },
  { day: 'Sat', sleep: 58, alcohol: 3.2 },
  { day: 'Sun', sleep: 74, alcohol: 1.0 },
];

const fitnessForecastData = [
  { month: 'July', current: 72 },
  { month: 'August', current: 75 },
  { month: 'September', current: 80 },
  { month: 'October', current: 89.2 },
];

export function InsightsView() {
  return (
    <div className="flex flex-col gap-6 select-none text-[#f3f4f6]">

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Biological Age Snapshot Card */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="lg:col-span-4 bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Biometric Snapshot</span>
            <Award className="h-4.5 w-4.5 text-gray-400" />
          </div>

          {/* Content info */}
          <div className="space-y-1">
            <h3 className="text-md font-medium text-gray-300">Biological Age</h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white">28.4</span>
              <span className="text-xs text-gray-400 font-bold uppercase">years</span>
            </div>
            <p className="text-[10px] font-bold text-green-400 mt-1">
              -2.1 yrs vs last month
            </p>
          </div>

          {/* Central Sphere Graphic */}
          <div className="flex items-center justify-center py-6">
            <div className="h-28 w-28 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-inner relative">
              <div className="absolute inset-2.5 rounded-full bg-gradient-to-tr from-amber-500/20 to-red-500/20 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 shadow-lg shadow-red-500/20 blur-[1px]" />
              </div>
            </div>
          </div>

          {/* Bottom chronological stats */}
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-4 border-t border-white/5">
            <span>Chronological Age</span>
            <span className="text-white">32.0</span>
          </div>
        </motion.div>

        {/* Deep Sleep vs Alcohol Line Chart */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="lg:col-span-8 bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Correlation Finder</span>
              <h3 className="text-md font-medium text-white">Deep Sleep vs. Alcohol</h3>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Deep Sleep
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="h-2 w-2 rounded-full bg-white" /> Alcohol
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepVsAlcoholData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1c1d1f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', color: '#f3f4f6' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="sleep" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="alcohol" stroke="#ffffff" strokeDasharray="3 3" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insight text block */}
          <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                <span>78% Correlation</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Data suggests a critical threshold: <span className="font-bold text-white">&gt;2 units of alcohol</span> results in a <span className="font-bold text-white">42% decrease</span> in restorative REM cycles.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Card: Predictive Analytics Fitness Forecast */}
      <motion.div 
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 md:p-8 shadow-xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Predictive Analytics</span>
            <h3 className="text-md font-medium text-white">Fitness Forecast</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
              Based on current metabolic velocity and VO2 Max trajectory, we've modeled your potential for the next quarter.
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            +18% Improvement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          {/* Stats */}
          <div className="md:col-span-3 flex justify-between md:flex-col gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Score</span>
              <p className="text-3xl font-extrabold text-white">89.2</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Readiness</span>
              <p className="text-3xl font-extrabold text-white">Oct 12</p>
            </div>
          </div>

          {/* Fitness Chart */}
          <div className="md:col-span-9 h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitnessForecastData}>
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1c1d1f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', color: '#f3f4f6' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, stroke: '#f59e0b', fill: '#fff' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
