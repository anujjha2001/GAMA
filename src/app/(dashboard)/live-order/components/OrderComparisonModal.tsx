'use client';

import { motion } from "framer-motion";
import { X, ExternalLink, Activity, Target, ShieldCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderComparisonModal({ meal, onClose }: { meal: any, onClose: () => void }) {
  if (!meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#0c0c0e] border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

        {/* Header Image & Close */}
        <div className="relative h-64 shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 relative z-10 scrollbar-hide flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">{meal.name}</h2>
            <p className="text-lg text-slate-400">{meal.restaurant?.name || "Local Kitchen"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: AI Analysis & Health Impact */}
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-display text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Aura Analysis
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {meal.description || "This meal optimally aligns with your current recovery phase, providing the necessary amino acids for muscle synthesis without excess sodium."}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Gut Health Impact</span>
                    <span className="text-sm font-medium text-emerald-400">Positive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Inflammation</span>
                    <span className="text-sm font-medium text-emerald-400">Low</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Blood Sugar Spike</span>
                    <span className="text-sm font-medium text-amber-400">Moderate</span>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Flame className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-lg font-medium text-white">{meal.calories}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Kcal</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Target className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-lg font-medium text-white">{meal.macros?.protein || 0}g</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Protein</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1" />
                  <span className="text-lg font-medium text-white">{meal.macros?.carbs || 0}g</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Carbs</span>
                </div>
              </div>
            </div>

            {/* Right: Providers & Deep Links */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-display text-white border-b border-white/10 pb-4">Order Options</h3>
              
              <div className="flex flex-col gap-4">
                {/* Zomato Option */}
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Zomato</h4>
                    <p className="text-xs text-slate-400">ETA: {meal.eta || '30'} mins • ₹40 Delivery</p>
                  </div>
                  <Button className="bg-[#E23744] hover:bg-[#c92f3b] text-white rounded-full">
                    Open App <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Swiggy Option */}
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Swiggy</h4>
                    <p className="text-xs text-slate-400">ETA: {meal.eta ? parseInt(meal.eta)+5 : '35'} mins • Free Delivery</p>
                  </div>
                  <Button className="bg-[#FC8019] hover:bg-[#e06f11] text-white rounded-full">
                    Open App <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
