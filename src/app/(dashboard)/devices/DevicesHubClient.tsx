'use client';

import { Suspense, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import HealthOverview from "./components/HealthOverview";
import ConnectedDevices from "./components/ConnectedDevices";
import LiveMetrics from "./components/LiveMetrics";
import SyncCenter from "./components/SyncCenter";
import AuraAIPanel from "./components/AuraAIPanel";
import ConnectNewDevice from "./components/ConnectNewDevice";

// Subtle entry animation for the entire page
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};

export default function DevicesHubClient() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch for heavy client animations

  return (
    <motion.div 
      className="flex flex-col gap-8 pb-24 w-full relative min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Premium Multi-layer Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Dynamic Light Bloom & Gradient Mesh */}
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-sky-900/10 blur-[120px] rounded-full mix-blend-screen opacity-60 animate-pulse-slow" />
        <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-20 w-[700px] h-[700px] bg-indigo-900/10 blur-[150px] rounded-full mix-blend-screen opacity-40" />
        
        {/* Glass Noise Texture Overlay (subtle) */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
        
        {/* Depth gradient to fade out bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <motion.div variants={itemVariants}>
        <Suspense fallback={<div className="h-64 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <HealthOverview />
        </Suspense>
      </motion.div>

      {/* Devices Hub Section Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8">
        <div>
          <h2 className="text-3xl font-display font-medium tracking-tight text-white drop-shadow-md">
            Devices Hub
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Connect, sync and monitor all your health devices in real-time.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-white rounded-full px-6 transition-all duration-300 h-11"
        >
          <Plus className="w-4 h-4 mr-2 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Connect New Device</span>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full relative">
        <Suspense fallback={<div className="h-72 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <ConnectedDevices />
        </Suspense>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Suspense fallback={<div className="h-40 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <LiveMetrics />
        </Suspense>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Suspense fallback={<div className="h-96 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <SyncCenter />
        </Suspense>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Suspense fallback={<div className="h-40 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <AuraAIPanel />
        </Suspense>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-4">
        <Suspense fallback={<div className="h-96 glass-panel rounded-3xl animate-pulse bg-white/5" />}>
          <ConnectNewDevice />
        </Suspense>
      </motion.div>

    </motion.div>
  );
}
