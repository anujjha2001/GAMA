'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, MoreHorizontal, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';

// Sample data for Recharts matching the mockup active users style
const activeUsersData = [
  { name: 'Oct', users: 30 },
  { name: 'Mar', users: 52 },
  { name: 'Jul', users: 40 },
  { name: 'Aug', users: 60 },
];

const miniSalesData = [
  { value: 10 }, { value: 18 }, { value: 12 }, { value: 24 }, { value: 15 }, { value: 30 }
];

export function NexusView() {
  return (
    <div className="flex flex-col gap-6">

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* HERO COMPONENT CARD: OPTIMIZE YOUR METRICS (Colspan: 7) */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="lg:col-span-7 bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[36px] overflow-hidden flex flex-col justify-between min-h-[460px] p-8 shadow-xl relative"
        >
          {/* Floating Content Layer */}
          <div className="relative z-10 space-y-6">
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Popular Solution</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight max-w-[320px]">
              Optimize Your Metrics
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success('Optimizing flow started')}
              className="px-6 py-3 bg-white text-black font-semibold rounded-2xl text-sm shadow-xl hover:bg-white/90 transition-all cursor-pointer"
            >
              Start Now
            </motion.button>
          </div>

          {/* Portrait Background (Right-Aligned) */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] pointer-events-none select-none">
            {/* Visual fading gradient left to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#28292c]/90 via-[#28292c]/40 to-transparent z-10" />
            <img
              alt="Woman in track jacket"
              className="w-full h-full object-cover object-center opacity-85"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000"
            />
          </div>

          {/* Glass Overlaid Metrics Bar */}
          <div className="relative z-20 mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center justify-between gap-2 shadow-2xl">
            <div className="flex justify-between items-center w-full">
              <div className="text-center flex-1">
                <h4 className="text-xl md:text-2xl font-bold text-white">76k</h4>
                <span className="text-[10px] font-medium text-gray-400">Users</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center flex-1">
                <h4 className="text-xl md:text-2xl font-bold text-white">1.5m</h4>
                <span className="text-[10px] font-medium text-gray-400">Clicks</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center flex-1">
                <h4 className="text-xl md:text-2xl font-bold text-white">$3,6k</h4>
                <span className="text-[10px] font-medium text-gray-400">Sales</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center flex-1">
                <h4 className="text-xl md:text-2xl font-bold text-white">47</h4>
                <span className="text-[10px] font-medium text-gray-400">Items</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black border border-white/10 flex items-center justify-center text-white cursor-pointer ml-2"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN CARDS (Colspan: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* CARD 1: ACTIVE USERS NOW */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col justify-between h-[218px]"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Real-time status</span>
                <h3 className="text-md font-medium text-white flex items-center gap-1.5">
                  Active Users right now
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                </h3>
              </div>
              <div className="px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-amber-500">
                50
              </div>
            </div>

            {/* Smooth Area Chart */}
            <div className="w-full h-24 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeUsersData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1c1d1f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* CARD 2: LATEST SALES */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 shadow-xl flex justify-between items-center h-[218px] relative overflow-hidden"
          >
            <div className="flex flex-col justify-between h-full z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Latest Sales</span>

                {/* Micro Sparkline */}
                <div className="w-20 h-6 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniSalesData}>
                      <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1 mt-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white"> 589 INR</span>
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">+ 6%</span>
                </div>
                <span className="text-[10px] text-gray-400">Your total earnings</span>
              </div>
            </div>

            {/* 3D Backpack Preview Card */}
            <div className="w-[140px] h-[140px] bg-black/40 border border-white/10 rounded-2xl flex flex-col justify-between p-3 relative overflow-hidden group shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=300')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="relative z-10 text-[9px] uppercase tracking-wider text-gray-400 text-right">Preview</div>
              <div className="relative z-10">
                <h5 className="text-[10px] font-bold text-white leading-tight">Synthetics backpack</h5>
                <span className="text-[8px] text-gray-400">Premium design</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

      {/* BOTTOM SECTION: TOP CONTENT / VIDEOS */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 md:p-8 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-medium text-white">Your top videos in this period</h3>

          <button
            onClick={() => toast.info('Sorting filter changed')}
            className="flex items-center gap-1.5 px-4 py-2 bg-black/35 hover:bg-black/50 border border-white/5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-all"
          >
            Popularity
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="pb-3">Video</th>
                <th className="pb-3 text-center">Views</th>
                <th className="pb-3 text-center">Average view duration</th>
                <th className="pb-3 text-center">Activity</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {/* Row 1 */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 flex items-center gap-4">
                  <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 bg-slate-900 flex-shrink-0">
                    <img
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white leading-tight">Build An Amazing Back Workout</h4>
                    <span className="text-[10px] text-gray-400">Sport Series</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-white">18.3k</span>
                    <span className="text-xs text-gray-400">views</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-bold text-white">13:31</span>
                    <span className="text-xs text-gray-400">(17.54%)</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="w-24 h-8 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ v: 10 }, { v: 15 }, { v: 8 }, { v: 25 }, { v: 18 }, { v: 30 }]}>
                        <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => toast.success('Actions opened')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 flex items-center gap-4">
                  <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 bg-slate-900 flex-shrink-0">
                    <img
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white leading-tight">How to Train the Muscles at Home</h4>
                    <span className="text-[10px] text-gray-400">Sport Series</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-white">16.3k</span>
                    <span className="text-xs text-gray-400">views</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-bold text-white">17:34</span>
                    <span className="text-xs text-gray-400">(38.54%)</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="w-24 h-8 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ v: 20 }, { v: 12 }, { v: 18 }, { v: 14 }, { v: 25 }, { v: 22 }]}>
                        <Area type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={1.5} fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => toast.success('Actions opened')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </motion.div>

    </div>
  );
}
