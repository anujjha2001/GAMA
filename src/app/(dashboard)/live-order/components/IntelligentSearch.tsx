'use client';

import { Search, Sparkles } from "lucide-react";

export default function IntelligentSearch({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (val: string) => void }) {
  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-full p-2 backdrop-blur-md flex items-center relative overflow-hidden group focus-within:border-amber-500/50 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:animate-shimmer pointer-events-none" />
      
      <div className="pl-4 pr-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
      </div>
      
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Ask Aura for a meal... e.g., 'High protein post-workout lunch'"
        className="flex-1 bg-transparent border-none text-white placeholder-slate-500 outline-none text-lg font-light tracking-wide py-3"
      />
      
      <button className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2">
        <Search className="w-4 h-4" />
        <span>Discover</span>
      </button>
    </div>
  );
}
