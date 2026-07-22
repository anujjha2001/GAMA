'use client';

import * as React from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, JetBrains_Mono } from 'next/font/google';
import {
  ChefHat, Apple, Utensils, Flame, Droplets, Camera, Plus, Search,
  Trash2, Globe, BookOpen, Heart, Info, Clock, AlertCircle,
  MapPin, ShoppingBag, Check, RefreshCw, Send, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { toast } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
const jbMono = JetBrains_Mono({ subsets: ['latin'] });

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MealGuidePage() {
  const { data, error, mutate } = useSWR('/api/meals', fetcher);
  const [isLoadingUI, setIsLoadingUI] = React.useState(false);

  // States for interactive modules
  const [activeTab, setActiveTab] = React.useState<'plan' | 'builder' | 'grocery' | 'restaurants' | 'travel'>('plan');

  // AI Smart Meal Builder
  const [builderQuery, setBuilderQuery] = React.useState('');
  const [builderIngredients, setBuilderIngredients] = React.useState('');
  const [generatedRecipes, setGeneratedRecipes] = React.useState<any[]>([]);

  // Restaurant Intelligence
  const [selectedRestaurant, setSelectedRestaurant] = React.useState('McDonalds');
  const [restaurantRecommendations, setRestaurantRecommendations] = React.useState<any[]>([]);

  // Travel Meal Guide
  const [selectedCountry, setSelectedCountry] = React.useState('Japan');
  const [travelGuideData, setTravelGuideData] = React.useState<any | null>(null);

  // Smart Grocery Mode (Scanner Simulator)
  const [groceryItems, setGroceryItems] = React.useState<any[]>([]);
  const [pantryInventory, setPantryInventory] = React.useState<any[]>([]);
  const [pantryAlert, setPantryAlert] = React.useState('');
  const [newGroceryItem, setNewGroceryItem] = React.useState('');
  const [newGroceryCategory, setNewGroceryCategory] = React.useState('Vegetables');

  // Hydration state
  const [waterConsumed, setWaterConsumed] = React.useState(1250);

  // AURA Mini Nutrition Coach Chat
  const [coachInput, setCoachInput] = React.useState('');
  const [coachMessages, setCoachMessages] = React.useState<any[]>([
    { role: 'assistant', content: 'Hello! I am AURA, your nutrition coach. How can I help you optimize your diet today?' }
  ]);
  const [isCoachLoading, setIsCoachLoading] = React.useState(false);

  // AI Meal Scanner states
  const [selectedMealImage, setSelectedMealImage] = React.useState<string | null>(null);
  const [mealScanResult, setMealScanResult] = React.useState<any | null>(null);
  const [isScanningMeal, setIsScanningMeal] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Trust-centric pipeline states
  const [scanConfirmed, setScanConfirmed] = React.useState(false);
  const [editMealName, setEditMealName] = React.useState('');
  const [editServingSize, setEditServingSize] = React.useState(1.0);
  const [editIngredients, setEditIngredients] = React.useState('');
  const [editCookingStyle, setEditCookingStyle] = React.useState('Original');

  const handleMealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setSelectedMealImage(base64String);
      setMealScanResult(null);
      setScanConfirmed(false);
      setIsScanningMeal(true);

      try {
        const res = await fetch('/api/food-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.visionPayload) {
            let name = data.visionPayload.mealName;
            // Learning System Correction check
            try {
              const stored = localStorage.getItem('aura_scanner_corrections');
              if (stored) {
                const correctionsDict = JSON.parse(stored);
                if (correctionsDict[name]) {
                  name = correctionsDict[name];
                  toast.info(`Applied learning system name: ${name}`);
                }
              }
            } catch (e) { }

            const finalPayload = { ...data.visionPayload, mealName: name };
            setMealScanResult(finalPayload);
            setEditMealName(name);
            setEditServingSize(1.0);
            setEditIngredients(finalPayload.ingredients ? finalPayload.ingredients.join(', ') : '');
            setEditCookingStyle('Original');
            setScanConfirmed(false);
          } else {
            throw new Error(data.error || 'Failed to analyze');
          }
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        toast.error('Failed to analyze meal image.');
      } finally {
        setIsScanningMeal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getRecalculatedNutrition = () => {
    if (!mealScanResult || mealScanResult.isFood === false || !mealScanResult.isValidFood || mealScanResult.confidence < 70) return null;

    const baseCal = mealScanResult.calories || 0;
    const basePro = mealScanResult.protein || 0;
    const baseCarb = mealScanResult.carbs || 0;
    const baseFat = mealScanResult.fat || 0;
    const baseFib = mealScanResult.fiber || 0;

    let styleMult = 1.0;
    let fatMult = 1.0;

    if (editCookingStyle === 'Fried') {
      styleMult = 1.25;
      fatMult = 1.45;
    } else if (editCookingStyle === 'Grilled') {
      styleMult = 0.95;
      fatMult = 0.9;
    } else if (editCookingStyle === 'Boiled' || editCookingStyle === 'Steamed') {
      styleMult = 0.88;
      fatMult = 0.75;
    } else if (editCookingStyle === 'Baked') {
      styleMult = 0.98;
      fatMult = 0.95;
    }

    return {
      calories: Math.round(baseCal * editServingSize * styleMult),
      protein: Math.round(basePro * editServingSize),
      carbs: Math.round(baseCarb * editServingSize * (editCookingStyle === 'Fried' ? 1.1 : 1.0)),
      fat: Math.round(baseFat * editServingSize * fatMult),
      fiber: Math.round(baseFib * editServingSize)
    };
  };

  const handleSaveCorrection = (newName: string) => {
    if (!mealScanResult) return;
    const oldName = mealScanResult.mealName;
    try {
      const stored = localStorage.getItem('aura_scanner_corrections');
      const correctionsDict = stored ? JSON.parse(stored) : {};
      correctionsDict[oldName] = newName;
      localStorage.setItem('aura_scanner_corrections', JSON.stringify(correctionsDict));

      setMealScanResult((prev: any) => ({ ...prev, mealName: newName }));
      toast.success(`AURA memory updated: "${oldName}" mapped to "${newName}"`);
    } catch (e) { }
  };

  // Sync data once fetched
  React.useEffect(() => {
    if (data) {
      if (data.groceryList) setGroceryItems(data.groceryList);
      if (data.nutritionMetrics?.waterConsumedMl) {
        setWaterConsumed(data.nutritionMetrics.waterConsumedMl);
      }
    }
  }, [data]);

  // Cuisine Explorer details
  const cuisines = [
    { name: 'Mediterranean', popular: 'Greek Salad, Hummus, Baked Cod', score: 98, note: 'High in omega-3, healthy fats, fiber.' },
    { name: 'Japanese', popular: 'Sashimi, Miso Soup, Soba', score: 95, note: 'Lean proteins, low saturated fat, rich minerals.' },
    { name: 'Indian', popular: 'Dal Tadka, Tandoori Chicken, Chana Masala', score: 88, note: 'Anti-inflammatory spices, fiber-rich lentils.' },
    { name: 'Italian', popular: 'Caprese Salad, Grilled Sea Bass, Minestrone', score: 85, note: 'Polyphenol-rich olive oil, lycopene tomatoes.' },
    { name: 'Mexican', popular: 'Black Bean Tacos, Guacamole, Fajitas', score: 84, note: 'Avocado fats, complex carbs, lean protein.' },
    { name: 'Thai', popular: 'Tom Yum Soup, Papaya Salad, Green Curry', score: 82, note: 'Immune boosting ginger, lemongrass, spices.' }
  ];
  const [selectedCuisine, setSelectedCuisine] = React.useState<any>(cuisines[0]);

  // Handle Recipe Generation
  const handleGenerateRecipes = async () => {
    setIsLoadingUI(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_recipes',
          payload: { query: builderQuery, ingredients: builderIngredients }
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.recipes) {
          setGeneratedRecipes(result.recipes);
          toast.success('Successfully built AI recipes!');
        }
      }
    } catch (err) {
      toast.error('Failed to query AI Smart Builder');
    } finally {
      setIsLoadingUI(false);
    }
  };

  // Handle Restaurant Menu Recommendation
  const handleRestaurantSearch = async (restaurant: string) => {
    setSelectedRestaurant(restaurant);
    setIsLoadingUI(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restaurant_search',
          payload: { restaurant }
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.recommendations) {
          setRestaurantRecommendations(result.recommendations);
        }
      }
    } catch (err) {
      toast.error('Failed to analyze restaurant menu');
    } finally {
      setIsLoadingUI(false);
    }
  };

  // Trigger default restaurant recommendations on mount
  React.useEffect(() => {
    handleRestaurantSearch('McDonalds');
  }, []);

  // Handle Travel Cuisine Advice
  const handleTravelSearch = async (countryName: string) => {
    setSelectedCountry(countryName);
    setIsLoadingUI(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'travel_guide',
          payload: { country: countryName }
        })
      });
      if (res.ok) {
        const result = await res.json();
        setTravelGuideData(result);
      }
    } catch (err) {
      toast.error('Failed to compile Travel Guide');
    } finally {
      setIsLoadingUI(false);
    }
  };

  React.useEffect(() => {
    handleTravelSearch('Japan');
  }, []);

  // Handle Pantry Scanner Simulator
  const handleScanPantry = async () => {
    setIsLoadingUI(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan_pantry'
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.inventory) setPantryInventory(result.inventory);
        if (result.alert) setPantryAlert(result.alert);
        toast.success('Pantry scanner simulated successfully!');
      }
    } catch (err) {
      toast.error('Pantry scanner error');
    } finally {
      setIsLoadingUI(false);
    }
  };

  // Add Item to Grocery List
  const handleAddGrocery = () => {
    if (!newGroceryItem.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: newGroceryItem.trim(),
      category: newGroceryCategory,
      quantity: 'As needed',
      purchased: false
    };
    setGroceryItems([newItem, ...groceryItems]);
    setNewGroceryItem('');
    toast.success(`Added ${newItem.name} to grocery planner.`);
  };

  // Toggle purchased state
  const handleToggleGrocery = (id: string) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item));
  };

  // One-click Export
  const handleExportGrocery = () => {
    const textContent = groceryItems
      .map(item => `[${item.purchased ? 'X' : ' '}] ${item.name} (${item.category}) - ${item.quantity}`)
      .join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gama-grocery-list.txt';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Grocery list exported successfully!');
  };

  // Hydration handler
  const handleAddWater = () => {
    setWaterConsumed(prev => Math.min(prev + 250, 4000));
    toast.info('Added 250ml to daily log.');
  };

  // AURA Coach chat
  const handleCoachSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coachInput.trim() || isCoachLoading) return;

    const userMessage = { role: 'user', content: coachInput.trim() };
    const newMessages = [...coachMessages, userMessage];
    setCoachMessages(newMessages);
    setCoachInput('');
    setIsCoachLoading(true);

    try {
      const res = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-5) // Send recent context
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCoachMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.message || 'I processed your request.' }
        ]);
      }
    } catch (err) {
      toast.error('Coach communication error');
    } finally {
      setIsCoachLoading(false);
    }
  };

  if (error) return <div className="p-10 text-rose-500 font-mono">SYSTEM ERROR: FAILED TO CONNECT TO MEALS API.</div>;
  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
      <div className="w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-neutral-400 font-medium">Booting AURA Nutrition Engine...</span>
    </div>
  );

  const metrics = data?.nutritionMetrics || {
    score: 88,
    caloriesConsumed: 970,
    caloriesTarget: 2200,
    proteinConsumed: 68,
    proteinTarget: 140,
    carbsConsumed: 47,
    carbsTarget: 180,
    fatConsumed: 44,
    fatTarget: 70,
    waterConsumedMl: 1250,
    waterTargetMl: 3000,
    streak: 5
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8 flex flex-col w-full ${inter.className}`}>

      {/* 3D Animated Landing Hero (Premium Parallax + Particle Effect simulated via styling) */}
      <div className="relative w-full h-[220px] rounded-[32px] overflow-hidden border border-white/10 mb-8 bg-gradient-to-br from-neutral-900/90 via-black to-[#13110d] flex items-center justify-between px-8 md:px-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-5 right-1/3 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-2"
          >
            <span className="px-3 py-1 text-[10px] font-black tracking-widest bg-white/10 text-neutral-300 border border-white/10 uppercase rounded-full">
              Live AI Nutrition OS
            </span>


          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl md:text-whitexl font-black text-white tracking-tight leading-none"
          >
            Your Personal AI Nutrition Companion
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs text-neutral-400 mt-2.5 leading-relaxed"
          >
            AURA continuously analyzes your meals, nutrition, goals, and health profile to create personalized meal recommendations that evolve with your lifestyle.
          </motion.p>
        </div>

        {/* Floating animated 3D Plate Mockup */}
        <div className="hidden lg:flex items-center justify-center relative w-48 h-48 select-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            className="w-40 h-40 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="GAMA" className="w-full h-full object-cover opacity-80 animate-black" />
            </div>
            {/* Orbiting particles representing macronutrients */}
            <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce" />
            <div className="absolute bottom-4 right-1 w-4 h-4 rounded-full bg-white text-black font-semibold shadow-[0_0_10px_#00f0ff]" />
            <div className="absolute top-1/2 right-2 w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />
          </motion.div>
        </div>
      </div>

      {/* Welcome Section Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nutrition Score</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">{metrics.score}</span>
            <span className="text-[10px] text-neutral-500">/100</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-white text-black font-semibold h-full rounded-full" style={{ width: `${metrics.score}%` }} />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Daily Calories</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{metrics.caloriesConsumed}</span>
            <span className="text-[10px] text-neutral-500">/ {metrics.caloriesTarget} kcal</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-white-500 h-full rounded-full" style={{ width: `${(metrics.caloriesConsumed / metrics.caloriesTarget) * 100}%` }} />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Protein Goal</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{metrics.proteinConsumed}g</span>
            <span className="text-[10px] text-neutral-500">/ {metrics.proteinTarget}g</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-white text-black font-semibold h-full rounded-full" style={{ width: `${(metrics.proteinConsumed / metrics.proteinTarget) * 100}%` }} />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Water Intake</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{(waterConsumed / 1000).toFixed(2)}L</span>
            <span className="text-[10px] text-neutral-500">/ {(metrics.waterTargetMl / 1000).toFixed(0)}L</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(waterConsumed / metrics.waterTargetMl) * 100}%` }} />
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-2xl border border-border p-4 rounded-2xl flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Healthy Streak</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white">{metrics.streak} Days</span>
            <span className="text-[10px] text-neutral-500">Active</span>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-4 h-1.5 rounded-full bg-white text-black font-semibold" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive navigation hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Submodule panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-white/10 gap-6 mb-4">
            <button
              onClick={() => setActiveTab('plan')}
              className={`pb-2.5 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'plan' ? 'text-white border-b-2 border-white/20' : 'text-neutral-400 hover:text-white'}`}
            >
              Meal Planner & History
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`pb-2.5 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'builder' ? 'text-white border-b-2 border-white/20' : 'text-neutral-400 hover:text-white'}`}
            >
              AI Recipe Builder
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`pb-2.5 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'grocery' ? 'text-white border-b-2 border-white/20' : 'text-neutral-400 hover:text-white'}`}
            >
              Smart Pantry & Groceries
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`pb-2.5 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'restaurants' ? 'text-white border-b-2 border-white/20' : 'text-neutral-400 hover:text-white'}`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`pb-2.5 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'travel' ? 'text-white border-b-2 border-white/20' : 'text-neutral-400 hover:text-white'}`}
            >
              Travel
            </button>
          </div>

          <AnimatePresence mode="wait">

            {/* Plan Tab */}
            {activeTab === 'plan' && (
              <motion.div
                key="plan-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. Today's Meal Plan */}
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Today's Meal Plan</h3>
                    <span className="text-[10px] text-neutral-400">Generated dynamically by AURA</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Breakfast</span>
                      <span className="text-xs font-bold text-white mt-1.5 leading-snug">Avocado Quinoa Egg Bowl</span>
                      <span className="text-[9px] text-neutral-500 mt-2">420 kcal • 22g Protein</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Lunch</span>
                      <span className="text-xs font-bold text-white mt-1.5 leading-snug">Grilled Salmon & Spinach</span>
                      <span className="text-[9px] text-neutral-500 mt-2">550 kcal • 46g Protein</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Dinner</span>
                      <span className="text-xs font-bold text-white mt-1.5 leading-snug">Tofu & Vegetable Stir Fry</span>
                      <span className="text-[9px] text-neutral-500 mt-2">380 kcal • 18g Protein</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Snacks</span>
                      <span className="text-xs font-bold text-white mt-1.5 leading-snug">Almonds & Mixed Berries</span>
                      <span className="text-[9px] text-neutral-500 mt-2">180 kcal • 5g Protein</span>
                    </div>
                  </div>
                </div>

                {/* 2. AI Meal Scanner */}
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">AI Meal Scanner</h3>
                    <span className="text-[10px] text-neutral-400">Scan food plate or refrigerator</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMealImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {!selectedMealImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/10 transition-colors"
                    >
                      <div className="p-4 bg-white/5 border border-white/10 text-neutral-300 rounded-full">
                        <Camera className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-white block">Upload or Take Meal Picture</span>
                        <span className="text-[10px] text-neutral-500 mt-1 block">Analyze calories, macros, origin & summary instantly</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview & Scanner State */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                        <img
                          src={selectedMealImage}
                          alt="Meal Preview"
                          className="w-full h-full object-cover"
                        />
                        {isScanningMeal && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-white/20 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[11px] text-neutral-300 font-bold uppercase tracking-widest animate-pulse">Scanning Meal Profile...</span>
                          </div>
                        )}
                      </div>

                      {isScanningMeal && (
                        <div className="bg-[#14100e] border border-[#2c1e15]/30 rounded-[32px] p-6 space-y-6 animate-pulse">
                          <div className="flex justify-between items-center">
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-white/10 rounded-lg" />
                              <div className="h-3 w-48 bg-white/5 rounded-lg" />
                            </div>
                          </div>
                          <div className="h-12 bg-white/5 rounded-2xl" />
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className="h-12 bg-white/5 rounded-xl" />
                            ))}
                          </div>
                          <div className="h-20 bg-white/5 rounded-2xl" />
                        </div>
                      )}

                      {/* Scan results */}
                      {mealScanResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#14100e] border border-[#2c1e15] rounded-[32px] p-6 space-y-6 shadow-xl"
                        >
                          {/* Image Validation & Classification Check */}
                          {(mealScanResult.isFood === false || !mealScanResult.isValidFood || mealScanResult.classification === 'Non-Food') ? (
                            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-5 space-y-3">
                              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                Food Not Detected
                              </div>
                              <div className="text-[10px] text-neutral-400 space-y-1">
                                <p className="font-bold text-white">Classification: {mealScanResult.classification || 'Unknown'}</p>
                                <p className="font-semibold text-rose-300">
                                  Reason: {mealScanResult.message || (mealScanResult.validationErrors?.length > 0 ? mealScanResult.validationErrors.join(', ') : 'No recognizable food found or image quality is insufficient.')}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-[#2c1e15] text-[9px] text-neutral-500 space-y-1">
                                <span className="font-bold text-white block uppercase">Suggestions:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  <li>Ensure the meal is clearly visible in the center</li>
                                  <li>Try scanning again in better lighting</li>
                                  <li>Crop the image closer to the plate</li>
                                  <li>Search the meal manually using Global Search</li>
                                </ul>
                              </div>
                              <button
                                onClick={() => { setSelectedMealImage(null); setMealScanResult(null); }}
                                className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                              >
                                Scan Again
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Confidence Tier Headers */}
                              {mealScanResult.confidence < 70 ? (
                                /* LOW CONFIDENCE SCREEN */
                                <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 space-y-3 text-center">
                                  <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Low Confidence ({mealScanResult.confidence}%)
                                  </span>
                                  <p className="text-xs font-bold text-white mt-1">Unable to confidently identify this meal.</p>
                                  <p className="text-[9px] text-neutral-400">To protect your health metadata, calories and macronutrients are not guessed.</p>
                                  <div className="flex gap-2 justify-center pt-2">
                                    <button onClick={() => { setSelectedMealImage(null); setMealScanResult(null); }} className="px-4 py-1.5 bg-white text-black font-semibold text-black text-[9px] font-black rounded-lg uppercase tracking-wider">Scan Again</button>
                                    <button onClick={() => { setSelectedMealImage(null); setMealScanResult(null); }} className="px-4 py-1.5 bg-white/5 text-white text-[9px] font-black rounded-lg uppercase tracking-wider">Search Manually</button>
                                  </div>
                                </div>
                              ) : mealScanResult.confidence >= 70 && mealScanResult.confidence <= 84 && !scanConfirmed ? (
                                /* MEDIUM CONFIDENCE SCREEN */
                                <div className="bg-[#1e1714] border border-[#2c1e15] rounded-2xl p-5 space-y-4 text-center">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black bg-white/5 text-neutral-300 border border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Medium Confidence ({mealScanResult.confidence}%)
                                    </span>
                                    <h4 className="text-sm font-bold text-white mt-2">Is this {mealScanResult.mealName}?</h4>
                                    <p className="text-[9px] text-neutral-400">Please confirm before AURA estimates nutrition metrics.</p>
                                  </div>
                                  <div className="flex gap-3 justify-center">
                                    <button
                                      onClick={() => setScanConfirmed(true)}
                                      className="px-6 py-2 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      ✓ Yes
                                    </button>
                                    <button
                                      onClick={() => { setSelectedMealImage(null); setMealScanResult(null); }}
                                      className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      ✕ No
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* HIGH & VERY HIGH CONFIDENCE SCREENS */
                                <div className="space-y-5">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      {mealScanResult.confidence >= 85 && mealScanResult.confidence <= 94 ? (
                                        <span className="text-[10px] font-black text-neutral-300 block">
                                          This appears to be <strong className="text-white font-black text-sm">{mealScanResult.mealName}</strong>
                                        </span>
                                      ) : (
                                        <span className="text-sm font-black text-white block">{mealScanResult.mealName}</span>
                                      )}

                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] bg-white/5 text-neutral-300 border border-white/10 px-1.5 py-0.5 rounded uppercase font-black">
                                          Confidence: {mealScanResult.confidence}%
                                        </span>
                                        <span className="text-[8px] bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                          Database: USDA + OpenFoodFacts
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => { setSelectedMealImage(null); setMealScanResult(null); setScanConfirmed(false); }}
                                      className="text-[9px] text-neutral-500 hover:text-white uppercase tracking-wider font-extrabold"
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  {/* AI Recognition Explanation */}
                                  {mealScanResult.whyConfidence && mealScanResult.whyConfidence.length > 0 && (
                                    <div className="bg-[#1e1714] border border-[#2c1e15] p-3.5 rounded-2xl space-y-1">
                                      <span className="text-[8px] text-white font-bold uppercase tracking-widest block">AI Explanation</span>
                                      <ul className="list-disc pl-4 text-[9px] text-neutral-400 space-y-0.5">
                                        {mealScanResult.whyConfidence.map((w: string, idx: number) => (
                                          <li key={idx}>{w}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Macro Nutrition Display */}
                                  {(() => {
                                    const macros = getRecalculatedNutrition();
                                    if (!macros) return null;
                                    return (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-5 gap-2 text-center bg-black/40 border border-white/5 p-3.5 rounded-2xl">
                                          <div>
                                            <span className="text-[9px] text-neutral-400 uppercase font-bold">Energy</span>
                                            <span className="text-[11px] font-black text-white block mt-0.5">~{macros.calories} kcal</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-neutral-400 uppercase font-bold">Protein</span>
                                            <span className="text-[11px] font-black text-white block mt-0.5">~{macros.protein}g</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-neutral-400 uppercase font-bold">Carbs</span>
                                            <span className="text-[11px] font-black text-white block mt-0.5">~{macros.carbs}g</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-neutral-400 uppercase font-bold">Fat</span>
                                            <span className="text-[11px] font-black text-white block mt-0.5">~{macros.fat}g</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-neutral-400 uppercase font-bold">Fiber</span>
                                            <span className="text-[11px] font-black text-white block mt-0.5">~{macros.fiber}g</span>
                                          </div>
                                        </div>

                                        {/* Dynamic Detailed Scoring preview */}
                                        <div className="bg-[#1e1714] border border-[#2c1e15] p-4 rounded-3xl space-y-3">
                                          <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider block">AURA Biometrics Match</span>

                                          <div className="grid grid-cols-2 gap-2 text-[9px]">
                                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl">
                                              <span className="text-neutral-500">Glycemic Load</span>
                                              <span className="font-extrabold text-neutral-300">{mealScanResult.glycemicLoad}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl">
                                              <span className="text-neutral-500">Processing</span>
                                              <span className="font-extrabold text-emerald-400">{mealScanResult.processingLevel}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl col-span-2">
                                              <span className="text-neutral-500">Feelings prediction:</span>
                                              <span className="font-extrabold text-white bg-white/5 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">{mealScanResult.expectedFeeling || 'Energized'}</span>
                                            </div>
                                          </div>

                                          <div className="space-y-1.5 text-[9px] border-t border-[#2c1e15] pt-2">
                                            <div>
                                              <span className="text-emerald-400 font-extrabold block">✓ Why Recommended</span>
                                              <p className="text-neutral-400 mt-0.5">{mealScanResult.whyRecommended}</p>
                                            </div>
                                            {mealScanResult.whyNotRecommended && (
                                              <div>
                                                <span className="text-rose-400 font-extrabold block">⚠ Caution</span>
                                                <p className="text-neutral-400 mt-0.5">{mealScanResult.whyNotRecommended}</p>
                                              </div>
                                            )}
                                            {mealScanResult.healthierAlternative && (
                                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl flex justify-between items-center mt-1">
                                                <div>
                                                  <span className="text-[8px] text-neutral-500 block uppercase">Healthier Alternative</span>
                                                  <span className="font-bold text-emerald-400">{mealScanResult.healthierAlternative}</span>
                                                </div>
                                                <button onClick={() => toast.success(`Added ${mealScanResult.healthierAlternative} to grocery list`)} className="bg-emerald-500 text-black px-2 py-1 rounded text-[8px] font-black uppercase">Swap</button>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* MANUAL CORRECTIONS / OVERRIDES PANEL */}
                                        <div className="bg-[#1e1714] border border-[#2c1e15] p-4 rounded-3xl space-y-4">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-neutral-400 uppercase font-black tracking-wider">Manual Adjustment</span>
                                            <span className="text-[8px] text-neutral-500 font-semibold">Updates metrics instantly</span>
                                          </div>

                                          <div className="space-y-3">
                                            {/* Meal Name & Learning Correction */}
                                            <div>
                                              <label className="text-[8px] text-neutral-400 uppercase block mb-1 font-bold">Meal Name</label>
                                              <div className="flex gap-2">
                                                <input
                                                  type="text"
                                                  value={editMealName}
                                                  onChange={(e) => setEditMealName(e.target.value)}
                                                  className="flex-1 bg-black/40 border border-[#2c1e15] text-xs text-white p-2 rounded-xl focus:outline-none"
                                                />
                                                {editMealName !== mealScanResult.mealName && (
                                                  <button
                                                    onClick={() => handleSaveCorrection(editMealName)}
                                                    className="bg-white text-black font-semibold hover:bg-neutral-200 text-black text-[9px] font-black px-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                                                  >
                                                    Teach AURA
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {/* Serving Size Slider */}
                                            <div>
                                              <div className="flex justify-between items-center mb-1 text-[8px] text-neutral-400">
                                                <span className="font-bold uppercase">Serving Size</span>
                                                <span className="font-extrabold text-neutral-300">{editServingSize}x</span>
                                              </div>
                                              <input
                                                type="range"
                                                min="0.5"
                                                max="3.0"
                                                step="0.1"
                                                value={editServingSize}
                                                onChange={(e) => setEditServingSize(parseFloat(e.target.value))}
                                                className="w-full accent-white h-1 bg-black/40 rounded-lg cursor-pointer"
                                              />
                                            </div>

                                            {/* Cooking Style Select */}
                                            <div>
                                              <label className="text-[8px] text-neutral-400 uppercase block mb-1 font-bold">Cooking Style</label>
                                              <select
                                                value={editCookingStyle}
                                                onChange={(e) => setEditCookingStyle(e.target.value)}
                                                className="w-full bg-black/40 border border-[#2c1e15] text-xs text-white p-2 rounded-xl focus:outline-none cursor-pointer"
                                              >
                                                <option value="Original">Original (Database Standard)</option>
                                                <option value="Grilled">🔥 Grilled (Lower Fat)</option>
                                                <option value="Fried">🍳 Fried (+Fat & Calories)</option>
                                                <option value="Boiled">💧 Boiled (Lower Calories)</option>
                                                <option value="Baked">烤 Baked (Uniform Roast)</option>
                                                <option value="Steamed">💨 Steamed (Gentle & Light)</option>
                                              </select>
                                            </div>

                                            {/* Ingredients override list */}
                                            <div>
                                              <label className="text-[8px] text-neutral-400 uppercase block mb-1 font-bold">Key Ingredients</label>
                                              <input
                                                type="text"
                                                value={editIngredients}
                                                onChange={(e) => setEditIngredients(e.target.value)}
                                                className="w-full bg-black/40 border border-[#2c1e15] text-xs text-white p-2 rounded-xl focus:outline-none"
                                                placeholder="Quinoa, chicken, kale, avocado..."
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Add to history button */}
                                        <button
                                          onClick={() => {
                                            toast.success(`Logged ${editMealName} (~${macros.calories} kcal) to daily history.`);
                                            setSelectedMealImage(null);
                                            setMealScanResult(null);
                                            setScanConfirmed(false);
                                          }}
                                          className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer transition-colors"
                                        >
                                          ✓ Log Meal to Health Twin
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Meal History Timeline */}
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Meal History</h3>
                  <div className="space-y-4">
                    {data.todayMeals?.map((meal: any) => (
                      <div key={meal.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 border border-white/10 text-neutral-300 rounded-xl">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{meal.name}</span>
                            <span className="text-[9px] text-neutral-400 uppercase font-semibold tracking-wider mt-0.5 block">{meal.mealType} • {new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{meal.calories} kcal</span>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">AI Score: {meal.healthRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Builder Tab */}
            {activeTab === 'builder' && (
              <motion.div
                key="builder-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">AI Smart Meal Builder</h3>
                  <p className="text-[11px] text-neutral-400 leading-normal mb-4">
                    List the ingredients you currently have at home, or describe what you want AURA to build. We will formulate structured recipes matching your dietary baseline.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Available Ingredients</label>
                      <input
                        type="text"
                        placeholder="e.g. eggs, rice, spinach, paneer"
                        value={builderIngredients}
                        onChange={(e) => setBuilderIngredients(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Recipe Focus or Diet Type</label>
                      <input
                        type="text"
                        placeholder="e.g. High-protein dinner, low carbs, lunch under 500 calories"
                        value={builderQuery}
                        onChange={(e) => setBuilderQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                      />
                    </div>

                    <button
                      onClick={handleGenerateRecipes}
                      disabled={isLoadingUI}
                      className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingUI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Customized Recipes...</span>
                        </>
                      ) : (
                        <>

                          <span>Generate 3 Recipes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {generatedRecipes.length > 0 && (
                  <div className="space-y-6">
                    {generatedRecipes.map((recipe, idx) => (
                      <div key={idx} className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">{recipe.name}</h4>
                            <span className="text-[10px] text-neutral-400 mt-1 block">Time: {recipe.cookingTime} • Difficulty: {recipe.difficulty}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-lg uppercase tracking-wider">Health Score: {recipe.healthScore}/100</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
                          <div className="text-center">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Calories</span>
                            <span className="text-xs font-bold text-white block mt-0.5">{recipe.calories} kcal</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Protein</span>
                            <span className="text-xs font-bold text-white block mt-0.5">{recipe.protein}g</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Carbs</span>
                            <span className="text-xs font-bold text-white block mt-0.5">{recipe.carbs}g</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Fat</span>
                            <span className="text-xs font-bold text-white block mt-0.5">{recipe.fat}g</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-neutral-300 italic mb-4 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/20/10">
                          {recipe.recommendationReason}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Required Ingredients</span>
                            <ul className="space-y-1 text-[11px] text-neutral-300">
                              {recipe.ingredients?.map((item: string, i: number) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-emerald-500" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Step-by-Step Instructions</span>
                            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-neutral-300">
                              {recipe.instructions?.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Grocery Tab */}
            {activeTab === 'grocery' && (
              <motion.div
                key="grocery-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. Smart Grocery Mode Scanner */}
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Smart Pantry Scanner</h3>
                    <button
                      onClick={handleScanPantry}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-colors hover:bg-white/10 flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> Scan Fridge / Pantry
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal mb-4">
                    Audit refrigerator inventory and expiration dates using smart visual analysis.
                  </p>

                  {pantryAlert && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex gap-3 items-start mb-4">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-white block">Nutrition Alert</span>
                        <span className="text-[11px] text-neutral-300 mt-1 block leading-relaxed">{pantryAlert}</span>
                      </div>
                    </div>
                  )}

                  {pantryInventory.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pantryInventory.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                          <span className="text-xs font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-neutral-400 mt-1 block">{item.quantity}</span>
                          {item.expiringSoon && (
                            <span className="text-[9px] text-rose-400 font-extrabold uppercase mt-1">Expiring Soon</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Smart Grocery Planner */}
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Smart Grocery Planner</h3>
                    <button
                      onClick={handleExportGrocery}
                      className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black text-[10px] font-bold uppercase rounded-lg tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> One-click Export
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add grocery item..."
                      value={newGroceryItem}
                      onChange={(e) => setNewGroceryItem(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                    />
                    <select
                      value={newGroceryCategory}
                      onChange={(e) => setNewGroceryCategory(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl text-xs px-3 py-2 text-black"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Proteins">Proteins</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Supplements">Supplements</option>
                    </select>
                    <button
                      onClick={handleAddGrocery}
                      className="p-2.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {groceryItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleGrocery(item.id)}
                        className={`p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-white/10 ${item.purchased ? 'opacity-50 line-through' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.purchased ? 'bg-white text-black font-semibold border-white/20 text-black' : 'border-white/20'}`}>
                            {item.purchased && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{item.name}</span>
                            <span className="text-[9px] text-neutral-400 font-semibold tracking-wider block mt-0.5">{item.category} • {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <motion.div
                key="restaurants-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Restaurant Intelligence</h3>
                  <p className="text-[11px] text-neutral-400 leading-normal mb-4">
                    Enter the name of a restaurant menu to generate high-protein alternatives and diabetes-friendly healthy substitutions.
                  </p>

                  <div className="flex gap-2 flex-wrap mb-6">
                    {['McDonalds', 'Subway', 'Starbucks', 'KFC'].map((res) => (
                      <button
                        key={res}
                        onClick={() => handleRestaurantSearch(res)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${selectedRestaurant === res ? 'bg-white text-black font-semibold text-black border-white/20' : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'}`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>

                  {restaurantRecommendations.length > 0 && (
                    <div className="space-y-4">
                      {restaurantRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-white block">{rec.name}</span>
                              <span className="text-[9px] text-neutral-300 font-extrabold uppercase mt-1 block tracking-wider">Best for: {rec.bestFor}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-lg uppercase tracking-wider">Score: {rec.healthScore}/100</span>
                          </div>

                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-white/5 border border-white/5 rounded-xl p-3 my-3 text-center">
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Calories</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.calories} kcal</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Protein</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.protein}g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Carbs</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Fat</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.fat}g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Sodium</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.sodium}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-neutral-400 block uppercase">Sugar</span>
                              <span className="text-[10px] font-bold text-white block mt-0.5">{rec.sugar}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-neutral-300 leading-relaxed bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 mb-2">
                            <span className="font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Healthy Substitution</span>
                            {rec.substitution}
                          </div>

                          <p className="text-[10px] text-neutral-400 leading-normal">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Travel Tab */}
            {activeTab === 'travel' && (
              <motion.div
                key="travel-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Travel Meal Guide</h3>
                  <p className="text-[11px] text-neutral-400 leading-normal mb-4">
                    Traveling abroad? AURA translates foreign dishes and scans local menus to advise allergy warnings and healthy places.
                  </p>

                  <div className="flex gap-2 flex-wrap mb-6">
                    {['Japan', 'Italy', 'Thailand', 'Dubai'].map((country) => (
                      <button
                        key={country}
                        onClick={() => handleTravelSearch(country)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${selectedCountry === country ? 'bg-white text-black font-semibold text-black border-white/20' : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'}`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>

                  {travelGuideData && (
                    <div className="space-y-6">

                      {/* Warnings */}
                      {travelGuideData.warnings?.length > 0 && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                          <span className="text-xs font-bold text-white block mb-2 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-500" /> Allergy & Health Warnings
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-300">
                            {travelGuideData.warnings.map((w: string, i: number) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Dishes */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-3">Healthy Local Dishes</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {travelGuideData.localDishes?.map((dish: any, idx: number) => (
                            <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                              <span className="text-xs font-bold text-white block">{dish.name}</span>
                              <span className="text-[9px] text-neutral-400 mt-1 block">Ingredients: {dish.ingredients}</span>
                              <span className="text-[10px] text-emerald-400 font-medium block mt-2">{dish.calories} kcal • {dish.protein}g Protein</span>
                              <p className="text-[10px] text-neutral-400 leading-normal mt-2 pt-2 border-t border-white/5">{dish.benefits}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Restaurants */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-3">Recommended Healthy Restaurants</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {travelGuideData.restaurants?.map((rest: any, idx: number) => (
                            <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-xs font-bold text-white block">{rest.name}</span>
                                <span className="text-[9px] text-neutral-400 block mt-0.5">{rest.cuisine} • Price: {rest.price}</span>
                                <span className="text-[10px] text-neutral-300 block mt-2 font-medium">Specialty: {rest.specialty}</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-4 text-[9px] text-neutral-500">
                                <span>Rating: {rest.rating}⭐</span>
                                <span className="flex items-center gap-0.5 text-white hover:underline cursor-pointer">
                                  <MapPin className="w-3 h-3" /> Map Direction
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* 4. Global Cuisine Explorer */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Global Cuisine Explorer</h3>
              <span className="text-[10px] text-neutral-400">Interactive Cuisines</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine.name}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${selectedCuisine.name === cuisine.name ? 'bg-white text-black font-semibold text-black border-white/20' : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'}`}
                >
                  {cuisine.name}
                </button>
              ))}
            </div>

            {selectedCuisine && (
              <motion.div
                layout
                className="bg-white/5 border border-white/5 p-4 rounded-2xl mt-3 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{selectedCuisine.name} Cuisine</span>
                  <span className="text-[11px] text-neutral-400 mt-1 block">Popular options: {selectedCuisine.popular}</span>
                  <p className="text-[11px] text-neutral-300 leading-normal mt-3 italic">{selectedCuisine.note}</p>
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <span className="text-[9px] uppercase font-bold block">Health Rating</span>
                  <span className="text-xl font-black block mt-0.5">{selectedCuisine.score}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 5. Smart Healthy Alternatives */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Healthy Alternatives</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-rose-400 block">Pizza</span>
                  <span className="text-[9px] text-neutral-500">Refined carbohydrates</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">Whole Wheat / Cauliflower Pizza</span>
                  <span className="text-[9px] text-neutral-500">Complex fiber-rich crust</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-rose-400 block">Soft Drinks</span>
                  <span className="text-[9px] text-neutral-500">High fructose sugar syrup</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">Sparkling Water with Lemon</span>
                  <span className="text-[9px] text-neutral-500">Zero sugars, alkaline hydration</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-rose-400 block">White Rice</span>
                  <span className="text-[9px] text-neutral-500">Fast digesting starches</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">Quinoa / Cauliflower Rice</span>
                  <span className="text-[9px] text-neutral-500">Dense micronutrients, slow glucose index</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: HUD Widgets */}
        <div className="space-y-6">

          {/* 2. Hydration Center */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Hydration Center</h3>
            <div className="flex justify-between items-center gap-6">

              {/* Bottle SVG filler */}
              <div className="relative w-16 h-28 border-2 border-white/20 rounded-b-2xl rounded-t-lg bg-black/40 overflow-hidden flex items-end">
                <motion.div
                  animate={{ height: `${(waterConsumed / metrics.waterTargetMl) * 100}%` }}
                  className="w-full bg-gradient-to-t from-sky-600 to-sky-400 shadow-[0_0_15px_#38bdf8]"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Today's Target</span>
                  <span className="text-lg font-black text-white block mt-0.5">{waterConsumed} ml / {metrics.waterTargetMl} ml</span>
                </div>
                <button
                  onClick={handleAddWater}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Droplets className="w-4 h-4" /> Add 250ml Water
                </button>
              </div>
            </div>
          </div>

          {/* 3. Micronutrient Intelligence */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Micronutrient Intelligence</h3>
            <div className="space-y-3">
              {Object.entries(data.micronutrients || {}).map(([key, item]: any) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-neutral-300">
                    <span className="capitalize">{key.replace('vitamin', 'Vitamin ')}</span>
                    <span className={item.status === 'Deficient' ? 'text-rose-400' : item.status === 'Suboptimal' ? 'text-neutral-300' : 'text-emerald-400'}>
                      {item.value} / {item.target} {item.unit} ({item.status})
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === 'Deficient' ? 'bg-rose-500' : item.status === 'Suboptimal' ? 'bg-white text-black font-semibold' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Weekly Nutrition Story */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6 bg-gradient-to-br from-neutral-900/60 via-card/60 to-[#12141a]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Weekly Nutrition Story</h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
              "{data.weeklyStory}"
            </p>
          </div>

          {/* 5. Favorite Recipes */}
          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Favorite Recipes</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-white">High Protein Grilled Chicken Wrap</span>
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-white">Fiber-rich Mediterranean Dal</span>
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
