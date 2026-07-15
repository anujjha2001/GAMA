feature-dashboard
'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Shield, Calendar, Users, ChevronRight,
  ArrowRight, Globe, Check, Activity, Zap,
  Moon, Flame, Brain, BookOpen, Compass, Upload,
  Plus, CircleDot, Database, FileText, Smartphone, AlertCircle, Sliders
} from 'lucide-react';
import { toast } from 'sonner';
import HealthOrb3D from '@/components/shared/health-orb-3d';


export default function HomePage() {
  // AI Food Scanner Interaction State
  const [scannedFood, setScannedFood] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  // Health Timeline State
  const [activeTimelineHour, setActiveTimelineHour] = React.useState<string>('Morning');

  const foodOptions = {
    salad: {
      name: 'Mediterranean Avocado Salad',
      calories: '320 kcal',
      protein: '12g',
      fat: '22g',
      carbs: '18g',
      vitamins: 'A, C, K, B-6',
      rating: '9.4/10',
      alternatives: 'Substitute store-bought dressing with olive oil & lemon to reduce sodium.'
    },
    burger: {
      name: 'Double Cheese Bacon Burger',
      calories: '780 kcal',
      protein: '38g',
      fat: '45g',
      carbs: '55g',
      vitamins: 'B-12, Iron, Zinc',
      rating: '3.1/10',
      alternatives: 'Swap for a grilled chicken wrap or turkey burger on sourdough wrap.'
    }
  };

  const handleScanFood = (foodType: 'salad' | 'burger') => {
    setIsScanning(true);
    setScannedFood(null);
    setTimeout(() => {
      setIsScanning(false);
      setScannedFood(foodType);
      toast.success(`Scanned ${foodType === 'salad' ? 'Salad' : 'Burger'} successfully!`);
    }, 1500);
  };

  const timelineData = {
    'Morning': {
      title: '07:30 AM — Early Rise & Reset',
      action: 'Hydration & Light Mobility',
      suggestion: 'Cortisol levels are naturally peaking. Take 150ml of filtered water with electrolyte minerals. Postpone caffeine intake until 9:00 AM for optimal energy management.'
    },
    'Breakfast': {
      title: '08:30 AM — Nutrient Loading',
      action: 'High-Protein Breakfast',
      suggestion: 'Aim for 35g of protein and healthy fats (e.g., pasture-raised eggs, avocado). This stabilizes blood glucose and prevents late afternoon crashes.'
    },
    'Workout': {
      title: '11:00 AM — Physical Output',
      action: 'Strength & Zone 2 Cardio',
      suggestion: 'Your body temperature is ideal for performance. Maintain heart rate between 130–145 bpm for optimal cardiovascular base development.'
    },
    'Lunch': {
      title: '01:30 PM — Sustained Energy',
      action: 'Balanced Wholefood Bowl',
      suggestion: 'Incorporate complex carbohydrates (quinoa or sweet potato) and leafy greens to replenish glycogen stores without inducing postprandial fatigue.'
    },
    'Hydration': {
      title: '03:30 PM — Fluid Balance',
      action: 'Electrolyte Mineral Intake',
      suggestion: 'Autonomic signals indicate minor cellular dehydration. Replenish with 500ml water. This prevents cognitive sluggishness during late meetings.'
    },
    'Medicine': {
      title: '05:00 PM — Micronutrient Timing',
      action: 'Omega-3 & Vitamin D3 Support',
      suggestion: 'Lipid-soluble supplements are best absorbed alongside your evening meals. Take now to optimize immune and hormonal synthesis cycles.'
    },
    'Meditation': {
      title: '06:30 PM — Autonomic Transition',
      action: '10-Min Box Breathing',
      suggestion: 'Shift nervous system state from sympathetic (fight/flight) to parasympathetic (rest/digest) before dinner to maximize nutrient digestion.'
    },
    'Dinner': {
      title: '07:30 PM — Last Feeding Window',
      action: 'Light Digestible Dinner',
      suggestion: 'Focus on lean proteins (wild salmon) and fibrous vegetables. Limit heavy carbs close to bedtime to prevent body temperature spikes during sleep.'
    },
    'Sleep': {
      title: '10:30 PM — Sleep Architecture Initiation',
      action: 'Wind-Down & Darkness Lock',
      suggestion: 'Melatonin production is rising. Dim overhead lighting, restrict blue screens, and maintain room temperature at 18°C (64°F) for deep sleep entry.'
    }
  };
    
"use client";

import Image from "next/image";
import Link from "next/link";
    develop

  return (
    feature-dashboard
    <div className="min-h-screen bg-[#07090e] text-[#f3f4f6] font-sans overflow-x-hidden selection:bg-[#f97316]/30 selection:text-white relative">

      {/* Atmospheric Background Mesh Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[60%] bg-[#f97316]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[55%] h-[55%] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 border border-white/10 bg-black/45 backdrop-blur-md rounded-full px-8 py-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center">
            <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">GAMA</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <a href="#overview" className="hover:text-white transition-colors">Overview</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#technology" className="hover:text-white transition-colors">Technology</a>
          <a href="#community" className="hover:text-white transition-colors">Community</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-white hover:bg-white/95 text-black font-semibold rounded-full text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1"
          >
            Start Free <span className="text-[10px]"></span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-screen relative flex items-center justify-center pt-28 pb-16 overflow-hidden z-10">

        {/* Background Image of Athlete */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/20 to-[#07090e] z-10" />
          <img
            src="/hero-athlete.png"
            alt="Athlete Hero"
            className="w-full h-full object-cover opacity-80 max-w-6xl mx-auto scale-100 translate-y-20"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 w-full text-center relative z-20 space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-light tracking-tight text-white leading-none">
              Move With <span className="italic font-serif font-normal text-[#f97316]">Meaning</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto leading-relaxed mt-4">
              GAMA is your AI-driven coach that listens, learns, and adapts — helping your body find its natural rhythm every day.
            </p>
          </div>

          {/* Prompt / Input Console Box */}
          <div className="max-w-xl mx-auto mt-10 p-4 bg-black/55 backdrop-blur-xl border border-white/10 rounded-[28px] space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
              <input
                type="text"
                placeholder="Good morning, how are you feeling, and how do you want to move today?"
                className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Querying GAMA Bio-intelligence...")}
                  className="p-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toast.info("Opening biometric sliders controls...")}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tag suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {[
                { label: 'Energize', icon: '', color: 'hover:border-[#f97316]/30' },
                { label: 'Recover', icon: '', color: 'hover:border-purple-500/30' },
                { label: 'Focus', icon: '', color: 'hover:border-pink-500/30' },
                { label: 'Calm', icon: '', color: 'hover:border-emerald-500/30' },
                { label: 'Reset', icon: '', color: 'hover:border-cyan-500/30' }
              ].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => toast.success(`Simulating ${tag.label} routine...`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-gray-400 hover:text-white transition-all cursor-pointer ${tag.color}`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED INTEGRATIONS */}
      <section className="py-12 border-y border-white/5 bg-black/25 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">
            Trusted Wearables & Ecosystem Integrations
          </p>
          <div className="relative w-full flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-16 py-2 items-center pr-16">
              {['Apple Health', 'Google Fit', 'Fitbit', 'WHOOP', 'Garmin', 'Oura', 'Samsung Health'].map((logo, idx) => (
                <span key={idx} className="text-lg md:text-xl font-extrabold tracking-tight text-gray-600 hover:text-white transition-colors uppercase select-none">
                  {logo}
                </span>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 py-2 items-center pr-16">
              {['Apple Health', 'Google Fit', 'Fitbit', 'WHOOP', 'Garmin', 'Oura', 'Samsung Health'].map((logo, idx) => (
                <span key={idx} className="text-lg md:text-xl font-extrabold tracking-tight text-gray-600 hover:text-white transition-colors uppercase select-none">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY GAMA */}
      <section id="why-gama" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Why GAMA</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Beyond Passive Tracking</h2>
          <p className="text-sm text-gray-400">
            Traditional health apps tell you what happened. GAMA understands your physiology to shape what you do next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Traditional Health Apps */}
          <div className="md:col-span-5 bg-[#121318]/60 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-500 uppercase tracking-wider">Traditional Apps</h3>
              <ul className="space-y-4">
                {['Track Static Data Only', 'Manual Calorie Estimation', 'Endless Manual Input Logging', 'Static Weekly Reports', 'Generic One-Size-Fits-All Advice'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="text-red-500">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 border-t border-white/5 mt-8 text-xs text-gray-600">
              Passively logs metrics without offering actionable steps.
            </div>
          </div>

          {/* VS Divider */}
          <div className="hidden md:flex md:col-span-2 items-center justify-center">
            <span className="w-10 h-10 rounded-full border border-white/5 bg-black flex items-center justify-center text-xs font-bold text-gray-500">VS</span>
          </div>

          {/* GAMA */}
          <div className="md:col-span-5 bg-[#1c120c]/60 border border-[#f97316]/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(249,115,22,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#f97316] uppercase tracking-wider">GAMA AI</h3>
              <ul className="space-y-4">
                {['AI Comprehends Wearable Signals', 'Predictive Biomarker Forecasting', 'Proactive Personal Bio-Coach', 'Intelligently Learns Daily Habits', 'Actionable Micro-Decision Prompts'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-[#f97316] font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 border-t border-[#f97316]/10 mt-8 text-xs text-[#f97316]">
              Continuously processes data loops to guide daily recovery.
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH INTELLIGENCE DASHBOARD PREVIEW */}
      <section id="dashboard" className="py-24 bg-[#0a0a0f] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Dashboard Preview</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Sovereign Health Intelligence</h2>
            <p className="text-sm text-gray-400">
              A comprehensive bio-telemetry command center rendering your vital signals in real-time.
            </p>
          </div>

          {/* Dashboard Preview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Main Score - Large Card */}
            <div className="md:col-span-8 bg-black/40 border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[350px] relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#f97316] uppercase tracking-wider">Metabolic Health Score</span>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md font-mono">+4.2% this week</span>
              </div>

              <div className="my-6 flex items-baseline gap-4">
                <span className="text-7xl md:text-9xl font-extrabold text-white">96</span>
                <div>
                  <span className="text-base font-bold text-white block">Excellent Status</span>
                  <span className="text-xs text-gray-500">Optimum endocrine and autonomic balance</span>
                </div>
              </div>

              {/* Mini Weekly Sparkline graph in SVG */}
              <div className="w-full h-24 mt-4">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-sparkline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q30,70 60,75 T120,40 T180,60 T240,30 T300,45 T360,20 T400,10 L400,100 L0,100 Z"
                    fill="url(#gradient-sparkline)"
                  />
                  <path
                    d="M0,80 Q30,70 60,75 T120,40 T180,60 T240,30 T300,45 T360,20 T400,10"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="md:col-span-4 grid grid-cols-1 gap-6">
              {/* Sleep Score Ring */}
              <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sleep</span>
                  <h4 className="text-xl font-bold text-white">8h 42m</h4>
                  <p className="text-xs text-gray-400">92% Deep Sleep Ratio</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset="25" />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">92</span>
                </div>
              </div>

              {/* Stress Level Tracker */}
              <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Stress (HRV)</span>
                  <h4 className="text-xl font-bold text-white">Low Vagal Tone</h4>
                  <p className="text-xs text-[#f97316]">Relaxation Activated</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">12</span>
                  <span className="text-xs text-gray-500 block">HRV Index</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MEET YOUR AI HEALTH TEAM */}
      <section id="ai-team" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Coaching Sandbox</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Meet Your AI Health Team</h2>
          <p className="text-sm text-gray-400">
            A panel of specialized deep learning models tailored to coordinate separate domains of your daily biology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Nutrition AI',
              description: 'Examines food profiles, tracks nutrient loads, and optimizes metabolic energy levels throughout the day.',
              icon: <Flame className="w-6 h-6 text-[#f97316]" />,
              glow: 'hover:border-[#f97316]/30'
            },
            {
              title: 'Workout AI',
              description: 'Formulates adaptive strength and cardiovascular targets based on current autonomic base readings.',
              icon: <Activity className="w-6 h-6 text-purple-400" />,
              glow: 'hover:border-purple-500/30'
            },
            {
              title: 'Recovery AI',
              description: 'Monitors HRV balance, oxygen saturation, and body temperature to prevent athletic overtraining.',
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              glow: 'hover:border-yellow-500/30'
            },
            {
              title: 'Sleep AI',
              description: 'Analyzes circadian rhythm shifts, bedroom temperatures, and sleep cycle states to build perfect sleep hygiene.',
              icon: <Moon className="w-6 h-6 text-cyan-400" />,
              glow: 'hover:border-cyan-500/30'
            },
            {
              title: 'Mental Wellness AI',
              description: 'Supports focus tracking, schedules parasympathetic breathing sessions, and manages neural recovery cycles.',
              icon: <Brain className="w-6 h-6 text-pink-400" />,
              glow: 'hover:border-pink-500/30'
            },
            {
              title: 'Medical Report AI',
              description: 'Deciphers complex biomarker results and lipid panels to summarize critical markers into simple concepts.',
              icon: <FileText className="w-6 h-6 text-emerald-400" />,
              glow: 'hover:border-emerald-500/30'
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-[#0c0f17]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] space-y-6 shadow-xl flex flex-col justify-between min-h-[250px] transition-all duration-300 ${card.glow}`}
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                {card.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI FOOD SCANNER */}
      <section id="food-scanner" className="py-24 bg-[#0a0a0f] border-t border-white/5 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest block">AI Food Scanner</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Instantly scan and analyze nutrients.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Snap a picture of any meal. GAMA's deep-vision parser instantly structures calories, macros, micro-nutrients, and offers suggestions to optimize blood-glucose stability.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => handleScanFood('salad')}
                className="px-5 py-3 bg-[#f97316]/10 border border-[#f97316]/20 hover:bg-[#f97316]/20 text-[#f97316] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Scan Salad (Good)
              </button>
              <button
                onClick={() => handleScanFood('burger')}
                className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Scan Burger (Caution)
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center relative">
            {/* Outer Interactive Mockup Frame */}
            <div className="w-[320px] h-[580px] bg-black rounded-[48px] border-8 border-gray-800 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col justify-between text-white font-sans">
              {/* Dynamic Camera Screen / Viewport */}
              <div className="h-2/5 bg-[#121316] relative flex items-center justify-center border-b border-white/5">
                {isScanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                    <div className="w-12 h-12 rounded-full border-4 border-t-[#f97316] border-white/10 animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-4 text-[#f97316]">Analyzing Macros...</span>
                  </div>
                ) : null}

                {scannedFood === 'salad' && (
                  <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
                    alt="Salad"
                    className="w-full h-full object-cover"
                  />
                )}
                {scannedFood === 'burger' && (
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80"
                    alt="Burger"
                    className="w-full h-full object-cover"
                  />
                )}
                {!scannedFood && !isScanning && (
                  <div className="text-center p-6 space-y-2">
                    <Smartphone className="w-8 h-8 text-gray-500 mx-auto" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Camera Viewport</p>
                    <p className="text-[9px] text-gray-500">Select an item on the left to simulate camera capture.</p>
                  </div>
                )}
              </div>

              {/* Analytical Output Details */}
              <div className="flex-1 bg-[#0c0f17] p-6 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {scannedFood ? (
                    <motion.div
                      key={scannedFood}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#f97316] uppercase tracking-wider">Health Rating</span>
                          <span className="text-xs font-mono font-bold text-white bg-[#f97316]/10 border border-[#f97316]/20 px-2 py-0.5 rounded">
                            {foodOptions[scannedFood as keyof typeof foodOptions].rating}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white">{foodOptions[scannedFood as keyof typeof foodOptions].name}</h4>
                      </div>

                      {/* Macronutrient breakdown */}
                      <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-white/5">
                        <div>
                          <span className="text-[8px] text-gray-500 block uppercase">Calories</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].calories}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 block uppercase">Protein</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].protein}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 block uppercase">Fat</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].fat}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 block uppercase">Carbs</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].carbs}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-500 uppercase font-bold block">Better Alternatives</span>
                        <p className="text-[10px] text-gray-300 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                          {foodOptions[scannedFood as keyof typeof foodOptions].alternatives}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Upload className="w-5 h-5 text-gray-500 animate-bounce" />
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Awaiting Scan Telemetry</span>
                      <p className="text-[9px] text-gray-500 max-w-[180px]">Run a camera simulation scan to visualize real-time macro analytics.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HEALTH TIMELINE */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Chronobiology</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Health Timeline Optimization</h2>
          <p className="text-sm text-gray-400">
            Interactive timeline mapping daily chronobiological events paired with context-sensitive AI recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Vertical timeline tab selector */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {Object.keys(timelineData).map((hourKey) => (
              <button
                key={hourKey}
                onClick={() => setActiveTimelineHour(hourKey)}
                className={`w-full text-left px-6 py-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${activeTimelineHour === hourKey
                  ? 'bg-[#f97316] border-[#f97316] text-white shadow-lg'
                  : 'bg-[#121316]/60 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                  }`}
              >
                <span>{hourKey}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Interactive display detail card */}
          <div className="lg:col-span-8 bg-[#121316]/60 border border-white/5 rounded-3xl p-8 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTimelineHour}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider block">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].title}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].action}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-extrabold">Active AI Suggestion</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed bg-white/5 border border-white/5 p-5 rounded-2xl">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].suggestion}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-6 border-t border-white/5 mt-8 flex justify-between items-center text-xs text-gray-500">
              <span>Chronobiological Sync Loop</span>
              <span>Event telemetry provided in real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* WEARABLE ECOSYSTEM CONNECTION GRAPH */}
      <section className="py-24 bg-[#0a0a0f] border-t border-white/5 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest block">Wearable Ecosystem</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              A united, synced ecosystem.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              GAMA coordinates with every major wearable and fit sensor. Our background synchronization pipeline processes biometric data streams dynamically to deliver unified telemetry.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Apple Watch', 'Fitbit', 'WHOOP', 'Garmin', 'Samsung Health'].map((device, idx) => (
                <span key={idx} className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/5 px-3 py-1 rounded-full uppercase">
                  {device}
                </span>
              ))}
            </div>
          </div>

          {/* Animated SVG Connection Graph */}
          <div className="lg:col-span-7 flex justify-center relative min-h-[350px]">
            <svg className="w-[300px] h-[300px]" viewBox="0 0 200 200">
              <defs>
                <radialGradient id="glow-svg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f0404ff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#d51515ff" stopOpacity="0" />
                </radialGradient>
                <clipPath id="logo-clip">
                  <circle cx="100" cy="100" r="21" />
                </clipPath>
              </defs>
              {/* Glow center */}
              <circle cx="100" cy="100" r="80" fill="url(#glow-svg)" />

              {/* Connection Lines */}
              <line x1="100" y1="100" x2="30" y2="60" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="170" y2="60" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="30" y2="140" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="170" y2="140" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="100" y2="25" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="100" y2="175" stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Pulsing Core */}
              <circle cx="100" cy="100" r="22" fill="#07090e" stroke="#000000ff" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="30" fill="transparent" stroke="#f97316" strokeWidth="1" className="animate-ping origin-center" style={{ transformOrigin: '100px 100px' }} />
              <image href="/logo.jpg" x="79" y="79" width="42" height="42" clipPath="url(#logo-clip)" />

              {/* Surrounding Nodes */}
              {/* Top Node (Apple Health) */}
              <circle cx="100" cy="25" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Right Top Node (Garmin) */}
              <circle cx="170" cy="60" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Right Bottom Node (Fitbit) */}
              <circle cx="170" cy="140" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Bottom Node (Samsung) */}
              <circle cx="100" cy="175" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Left Bottom Node (WHOOP) */}
              <circle cx="30" cy="140" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Left Top Node (Oura) */}
              <circle cx="30" cy="60" r="8" fill="#121316" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>
          </div>

        </div>
      </section>

      {/* SECURITY & PRIVACY */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Sovereign Encryption</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Military-Grade Security</h2>
          <p className="text-sm text-gray-400">
            We value privacy as a basic human right. Your biological data is fully sandboxed under your client-side keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Private AI Memory',
              description: 'AI model parameters reside in private sandbox runtimes. Your personal interactions are never utilized for global model updates.',
              icon: <Database className="w-5 h-5 text-[#f97316]" />
            },
            {
              title: 'GDPR Compliance',
              description: 'Exceeding standard European regulations. Absolute right-to-be-forgotten and portable clinical telemetry storage export loops.',
              icon: <Shield className="w-5 h-5 text-cyan-400" />
            },
            {
              title: 'HIPAA Ready Architecture',
              description: 'Secure clinical-grade storage servers built using strict verification processes to satisfy all healthcare integration guidelines.',
              icon: <Check className="w-5 h-5 text-emerald-400" />
            },
            {
              title: 'Client-Side Encryption',
              description: 'Biometric indicators are locked locally on your terminal device using cryptographic signature pipelines.',
              icon: <Shield className="w-5 h-5 text-purple-400" />
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-[#121316]/60 border border-white/5 p-6 rounded-3xl space-y-4 hover:border-[#f97316]/20 transition-colors"
            >
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
              <h3 className="font-bold text-white text-base">{card.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section id="pricing" className="py-24 bg-[#0a0a0f] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest">Pricing Plans</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Choose Your Access Level</h2>
            <p className="text-sm text-gray-400">
              Sovereign health intelligence tools tailored for everyday performance optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-black/40 border border-white/5 p-8 rounded-3xl flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Free Access</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                  <span className="text-xs text-gray-500">/ forever</span>
                </div>
                <p className="text-xs text-gray-400">Basic integration monitoring and biometric indicators logging.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-gray-300">
                  <li className="flex items-center gap-2">✓ 2 Wearable Connections</li>
                  <li className="flex items-center gap-2">✓ Basic Sleep & Recovery Logs</li>
                  <li className="flex items-center gap-2">✓ Limited AI Insights (1/day)</li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-center text-xs transition-all mt-8"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro Plan - Best Value */}
            <div className="bg-[#1c120c]/60 border border-[#f97316]/30 p-8 rounded-3xl flex flex-col justify-between min-h-[400px] relative shadow-[0_0_50px_rgba(249,115,22,0.05)]">
              <div className="absolute top-4 right-4 bg-[#f97316] text-white text-[8px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
                Recommended
              </div>
              <div className="space-y-4">
                <span className="text-[10px] text-[#f97316] uppercase font-bold tracking-wider">Pro Core</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">999 INR</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <p className="text-xs text-gray-400">Full AI health panel access, chronobiological schedules, and deep scans.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-gray-200">
                  <li className="flex items-center gap-2">✓ Unlimited Wearable Syncing</li>
                  <li className="flex items-center gap-2">✓ Six Specialized AI Coaches</li>
                  <li className="flex items-center gap-2">✓ Unlimited AI Food Scanning</li>
                  <li className="flex items-center gap-2">✓ Dynamic Chronobiological Sync</li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl text-center text-xs transition-all mt-8 shadow-lg shadow-[#f97316]/20"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-black/40 border border-white/5 p-8 rounded-3xl flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Enterprise Elite</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-xs text-gray-400">Tailored corporate healthcare platforms and clinical consulting pipelines.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-gray-300">
                  <li className="flex items-center gap-2">✓ Custom API & Telemetry Hooks</li>
                  <li className="flex items-center gap-2">✓ 1-on-1 Certified Medical Coaches</li>
                  <li className="flex items-center gap-2">✓ Private Sandboxed Cloud Cluster</li>
                </ul>
              </div>
              <button
                onClick={() => toast.success('Connecting to custom consulting team...')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-xs transition-all mt-8"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COOL FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center">
                <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-white">GAMA</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Sovereign biological diagnostic dashboard and epigenetic modeling coordinate framework.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/twin" className="hover:text-white transition-colors">Digital Twin</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Insights</Link></li>
              <li><Link href="/vault" className="hover:text-white transition-colors">Secure Vault</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Connect</h5>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                {/* Twitter SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {/* Github SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {/* Youtube SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            © 2026 GAMA. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Marquee Animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 25s linear infinite;
        }
      `}</style>


    <div className="min-h-screen bg-[#1c1d1f] text-[#f3f4f6] font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-white relative">
      {/* Dynamic background atmospheric warm glows */}
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-[#ef4444]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-[#f59e0b]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <img src="/logo.jpg" alt="GAMA Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">GAMA</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#hero" className="hover:text-white transition-colors">Hero</a>
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#consulting" className="hover:text-white transition-colors">Consulting</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white hover:bg-white/95 text-black font-semibold rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO SECTION */}
      <section id="hero" className="min-h-screen relative flex items-center pt-24 overflow-hidden justify-center text-center">
        {/* Background Video Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: -1 }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
          >
            <source src="/fitness-track-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-transparent via-[#1c1d1f]/80 to-[#1c1d1f]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 w-full relative z-10 py-12 flex flex-col items-center justify-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-400/20 text-[10px] font-bold text-amber-500 rounded-full uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Intelligence Shell Synchronized
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight max-w-3xl">
              Precision Health for Peak <span className="text-amber-500">Longevity</span>
            </h1>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-xl">
              Experience GAMA's biometric security framework. Synchronizing epigenetic feedback loops, autonomic resonance profiling, and secure clinical records inside a state-of-the-art biological dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                href="/login"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl text-sm shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                Enter Portal
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#vision"
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VISION OF GAMA */}
      <section id="vision" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Vision</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">The Epigenetic Architecture</h2>
          <p className="text-sm text-gray-400">
            We merge diagnostic precision with decentralized cloud privacy, giving you ultimate sovereign control over your diagnostic telemetry.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row justify-center items-center">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-black transition-colors hover:bg-white/90 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-white/10 px-5 transition-colors hover:bg-white/5 md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </section>
 develop
    </div>
  );
}
