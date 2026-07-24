'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Moon, Heart, Search, Edit2, Plus, Calendar, ChevronRight,
  Flame, Zap, Award, Mic, MicOff, Camera, RefreshCw, Send, Check, X, ShieldAlert, TrendingUp, Play, ActivitySquare, HeartPulse, BrainCircuit
} from 'lucide-react';
import { AuraChatPanel } from '@/components/aura/AuraChatPanel';
import { Message, useAura } from '@/hooks/useAura';
import {
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';

import { HealthPipeline } from '@/lib/health-engine/orchestrator/health-pipeline';
import { BaselineEngine } from '@/lib/health-engine/core/baseline';
import { AppleProvider } from '@/lib/health-engine/providers/apple';
import { GarminProvider } from '@/lib/health-engine/providers/garmin';
import { FitbitProvider } from '@/lib/health-engine/providers/fitbit';
import { OuraProvider } from '@/lib/health-engine/providers/oura';
import { ManualProvider } from '@/lib/health-engine/providers/manual';
import { MockProvider } from '@/lib/health-engine/providers/mock';

export function DashboardView() {
  // --- Persistent Interactive States ---
  const [mounted, setMounted] = React.useState(false);
  const [explainMetric, setExplainMetric] = React.useState<string | null>(null);
  const [isManualInputOpen, setIsManualInputOpen] = React.useState(false);


  const {
    steps, setSteps,
    sleepHours, setSleepHours,
    hrv, setHrv,
    stressLevel, setStressLevel,
    heartRate, setHeartRate,
    provider, setProvider,
    simulatedHour, setSimulatedHour,
    manualInputs, setManualInputs,
    memoryTags
  } = useHealthStore();

  // AURA Chat & Interface States
  const { messages, setMessages: setChatHistory, input, setInput, handleSubmit, isLoading } = useAura();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);

  // Vision & Camera Upload States
  const [isScanning, setIsScanning] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [detectedMeal, setDetectedMeal] = React.useState<{
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl: string;
  } | null>(null);

  // Proactive State (Prevents spamming the recovery warning toast)
  const [hasTriggeredRecoveryWarning, setHasTriggeredRecoveryWarning] = React.useState(false);

  // --- Web Speech API Refs ---
  const recognitionRef = React.useRef<any>(null);

  // --- Load Initial State from LocalStorage ---
  React.useEffect(() => {
    setMounted(true);
    try {
      const savedSteps = localStorage.getItem('gama_steps');
      const savedSleep = localStorage.getItem('gama_sleepHours');
      const savedHrv = localStorage.getItem('gama_hrv');
      const savedStress = localStorage.getItem('gama_stressLevel');

      if (savedSteps) setSteps(parseInt(savedSteps));
      if (savedSleep) setSleepHours(parseFloat(savedSleep));
      if (savedHrv) setHrv(parseInt(savedHrv));
      if (savedStress) setStressLevel(parseFloat(savedStress));
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }, []);

  // --- Save State changes to LocalStorage ---
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('gama_steps', steps.toString());
      localStorage.setItem('gama_sleepHours', sleepHours.toString());
      localStorage.setItem('gama_hrv', hrv.toString());
      localStorage.setItem('gama_stressLevel', stressLevel.toString());
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [steps, sleepHours, hrv, stressLevel, mounted]);

  // --- Health Intelligence Engine Run ---
  const getRawData = () => {
    switch (provider) {
      case 'apple': return AppleProvider.getHealthData();
      case 'garmin': return GarminProvider.getHealthData();
      case 'fitbit': return FitbitProvider.getHealthData();
      case 'oura': return OuraProvider.getHealthData();
      case 'manual': return ManualProvider.getHealthData(manualInputs);
      case 'mock':
      default: {
        const baseMock = MockProvider.getHealthData(simulatedHour);
        return {
          ...baseMock,
          steps,
          sleepHours,
          hrv,
          currentHeartRate: heartRate,
        };
      }
    }
  };

  const rawData = getRawData();
  const baseline = BaselineEngine.getBaseline();
  const pipelineState = HealthPipeline.run(rawData, baseline);
  const wellnessScore = pipelineState.metrics.wellness.rawScore;

  // --- Proactive AURA Trigger ---
  React.useEffect(() => {
    if (!mounted) return;
    if (wellnessScore < 70 && !hasTriggeredRecoveryWarning) {
      setHasTriggeredRecoveryWarning(true);
      toast.custom((t) => (
        <div className="aura-overlay backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-[0_8px_32px_rgba(10, 132, 255,0.15)] flex flex-col gap-3 text-white max-w-sm">
          <div className="flex items-center gap-2 text-neutral-300">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">AURA Proactive Alert</span>
          </div>
          <p className="text-xs text-neutral-200 leading-normal">
            Your recovery metrics are low today, {(() => {
              if (typeof window !== 'undefined') {
                const storedName = localStorage.getItem('gama_user_name');
                if (storedName) return storedName.split(' ')[0];
              }
              return 'Alvie';
            })()}. I've adjusted your training plan to a light stretch to optimize your heart rate variability.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                setIsChatOpen(true);
                handleSubmit("Show me the adjusted light stretch workout plan");
              }}
              className="px-3.5 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              See Plan
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    } else if (wellnessScore >= 70 && hasTriggeredRecoveryWarning) {
      setHasTriggeredRecoveryWarning(false);
    }
  }, [wellnessScore, hasTriggeredRecoveryWarning, mounted]);

  const sleepData = [
    { name: 'Deep', val: parseFloat((sleepHours * 0.25).toFixed(2)) },
    { name: 'Core', val: parseFloat((sleepHours * 0.50).toFixed(2)) },
    { name: 'REM', val: parseFloat((sleepHours * 0.15).toFixed(2)) },
    { name: 'Awake', val: parseFloat((sleepHours * 0.10).toFixed(2)) }
  ];

  const startSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechGen = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechGen) {
        toast.error("Web Speech API is not supported on this browser.");
        setIsListening(false);
        return;
      }

      const rec = new SpeechGen();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        toast.info("AURA is listening...");
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        setIsChatOpen(true);
        handleSubmit(text);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      startSpeechRecognition();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsChatOpen(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const response = await fetch('/api/aura', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64String,
            dashboardState: { steps, sleepHours, hrv, stressLevel, wellnessScore }
          })
        });

        const data = await response.json();
        setIsScanning(false);

        if (data.success && data.visionPayload) {
          setDetectedMeal(data.visionPayload);
          setShowConfirmModal(true);
        } else {
          toast.error("Scanning failed. AURA couldn't identify the image.");
        }
      } catch (err) {
        setIsScanning(false);
        toast.error("Error communicating with Vision Engine.");
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmLogMeal = () => {
    if (!detectedMeal) return;

    setSteps(prev => prev + 1500);
    setHeartRate(prev => Math.min(85, prev + 2));

    toast.success(`Logged ${detectedMeal.mealName}! Metrics refreshed.`);
    setShowConfirmModal(false);
    setDetectedMeal(null);
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen text-white font-sans pb-12 select-none relative">

      {/* Immersive layered background effects inspired by Dribbble Reference */}
      <div className="absolute inset-0 bg-[#070709] z-0 overflow-hidden pointer-events-none">
        {/* Soft ambient lighting */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        {/* Subtle vignette layer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(7,7,9,0.85)_100%)]" />
      </div>

      {/* --- VISION SCANNING OVERLAY --- */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-3xl z-50 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_var(--brand-glow)] bg-neutral-950/80 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/15 to-transparent w-full h-[30%] animate-[bounce_2s_infinite]" />
            <RefreshCw className="w-16 h-16 text-white animate-spin" />
          </div>
          <h3 className="mt-8 text-lg font-bold tracking-widest uppercase text-white">AURA Scanner Active</h3>
          <p className="mt-2 text-xs text-neutral-300 uppercase tracking-wider animate-pulse">Deconstructive Meal Recognition in progress...</p>
        </div>
      )}

      {/* --- MULTIMODAL CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirmModal && detectedMeal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0f0f13]/90 border border-white/10 rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h4 className="font-extrabold text-white text-sm tracking-wider uppercase">Verify Meal Scan</h4>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDetectedMeal(null);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-6 space-y-4">
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/10 relative">
                  <img
                    src={detectedMeal.imageUrl}
                    alt={detectedMeal.mealName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-sm font-semibold text-white tracking-wide">{detectedMeal.mealName}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Calories</span>
                    <span className="text-sm font-extrabold text-neutral-300">{detectedMeal.calories}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Protein</span>
                    <span className="text-sm font-extrabold text-white">{detectedMeal.protein}g</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Carbs</span>
                    <span className="text-sm font-extrabold text-white">{detectedMeal.carbs}g</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Fat</span>
                    <span className="text-sm font-extrabold text-white">{detectedMeal.fat}g</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmLogMeal}
                  className="flex-1 py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Yes, Log Meal
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDetectedMeal(null);
                  }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer text-white flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Panel Wrapper */}
      <div className="relative w-full rounded-[40px] border border-white/5 overflow-hidden z-10 bg-[#09090b]/80 backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.8)]">

        {/* Dashboard Hero Background - HD Motion Vision (No blur) */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center opacity-75 pointer-events-none z-0"
          style={{ backgroundImage: 'url("/dashboard-hero-clean.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b] via-[#09090b]/85 to-transparent pointer-events-none z-0" />

        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 bg-[#09090b]/40 pointer-events-none z-0" />

        {/* Ambient Gradient Highlights */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-0" />

        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-10 flex flex-col gap-8">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 relative z-10">
            {/* AURA Interactive Input Bar */}
            <div className="flex-1 flex flex-col items-start max-w-2xl text-left">
              <span className="text-[10px] font-black tracking-widest uppercase text-white mb-1">Health Operating System</span>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                AURA

              </h2>

              <div className="mt-3 w-full flex items-center justify-between bg-black/40 border border-white/5 hover:border-white/10 focus-within:border-white/20/40 rounded-2xl px-5 py-3 transition-all duration-300 shadow-inner">
                <input
                  type="text"
                  id="aura-dashboard-ask-input"
                  name="aura-dashboard-ask-input"
                  placeholder="Ask me to analyze stress, workouts, or recovery..."
                  value={input}
                  onFocus={() => setIsChatOpen(true)}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsChatOpen(true);
                      handleSubmit();
                    }
                  }}
                  className="w-full bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                />

                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                  <label className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all flex items-center justify-center text-neutral-300 hover:text-white shadow">
                    <input
                      type="file"
                      id="aura-dashboard-camera-input"
                      name="aura-dashboard-camera-input"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-4 h-4" />
                  </label>

                  <button
                    onClick={handleVoiceToggle}
                    className={`p-2 border rounded-xl transition-all flex items-center justify-center cursor-pointer shadow ${isListening
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-white/5 text-neutral-300 hover:text-white hover:border-white/10'
                      }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsChatOpen(true);
                      handleSubmit();
                    }}
                    className="p-1 bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl cursor-pointer transition-all w-8 h-8 flex items-center justify-center overflow-hidden border border-white/10 hover:scale-105"
                  >
                    <img src="/logo.jpg?v=2" alt="Send" className="w-full h-full object-cover rounded-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Top Right User Profile controls */}
            <div className="flex items-center gap-4 self-end lg:self-center bg-black/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5 shadow-lg">
              <button
                onClick={() => {
                  setSteps(19840);
                  setSleepHours(7.75);
                  setHrv(80);
                  setStressLevel(2.7);
                  toast.success("Metrics reset to baseline values.");
                }}
                title="Reset Metrics to Default"
                className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer shadow"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow"
                />
                <div className="text-left">
                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    {(() => {
                      if (typeof window !== 'undefined') {
                        const storedName = localStorage.getItem('gama_user_name');
                        if (storedName) return storedName;
                      }
                      return 'Alvie Wahed';
                    })()}
                  </h4>
                  <span className="text-[10px] text-neutral-400 block tracking-wider uppercase font-bold">User Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- AURA GLASSMORPHIC CHAT PANEL --- */}
          <AuraChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={messages}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          {/* Health Alerts Warning Banner */}
          {pipelineState.alerts.length > 0 && (
            <div className="flex flex-col gap-3.5 p-5 bg-red-950/30 border border-red-500/20 rounded-3xl relative z-30 shadow-2xl backdrop-blur-xl">
              {pipelineState.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <ShieldAlert className="w-5.5 h-5.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-xs text-red-400 uppercase tracking-widest">{alert.title}</h5>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-0.5">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controls / Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 relative z-30 border-b border-white/5 pb-4">

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                {pipelineState.provider} Sync: {pipelineState.quality}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Provider Adapter Selector */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-full px-4 py-1.5 text-xs font-semibold text-neutral-200">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Source:</span>
                <select
                  id="aura-dashboard-source-select"
                  name="aura-dashboard-source-select"
                  value={provider}
                  onChange={(e: any) => setProvider(e.target.value)}
                  className="bg-transparent border-0 text-white focus:outline-none cursor-pointer pr-4 font-bold text-xs"
                >
                  <option value="mock" className="bg-neutral-900 text-white">Mock Simulator</option>
                  <option value="apple" className="bg-neutral-900 text-white">Apple HealthKit</option>
                  <option value="garmin" className="bg-neutral-900 text-white">Garmin Connect</option>
                  <option value="fitbit" className="bg-neutral-900 text-white">Fitbit Premium</option>
                  <option value="oura" className="bg-neutral-900 text-white">Oura Ring</option>
                  <option value="manual" className="bg-neutral-900 text-white">Manual Input Mode</option>
                </select>
              </div>

              {/* Simulated circadian hour slider if mock is selected */}
              {provider === 'mock' && (
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-full px-4 py-1.5 text-xs font-semibold text-neutral-200">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Hour: {simulatedHour}:00</span>
                  <input
                    type="range"
                    id="aura-dashboard-simulated-hour"
                    name="aura-dashboard-simulated-hour"
                    min="0"
                    max="23"
                    value={simulatedHour}
                    onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                    className="w-20 accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Manual Override inputs button */}
              {provider === 'manual' && (
                <button
                  onClick={() => setIsManualInputOpen(!isManualInputOpen)}
                  className="px-4 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-full text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Log Biometrics
                </button>
              )}

              {/* Date Range Selector */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-white/5 rounded-full text-xs font-medium text-neutral-300">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] font-bold tracking-wide">15 - 20 July, 2026</span>
              </div>

              {/* Create Report Button */}
              <button className="px-5 py-1.5 bg-white text-black hover:bg-neutral-100 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow">
                Report
              </button>
            </div>
          </div>

          {/* --- AURA MORNING BRIEFING & SUMMARY HEADER WIDGETS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* 1. AI Morning Brief Widget Banner (Adjusted original size) */}
            <div className="md:col-span-2 relative rounded-[32px] overflow-hidden bg-black/45 backdrop-blur-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/5 hover:border-white/10 transition-all duration-500 w-full group shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-white/5 via-transparent to-transparent pointer-events-none group-hover:from-brand/15 transition-all duration-500" />
              <div className="space-y-3 text-left max-w-xl relative z-10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4.5 h-4.5 animate-pulse text-blue-400" /> AURA Morning Briefing
                </span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white leading-normal">
                  "You slept 1.5 hours less than your weekly average."
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  HRV index is suppressed at {hrv}ms. Consider avoiding intense aerobic training and target Zone 2 movement intervals. Prioritize 500ml mineralized water before 2:00 PM.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  handleSubmit("Analyze my recovery deficit options");
                }}
                className="px-5 py-3 bg-white hover:bg-neutral-100 text-black font-black rounded-2xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow shrink-0 relative z-10"
              >
                Interactive Audit
              </button>
            </div>

            {/* 2. Burnout Risk & Medical Summary Column */}
            <div className="flex flex-col justify-between gap-3">
              {/* Burnout Risk Dial */}
              <div className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-4 flex items-center gap-4 hover:border-white/10 transition-all duration-500 cursor-pointer shadow-lg flex-1">
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/5"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-white"
                      strokeDasharray="45, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">45</div>
                </div>
                <div className="text-left">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Burnout Risk</h4>
                  <p className="text-sm font-extrabold text-white">Medium</p>
                  <span className="text-[9px] text-neutral-300 font-medium">Sleep debt detected</span>
                </div>
              </div>

              {/* Recent Medical Report */}
              <div className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-4 flex items-start gap-3 hover:border-white/10 transition-all duration-500 cursor-pointer shadow-lg flex-1">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Lipid Panel</h4>
                  <p className="text-xs font-bold text-white leading-tight mt-0.5">LDL slightly high (140 mg/dL)</p>
                  <span className="text-[9px] text-neutral-500 block mt-1">Analyzed yesterday • 96% Conf</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* LEFT CONTAINER (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Row 1: Activity, Sleep, Heart */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Activity Card */}
                <div
                  onClick={() => setExplainMetric("stress")}
                  className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 group cursor-pointer shadow-2xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                        <Activity className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Activity</span>
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSteps(prev => Math.max(0, prev - 1000))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">-</button>
                      <button onClick={() => setSteps(prev => prev + 1000)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-3 text-left">
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Browsing</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-2.5 h-1.5 bg-white text-black font-semibold rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm" />
                        <div className="w-4 h-1.5 bg-white text-black font-semibold rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Conversation</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm" />
                        <div className="w-3 h-1.5 bg-white text-black font-semibold rounded-sm" />
                        <div className="w-2 h-1.5 bg-white text-black font-semibold rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Phone</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-4 h-1.5 bg-white text-black font-semibold rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-3 text-left">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{rawData.steps.toLocaleString()}</h3>
                      <span className="text-[8px] text-neutral-400 uppercase font-semibold">Steps ({pipelineState.metrics.stress.confidence}% conf)</span>
                    </div>
                    <div className="flex gap-1 items-end h-7">
                      <div className="w-1 h-3 bg-white text-black font-semibold/30 rounded-full" />
                      <div className="w-1 h-5 bg-white text-black font-semibold rounded-full" />
                      <div className="w-1 h-4 bg-white text-black font-semibold/60 rounded-full" />
                      <div className="w-1 h-6 bg-white text-black font-semibold rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 2. Sleep Card */}
                <div
                  onClick={() => setExplainMetric("sleep")}
                  className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 group cursor-pointer shadow-2xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                        <Moon className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Sleep</span>
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSleepHours(prev => Math.max(0, prev - 0.25))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">-</button>
                      <button onClick={() => setSleepHours(prev => prev + 0.25)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">+</button>
                    </div>
                  </div>

                  <div className="h-16 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sleepGradVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#84cc16" strokeWidth={2} fillOpacity={1} fill="url(#sleepGradVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-3 text-left">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{pipelineState.metrics.sleep.displayValue}</h3>
                      <span className="text-[8px] text-neutral-400 uppercase font-semibold">Sleep Score: {pipelineState.metrics.sleep.rawScore} ({pipelineState.metrics.sleep.confidence}% conf)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Heart Card */}
                <div
                  onClick={() => setExplainMetric("heart")}
                  className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 group cursor-pointer shadow-2xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-400">
                        <Heart className="w-4.5 h-4.5 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Heart (HRV)</span>
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setHrv(prev => Math.max(10, prev - 5))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">-</button>
                      <button onClick={() => setHrv(prev => prev + 5)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white">+</button>
                    </div>
                  </div>

                  <div className="h-14 flex items-end justify-center gap-1.5 mt-2">
                    {[
                      { day: 'M', active: false, h: 5 },
                      { day: 'T', active: false, h: 8 },
                      { day: 'W', active: true, h: 14 },
                      { day: 'T', active: true, h: 12 },
                      { day: 'F', active: true, h: 10 },
                      { day: 'S', active: false, h: 7 },
                      { day: 'S', active: false, h: 9 }
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="w-2.5 flex flex-col gap-0.5 items-center justify-end" style={{ height: '48px' }}>
                          {Array.from({ length: 6 }).map((_, segmentIdx) => {
                            const show = (6 - segmentIdx) <= Math.ceil(col.h / 2.5);
                            return (
                              <div
                                key={segmentIdx}
                                className={`w-2.5 h-1.5 rounded-[1px] transition-colors ${show
                                  ? col.active
                                    ? 'bg-amber-500'
                                    : 'bg-neutral-600'
                                  : 'bg-neutral-800/40'
                                  }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[8px] text-neutral-500 font-bold uppercase">{col.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-3 text-left">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{pipelineState.metrics.heart.displayValue}</h3>
                      <span className="text-[8px] text-neutral-400 uppercase font-semibold">{pipelineState.metrics.hrv.displayValue} HRV ({pipelineState.metrics.heart.confidence}% conf)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Wellness Score & Focus Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 4. Wellness Score Card */}
                <div
                  onClick={() => setExplainMetric("wellness")}
                  className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-6 h-[260px] flex flex-col justify-between relative overflow-hidden group hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 cursor-pointer shadow-2xl"
                >
                  <div className="absolute inset-x-0 bottom-14 h-24 pointer-events-none z-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 100" fill="none">
                      <path d="M0,50 C100,10 150,90 250,30 C320,0 360,70 400,40" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" />
                      <path d="M0,60 C80,30 180,80 280,40 C340,15 370,60 400,50" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0,40 C120,70 200,20 300,60 C350,80 380,30 400,45" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Wellness Score</span>
                    <button className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider" onClick={(e) => e.stopPropagation()}>
                      <span>Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto relative z-10 text-center">
                    <h2 className="text-whitexl font-black text-white tracking-tight leading-none text-glow">{wellnessScore}</h2>
                    <span className="text-[10px] font-black text-neutral-300 mt-2 uppercase tracking-widest">
                      {pipelineState.metrics.wellness.status === "Excellent" ? "Optimal Performance" : pipelineState.metrics.wellness.status === "Good" ? "Stable Condition" : "Requires Rest"}
                    </span>
                    <span className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">Bio-Logic Engine v1</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs relative z-10 text-left" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Sleep</span>
                      <span className="font-bold text-neutral-200">{sleepHours}h</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        handleSubmit("Analyze my Wellness Score");
                      }}
                      className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-widest"
                    >
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Audit</span>
                    </button>
                    <div className="text-right">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">HRV</span>
                      <span className="font-bold text-neutral-200">{hrv} ms</span>
                    </div>
                  </div>
                </div>

                {/* 5. Focus Activity Card */}
                <div
                  onClick={() => setExplainMetric("focus")}
                  className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[28px] p-6 h-[260px] flex flex-col justify-between relative overflow-hidden group hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 cursor-pointer shadow-2xl"
                >
                  <div className="absolute inset-x-6 bottom-16 h-14 flex items-end justify-center gap-[3px] opacity-10 pointer-events-none">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const h = Math.abs(Math.sin(i * 0.15)) * 36 + 6;
                      return <div key={i} className="w-[2px] bg-white rounded-full" style={{ height: `${h}px` }} />;
                    })}
                  </div>

                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Focus Activity</span>
                    <button className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider" onClick={(e) => e.stopPropagation()}>
                      <span>Daily</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto relative z-10 text-center">
                    <h2 className="text-whitexl font-black text-white tracking-tight leading-none">{pipelineState.metrics.focus.rawScore}</h2>
                    <span className="text-[10px] font-black text-neutral-300 mt-2 uppercase tracking-widest">Focus Score</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wide">Deep Work {(rawData.deepWorkMin ?? 240) / 60}h</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs relative z-10 text-left" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Session</span>
                      <span className="font-bold text-neutral-200">42 min</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-widest">
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Insights</span>
                    </button>
                    <div className="text-right">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Deep Work</span>
                      <span className="font-bold text-neutral-200">{(rawData.deepWorkMin ?? 240) / 60}h</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR TALL CARD (4 Cols) */}
            <div className="lg:col-span-4 h-full">

              {/* 6. Balanced Energy & Recovery State tall card */}
              <div
                onClick={() => setExplainMetric("stress")}
                className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col justify-between h-full min-h-[540px] relative group hover:border-white/20/25 hover:-translate-y-[2px] transition-all duration-500 cursor-pointer shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-bottom opacity-10 mix-blend-luminosity pointer-events-none z-0"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600')`
                  }}
                />

                <div className="p-5 relative z-10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 max-w-[280px] mx-auto shadow-lg">
                    {[
                      { icon: Flame, color: 'text-white' },
                      { icon: Zap, color: 'text-yellow-400' },
                      { icon: Activity, color: 'text-white' },
                      { icon: Award, color: 'text-white' },
                      { icon: Heart, color: 'text-red-500' }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button key={idx} className="p-2 rounded-full hover:bg-white/10 transition-all text-neutral-300 hover:text-white cursor-pointer hover:scale-110">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 relative z-10 my-auto">
                  <div className="relative w-60 h-44 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 130">
                      <path
                        d="M30 110 A 70 70 0 0 1 170 110"
                        fill="none"
                        stroke="#1a1a24"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M30 110 A 70 70 0 0 1 100 40"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1="100"
                        y1="110"
                        x2={100 + Math.cos((Math.PI - (pipelineState.metrics.stress.gaugeValue - 1) * (Math.PI / 4))) * 48}
                        y2={110 - Math.sin((Math.PI - (pipelineState.metrics.stress.gaugeValue - 1) * (Math.PI / 4))) * 48}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="110" r="5" fill="#ffffff" />
                    </svg>

                    <div className="absolute bottom-4 flex flex-col items-center">
                      <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">Stress Index</span>
                      <h2 className="text-whitexl font-black text-white tracking-tight">{pipelineState.metrics.stress.displayValue}</h2>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 mt-2 relative z-20" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setStressLevel(prev => Math.max(1.0, parseFloat((prev - 0.2).toFixed(1))))}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black tracking-widest uppercase transition-all cursor-pointer text-white"
                    >
                      - Low
                    </button>
                    <button
                      onClick={() => setStressLevel(prev => Math.min(5.0, parseFloat((prev + 0.2).toFixed(1))))}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black tracking-widest uppercase transition-all cursor-pointer text-white"
                    >
                      + High
                    </button>
                  </div>

                  <div className="w-full h-10 relative flex items-center justify-center overflow-hidden mt-4">
                    <svg className="w-48 h-full opacity-30" viewBox="0 0 200 40">
                      <path d="M0 20 C30 10, 50 30, 80 20 C110 10, 130 30, 160 20 C180 15, 190 25, 200 20" stroke="#0a84ff" strokeWidth="2" fill="none" />
                      <path d="M0 25 C20 15, 60 35, 100 25 C140 15, 170 35, 200 25" stroke="#eab308" strokeWidth="1.5" fill="none" />
                      <path d="M0 15 C40 30, 80 10, 120 20 C160 30, 180 10, 200 15" stroke="#ffffff" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                </div>

                <div className="p-5 text-center relative z-10 border-t border-white/5 bg-black/50">
                  <h3 className="text-[10px] font-black text-neutral-100 uppercase tracking-widest">Adaptive Energy Dial</h3>
                  <span className="text-[9px] text-neutral-400 mt-1 block uppercase font-bold tracking-wider">Dynamic Biometric Stability</span>
                </div>
              </div>

              {/* 7. Burnout risk indicator widget */}
              <div className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 mt-6 space-y-4 hover:border-white/20/25 transition-all duration-500 shadow-2xl">
                <div className="flex justify-between items-center text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Burnout Prediction</span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">Risk: MEDIUM</span>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-full border-2 border-white/20/35 border-t-brand flex items-center justify-center relative shrink-0">
                    <span className="text-xs font-black text-white">42%</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Mild Sleep Debt Accumulated</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      HRV patterns display normal vagal base tone but sleep levels dropped by 18%. Target a 30m wind-down schedule tonight to avoid exhaustion triggers.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* --- EXPLAINABILITY DETAIL DIALOG --- */}
      <AnimatePresence>
        {explainMetric && pipelineState.metrics[explainMetric] && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0f0f13]/95 border border-white/10 rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl text-white"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5 text-left">
                <div>
                  <h4 className="font-extrabold text-sm tracking-wider uppercase text-white">{pipelineState.metrics[explainMetric].title} Analysis</h4>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest block font-bold">Engine version: 1.0.0</span>
                </div>
                <button
                  onClick={() => setExplainMetric(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-6 space-y-5 text-left">
                <div className="flex justify-between items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Value</span>
                    <span className="text-2xl font-black text-white">{pipelineState.metrics[explainMetric].displayValue}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-neutral-400 block uppercase font-bold">Confidence</span>
                    <span className="text-sm font-extrabold text-neutral-300">{pipelineState.metrics[explainMetric].confidence}%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">How was this calculated?</h5>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                    {pipelineState.metrics[explainMetric].explanation}
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Contributing Factors</h5>
                  <div className="space-y-2">
                    {pipelineState.metrics[explainMetric].factors.map((factor, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                        <span className="text-neutral-300 font-medium">{factor.metric}</span>
                        <span className={`font-bold ${factor.contribution >= 0 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {factor.contribution >= 0 ? `+${factor.contribution}` : factor.contribution}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setExplainMetric(null)}
                className="w-full py-3 bg-white hover:bg-neutral-100 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Analysis
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MANUAL BIOMETRICS INPUT OVERLAY --- */}
      <AnimatePresence>
        {isManualInputOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#0f0f13]/95 border border-white/10 rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl text-white"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5 text-left">
                <div>
                  <h4 className="font-extrabold text-sm tracking-wider uppercase">Log Daily Biometrics</h4>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Manual override will recalculate GAMA health engine metrics</span>
                </div>
                <button
                  onClick={() => setIsManualInputOpen(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin text-left">
                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Steps Counter</label>
                  <input
                    type="number"
                    value={manualInputs.steps ?? 10000}
                    onChange={(e) => setManualInputs({ steps: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Sleep Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualInputs.sleepHours ?? 7.0}
                    onChange={(e) => setManualInputs({ sleepHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">HRV (ms)</label>
                  <input
                    type="number"
                    value={manualInputs.hrv ?? 60}
                    onChange={(e) => setManualInputs({ hrv: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Resting HR (bpm)</label>
                  <input
                    type="number"
                    value={manualInputs.restingHeartRate ?? 65}
                    onChange={(e) => setManualInputs({ restingHeartRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Current HR (bpm)</label>
                  <input
                    type="number"
                    value={manualInputs.currentHeartRate ?? 70}
                    onChange={(e) => setManualInputs({ currentHeartRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Blood Oxygen (%)</label>
                  <input
                    type="number"
                    value={manualInputs.bloodOxygen ?? 98}
                    onChange={(e) => setManualInputs({ bloodOxygen: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Systolic BP</label>
                  <input
                    type="number"
                    value={manualInputs.systolic ?? 120}
                    onChange={(e) => setManualInputs({ systolic: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Diastolic BP</label>
                  <input
                    type="number"
                    value={manualInputs.diastolic ?? 80}
                    onChange={(e) => setManualInputs({ diastolic: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Water Intake (ml)</label>
                  <input
                    type="number"
                    value={manualInputs.waterIntakeMl ?? 1500}
                    onChange={(e) => setManualInputs({ waterIntakeMl: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-neutral-400 uppercase tracking-widest font-black">Mood (1 to 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={manualInputs.mood ?? 3}
                    onChange={(e) => setManualInputs({ mood: parseInt(e.target.value) || 3 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success("Manual biometrics successfully saved!");
                    setIsManualInputOpen(false);
                  }}
                  className="flex-1 py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Log
                </button>
                <button
                  onClick={() => setIsManualInputOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer text-white"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
