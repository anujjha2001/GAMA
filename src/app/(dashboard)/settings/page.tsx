'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Shield, RefreshCw, Trash2, Plus, Check, Save, HardDrive, BellRing, Heart, Radio
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const {
    memoryTags, addMemoryTag, removeMemoryTag,
    steps, sleepHours, hrv, stressLevel, heartRate,
    setSteps, setSleepHours, setHrv, setStressLevel, setHeartRate
  } = useHealthStore();

  const [newTagVal, setNewTagVal] = React.useState('');
  const [newTagCat, setNewTagCat] = React.useState<'preference' | 'medical' | 'dislike' | 'goal'>('preference');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAddTag = () => {
    if (!newTagVal.trim()) return;
    addMemoryTag(newTagCat, newTagVal.trim());
    toast.success(`Memory tag added to AURA's long-term memory`);
    setNewTagVal('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden bg-black/35 backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[160px] border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-violet-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Core Preferences & Sync
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Settings Portal</h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Configure AURA's neural pathways, synchronize biometric wearables, and review long-term health memories stored locally.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme & Profile Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 border border-white/10 space-y-6 hover:border-white/20 transition-all duration-300">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Theme Mode</h3>

            <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 border border-white/5 rounded-2xl">
              <button
                onClick={() => {
                  setTheme('light');
                  toast.success('Pure Zen light theme activated');
                }}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${theme === 'light'
                    ? 'bg-white/10 text-white shadow-md font-semibold'
                    : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-wider">Pure Zen</span>
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  toast.success('Deep Space Premium dark theme activated');
                }}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${theme === 'dark'
                    ? 'bg-white/10 text-white shadow-md font-semibold'
                    : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-wider">Deep Space</span>
              </button>
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
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
              <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>

            {/* Add Memory Form */}
            <div className="p-4 bg-white/5 rounded-[20px] border border-white/5 flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-1/3">
                <select
                  value={newTagCat}
                  onChange={(e: any) => setNewTagCat(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
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
                  className="flex-1 bg-white/5 border border-white/5 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-neutral-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                  }}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 bg-violet-500 hover:bg-violet-400 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
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
    </div>
  );
}
