'use client';

import { Suspense, useEffect, useState, useRef } from "react";
import { Plus, Activity, Smartphone, Wifi, BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import ConnectedDevices from "./components/ConnectedDevices";
import SyncCenter from "./components/SyncCenter";
import AuraAIPanel from "./components/AuraAIPanel";
import ConnectNewDevice from "./components/ConnectNewDevice";

// Subtle entry animation for the entire page
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
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 1 }
  }
};

export default function DevicesHubClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax effect for the hero background
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-12 pb-32 w-full relative min-h-screen">

      {/* Premium Immersive Background - Gradient Mesh, Noise, Blur */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#070709]">
        {/* Dynamic Light Blooms matching GAMA core */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

        {/* Subtle Glass Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />

        {/* Depth gradient to ground the UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex flex-col gap-12 z-10"
      >
        {/* Cinematic Hero Section */}
        <motion.div
          style={{ y: yHero, opacity: opacityHero }}
          className="relative pt-16 pb-8 flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Gama paired Active</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-sm mb-6">
            Devices Hub
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-300/80 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Connect every wearable. Monitor everything. One intelligent health ecosystem synchronized in real-time.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-slate-200">5 Metrics Live</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-200">2 Devices Connected</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <Wifi className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-200">Optimal Signal</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Section Header for Ecosystem */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 px-4 lg:px-8">
          <div>
            <h2 className="text-2xl font-display font-medium tracking-tight text-white drop-shadow-md">
              Your Ecosystem
            </h2>
          </div>
          <Button
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md text-white rounded-full px-6 transition-all duration-300 h-12 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="font-medium">Connect Device</span>
          </Button>
        </motion.div>

        {/* Core Devices Grid */}
        <motion.div variants={itemVariants} className="w-full relative px-4 lg:px-8">
          <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
            <ConnectedDevices />
          </Suspense>
        </motion.div>

        {/* Advanced Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 px-4 lg:px-8">
          {/* AI Insights Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
              <AuraAIPanel />
            </Suspense>
          </motion.div>

          {/* Sync Center */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
              <SyncCenter />
            </Suspense>
          </motion.div>
        </div>

        {/* Device Discovery Modal */}
        <AnimatePresence>
          {isConnectModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-[#070709] overflow-y-auto"
            >
              <div className="min-h-screen p-4 lg:p-8 flex flex-col max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 pt-4">
                  <div>
                    <h2 className="text-3xl font-display font-medium tracking-tight text-white drop-shadow-md">
                      Connect New Device
                    </h2>
                    <p className="text-slate-400 mt-1">Select a wearable or medical device to add to your ecosystem</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsConnectModalOpen(false)}
                    className="rounded-full hover:bg-white/10 text-white"
                  >
                    Close
                  </Button>
                </div>
                
                <Suspense fallback={<div className="h-[500px] rounded-3xl bg-white/5 animate-pulse" />}>
                  <ConnectNewDevice onCompleteAction={() => setIsConnectModalOpen(false)} />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
