'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Moon, Heart, Search, Edit2, Plus, Calendar, ChevronRight,
  Flame, Zap, Award, Mic, MicOff, Camera, RefreshCw, Send, Check, X, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';

export function DashboardView() {
  // --- Persistent Interactive States ---
  const [mounted, setMounted] = React.useState(false);
  const {
    steps, setSteps,
    sleepHours, setSleepHours,
    hrv, setHrv,
    stressLevel, setStressLevel,
    heartRate, setHeartRate,
    memoryTags
  } = useHealthStore();

  // AURA Chat & Interface States
  const [askInput, setAskInput] = React.useState('');
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<Array<{ role: 'user' | 'assistant', content: string, gridPayload?: any }>>([]);
  const [isAuraTyping, setIsAuraTyping] = React.useState(false);

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
      const savedHistory = localStorage.getItem('gama_chatHistory');

      if (savedSteps) setSteps(parseInt(savedSteps));
      if (savedSleep) setSleepHours(parseFloat(savedSleep));
      if (savedHrv) setHrv(parseInt(savedHrv));
      if (savedStress) setStressLevel(parseFloat(savedStress));
      if (savedHistory) setChatHistory(JSON.parse(savedHistory));
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
      localStorage.setItem('gama_chatHistory', JSON.stringify(chatHistory));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [steps, sleepHours, hrv, stressLevel, chatHistory, mounted]);

  // --- Wellness Score Calculation ---
  // Wellness = (Sleep * 10 + HRV + Steps / 250) / StressLevel
  const sleepWeight = sleepHours * 10;
  const stepsWeight = steps / 250;
  const rawWellness = (sleepWeight + hrv + stepsWeight) / stressLevel;
  const wellnessScore = Math.min(100, Math.max(10, Math.round(rawWellness)));

  // --- Proactive AURA Trigger ---
  React.useEffect(() => {
    if (!mounted) return;
    if (wellnessScore < 70 && !hasTriggeredRecoveryWarning) {
      setHasTriggeredRecoveryWarning(true);
      // Subtle proactive warning slide-in
      toast.custom((t) => (
        <div className="aura-overlay backdrop-blur-2xl border border-orange-500/30 p-5 rounded-3xl shadow-[0_8px_32px_rgba(249,115,22,0.15)] flex flex-col gap-3 text-white max-w-sm">
          <div className="flex items-center gap-2 text-orange-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">AURA Proactive Alert</span>
          </div>
          <p className="text-xs text-neutral-200 leading-normal">
            Your recovery metrics are low today, Alvie. I've adjusted your training plan to a light stretch to optimize your heart rate variability.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                setIsChatOpen(true);
                handleAuraQuery("Show me the adjusted light stretch workout plan");
              }}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
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
      // Reset if recovery recovers
      setHasTriggeredRecoveryWarning(false);
    }
  }, [wellnessScore, hasTriggeredRecoveryWarning, mounted]);

  // --- Dynamic Sleep Chart Data generation ---
  const sleepData = [
    { name: 'Deep', val: parseFloat((sleepHours * 0.25).toFixed(2)) },
    { name: 'Core', val: parseFloat((sleepHours * 0.50).toFixed(2)) },
    { name: 'REM', val: parseFloat((sleepHours * 0.15).toFixed(2)) },
    { name: 'Awake', val: parseFloat((sleepHours * 0.10).toFixed(2)) }
  ];

  // --- Calming Speech Synthesis ---
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown symbols before speaking
      const cleanText = text.replace(/\*\*|•/g, '').substring(0, 200);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.05;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const calmingVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira')));
      if (calmingVoice) {
        utterance.voice = calmingVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Speech to Text Recognition ---
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
        setAskInput(text);
        handleAuraQuery(text);
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

  // --- Send Query to AURA Route ---
  const handleAuraQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: queryText }];
    setChatHistory(updatedHistory);
    setAskInput('');
    setIsAuraTyping(true);

    try {
      const response = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: updatedHistory,
          memoryTags,
          dashboardState: {
            steps,
            sleepHours,
            hrv,
            stressLevel,
            wellnessScore,
            heartRate
          }
        })
      });

      const data = await response.json();
      setIsAuraTyping(false);

      if (data.success) {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          gridPayload: data.gridPayload
        }]);
        speakText(data.text);
      } else {
        toast.error("AURA experienced a brain loop. Please try again.");
      }
    } catch (err) {
      setIsAuraTyping(false);
      toast.error("Failed to connect to AURA.");
    }
  };

  // --- Meal Photo Scanner Upload Handler ---
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

  // --- Confirm Logged Meal macros ---
  const confirmLogMeal = () => {
    if (!detectedMeal) return;

    // Add macros to activity & steps (simulate workout offset or add calories)
    setSteps(prev => prev + 1500); // Trigger physical log
    setHeartRate(prev => Math.min(85, prev + 2)); // Dynamic HR change

    // Add to history
    setChatHistory(prev => [...prev, {
      role: 'assistant',
      content: `Successfully logged **${detectedMeal.mealName}** (${detectedMeal.calories} kcal, ${detectedMeal.protein}g Protein, ${detectedMeal.carbs}g Carbs, ${detectedMeal.fat}g Fat) to your dashboard. Steps & heart metrics synced.`,
    }]);

    toast.success(`Logged ${detectedMeal.mealName}! Metrics refreshed.`);
    setShowConfirmModal(false);
    setDetectedMeal(null);
  };

  // --- Rich Grid Item Addition ---
  const handleAddToPlan = (item: any) => {
    setSteps(prev => prev + 200); // Small increment
    toast.success(`Added ${item.name} to today's metabolic meal plan!`);
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen text-white font-sans pb-12 select-none relative">

      {/* --- VISION SCANNING OVERLAY --- */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center">
          <div className="relative w-72 h-72 border border-orange-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.2)] bg-neutral-900/60 flex items-center justify-center">
            {/* Pulsing Hologram/Scan lines */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/20 to-transparent w-full h-[30%] animate-[bounce_2s_infinite]" />
            <RefreshCw className="w-16 h-16 text-orange-500 animate-spin" />
          </div>
          <h3 className="mt-8 text-xl font-light tracking-widest uppercase text-neutral-300">AURA Multimodal Scanner Active</h3>
          <p className="mt-2 text-xs text-orange-400 uppercase tracking-wider animate-pulse">Deconstructive Meal Recognition in progress...</p>
        </div>
      )}

      {/* --- MULTIMODAL CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirmModal && detectedMeal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md aura-overlay backdrop-blur-3xl rounded-[32px] p-6 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h4 className="font-extrabold text-white text-base tracking-wider uppercase">Vision Verification</h4>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDetectedMeal(null);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
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
                    <span className="text-sm font-extrabold text-orange-400">{detectedMeal.calories}</span>
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
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
      <div className="relative w-full rounded-[40px] border border-white/10 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.9)] z-10 bg-[#0e0e11]/85 backdrop-blur-md">

        {/* Banner Portrait Background image covering the upper portion of the dashboard */}
        <div
          className="absolute top-0 left-0 right-0 h-[680px] bg-cover bg-center pointer-events-none z-0 brightness-[0.35] contrast-[1.1]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600')`
          }}
        />
        {/* Soft fading gradient to dark color at the bottom */}
        <div className="absolute top-0 left-0 right-0 h-[680px] bg-gradient-to-b from-black/10 via-[#0e0e11]/60 to-[#0e0e11] z-0" />

        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">

            {/* Greeting and Assistant search in the middle */}
            <div className="flex flex-col items-center mx-auto text-center relative z-25 w-full max-w-xl">
              <h2 className="text-lg md:text-xl font-light text-neutral-300 tracking-wide flex items-center gap-2">
                Hey, Ask <span className="text-orange-500 font-semibold tracking-wider">AURA</span> <span></span>
              </h2>

              <div className="mt-2 w-full flex items-center justify-center relative bg-black/40 border border-white/10 rounded-full px-5 py-2 hover:border-white/20 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Just ask me anything"
                  value={askInput}
                  onFocus={() => setIsChatOpen(true)}
                  onChange={(e) => setAskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAuraQuery(askInput);
                  }}
                  className="w-full bg-transparent py-2.5 text-center text-xl md:text-2xl font-light tracking-tight text-white placeholder-neutral-400 focus:outline-none"
                />

                {/* Multimodal Actions */}
                <div className="absolute right-4 flex items-center gap-3">
                  {/* Camera Upload Button */}
                  <label className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full cursor-pointer transition-colors flex items-center justify-center text-neutral-300 hover:text-orange-500">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-4 h-4" />
                  </label>

                  {/* Voice waveform Activation */}
                  <button
                    onClick={handleVoiceToggle}
                    className={`p-2 border rounded-full transition-colors flex items-center justify-center cursor-pointer ${isListening
                      ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-orange-500 hover:border-orange-500/50'
                      }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Animated Waveform Bars */}
                  {isListening && (
                    <div className="flex gap-[2px] items-center h-4 px-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-orange-500 rounded-full animate-soundwave"
                          style={{
                            height: '100%',
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right User Profile controls */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center bg-black/30 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
              <button
                onClick={() => {
                  setSteps(19840);
                  setSleepHours(7.75);
                  setHrv(80);
                  setStressLevel(2.7);
                  setChatHistory([]);
                  toast.success("Metrics reset to baseline values.");
                }}
                title="Reset Metrics to Default"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                  alt="Alvie Wahed"
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-white leading-tight">Alvie Wahed</h4>
                  <span className="text-[9px] text-neutral-400 leading-none">Product Manager</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- AURA GLASSMORPHIC CHAT OVERLAY --- */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl mx-auto aura-overlay backdrop-blur-3xl rounded-[32px] border border-white/10 p-5 md:p-6 shadow-2xl relative z-40 mt-1 flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">AURA Biometric Brain Coordinates</span>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Minimize
                  </button>
                </div>

                {/* Chat Message Window */}
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 space-y-3">
                      <p className="text-sm font-light">"AURA is initialized and contextually synchronized to GAMA."</p>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {["What should I eat to boost my Vitamin C?", "I am feeling tired today", "Explain my Wellness Score"].map((hint, i) => (
                          <button
                            key={i}
                            onClick={() => handleAuraQuery(hint)}
                            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full text-[10px] transition-colors cursor-pointer text-neutral-300"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className={`flex gap-3 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${item.role === 'user'
                            ? 'bg-orange-500 text-black font-semibold'
                            : 'bg-white/5 border border-white/5 text-neutral-200'
                            }`}>
                            {item.content}
                          </div>
                        </div>

                        {/* Rendering Rich Food Media Grid payload if response matches */}
                        {item.gridPayload && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {item.gridPayload.map((food: any, fIdx: number) => (
                              <div
                                key={fIdx}
                                className="bg-black/45 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/10 transition-colors shadow-lg"
                              >
                                <div className="h-28 w-full relative">
                                  <img
                                    src={food.imageUrl}
                                    alt={food.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                                  <div className="space-y-1">
                                    <h5 className="font-extrabold text-white text-xs tracking-wide uppercase">{food.name}</h5>
                                    <p className="text-[10px] text-neutral-400 leading-normal">{food.desc}</p>
                                  </div>

                                  <div className="border-t border-white/5 pt-2 text-[9px] text-neutral-400 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Calories:</span>
                                      <span className="text-white font-bold">{food.calories}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Macros:</span>
                                      <span className="text-white">{food.macros.protein} P | {food.macros.carbs} C</span>
                                    </div>
                                    {Object.entries(food.micronutrients).map(([k, v]: any) => (
                                      <div key={k} className="flex justify-between text-orange-400">
                                        <span>{k}:</span>
                                        <span>{v}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <button
                                    onClick={() => handleAddToPlan(food)}
                                    className="w-full py-2 bg-white hover:bg-neutral-100 text-black font-extrabold rounded-xl text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Add to Meal Plan
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isAuraTyping && (
                    <div className="flex gap-2 items-center text-xs text-neutral-400 pl-3">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      <span>AURA is coordinating data...</span>
                    </div>
                  )}
                </div>

                {/* Chat Inline Reply Box */}
                <div className="flex gap-2 items-center border-t border-white/5 pt-3">
                  <input
                    type="text"
                    placeholder="Provide follow-up health coordinates..."
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAuraQuery(askInput);
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                  <button
                    onClick={() => handleAuraQuery(askInput)}
                    className="p-2.5 bg-orange-500 hover:bg-orange-400 text-black rounded-2xl cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls / Filter Bar */}
          <div className="flex flex-wrap justify-end items-center gap-2.5 mt-4">
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer">
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-neutral-200">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>15 - 20 July, 2026</span>
            </div>

            {/* Wallet Button */}
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
              <Plus className="w-3 h-3" />
              <span>Add Wallet</span>
            </button>

            {/* Create Report Button */}
            <button className="px-5 py-2 bg-white text-black hover:bg-neutral-100 rounded-full text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-lg">
              Create a Report
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-stretch">

            {/* LEFT CONTAINER (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6 justify-between">

              {/* Row 1: Activity, Sleep, Heart */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Activity Card */}
                <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20 transition-all duration-300 group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Activity className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Activity</span>
                    </div>
                    {/* Add adjusters */}
                    <div className="flex gap-1.5">
                      <button onClick={() => setSteps(prev => Math.max(0, prev - 1000))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">-</button>
                      <button onClick={() => setSteps(prev => prev + 1000)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">+</button>
                    </div>
                  </div>

                  {/* Horizontal categorization rows + vertical bars inside a custom container */}
                  <div className="flex flex-col gap-2 mt-3">
                    {/* Browsing */}
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Browsing</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-2.5 h-1.5 bg-orange-500 rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-orange-500/20 rounded-sm" />
                        <div className="w-4 h-1.5 bg-orange-500 rounded-sm" />
                      </div>
                    </div>
                    {/* Conversation */}
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Conversation</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-1.5 h-1.5 bg-orange-500/20 rounded-sm" />
                        <div className="w-3 h-1.5 bg-orange-500 rounded-sm" />
                        <div className="w-2 h-1.5 bg-orange-500 rounded-sm" />
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                      <span className="w-16 font-semibold uppercase tracking-wider">Phone</span>
                      <div className="flex gap-1 flex-1 px-4">
                        <div className="w-4 h-1.5 bg-orange-500 rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-orange-500/20 rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-orange-500/20 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Steps footer */}
                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{steps.toLocaleString()}</h3>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Steps</span>
                    </div>
                    {/* Small vertical bar indicators */}
                    <div className="flex gap-1 items-end h-7">
                      <div className="w-1 h-3 bg-orange-500/30 rounded-full" />
                      <div className="w-1 h-5 bg-orange-500 rounded-full" />
                      <div className="w-1 h-4 bg-orange-500/60 rounded-full" />
                      <div className="w-1 h-6 bg-orange-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 2. Sleep Card */}
                <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Moon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Sleep</span>
                    </div>
                    {/* Sleep adjusters */}
                    <div className="flex gap-1.5">
                      <button onClick={() => setSleepHours(prev => Math.max(0, prev - 0.25))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">-</button>
                      <button onClick={() => setSleepHours(prev => prev + 0.25)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">+</button>
                    </div>
                  </div>

                  {/* Sleep Recharts area chart */}
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

                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{sleepHours}h</h3>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Duration Coordinates</span>
                    </div>
                  </div>
                </div>

                {/* 3. Heart Card */}
                <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between h-[255px] hover:border-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Heart className="w-4.5 h-4.5 text-white animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Heart (HRV)</span>
                    </div>
                    {/* HRV adjusters */}
                    <div className="flex gap-1.5">
                      <button onClick={() => setHrv(prev => Math.max(10, prev - 5))} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">-</button>
                      <button onClick={() => setHrv(prev => prev + 5)} className="w-5 h-5 bg-white/5 border border-white/10 rounded text-[9px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">+</button>
                    </div>
                  </div>

                  {/* Heart rate visual bars representation - segmented blocks */}
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

                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{heartRate} <span className="text-xs font-normal text-neutral-400">BPM</span></h3>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">{hrv} ms HRV</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Wellness Score & Focus Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 4. Wellness Score Card */}
                <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 h-[260px] flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                  {/* Elegant layered sine wave graphic representing frequency */}
                  <div className="absolute inset-x-0 bottom-14 h-24 pointer-events-none z-0 opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 400 100" fill="none">
                      <path d="M0,50 C100,10 150,90 250,30 C320,0 360,70 400,40" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                      <path d="M0,60 C80,30 180,80 280,40 C340,15 370,60 400,50" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0,40 C120,70 200,20 300,60 C350,80 380,30 400,45" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Wellness Score</span>
                    <button className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <span>Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto relative z-10 text-center">
                    <h2 className="text-5xl font-black text-white tracking-tight leading-none text-glow">{wellnessScore}</h2>
                    <span className="text-xs font-bold text-orange-400 mt-1.5 uppercase tracking-wide">
                      {wellnessScore >= 80 ? 'Optimal Performance' : wellnessScore >= 70 ? 'Stable Condition' : 'Critically Low Recovery'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">Responsive Bio-Logic Engine</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs relative z-10">
                    <div className="text-left">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Sleep quality</span>
                      <span className="font-semibold text-neutral-200">{sleepHours}h</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        handleAuraQuery("Analyze my Wellness Score");
                      }}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-[9px] font-bold text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Request Audit</span>
                    </button>
                    <div className="text-right">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">HRV Index</span>
                      <span className="font-semibold text-neutral-200">{hrv} ms</span>
                    </div>
                  </div>
                </div>

                {/* 5. Focus Activity Card */}
                <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 h-[260px] flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">

                  {/* High density vertical signal strength graph representing focus flow */}
                  <div className="absolute inset-x-6 bottom-16 h-14 flex items-end justify-center gap-[3px] opacity-15 pointer-events-none">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const h = Math.abs(Math.sin(i * 0.15)) * 36 + 6;
                      return <div key={i} className="w-[2px] bg-white rounded-full" style={{ height: `${h}px` }} />;
                    })}
                  </div>

                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Focus Activity</span>
                    <button className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <span>Daily</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto relative z-10 text-center">
                    <h2 className="text-5xl font-black text-white tracking-tight leading-none">73</h2>
                    <span className="text-xs font-bold text-orange-400 mt-1.5 uppercase tracking-wide">Focus Score</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">Deep Work 14.5h</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs relative z-10">
                    <div className="text-left">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Avg Session</span>
                      <span className="font-semibold text-neutral-200">42 min</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-[9px] font-bold text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Insights</span>
                    </button>
                    <div className="text-right">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wider font-bold">Deep Work</span>
                      <span className="font-semibold text-neutral-200">14.5h</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR TALL CARD (4 Cols) */}
            <div className="lg:col-span-4 h-full">

              {/* 6. Balanced Energy & Recovery State tall card */}
              <div className="bg-black/35 backdrop-blur-xl border border-white/10 rounded-[36px] overflow-hidden flex flex-col justify-between h-full min-h-[540px] relative group hover:border-white/20 transition-all duration-300">
                {/* Forest background at the bottom matching mockup */}
                <div
                  className="absolute inset-0 bg-cover bg-bottom opacity-25 mix-blend-luminosity pointer-events-none z-0"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600')`
                  }}
                />

                {/* Top header row inside card: Pill buttons */}
                <div className="p-5 relative z-10">
                  <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 max-w-[285px] mx-auto shadow-inner">
                    {[
                      { icon: Flame, color: 'text-orange-500' },
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

                {/* Dial Gauge Indicator */}
                <div className="flex flex-col items-center justify-center p-6 relative z-10 my-auto">

                  {/* Gauge Arc SVG */}
                  <div className="relative w-60 h-44 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 130">
                      {/* Dotted background path */}
                      <path
                        d="M30 110 A 70 70 0 0 1 170 110"
                        fill="none"
                        stroke="#262626"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                      />
                      {/* Active white dotted path based on stress level (1 to 5) */}
                      <path
                        d="M30 110 A 70 70 0 0 1 100 40"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                      />

                      {/* Needle pointing to stress index */}
                      <line
                        x1="100"
                        y1="110"
                        x2={100 + Math.cos((Math.PI - (stressLevel - 1) * (Math.PI / 4))) * 48}
                        y2={110 - Math.sin((Math.PI - (stressLevel - 1) * (Math.PI / 4))) * 48}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="110" r="5" fill="#ffffff" />
                    </svg>

                    {/* Speedometer center text labels */}
                    <div className="absolute bottom-4 flex flex-col items-center">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">Stress Index</span>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{stressLevel} / 5.0</h2>
                    </div>
                  </div>

                  {/* Stress Level adjusters */}
                  <div className="flex justify-center gap-3 mt-2 relative z-20">
                    <button
                      onClick={() => setStressLevel(prev => Math.max(1.0, parseFloat((prev - 0.2).toFixed(1))))}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] transition-colors cursor-pointer uppercase font-bold text-neutral-300"
                    >
                      - Less Stress
                    </button>
                    <button
                      onClick={() => setStressLevel(prev => Math.min(5.0, parseFloat((prev + 0.2).toFixed(1))))}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] transition-colors cursor-pointer uppercase font-bold text-neutral-300"
                    >
                      + More Stress
                    </button>
                  </div>

                  {/* Overlapping wavy lines underneath dial */}
                  <div className="w-full h-10 relative flex items-center justify-center overflow-hidden mt-2">
                    <svg className="w-48 h-full opacity-65" viewBox="0 0 200 40">
                      <path d="M0 20 C30 10, 50 30, 80 20 C110 10, 130 30, 160 20 C180 15, 190 25, 200 20" stroke="#f97316" strokeWidth="2" fill="none" />
                      <path d="M0 25 C20 15, 60 35, 100 25 C140 15, 170 35, 200 25" stroke="#eab308" strokeWidth="1.5" fill="none" />
                      <path d="M0 15 C40 30, 80 10, 120 20 C160 30, 180 10, 200 15" stroke="#ffffff" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                </div>

                {/* Bottom title labels */}
                <div className="p-6 text-center relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">Stress & Adaptive Energy Dial</h3>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Dynamic Biometric Stability Index</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
