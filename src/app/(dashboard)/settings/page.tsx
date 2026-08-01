'use client';

import * as React from 'react';
import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Moon, Shield, RefreshCw, Trash2, Plus, Check, Save, HardDrive, BellRing, Heart, Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardAppearancePanel } from '@/components/settings/DashboardAppearancePanel';

export default function SettingsPage() {
  const [mounted, setMounted] = React.useState(false);
  const {
    memoryTags, addMemoryTag, removeMemoryTag,
    steps, sleepHours, hrv, stressLevel, heartRate,
    setSteps, setSleepHours, setHrv, setStressLevel, setHeartRate
  } = useHealthStore();

  const [newTagVal, setNewTagVal] = React.useState('');
  const [newTagCat, setNewTagCat] = React.useState<'preference' | 'medical' | 'dislike' | 'goal'>('preference');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  const handleAddTag = () => {
    if (!newTagVal.trim()) return;
    addMemoryTag(newTagCat, newTagVal.trim());
    toast.success(`Memory tag added to AURA's long-term memory`);
    setNewTagVal('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 }
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-12 pb-32 w-full relative min-h-screen font-sans text-[#eae3dc]">
      {/* Premium Immersive Background */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#070709]">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full flex flex-col gap-12 z-10">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="relative pt-16 pb-8 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="px-3 py-1 text-[10px] font-black tracking-widest bg-white/5 text-neutral-400 border border-white/10 uppercase rounded-full mb-4">
            Core Preferences & Sync
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-none">
            Settings Portal
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            Configure AURA's neural pathways, synchronize biometric wearables, and review long-term health memories stored locally.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full relative px-4 lg:px-8 flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme & Profile Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 border border-white/10 space-y-6 hover:border-white/20 transition-all duration-300">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Theme Mode</h3>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Deep Space Dark Mode</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Exclusive, optimized ambient interface theme.</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Wearable Simulation</h3>
              <p className="text-[10px] text-neutral-400">
                Simulate active wearable updates by adjusting metrics below. Updates will trigger AURA's real-time proactive context analysis.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Steps</span>
                    <span className="font-semibold">{steps.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="30000"
                    step="500"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Sleep Hours</span>
                    <span className="font-semibold">{sleepHours} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.25"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">HRV (ms)</span>
                    <span className="font-semibold">{hrv} ms</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    step="2"
                    value={hrv}
                    onChange={(e) => setHrv(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">Stress Level</span>
                    <span className="font-semibold">{stressLevel} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long-Term Memory Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 border border-white/10 space-y-6 hover:border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">AURA Long-Term Health Memory</h3>
                <p className="text-[10px] text-neutral-400">
                  Persistent facts, Every meal choices, preferences, and conditions AURA cross-references during conversations.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>

            {/* Add Memory Form */}
            <div className="p-4 bg-white/5 rounded-[20px] border border-white/5 flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-1/3">
                <select
                  value={newTagCat}
                  onChange={(e: any) => setNewTagCat(e.target.value)}
                  className="w-full bg-grey/5 border border-grey/5 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="preference">Preference</option>
                  <option value="medical">Medical Condition</option>
                  <option value="dislike">Dislike</option>
                  <option value="goal">Goal</option>
                </select>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Loves mungfali, gluten intolerant..."
                  value={newTagVal}
                  onChange={(e) => setNewTagVal(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/5 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-white placeholder-neutral-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 bg-white text-black font-semibold hover:bg-neutral-200 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of memories */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <AnimatePresence>
                {memoryTags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${tag.category === 'medical'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : tag.category === 'preference'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : tag.category === 'dislike'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                        {tag.category}
                      </span>
                      <span className="text-xs font-medium text-neutral-300">{tag.value}</span>
                    </div>

                    <button
                      onClick={() => {
                        removeMemoryTag(tag.id);
                        toast.error(`Memory tag deleted`);
                      }}
                      className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {memoryTags.length === 0 && (
                <div className="text-center py-8 text-xs text-neutral-500">
                  No memory tags recorded. Add tags above to initialize AURA's contextual memory database.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Background Personalization Panel */}
      <DashboardAppearancePanel />
        </motion.div>
      </motion.div>
    </div>
  );
}
