'use client';

import { CheckCircle2, Flame, Navigation, Clock, ShieldCheck } from "lucide-react";

export default function MealCard({ meal, onClick }: { meal: any, onClick: () => void }) {
  // We use placeholder images or gradients for meal images if not available
  const bgImage = meal.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop`;

  return (
    <div 
      onClick={onClick}
      className="group relative h-[380px] rounded-[32px] overflow-hidden cursor-pointer border border-white/10 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)]"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {meal.auraScore && (
          <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Aura {meal.auraScore}</span>
          </div>
        )}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-white">
          <Clock className="w-3 h-3 text-purple-400" />
          <span>{meal.eta || "25"}m</span>
        </div>
      </div>

      {/* Content Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-display font-medium text-white mb-1 group-hover:text-amber-400 transition-colors">
            {meal.name}
          </h3>
          <p className="text-sm text-slate-300 font-light truncate">
            {meal.restaurant?.name || "Local Kitchen"}
          </p>
        </div>

        {/* Nutrition Chips */}
        <div className="flex flex-wrap gap-2">
          <div className="px-2 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-md flex items-center gap-1.5 text-xs text-white">
            <Flame className="w-3 h-3 text-amber-500" />
            {meal.calories} kcal
          </div>
          <div className="px-2 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-md flex items-center gap-1.5 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {meal.macros?.protein || 0}g Protein
          </div>
          <div className="px-2 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-md flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            Health: {meal.healthScore || 90}
          </div>
        </div>
      </div>
    </div>
  );
}
