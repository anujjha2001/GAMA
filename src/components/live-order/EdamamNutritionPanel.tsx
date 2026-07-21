'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Zap, ChevronDown, BookOpen, Flame, Droplets,
  Apple, Clock, Users, ExternalLink, RefreshCw, Leaf, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface NutritionData {
  food: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturatedFat: number;
  potassium: number;
  vitaminA: number;
  vitaminC: number;
  vitaminB12: number;
  calcium: number;
  iron: number;
  magnesium: number;
  glycemicIndex: number;
  glycemicLoad: number;
  processingLevel: string;
  allergens: string[];
  dietCompatibility: {
    keto: boolean;
    vegan: boolean;
    diabeticFriendly: boolean;
    glutenFree: boolean;
  };
  healthHighlights: string[];
  warnings: string[];
  auraScore: number;
  confidence: number;
}

interface Recipe {
  id: string;
  label: string;
  image: string;
  source: string;
  url: string;
  yield: number;
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dietLabels: string[];
  healthLabels: string[];
  auraScore: number;
  difficulty: string;
  ingredients: string[];
  totalNutrients: {
    ENERC_KCAL: { label: string; quantity: number; unit: string };
    PROCNT: { label: string; quantity: number; unit: string };
    FAT: { label: string; quantity: number; unit: string };
    CHOCDF: { label: string; quantity: number; unit: string };
    FIBTG: { label: string; quantity: number; unit: string };
  };
}

export default function EdamamNutritionPanel() {
  const [query, setQuery] = React.useState('');
  const [mode, setMode] = React.useState<'nutrition' | 'recipes'>('nutrition');
  const [loading, setLoading] = React.useState(false);
  const [nutrition, setNutrition] = React.useState<NutritionData | null>(null);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [expandedRecipe, setExpandedRecipe] = React.useState<string | null>(null);

  const quickSearches = ['grilled chicken', 'dal makhani', 'quinoa salad', 'avocado toast', 'paneer tikka'];

  const handleSearch = async (q?: string) => {
    const term = q || query;
    if (!term.trim()) {
      toast.warning('Enter a food or recipe to analyze');
      return;
    }
    setLoading(true);
    setNutrition(null);
    setRecipes([]);
    try {
      const res = await fetch(`/api/nutrition?query=${encodeURIComponent(term)}&type=${mode}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      
      if (mode === 'nutrition') {
        setNutrition(data.data);
        toast.success('Nutrition facts loaded!');
      } else {
        setRecipes(Array.isArray(data.data) ? data.data : []);
        toast.success(`Found ${Array.isArray(data.data) ? data.data.length : 0} healthy recipes!`);
      }
      if (q) setQuery(q);
    } catch (err: any) {
      toast.error('Failed to fetch nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) =>
    score >= 75 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-red-400';
  
  const getScoreBg = (score: number) =>
    score >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 55 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  const NutrientBar = ({ label, value, unit, max, color = 'bg-orange-500' }: { label: string; value: number; unit: string; max: number; color?: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white font-bold">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );

  return (
    <div className="rounded-[32px] bg-[#0e0c0a]/95 backdrop-blur-xl border border-white/8 p-5 shadow-2xl space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <Apple className="w-3 h-3" />
            Edamam Nutrition Engine
          </span>
          <h3 className="text-sm font-black text-white mt-0.5">Food Intelligence</h3>
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8">
          <button
            onClick={() => setMode('nutrition')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${mode === 'nutrition' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Nutrition
          </button>
          <button
            onClick={() => setMode('recipes')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${mode === 'recipes' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Recipes
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1a1410] border border-white/8 rounded-xl px-3 py-2.5">
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={mode === 'nutrition' ? "grilled chicken, dal, salad..." : "healthy chicken recipe..."}
            className="bg-transparent text-xs text-white placeholder:text-neutral-500 flex-1 focus:outline-none"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {loading ? '' : 'Analyze'}
        </motion.button>
      </div>

      {/* Quick searches */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {quickSearches.map(q => (
          <button
            key={q}
            onClick={() => handleSearch(q)}
            className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[9px] text-neutral-300 font-semibold whitespace-nowrap hover:bg-white/10 hover:border-white/15 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-2">
          <div className="h-3 bg-white/8 rounded-full animate-pulse" />
          <div className="h-3 bg-white/5 rounded-full w-3/4 animate-pulse" />
          <div className="h-3 bg-white/3 rounded-full w-1/2 animate-pulse" />
        </div>
      )}

      {/* Nutrition Results */}
      {!loading && nutrition && mode === 'nutrition' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score + confidence */}
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl border flex flex-col items-center justify-center ${getScoreBg(nutrition.auraScore)}`}>
              <span className={`text-2xl font-black ${getScoreColor(nutrition.auraScore)}`}>{nutrition.auraScore}</span>
              <span className="text-[8px] text-neutral-400 font-bold">AURA</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white capitalize">{nutrition.food}</h4>
              <p className="text-[10px] text-neutral-400">per {nutrition.servingSize} • {nutrition.processingLevel}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {nutrition.dietCompatibility.keto && <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Keto ✓</span>}
                {nutrition.dietCompatibility.vegan && <span className="text-[8px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20">Vegan ✓</span>}
                {nutrition.dietCompatibility.diabeticFriendly && <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20">Diabetic ✓</span>}
                {nutrition.dietCompatibility.glutenFree && <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-500/20">GF ✓</span>}
              </div>
            </div>
          </div>

          {/* Macro bars */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Macros per Serving</span>
            <NutrientBar label="Calories" value={nutrition.calories} unit=" kcal" max={800} color="bg-amber-500" />
            <NutrientBar label="Protein" value={nutrition.protein} unit="g" max={60} color="bg-emerald-500" />
            <NutrientBar label="Carbohydrates" value={nutrition.carbs} unit="g" max={100} color="bg-blue-500" />
            <NutrientBar label="Fat" value={nutrition.fat} unit="g" max={50} color="bg-orange-500" />
            <NutrientBar label="Fiber" value={nutrition.fiber} unit="g" max={30} color="bg-teal-500" />
          </div>

          {/* Micronutrients */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-3">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Micronutrients</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sodium', val: `${nutrition.sodium}mg` },
                { label: 'Potassium', val: `${nutrition.potassium}mg` },
                { label: 'Calcium', val: `${nutrition.calcium}mg` },
                { label: 'Iron', val: `${nutrition.iron}mg` },
                { label: 'Vit. A', val: `${nutrition.vitaminA}%` },
                { label: 'Vit. C', val: `${nutrition.vitaminC}%` },
                { label: 'Magnesium', val: `${nutrition.magnesium}mg` },
                { label: 'B12', val: `${nutrition.vitaminB12}µg` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">{label}</span>
                  <span className="text-white font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GI info */}
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-2xl bg-white/3 border border-white/8 text-center">
              <p className="text-[9px] text-neutral-400 font-bold uppercase">Glycemic Index</p>
              <p className={`text-xl font-black mt-0.5 ${nutrition.glycemicIndex < 55 ? 'text-emerald-400' : nutrition.glycemicIndex < 70 ? 'text-amber-400' : 'text-red-400'}`}>{nutrition.glycemicIndex}</p>
              <p className="text-[9px] text-neutral-500">{nutrition.glycemicIndex < 55 ? 'Low' : nutrition.glycemicIndex < 70 ? 'Medium' : 'High'}</p>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-white/3 border border-white/8 text-center">
              <p className="text-[9px] text-neutral-400 font-bold uppercase">Glycemic Load</p>
              <p className={`text-xl font-black mt-0.5 ${nutrition.glycemicLoad < 11 ? 'text-emerald-400' : nutrition.glycemicLoad < 20 ? 'text-amber-400' : 'text-red-400'}`}>{nutrition.glycemicLoad}</p>
              <p className="text-[9px] text-neutral-500">{nutrition.glycemicLoad < 11 ? 'Low' : nutrition.glycemicLoad < 20 ? 'Medium' : 'High'}</p>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-white/3 border border-white/8 text-center">
              <p className="text-[9px] text-neutral-400 font-bold uppercase">Confidence</p>
              <p className="text-xl font-black mt-0.5 text-white">{nutrition.confidence}%</p>
              <p className="text-[9px] text-neutral-500">AI verified</p>
            </div>
          </div>

          {/* Health highlights */}
          {nutrition.healthHighlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {nutrition.healthHighlights.map((h, i) => (
                <span key={i} className="text-[9px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />{h}
                </span>
              ))}
            </div>
          )}

          {/* Warnings */}
          {nutrition.warnings.length > 0 && (
            <div className="p-3 rounded-2xl bg-red-500/8 border border-red-500/15">
              {nutrition.warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-red-300">⚠️ {w}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Recipe Results */}
      {!loading && recipes.length > 0 && mode === 'recipes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {recipes.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all cursor-pointer"
              onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
            >
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/8 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{recipe.label}</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{recipe.source} • {recipe.difficulty}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] text-amber-400 flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{Math.round(recipe.calories / (recipe.yield || 1))} kcal</span>
                      <span className="text-[9px] text-neutral-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{recipe.totalTime || '?'}min</span>
                      <span className="text-[9px] text-neutral-400 flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{recipe.yield} servings</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex flex-col items-center justify-center ${getScoreBg(recipe.auraScore)}`}>
                    <span className={`text-sm font-black ${getScoreColor(recipe.auraScore)}`}>{recipe.auraScore}</span>
                  </div>
                </div>

                {/* Diet labels */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {recipe.dietLabels.slice(0, 3).map((l, i) => (
                    <span key={i} className="text-[8px] bg-white/5 border border-white/8 text-neutral-300 px-1.5 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {expandedRecipe === recipe.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/8"
                  >
                    <div className="p-4 space-y-3">
                      {/* Macros */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Protein', val: recipe.totalNutrients?.PROCNT?.quantity?.toFixed(0) || '?', unit: 'g', color: 'text-emerald-400' },
                          { label: 'Carbs', val: recipe.totalNutrients?.CHOCDF?.quantity?.toFixed(0) || '?', unit: 'g', color: 'text-blue-400' },
                          { label: 'Fat', val: recipe.totalNutrients?.FAT?.quantity?.toFixed(0) || '?', unit: 'g', color: 'text-orange-400' },
                          { label: 'Fiber', val: recipe.totalNutrients?.FIBTG?.quantity?.toFixed(0) || '?', unit: 'g', color: 'text-teal-400' },
                        ].map(({ label, val, unit, color }) => (
                          <div key={label} className="text-center p-2 rounded-xl bg-white/3 border border-white/5">
                            <p className={`text-sm font-black ${color}`}>{val}{unit}</p>
                            <p className="text-[8px] text-neutral-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Ingredients */}
                      {recipe.ingredients.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Key Ingredients</p>
                          <div className="flex gap-1 flex-wrap">
                            {recipe.ingredients.map((ing, i) => (
                              <span key={i} className="text-[9px] text-white/60 bg-white/5 px-2 py-0.5 rounded-md">{ing}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <a
                        href={recipe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold hover:bg-emerald-600/25 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Full Recipe
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && nutrition === null && recipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
          <Apple className="w-8 h-8 text-neutral-600" />
          <p className="text-xs text-neutral-500">Enter any food to get real nutrition facts</p>
          <p className="text-[10px] text-neutral-600">Powered by Edamam × GAMA AI</p>
        </div>
      )}
    </div>
  );
}
