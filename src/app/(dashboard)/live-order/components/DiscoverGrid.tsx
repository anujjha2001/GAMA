'use client';

import { Suspense } from "react";
import MealCard from "./MealCard";
import { Utensils } from "lucide-react";

export default function DiscoverGrid({ meals = [], onSelectMeal }: { meals: any[], onSelectMeal: (meal: any) => void }) {
  if (meals.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-3xl backdrop-blur-sm">
        <Utensils className="w-8 h-8 text-slate-500 mb-4" />
        <p className="text-slate-400 font-light">Aura is discovering the best meals for you...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {meals.map((meal, idx) => (
        <MealCard key={idx} meal={meal} onClick={() => onSelectMeal(meal)} />
      ))}
    </div>
  );
}
