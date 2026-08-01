'use client';

import { MapPin, Navigation, Clock, Star, Store, ShieldCheck } from "lucide-react";

export default function GPSPanel({ restaurants = [] }: { restaurants?: any[] }) {
  // Add tailwind class 'animate-shimmer' to tailwind config if not there, or use a standard one.
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-medium text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Live Radar
        </h3>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
        {restaurants.length === 0 ? (
          <div className="text-slate-400 text-sm flex flex-col items-center justify-center h-full gap-2">
            <Store className="w-8 h-8 opacity-50" />
            Scanning nearby area...
          </div>
        ) : (
          restaurants.map((rest, idx) => (
            <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:bg-white/[0.08] transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium mb-1 group-hover:text-amber-400 transition-colors">{rest.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" /> {rest.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-sky-400" /> {rest.distance}km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" /> {rest.eta}m
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${rest.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {rest.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>

              <div className="flex gap-2">
                {rest.tags?.slice(0, 3).map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              
              {rest.healthScore && (
                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-max">
                  <ShieldCheck className="w-3 h-3" />
                  Health Score: {rest.healthScore}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
