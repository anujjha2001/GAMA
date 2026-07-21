'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, MapPin, Search, Sparkles, Flame, Droplets, Zap, ShieldCheck } from 'lucide-react';
import { Restaurant, Meal } from '@/lib/ai/marketplace/food-provider';

interface RestaurantOverlayProps {
  restaurant: Restaurant;
  onClose: () => void;
  meals: Meal[];
  onOptimize: (meal: Meal) => void;
  onOrderNow: (meal: Meal) => void;
  onToggleCompare: (meal: Meal) => void;
  compareList: Meal[];
}

export default function RestaurantOverlay({
  restaurant,
  onClose,
  meals,
  onOptimize,
  onOrderNow,
  onToggleCompare,
  compareList
}: RestaurantOverlayProps) {
  const [activeMenuCategory, setActiveMenuCategory] = React.useState('All');
  const [menuSearchQuery, setMenuSearchQuery] = React.useState('');

  const restaurantMeals = React.useMemo(() => {
    return meals.filter(m => {
      const matchesCategory = activeMenuCategory === 'All' || m.category === activeMenuCategory;
      const matchesSearch = m.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [meals, activeMenuCategory, menuSearchQuery]);

  const categories = React.useMemo(() => {
    const list = new Set<string>();
    meals.forEach(m => {
      if (m.category) list.add(m.category);
    });
    return ['All', ...Array.from(list)];
  }, [meals]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative w-full max-w-2xl bg-[#0a0807]/95 border-l border-[#2c1e15] h-full flex flex-col shadow-2xl z-10 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 bg-black/40 border border-white/5 rounded-full text-neutral-400 hover:text-white transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner */}
        <div className="relative h-64 w-full shrink-0">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807] via-[#0a0807]/50 to-black/30" />
          
          {/* Restaurant details */}
          <div className="absolute bottom-5 left-6 right-6">
            <span className="text-[10px] font-black uppercase bg-white text-black font-semibold text-black px-2.5 py-0.5 rounded-full tracking-wider mb-2 inline-block">
              {restaurant.platform} Partner
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">{restaurant.name}</h2>
            <p className="text-xs text-neutral-400 mt-1">{restaurant.cuisine}</p>

            <div className="flex gap-4 items-center mt-3 text-xs text-neutral-300">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-neutral-300" /> {restaurant.healthRating}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-white" /> {restaurant.deliveryTimeMins} mins</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-white" /> {restaurant.distanceKm} km away</span>
            </div>
          </div>
        </div>

        {/* Search menu */}
        <div className="p-6 border-b border-[#2c1e15] shrink-0 space-y-4">
          <div className="relative flex items-center bg-[#1e1714] border border-[#2c1e15] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500 mr-2" />
            <input
              type="text"
              id="menu-overlay-search"
              name="menu-overlay-search"
              placeholder="Search dishes inside restaurant menu..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 border-0 focus:outline-hidden"
            />
          </div>

          {/* Menu Categories selection bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveMenuCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${activeMenuCategory === c ? 'bg-white text-black font-semibold text-black font-extrabold' : 'bg-[#1e1714] text-neutral-400 border border-[#2c1e15]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {restaurantMeals.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-bold">
              No matching healthy dishes found inside menu categories.
            </div>
          ) : (
            restaurantMeals.map((meal) => {
              const isCompared = compareList.find(c => c.id === meal.id);
              return (
                <div
                  key={meal.id}
                  className="bg-[#14100e] border border-[#2c1e15] p-4.5 rounded-3xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between"
                >
                  <div className="flex gap-4.5 flex-1">
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/5"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{meal.name}</span>
                        <span className="text-[8px] bg-white/5 text-neutral-300 px-1.5 py-0.5 rounded font-black">
                          {meal.auraScore}/100 AURA
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">{meal.whyRecommend}</p>
                      
                      {/* Macro summaries */}
                      <div className="flex gap-3 text-[9px] text-neutral-500 pt-1">
                        <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-neutral-300" /> {meal.nutrients.calories} kcal</span>
                        <span>Protein: {meal.nutrients.proteinG}g</span>
                        <span>Carbs: {meal.nutrients.carbsG}g</span>
                        <span>Fat: {meal.nutrients.fatG}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-center items-center md:items-stretch">
                    <button
                      onClick={() => onOptimize(meal)}
                      className="px-3 py-1.5 bg-[#1e1714] border border-[#2c1e15] hover:border-white/10 text-neutral-300 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer text-center"
                    >
                      Optimize
                    </button>
                    <button
                      onClick={() => onOrderNow(meal)}
                      className="px-3.5 py-2 bg-white text-black font-semibold hover:bg-neutral-200 text-black rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer text-center"
                    >
                      Order Now
                    </button>
                    <label className="flex items-center gap-1.5 justify-center cursor-pointer text-[8px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300">
                      <input
                        type="checkbox"
                        checked={!!isCompared}
                        onChange={() => onToggleCompare(meal)}
                        className="rounded border-[#2c1e15] text-white focus:ring-0 bg-black/40"
                      />
                      Compare
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
