'use client';

import { Suspense, useEffect, useState, useRef } from "react";
import { Search, Flame, Droplets, MapPin, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from 'sonner';

import HeroDashboard from "./HeroDashboard";
import GPSPanel from "./GPSPanel";
import IntelligentSearch from "./IntelligentSearch";
import DiscoverGrid from "./DiscoverGrid";
import OrderComparisonModal from "./OrderComparisonModal";

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

export default function LiveOrderClient() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax effect for the hero background
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 800], [0, 1]);
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Active Query State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Data State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  
  // Modals
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery !== "") {
      fetchData(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchData = async (query = "") => {
    try {
      const qParam = query ? `&query=${encodeURIComponent(query)}` : '';
      
      const [recRes, restRes, discoverRes] = await Promise.all([
        fetch(`/api/live-order/recommend?profileId=demo-profile`),
        fetch(`/api/live-order/restaurants?lat=12.9716&lng=77.5946${qParam}`),
        fetch(`/api/live-order/discover?${qParam}`)
      ]);

      const [recJson, restJson, discoverJson] = await Promise.all([
        recRes.json(),
        restRes.json(),
        discoverRes.json()
      ]);

      if (recJson.success) setRecommendations(recJson.data);
      if (restJson.success) setRestaurants(restJson.data);
      if (discoverJson.success) setMeals(discoverJson.data);
    } catch (error) {
      console.error("Failed to load Live Order data:", error);
      toast.error("Failed to sync AI nutrition data.");
    }
  };

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-12 pb-32 w-full relative min-h-screen font-sans text-[#eae3dc]">

      {/* Premium Immersive Background - Gradient Mesh, Noise, Blur */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#070709]">
        {/* Dynamic Light Blooms matching GAMA core (using Live Order Amber/Emerald tones) */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0" />
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-medium text-amber-400 tracking-wide uppercase">Aura Nutrition Sync</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-sm mb-6">
            Healthy Discovery
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-300/80 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Precision eating engineered for your biology. Discover meals that perfectly match your real-time biometric state.
          </motion.p>
        </motion.div>

        {/* Personalized AI Hero Panel */}
        <motion.div variants={itemVariants} className="w-full relative px-4 lg:px-8">
          <Suspense fallback={<div className="h-48 rounded-3xl bg-white/5 animate-pulse" />}>
            <HeroDashboard recommendations={recommendations} />
          </Suspense>
        </motion.div>

        {/* Search & GPS Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 px-4 lg:px-8">
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-32 rounded-3xl bg-white/5 animate-pulse" />}>
              <IntelligentSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </Suspense>
            
            <div className="mt-8">
              <h2 className="text-2xl font-display font-medium tracking-tight text-white drop-shadow-md mb-6">
                Recommended For You
              </h2>
              <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
                <DiscoverGrid meals={meals} onSelectMeal={setSelectedMeal} />
              </Suspense>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
              <GPSPanel restaurants={restaurants} />
            </Suspense>
          </div>
        </motion.div>

      </motion.div>
      
      {/* Modals */}
      {showComparison && selectedMeal && (
        <OrderComparisonModal meal={selectedMeal} onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
}
