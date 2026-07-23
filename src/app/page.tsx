'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Heart, Shield, Calendar, Users, ChevronRight,
  ArrowRight, Globe, Check, Activity, Zap,
  Moon, Flame, Brain, BookOpen, Compass, Upload,
  Plus, CircleDot, Database, FileText, Smartphone, AlertCircle, Sliders,
  Apple, Utensils, Droplets
} from 'lucide-react';
const HealthOrb3D = dynamic(() => import('@/components/shared/health-orb-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[600px] relative flex items-center justify-center bg-transparent">
      <div className="h-48 w-48 rounded-full bg-cyan-500/10 animate-pulse blur-xl" />
    </div>
  ),
});


export default function HomePage() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30; // max shift
      const y = (clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#070709] text-[white] font-sans overflow-x-hidden selection:bg-white/20 selection:text-white relative">

      {/* Atmospheric Background Mesh Glows */}
      <div className="absolute inset-0 bg-[#070709] z-0 overflow-hidden pointer-events-none">
        {/* Soft ambient lighting */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-white/5 blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#0a84ff]/5 blur-[120px]" />
        {/* Subtle vignette layer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(7,7,9,0.95)_100%)]" />
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* TOP NAVIGATION BAR */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 border border-white/10 bg-black/45 backdrop-blur-md rounded-full px-8 py-3 flex justify-between items-center shadow-2xl shadow-black/40 hover:border-white/20 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center cursor-pointer"
          >
            <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-extrabold text-xl tracking-wider text-white">GAMA</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          <a href="#why-gama" className="hover:text-white transition-all duration-200">Overview</a>
          <a href="#dashboard" className="hover:text-white transition-all duration-200">Dashboard</a>
          <a href="#food-scanner" className="hover:text-white transition-all duration-200">Food Scanner</a>
          <a href="#pricing" className="hover:text-white transition-all duration-200">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-white hover:bg-white/95 text-black font-semibold rounded-full text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 duration-200"
          >
            Start Free
          </Link>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-screen relative flex items-center justify-center pt-28 pb-16 overflow-hidden z-10">

        {/* Ambient Neural Dots & Connection Lines Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-white text-black font-semibold rounded-full animate-ping duration-1000" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white text-black font-semibold rounded-full animate-ping duration-700" />
        </div>

        {/* Background Image of Athlete with Scale & Mouse Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/20 to-[#070709] z-10" />
          <motion.img
            src="/hero-athlete.png"
            alt="Athlete Hero"
            initial={{ scale: 1.08, opacity: 0.8 }}
            animate={{
              scale: 1.02,
              opacity: 1,
              x: mousePos.x * 0.4,
              y: mousePos.y * 0.4
            }}
            transition={{
              scale: { duration: 2.2, ease: 'easeOut' },
              opacity: { duration: 1.8 },
              x: { type: 'spring', stiffness: 50, damping: 20 },
              y: { type: 'spring', stiffness: 50, damping: 20 }
            }}
            className="w-full h-full object-cover max-w-7xl mx-auto translate-y-21"
          />
        </div>

        {/* Hero Content Container with Opposite Parallax */}
        <div className="max-w-4xl mx-auto px-6 w-full relative z-20 mt-16">
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Headline and Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2
                  }
                }
              }}
              style={{
                x: mousePos.x * -0.2,
                y: mousePos.y * -0.2
              }}
              className="flex flex-col items-center space-y-6 text-center"
            >
              {/* Ambient Label Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a84ff]/10 border border-[#0a84ff]/30 rounded-full backdrop-blur-md shadow-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] text-black font-semibold animate-pulse" />
                <span className="text-[9px] font-black text-[#00f0ff] uppercase tracking-[0.2em]">AURA HEALTH OS v6.0</span>
              </motion.div>

              {/* Apple-Level Headline */}
              <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] text-white flex flex-col items-center">
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 35 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
                  }}
                  className="font-light text-white font-sans"
                >
                  Your Autonomous
                </motion.span>
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 35 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
                  }}
                  className="font-black bg-gradient-to-r from-[#00f0ff] via-[#0a84ff] to-[#3b82f6] bg-clip-text text-transparent mt-1 block"
                >
                  Bio-Intelligence
                </motion.span>
              </h1>

              {/* Subtext Description */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="text-neutral-400 max-w-[620px] text-sm md:text-base font-medium leading-[1.6]"
              >
                Connect your wearables, analyze biometrics in real-time, and let AURA optimize your health, schedule, nutrition, and recovery — automatically.
              </motion.p>

              {/* Premium CTA Buttons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="flex flex-row items-center gap-4 pt-2 justify-center"
              >
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-semibold rounded-full text-xs shadow-[0_8px_30px_rgba(10,132,255,0.25)] hover:shadow-[0_8px_30px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>Initialize GAMA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href="#why-gama"
                  className="px-6 py-3 bg-transparent hover:bg-white/5 border border-[#0a84ff] text-white hover:text-white font-semibold rounded-full text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <span>Explore Ecosystem</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>

              {/* Feature Row with Icons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-white/5 w-full max-w-2xl text-[10px] text-neutral-400 font-bold uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#00f0ff]" />
                  <span>AI Health Coach</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00f0ff]" />
                  <span>Digital Twin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00f0ff]" />
                  <span>Predictive Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00f0ff]" />
                  <span>Real-time Optimization</span>
                </div>
              </motion.div>

              {/* Muted Brand Logos */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 0.4, transition: { delay: 0.8 } }
                }}
                className="pt-10 flex flex-col items-center gap-2"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">TRUSTED BY THOUSANDS</span>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-black text-white/60 tracking-wider">
                  <span>FORBES</span>
                  <span>TECHCRUNCH</span>
                  <span>THE VERGE</span>
                  <span>WIRED</span>
                  <span>BUSINESS INSIDER</span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll to explore bottom indicator */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">Scroll to explore</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 animate-bounce">
            <ArrowRight className="w-3.5 h-3.5 transform rotate-90" />
          </div>
        </div>
      </section>

      {/* TRUSTED INTEGRATIONS */}
      <section className="py-12 border-y border-white/10 bg-[#070709]/40 backdrop-blur-md relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6">
            Trusted Wearables & Ecosystem Integrations
          </p>
          <div className="relative w-full flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-16 py-2 items-center pr-16">
              {['Apple Health', 'Google Fit', 'Fitbit', 'WHOOP', 'Garmin', 'Oura', 'Samsung Health'].map((logo, idx) => (
                <span key={idx} className="text-lg md:text-xl font-extrabold tracking-tight text-white/40 hover:text-white transition-colors uppercase select-none">
                  {logo}
                </span>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 py-2 items-center pr-16">
              {['Apple Health', 'Google Fit', 'Fitbit', 'WHOOP', 'Garmin', 'Oura', 'Samsung Health'].map((logo, idx) => (
                <span key={idx} className="text-lg md:text-xl font-extrabold tracking-tight text-white/40 hover:text-white transition-colors uppercase select-none">
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
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Why GAMA</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Beyond Passive Tracking</h2>
          <p className="text-sm text-white/60">
            Traditional health apps tell you what happened. GAMA understands your physiology to shape what you do next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Traditional Health Apps */}
          <div className="md:col-span-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white/50 uppercase tracking-wider">Traditional Apps</h3>
              <ul className="space-y-4">
                {['Track Static Data Only', 'Manual Calorie Estimation', 'Endless Manual Input Logging', 'Static Weekly Reports', 'Generic One-Size-Fits-All Advice'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-white/50">
                    <span className="text-white">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 border-t border-white/10 mt-8 text-xs text-white/40">
              Passively logs metrics without offering actionable steps.
            </div>
          </div>

          {/* VS Divider */}
          <div className="hidden md:flex md:col-span-2 items-center justify-center">
            <span className="w-10 h-10 rounded-full border border-white/10 bg-[#070709] flex items-center justify-center text-xs font-bold text-white/50">VS</span>
          </div>

          {/* GAMA */}
          <div className="md:col-span-5 bg-white/5 backdrop-blur-2xl border border-[#0a84ff]/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(10, 132, 255,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0a84ff]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#0a84ff] uppercase tracking-wider">GAMA</h3>
              <ul className="space-y-4">
                {['AI Comprehends Wearable Signals', 'Predictive Biomarker Forecasting', 'Proactive Personal Bio-Coach', 'Intelligently Learns Daily Habits', 'Actionable Micro-Decision Prompts'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-[#0a84ff] font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 border-t border-[#0a84ff]/10 mt-8 text-xs text-[#0a84ff]">
              Continuously processes data loops to guide daily recovery.
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH INTELLIGENCE DASHBOARD PREVIEW */}
      <section id="dashboard" className="py-24 bg-[#070709]/50 border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Dashboard Preview</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Sovereign Health Intelligence</h2>
            <p className="text-sm text-white/60">
              A comprehensive bio-telemetry command center rendering your vital signals in real-time.
            </p>
          </div>

          {/* Dashboard Preview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Score - Large Card */}
            <div className="md:col-span-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[350px] relative shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#0a84ff] uppercase tracking-wider">Metabolic Health Score</span>
                <span className="text-xs text-white bg-white/5 px-2 py-0.5 rounded-md font-mono">+4.2% this week</span>
              </div>
 
              <div className="my-6 flex items-baseline gap-4">
                <span className="text-5xl md:text-7xl font-extrabold text-white">96</span>
                <div>
                  <span className="text-base font-bold text-white block">Excellent Status</span>
                  <span className="text-xs text-white/50">Optimum endocrine and autonomic balance</span>
                </div>
              </div>
 
              {/* Mini Weekly Sparkline graph in SVG */}
              <div className="w-full h-24 mt-4">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-sparkline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0a84ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q30,70 60,75 T120,40 T180,60 T240,30 T300,45 T360,20 T400,10 L400,100 L0,100 Z"
                    fill="url(#gradient-sparkline)"
                  />
                  <path
                    d="M0,80 Q30,70 60,75 T120,40 T180,60 T240,30 T300,45 T360,20 T400,10"
                    fill="none"
                    stroke="#0a84ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
 
            {/* Quick Metrics Column */}
            <div className="md:col-span-4 grid grid-cols-1 gap-6">
              {/* Sleep Score Ring */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Sleep</span>
                  <h4 className="text-xl font-bold text-white">8h 42m</h4>
                  <p className="text-xs text-white/60">92% Deep Sleep Ratio</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" stroke="#0a84ff" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset="25" />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">92</span>
                </div>
              </div>
 
              {/* Stress Level Tracker */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Stress (HRV)</span>
                  <h4 className="text-xl font-bold text-white">Low Vagal Tone</h4>
                  <p className="text-xs text-[#0a84ff]">Relaxation Activated</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">12</span>
                  <span className="text-xs text-white/50 block">HRV Index</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET YOUR AI HEALTH TEAM */}
      <section id="ai-team" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Coaching Sandbox</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Meet Your AI Health Team</h2>
          <p className="text-sm text-white/60">
            A panel of specialized deep learning models tailored to coordinate separate domains of your daily biology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Nutrition AI',
              description: 'Examines food profiles, tracks nutrient loads, and optimizes metabolic energy levels throughout the day.',
              icon: <Flame className="w-6 h-6 text-[#0a84ff]" />,
              glow: 'hover:border-[#0a84ff]/30 hover:shadow-[0_0_30px_rgba(10, 132, 255,0.05)]'
            },
            {
              title: 'Workout AI',
              description: 'Formulates adaptive strength and cardiovascular targets based on current autonomic base readings.',
              icon: <Activity className="w-6 h-6 text-white" />,
              glow: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            },
            {
              title: 'Recovery AI',
              description: 'Monitors HRV balance, oxygen saturation, and body temperature to prevent athletic overtraining.',
              icon: <Zap className="w-6 h-6 text-white" />,
              glow: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            },
            {
              title: 'Sleep AI',
              description: 'Analyzes circadian rhythm shifts, bedroom temperatures, and sleep cycle states to build perfect sleep hygiene.',
              icon: <Moon className="w-6 h-6 text-white" />,
              glow: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            },
            {
              title: 'Mental Wellness AI',
              description: 'Supports focus tracking, schedules parasympathetic breathing sessions, and manages neural recovery cycles.',
              icon: <Brain className="w-6 h-6 text-white" />,
              glow: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            },
            {
              title: 'Medical Report AI',
              description: 'Deciphers complex biomarker results and lipid panels to summarize critical markers into simple concepts.',
              icon: <FileText className="w-6 h-6 text-white" />,
              glow: 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] space-y-6 shadow-xl flex flex-col justify-between min-h-[250px] transition-all duration-300 ${card.glow}`}
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                {card.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* AI FOOD SCANNER */}
      <section id="food-scanner" className="py-24 bg-[#070709]/50 border-t border-white/10 backdrop-blur-xl relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
 
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">AI Food Scanner</span>
            <h2 className="text-5xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Instantly scan and analyze nutrients.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Snap a picture of any meal. GAMA&apos;s deep-vision parser instantly structures calories, macros, micro-nutrients, and offers suggestions to optimize blood-glucose stability.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => handleScanFood('salad')}
                className="px-5 py-3 bg-[#0a84ff]/10 border border-[#0a84ff]/20 hover:bg-[#0a84ff]/20 text-[#0a84ff] font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
            <div className="w-[320px] h-[580px] bg-[#070709] rounded-[48px] border-8 border-neutral-800 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden relative flex flex-col justify-between text-white font-sans">
              {/* Dynamic Camera Screen / Viewport */}
              <div className="h-2/5 bg-[#070709] relative flex items-center justify-center border-b border-white/10">
                {isScanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                    <div className="w-12 h-12 rounded-full border-4 border-t-[#0a84ff] border-white/10 animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-4 text-[#0a84ff]">Analyzing Macros...</span>
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
                    <Smartphone className="w-8 h-8 text-white/50 mx-auto" />
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Camera Viewport</p>
                    <p className="text-[9px] text-white/50">Select an item on the left to simulate camera capture.</p>
                  </div>
                )}
              </div>

              {/* Analytical Output Details */}
              <div className="flex-1 bg-[#070709] p-6 flex flex-col justify-between">
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
                          <span className="text-[9px] font-bold text-[#0a84ff] uppercase tracking-wider">Health Rating</span>
                          <span className="text-xs font-mono font-bold text-white bg-[#0a84ff]/10 border border-[#0a84ff]/20 px-2 py-0.5 rounded">
                            {foodOptions[scannedFood as keyof typeof foodOptions].rating}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white">{foodOptions[scannedFood as keyof typeof foodOptions].name}</h4>
                      </div>

                      {/* Macronutrient breakdown */}
                      <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-white/5">
                        <div>
                          <span className="text-[8px] text-white/50 block uppercase">Calories</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].calories}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-white/50 block uppercase">Protein</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].protein}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-white/50 block uppercase">Fat</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].fat}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-white/50 block uppercase">Carbs</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {foodOptions[scannedFood as keyof typeof foodOptions].carbs}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] text-white/50 uppercase font-bold block">Better Alternatives</span>
                        <p className="text-[10px] text-white/70 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                          {foodOptions[scannedFood as keyof typeof foodOptions].alternatives}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Upload className="w-5 h-5 text-white/50 animate-bounce" />
                      </div>
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Awaiting Scan Telemetry</span>
                      <p className="text-[9px] text-white/50 max-w-[180px]">Run a camera simulation scan to visualize real-time macro analytics.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HEALTH TIMELINE */}
      <section id="chronobiology" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Chronobiology</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Health Timeline Optimization</h2>
          <p className="text-sm text-white/60">
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
                  ? 'bg-gradient-to-r from-[#0a84ff]/25 to-[#0071e3]/15 border-[#0a84ff]/40 text-white shadow-lg shadow-[#0a84ff]/5'
                  : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 text-white/60 hover:text-white'
                  }`}
              >
                <span>{hourKey}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Interactive display detail card */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 min-h-[300px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

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
                  <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-wider block">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].title}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].action}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-white text-black font-semibold animate-pulse" />
                    <span className="text-[10px] text-white uppercase tracking-widest font-extrabold">Active AI Suggestion</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed bg-white/5 border border-white/10 p-5 rounded-2xl">
                    {timelineData[activeTimelineHour as keyof typeof timelineData].suggestion}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-6 border-t border-white/10 mt-8 flex justify-between items-center text-xs text-white/50">
              <span>Chronobiological Sync Loop</span>
              <span>Event Telemetry provided in real-time</span>
            </div>
          </div>
        </div>
      </section>


      {/* AI HEALTH OVERVIEW */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">AI Health Overview</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Your Core Health Score</h2>
          <p className="text-sm text-white/60">
            A real-time evaluation of your cardiovascular, metabolic, sleep and autonomic biometrics combined into a single unified health status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">AI Health Score</span>
              <h3 className="text-2xl font-bold text-white">96 / 100</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Your biological systems are running at near-optimum performance. Excellent endocrine indicators and stable blood glucose signals detected.
              </p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0a84ff] h-full w-[96%]" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">Recovery Score</span>
              <h3 className="text-2xl font-bold text-white">88% (Optimal)</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Autonomic signals indicate balanced vagal tone and heart rate variability (HRV) metrics. Ready for normal training load today.
              </p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0a84ff] h-full w-[88%]" />
            </div>
          </div>
        </div>
      </section>

      {/* AI HEALTH COPILOT & REAL-TIME MEMORY PREVIEW */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">AI Health Copilot</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              An intelligent conversation with your biology.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Meet GAMA's conversational copilot. It maintains a secure, client-side personal health memory, tracking details of your historical responses to build personalized biosketches.
            </p>
            <div className="space-y-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="text-xs text-neutral-300 font-mono">User Memory Context Active:</div>
              <p className="text-xs text-white/70 leading-relaxed">
                • Diet: Plant-Based / High Fiber<br />
                • Circadian Sleep Schedule: 10:30 PM - 6:30 AM<br />
                • Activity Type: Strength & Zone 2 Endurance training
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold">A</div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">GAMA Biometric AI</h4>
                  <span className="text-[9px] text-neutral-400">Response Generated Just Now</span>
                </div>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                "Good morning! Based on your 10:30 PM wind-down log and Oura ring telemetry, your deep sleep state lasted 2h 10m. Cortisol curves look normal. Let's start with a high-protein mineral intake before Zone 2 output."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECOVERY INTELLIGENCE & INSIGHTS */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Recovery & Insights</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Personalized Health Insights</h2>
          <p className="text-sm text-white/60">
            Intelligent analysis of your active telemetry, generating critical biophysical suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl">
            <span className="text-[9px] font-bold text-[#0a84ff] uppercase tracking-widest">Metabolic curve</span>
            <h4 className="text-base font-bold text-white">Glucose Stability Alert</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Post-lunch glucose peak offset by 1500-step activity window. Circadian synchronization loops locked.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl">
            <span className="text-[9px] font-bold text-[#0a84ff] uppercase tracking-widest">Circadian curve</span>
            <h4 className="text-base font-bold text-white">Optimal Melatonin Window</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Ideal dim-lighting schedule starts at 09:30 PM to trigger normal parasympathetic autonomic transitions.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl">
            <span className="text-[9px] font-bold text-[#0a84ff] uppercase tracking-widest">Cardiovascular health</span>
            <h4 className="text-base font-bold text-white">Vagal Tone Synced</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              HRV index registers positive 4.2% weekly increase. Restoring cardiovascular base resilience.
            </p>
          </div>
        </div>
      </section>

      {/* SMART HEALTH REPORTS & DIGITAL TWIN */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] space-y-6 shadow-2xl">
              <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">Digital Twin Telemetry</span>
              <div className="w-full h-44 border border-white/10 bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent" />
                <div className="w-20 h-20 rounded-full border border-white/10 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-white font-mono">Twin Synced</span>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Your digital twin maps real-time dynamic biomarkers to simulate recovery outcomes under various physical and cognitive stress events.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">Clinical Reports</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Smart Clinical Health Summaries.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Upload blood biomarker profiles or lipid panels. Our clinical parser structures key metrics, tracking historical changes across your digital twin.
            </p>
            <ul className="space-y-2 text-xs text-white/60">
              <li className="flex items-center gap-2">✓ Automated PDF & Clinical blood report parsing</li>
              <li className="flex items-center gap-2">✓ Summarized key warning levels (cholesterol, glucose, lipid balance)</li>
              <li className="flex items-center gap-2">✓ Dynamic integration with secure health record database</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WEARABLE ECOSYSTEM CONNECTION GRAPH */}
      <section className="py-24 bg-[#070709]/50 border-t border-white/10 backdrop-blur-xl relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest block">Wearable Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              A united, synced ecosystem.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              GAMA coordinates with every major wearable and fit sensor. Our background synchronization pipeline processes biometric data streams dynamically to deliver unified telemetry.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Apple Watch', 'Fitbit', 'WHOOP', 'Garmin', 'Samsung Health'].map((device, idx) => (
                <span key={idx} className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase">
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
                  <stop offset="0%" stopColor="rgba(0,0,0,0.15)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <clipPath id="logo-clip">
                  <circle cx="100" cy="100" r="21" />
                </clipPath>
              </defs>
              {/* Glow center */}
              <circle cx="100" cy="100" r="80" fill="url(#glow-svg)" />

              {/* Connection Lines */}
              <line x1="100" y1="100" x2="30" y2="60" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="170" y2="60" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="30" y2="140" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="170" y2="140" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="100" y2="25" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="100" x2="100" y2="175" stroke="rgba(10, 132, 255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Pulsing Core */}
              <circle cx="100" cy="100" r="22" fill="#070709" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="30" fill="transparent" stroke="#0a84ff" strokeWidth="1" className="animate-ping origin-center" style={{ transformOrigin: '100px 100px' }} />
              <image href="/logo.jpg" x="79" y="79" width="42" height="42" clipPath="url(#logo-clip)" />

              {/* Surrounding Nodes */}
              {/* Top Node (Apple Health) */}
              <circle cx="100" cy="25" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Right Top Node (Garmin) */}
              <circle cx="170" cy="60" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Right Bottom Node (Fitbit) */}
              <circle cx="170" cy="140" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Bottom Node (Samsung) */}
              <circle cx="100" cy="175" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Left Bottom Node (WHOOP) */}
              <circle cx="30" cy="140" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Left Top Node (Oura) */}
              <circle cx="30" cy="60" r="8" fill="#070709" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>
          </div>

        </div>
      </section>

      {/* SECURITY & PRIVACY */}
      <section id="encryption" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Sovereign Encryption</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Military-Grade Security</h2>
          <p className="text-sm text-white/60">
            We value privacy as a basic human right. Your biological data is fully sandboxed under your client-side keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Private AI Memory',
              description: 'AI model parameters reside in private sandbox runtimes. Your personal interactions are never utilized for global model updates.',
              icon: <Database className="w-5 h-5 text-[#0a84ff]" />
            },
            {
              title: 'GDPR Compliance',
              description: 'Exceeding standard European regulations. Absolute right-to-be-forgotten and portable clinical telemetry storage export loops.',
              icon: <Shield className="w-5 h-5 text-white" />
            },
            {
              title: 'HIPAA Ready Architecture',
              description: 'Secure clinical-grade storage servers built using strict verification processes to satisfy all healthcare integration guidelines.',
              icon: <Check className="w-5 h-5 text-white" />
            },
            {
              title: 'Client-Side Encryption',
              description: 'Biometric indicators are locked locally on your terminal device using cryptographic signature pipelines.',
              icon: <Shield className="w-5 h-5 text-white" />
            }
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl space-y-4 hover:border-[#0a84ff]/30 transition-colors shadow-2xl"
            >
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
              <h3 className="font-bold text-white text-base">{card.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section id="pricing" className="py-24 bg-[#070709]/50 border-t border-white/10 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold text-[#0a84ff] uppercase tracking-widest">Pricing Plans</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Choose Your Access Level</h2>
            <p className="text-sm text-white/60">
              Sovereign health intelligence tools tailored for everyday performance optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between min-h-[400px] shadow-2xl">
              <div className="space-y-4">
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Free Access</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                  <span className="text-xs text-white/50">/ forever</span>
                </div>
                <p className="text-xs text-white/60">Basic integration monitoring and biometric indicators logging.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-white/70">
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
            <div className="bg-white/5 backdrop-blur-2xl border border-[#0a84ff]/30 p-8 rounded-3xl flex flex-col justify-between min-h-[400px] relative shadow-[0_0_50px_rgba(10, 132, 255,0.08)]">
              <div className="absolute top-4 right-4 bg-[#0a84ff] text-white text-[8px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
                Recommended
              </div>
              <div className="space-y-4">
                <span className="text-[10px] text-[#0a84ff] uppercase font-bold tracking-wider">Pro Core</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">999 INR</span>
                  <span className="text-xs text-white/50">/ month</span>
                </div>
                <p className="text-xs text-white/60">Full AI health panel access, chronobiological schedules, and deep scans.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-white/50">
                  <li className="flex items-center gap-2">✓ Unlimited Wearable Syncing</li>
                  <li className="flex items-center gap-2">✓ Six Specialized AI Coaches</li>
                  <li className="flex items-center gap-2">✓ Unlimited AI Food Scanning</li>
                  <li className="flex items-center gap-2">✓ Dynamic Chronobiological Sync</li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-[#0a84ff] hover:bg-[#0071e3] text-white font-semibold rounded-xl text-center text-xs transition-all mt-8 shadow-lg shadow-[#0a84ff]/20"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between min-h-[400px] shadow-2xl">
              <div className="space-y-4">
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Enterprise Elite</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-xs text-white/60">Tailored corporate healthcare platforms and clinical consulting pipelines.</p>
                <ul className="space-y-2.5 pt-4 text-xs text-white/70">
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
      <footer className="border-t border-white/10 bg-[#070709]/60 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center">
                <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-white">GAMA</span>
            </div>
            <p className="text-xs text-white/65 leading-relaxed max-w-sm">
              AI-native personal health intelligence, continuously learning, predicting, and optimizing every day.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Platform</h5>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/twin" className="hover:text-white transition-colors">Digital Twin</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Insights</Link></li>
              <li><Link href="/vault" className="hover:text-white transition-colors">Secure Vault</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Connect</h5>
            <div className="flex gap-4 text-white/60">
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

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
            © 2026 GAMA. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-white/50 font-bold uppercase tracking-wider">
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

    </div>
  );
}
