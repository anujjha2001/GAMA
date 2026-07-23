'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Sparkles, X, Plus, Check, Heart, Brain, Wind, Flame, Eye, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

export interface OrganData {
  id: string;
  name: string;
  system: string;
  score: number;
  status: 'OPTIMAL' | 'GOOD' | 'ATTENTION';
  vitals: { label: string; value: string }[];
  description: string;
  recommendation: string;
  position3D: [number, number, number];
}

interface OrganInspectorPanelProps {
  organ: OrganData | null;
  onClose: () => void;
  onRefreshData?: () => void;
}

export function OrganInspectorPanel({ organ, onClose, onRefreshData }: OrganInspectorPanelProps) {
  const [symptomInput, setSymptomInput] = useState('');
  const [severity, setSeverity] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'log'>('overview');

  if (!organ) return null;

  const getStatusColor = (status: string) => {
    if (status === 'OPTIMAL') return 'text-[#00f0ff] border-[#00f0ff]/40 bg-[#00f0ff]/10';
    if (status === 'GOOD') return 'text-[#34d399] border-[#34d399]/40 bg-[#34d399]/10';
    return 'text-[#ff2a85] border-[#ff2a85]/40 bg-[#ff2a85]/10';
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organId: organ.id,
          symptomName: symptomInput,
          severity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully logged telemetry for ${organ.name} to Database!`);
        setSymptomInput('');
        onRefreshData?.();
        setActiveTab('overview');
      } else {
        toast.error(data.error || 'Failed to persist to database.');
      }
    } catch (err) {
      toast.error('Network error saving biometrics.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[#09090b]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-50 text-white flex flex-col gap-5 overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#00f0ff]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#ff2a85]/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff2a85]/20 border border-white/20 flex items-center justify-center text-[#00f0ff]">
              {organ.id === 'brain' && <Brain className="w-6 h-6" />}
              {organ.id === 'heart' && <Heart className="w-6 h-6 text-[#ff2a85]" />}
              {organ.id === 'lungs' && <Wind className="w-6 h-6 text-[#38bdf8]" />}
              {organ.id === 'stomach' && <Flame className="w-6 h-6 text-[#f59e0b]" />}
              {organ.id !== 'brain' && organ.id !== 'heart' && organ.id !== 'lungs' && organ.id !== 'stomach' && (
                <Activity className="w-6 h-6 text-[#00f0ff]" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest uppercase text-neutral-400">
                {organ.system}
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{organ.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Status Ring */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="4" className="text-white/10" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={144}
                  strokeDashoffset={144 - (144 * organ.score) / 100}
                  strokeLinecap="round"
                  className={organ.score >= 90 ? 'text-[#00f0ff]' : organ.score >= 75 ? 'text-[#34d399]' : 'text-[#ff2a85]'}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">{organ.score}</span>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Subsystem Vitality</div>
              <div className="text-sm font-bold text-white">
                {organ.score >= 90 ? 'Peak Equilibrium' : organ.score >= 75 ? 'Optimal Function' : 'Needs Monitoring'}
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border uppercase ${getStatusColor(organ.status)}`}>
            {organ.status}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold relative z-10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#00f0ff] text-black font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Telemetry & Telepathy
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'log' ? 'bg-[#00f0ff] text-black font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Log Biometrics
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 relative z-10">
            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-2">
              {organ.vitals.map((v, i) => (
                <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{v.label}</span>
                  <span className="text-sm font-black text-[#00f0ff] mt-1">{v.value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block mb-1">Clinical Physiology</span>
              {organ.description}
            </div>

            {/* Recommendation */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#00f0ff]/10 to-transparent border border-[#00f0ff]/30 text-xs flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-[#00f0ff] block">AURA Twin Recommendation</span>
                <p className="text-neutral-200 mt-0.5 leading-relaxed">{organ.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quick Log Form */}
        {activeTab === 'log' && (
          <form onSubmit={handleLogSubmit} className="flex flex-col gap-3 relative z-10">
            <div className="text-xs text-neutral-300">
              Directly persist symptoms or micro-observations for <strong className="text-white">{organ.name}</strong> to your live health database.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Symptom or Log Entry</label>
              <input
                type="text"
                placeholder={`e.g. Mild ${organ.name} fatigue or pressure`}
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00f0ff]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <span>Severity Scale</span>
                <span className="text-[#00f0ff]">{severity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[#00f0ff] bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Syncing Database...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save to Live Database
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
