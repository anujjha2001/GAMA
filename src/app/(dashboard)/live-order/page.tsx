'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Sparkles, Filter, Check, ArrowRight, Info,
  Flame, Droplets, Zap, ShieldAlert, Award, Star, Compass, Clock,
  Maximize2, Plus, Sliders, ChevronRight, X, Heart, ShieldCheck, Soup, Smile, Calendar, Trash2,
  Camera, Volume2, CloudSun, MapPin, AlertTriangle, Brain, RefreshCw, BarChart3, TrendingUp, Landmark
} from 'lucide-react';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';
import { FoodProviderManager, Restaurant, Meal, GroceryItem } from '@/lib/ai/marketplace/food-provider';
import { MockProvider } from '@/lib/ai/marketplace/mock-provider';
import RestaurantOverlay from '@/components/live-order/RestaurantOverlay';
import PreOrderChecklist from '@/components/live-order/PreOrderChecklist';

// Initialize Pluggable Mock Provider
if (typeof window !== 'undefined') {
  FoodProviderManager.setProvider(new MockProvider());
}

export default function LiveOrderPage() {
  const { sleepHours, stressLevel, hrv, heartRate, steps } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const provider = React.useMemo(() => FoodProviderManager.getProvider(), []);

  // UI Modes & States
  const [activeTab, setActiveTab] = React.useState<'restaurant' | 'grocery' | 'planner' | 'insights'>('restaurant');
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurant | null>(null);
  const [checkoutMeal, setCheckoutMeal] = React.useState<Meal | null>(null);

  // Pagination & Infinite Scroll States
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  // Debounce search input to prevent overloading global endpoints
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [vegFilter, setVegFilter] = React.useState(false);
  const [highProteinFilter, setHighProteinFilter] = React.useState(false);
  const [deficiencyFilter, setDeficiencyFilter] = React.useState<string | null>(null);

  // Smart Location Engine States
  const [locationPermission, setLocationPermission] = React.useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentAddress, setCurrentAddress] = React.useState('Workspace, Block 4B (GPS)');
  const [manualCity, setManualCity] = React.useState('Bengaluru');
  const [manualPIN, setManualPIN] = React.useState('560001');
  const [showLocationModal, setShowLocationModal] = React.useState(false);

  // Mood & Weather Intelligence States
  const [currentWeather, setCurrentWeather] = React.useState<'Hot & Humid' | 'Monsoon Rain' | 'Cool Winter'>('Hot & Humid');
  const [currentMood, setCurrentMood] = React.useState<'Stressed' | 'Low Energy' | 'High Recovery'>('');

  // Budget Engine States
  const [monthlyLimit, setMonthlyLimit] = React.useState(15000);
  const [spentThisMonth, setSpentThisMonth] = React.useState(9850);
  const [showBudgetModal, setShowBudgetModal] = React.useState(false);

  // Platform Integrations
  const [swiggyConnected, setSwiggyConnected] = React.useState(true);
  const [zomatoConnected, setZomatoConnected] = React.useState(false);

  // Selected details / Modals
  const [selectedMeal, setSelectedMeal] = React.useState<Meal | null>(null);
  const [compareList, setCompareList] = React.useState<Meal[]>([]);
  const [showCompareModal, setShowCompareModal] = React.useState(false);
  const [selectedOptimizerMeal, setSelectedOptimizerMeal] = React.useState<Meal | null>(null);

  // Optimizer Custom Modifications Checklist
  const [modifications, setModifications] = React.useState({
    lessOil: false,
    brownRice: false,
    extraProtein: false,
    noCheese: false,
    lessButter: false,
    reducedSodium: false
  });

  // Food Camera Simulation States
  const [showCameraModal, setShowCameraModal] = React.useState(false);
  const [cameraScanning, setCameraScanning] = React.useState(false);
  const [scannedResult, setScannedResult] = React.useState<any>(null);

  // Active Meal Journey Timeline States
  const [activeOrderTimeline, setActiveOrderTimeline] = React.useState<'Preparing' | 'Cooking' | 'Picked Up' | 'Delivered' | 'Digesting' | 'Energy Peak' | null>(null);
  const [digestionProgress, setDigestionProgress] = React.useState(0);

  // Voice Search Panel States
  const [voiceQueryInput, setVoiceQueryInput] = React.useState('');
  const [isListeningVoice, setIsListeningVoice] = React.useState(false);

  // Planner States
  const [plannerGoal, setPlannerGoal] = React.useState<'Muscle Gain' | 'Weight Loss' | 'Keto' | 'Diabetic Friendly' | 'Vegan'>('Muscle Gain');
  const [plannerDays, setPlannerDays] = React.useState<any[]>([]);

  // Food Memory State (bloating, sleep recovery logs)
  const [foodMemory, setFoodMemory] = React.useState({
    bloating: ['Paneer Tikka High Fiber Wrap', 'Double Cheese Burgers'],
    recovery: ['Avocado Quinoa Greens Salad', 'Omega-3 Salmon Superfood Bowl'],
    sleep: ['Warming Ginger Garlic Lentil Soup', 'Chamomile Tea']
  });

  // Loaded Catalog Data
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [groceries, setGroceries] = React.useState<GroceryItem[]>([]);

  // Load Data
  React.useEffect(() => {
    setMounted(true);
    // Request mock geolocation status
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission('granted'),
      () => setLocationPermission('denied')
    );
    loadCatalog();
    generateWeeklyPlan();
  }, [provider]);

  // Load Catalog from Pluggable active provider with pagination
  const loadCatalog = async (resetPage = false) => {
    if (!provider) return;
    const targetPage = resetPage ? 1 : page;
    setIsLoadingMore(true);

    const rData = await provider.getRestaurants({ vegOnly: vegFilter, query: debouncedQuery, page: targetPage });
    const mData = await provider.getMeals({ vegOnly: vegFilter, highProtein: highProteinFilter, query: debouncedQuery, page: targetPage });
    const gData = await provider.getGroceryItems(debouncedQuery, targetPage);

    if (resetPage) {
      setRestaurants(rData);
      setMeals(mData);
      setGroceries(gData);
      setPage(1);
      setHasMore(mData.length > 0);
    } else {
      setRestaurants(prev => {
        const ids = new Set(prev.map(r => r.id));
        const filtered = rData.filter(r => !ids.has(r.id));
        return [...prev, ...filtered];
      });
      setMeals(prev => {
        const ids = new Set(prev.map(m => m.id));
        const filtered = mData.filter(m => !ids.has(m.id));
        return [...prev, ...filtered];
      });
      setGroceries(prev => {
        const ids = new Set(prev.map(g => g.id));
        const filtered = gData.filter(g => !ids.has(g.id));
        return [...prev, ...filtered];
      });
      setHasMore(mData.length > 0);
    }
    setIsLoadingMore(false);
  };

  React.useEffect(() => {
    loadCatalog(true);
  }, [vegFilter, highProteinFilter, debouncedQuery]);

  // Load more when page increments
  React.useEffect(() => {
    if (page > 1) {
      loadCatalog(false);
    }
  }, [page]);

  // Setup intersection observer for infinite scroll
  React.useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoadingMore]);

  // Weekly Planner Generation
  const generateWeeklyPlan = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan = days.map((day, idx) => ({
      day,
      calories: plannerGoal === 'Weight Loss' ? 1500 + (idx * 30) : plannerGoal === 'Muscle Gain' ? 2600 - (idx * 20) : 2000,
      protein: plannerGoal === 'Muscle Gain' ? 140 : 90,
      breakfast: plannerGoal === 'Vegan' ? 'Avocado Greens Salad' : 'Double Chicken Protein Power Bowl',
      lunch: plannerGoal === 'Keto' ? 'Keto Cauliflower Crust Pizza' : 'Omega-3 Salmon Superfood Bowl',
      dinner: 'Warming Ginger Garlic Lentil Soup',
      cost: plannerGoal === 'Diabetic Friendly' ? 420 : 490
    }));
    setPlannerDays(plan);
  };

  React.useEffect(() => {
    generateWeeklyPlan();
  }, [plannerGoal]);

  if (!mounted) return null;

  // Smart Geolocation triggers
  const requestGPSLocation = () => {
    setLocationPermission('prompt');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission('granted');
        setCurrentAddress(`Workspace lat: ${pos.coords.latitude.toFixed(4)}, lng: ${pos.coords.longitude.toFixed(4)}`);
        toast.success('GPS coordinates retrieved successfully');
      },
      () => {
        setLocationPermission('denied');
        toast.error('Location permission denied. Enter location details manually.');
      }
    );
  };

  // Real-time Meal Optimization calculations
  const calculateOptimizedStats = (meal: Meal) => {
    let calSaved = 0;
    let proGained = 0;
    let costOffset = 0;
    let currentScore = meal.auraScore;

    if (modifications.lessOil) {
      calSaved += 120;
      currentScore += 3;
    }
    if (modifications.brownRice) {
      calSaved += 40;
      currentScore += 2;
    }
    if (modifications.extraProtein) {
      proGained += 18;
      calSaved += 90;
      costOffset += 90;
      currentScore += 5;
    }
    if (modifications.noCheese) {
      calSaved += 150;
      currentScore += 4;
    }
    if (modifications.lessButter) {
      calSaved += 80;
      currentScore += 2;
    }
    if (modifications.reducedSodium) {
      currentScore += 4;
    }

    return {
      calories: Math.max(100, meal.nutrients.calories - calSaved),
      protein: meal.nutrients.proteinG + proGained,
      carbs: Math.max(10, meal.nutrients.carbsG - (modifications.noCheese ? 5 : 0)),
      fat: Math.max(5, meal.nutrients.fatG - (modifications.noCheese ? 12 : 0) - (modifications.lessOil ? 10 : 0)),
      price: meal.price + costOffset,
      auraScore: Math.min(100, currentScore),
      caloriesSaved: calSaved,
      proteinGained: proGained
    };
  };

  const handleToggleCompare = (meal: Meal) => {
    if (compareList.find(c => c.id === meal.id)) {
      setCompareList(compareList.filter(c => c.id !== meal.id));
    } else {
      if (compareList.length >= 2) {
        toast.warning('You can compare a maximum of 2 meals side-by-side.');
        return;
      }
      setCompareList([...compareList, meal]);
    }
  };

  const triggerOrderRedirection = (meal: Meal) => {
    toast.success(`Opening Swiggy/Zomato deep-link to ${meal.restaurantName}...`);
    // Start GAMA Active post-meal timeline
    setActiveOrderTimeline('Preparing');
    setTimeout(() => setActiveOrderTimeline('Cooking'), 4000);
    setTimeout(() => setActiveOrderTimeline('Picked Up'), 8000);
    setTimeout(() => setActiveOrderTimeline('Delivered'), 12000);
    setTimeout(() => {
      setActiveOrderTimeline('Digesting');
      // Start Digestion Interval
      const interval = setInterval(() => {
        setDigestionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setActiveOrderTimeline('Energy Peak');
            return 100;
          }
          return prev + 10;
        });
      }, 2000);
    }, 15000);
  };

  // Camera upload simulator
  const handleSimulatedCameraScan = () => {
    setCameraScanning(true);
    setScannedResult(null);
    setTimeout(() => {
      setCameraScanning(false);
      setScannedResult({
        name: 'Detected Chicken Quesadilla',
        calories: 640,
        protein: 34,
        carbs: 45,
        fat: 26,
        score: 55,
        healthyMatch: 'Double Chicken Protein Power Bowl'
      });
      toast.success('AI Scanner completed successfully!');
    }, 2000);
  };

  // Voice command shortcut simulator
  const triggerVoiceCommand = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setIsListeningVoice(false);
      setVoiceQueryInput('High protein breakfast under ₹350');
      setSearchQuery('Chicken');
      setActiveTab('restaurant');
      toast.success('Voice understood: Searching "High protein breakfast under ₹350"');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#eae3dc] p-4 md:p-6 relative overflow-hidden flex flex-col font-sans">

      {/* Background cinematic glowing layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 z-10">
        <div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white text-black font-semibold animate-pulse" /> GAMA Live Food Intelligence
          </span>
          <h1 className="text-whitexl font-black text-white tracking-tight mt-1">AURA LIVE Order v3.0</h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Pluggable Provider Architecture integrated with Swiggy & Zomato deep-linking. Optimized in real-time by AURA.
          </p>
        </div>

        {/* Location display pill & Geolocation triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 bg-[#13100e] border border-white/10 px-3.5 py-2 rounded-2xl shadow-md text-xs hover:border-white/20/40 transition-colors"
          >
            <MapPin className="w-4 h-4 text-white" />
            <div className="text-left">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Delivery Location</span>
              <span className="text-[10px] text-white font-extrabold">{currentAddress}</span>
            </div>
          </button>

          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 bg-[#13100e] border border-[#2c1e15] px-3.5 py-2 rounded-2xl shadow-md text-xs hover:border-[#3c2a1e] transition-colors"
          >
            <Landmark className="w-4 h-4 text-neutral-400" />
            <div className="text-left">
              <span className="text-[9px] text-neutral-400 block uppercase font-bold">Monthly Budget</span>
              <span className="text-[10px] text-white font-extrabold">₹{spentThisMonth}/₹{monthlyLimit}</span>
            </div>
          </button>
        </div>
      </div>

      {/* CORE INTERACTIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 z-10">

        {/* LEFT CONTROL RAIL */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-start">

          {/* Weather & Mood Context Indicators */}
          <div className="rounded-[32px] bg-[#14100e]/95 backdrop-blur-xl border border-[#2c1e15] p-5 shadow-lg space-y-4">
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase block">Contextual Adaptors</span>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] text-neutral-400 font-bold block mb-1">Weather Adaptation</span>
                <select
                  id="live-order-weather-select"
                  name="live-order-weather-select"
                  value={currentWeather}
                  onChange={(e) => setCurrentWeather(e.target.value as any)}
                  className="w-full bg-[#1e1714] border border-[#2c1e15] rounded-xl text-xs text-white p-2"
                >
                  <option value="Hot & Humid">☀️ Hot & Humid (Cooling Foods)</option>
                  <option value="Monsoon Rain">🌧️ Monsoon Rain (Warm Soups)</option>
                  <option value="Cool Winter">❄️ Cool Winter (High Calorie Comfort)</option>
                </select>
              </div>

              <div>
                <span className="text-[9px] text-neutral-400 font-bold block mb-1">Mood & Stress Shift</span>
                <select
                  id="live-order-mood-select"
                  name="live-order-mood-select"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(e.target.value as any)}
                  className="w-full bg-[#1e1714] border border-[#2c1e15] rounded-xl text-xs text-white p-2"
                >
                  <option value="Stressed"> Stressed (Lower Cortisol)</option>
                  <option value="Low Energy">Low Energy (Complex Carbs)</option>
                  <option value="High Recovery"> High Recovery (Cheat Meal Window)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Connected Partner status cards */}
          <div className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] p-5 shadow-lg space-y-4">
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase block">Connected Partners</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#1e1714] border border-[#2c1e15] p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512" fill="#fc8019">
                    <path d="M439.4 207.2c-5.7-18.7-27.1-27.1-42.3-15.6l-50.5 38c-8.4 6.3-20.1 6.3-28.5 0L193.3 133.5c-30.8-23.2-74-7.4-83.3 30.5L78.6 303.1c-13.4 54.3 22 108.6 76.5 117.2l87.5 13.8c11.7 1.8 23.6-2.9 31-12.4l154.5-197.6c11.1-14.1 6.3-35.3-8.7-42.9z" />
                  </svg>
                  <span className="text-xs font-bold text-white">Swiggy</span>
                </div>
                <button
                  onClick={() => { setSwiggyConnected(!swiggyConnected); toast.info(swiggyConnected ? 'Swiggy integration unlinked' : 'Swiggy integration synced'); }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${swiggyConnected ? 'bg-white/5 text-neutral-300' : 'bg-white/5 text-neutral-400'}`}
                >
                  {swiggyConnected ? 'Active' : 'Configure'}
                </button>
              </div>
              <div className="flex justify-between items-center bg-[#1e1714] border border-[#2c1e15] p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#e23744">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-xs font-bold text-white font-sans tracking-wide">Zomato</span>
                </div>
                <button
                  onClick={() => { setZomatoConnected(!zomatoConnected); toast.info(zomatoConnected ? 'Zomato integration unlinked' : 'Zomato integration synced'); }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${zomatoConnected ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-neutral-400'}`}
                >
                  {zomatoConnected ? 'Active' : 'Configure'}
                </button>
              </div>
            </div>
          </div>

          {/* Food Memory logs */}
          <div className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] p-5 shadow-lg space-y-3">
            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase block">Food Memory Nodes</span>
            <div className="space-y-2 text-[10px]">
              <div>
                <span className="text-rose-400 font-bold block">🚨 Causes Bloating (Avoid)</span>
                <p className="text-neutral-400 mt-0.5">{foodMemory.bloating.join(', ')}</p>
              </div>
              <div className="pt-2 border-t border-[#2c1e15]">
                <span className="text-emerald-400 font-bold block">✓ Speeds Recovery</span>
                <p className="text-neutral-400 mt-0.5">{foodMemory.recovery.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* AI Voice Command Panel */}
          <div className="rounded-[32px] bg-neutral-900/95 border border-white/10 p-5 shadow-lg space-y-3">
            <span className="text-[10px] font-black tracking-widest text-neutral-300 uppercase block">AI Voice Assistant Shortcuts</span>
            <p className="text-[9px] text-neutral-400 leading-relaxed">
              Quickly trigger search queries using AURA's local voice-routing logic.
            </p>
            <button
              onClick={triggerVoiceCommand}
              className={`w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${isListeningVoice ? 'bg-brand animate-pulse text-white' : 'bg-white text-black font-semibold text-black hover:bg-neutral-200'}`}
            >
              <Volume2 className="w-4 h-4" /> {isListeningVoice ? 'AURA Listening...' : 'Trigger Voice Command'}
            </button>
          </div>

        </div>

        {/* CENTER FEED & BROWSE */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">

          {/* NAVIGATION BAR & SEARCH */}
          <div className="bg-[#14100e]/95 border border-[#2c1e15] rounded-[32px] p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

            {/* Tabs */}
            <div className="flex flex-wrap bg-[#1e1714] p-1 rounded-full border border-[#2c1e15] gap-1">
              {(['restaurant', 'grocery', 'planner', 'insights'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab ? 'bg-white text-black font-semibold text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Global Search Input */}
            <div className="flex-1 max-w-md relative flex items-center bg-[#1e1714] border border-[#2c1e15] rounded-full px-4.5 py-1.5">
              <Search className="w-4 h-4 text-neutral-500 mr-2" />
              <input
                type="text"
                id="live-order-global-search"
                name="live-order-global-search"
                placeholder="Search food, recipes, macros, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 border-0 focus:outline-hidden"
              />
              <button
                onClick={() => setShowCameraModal(true)}
                className="p-1 hover:bg-[#2c1e15] rounded-lg text-neutral-300 transition-colors"
                title="Scan Plate"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ACTIVE TAB RENDER */}
          {activeTab === 'restaurant' && (
            <>
              {/* Filter chips bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setVegFilter(!vegFilter)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${vegFilter ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#14100e] text-neutral-400 border-[#2c1e15]'}`}
                >
                  🥦 Veg Only
                </button>
                <button
                  onClick={() => setHighProteinFilter(!highProteinFilter)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${highProteinFilter ? 'bg-white/10 text-neutral-300 border-white/10' : 'bg-[#14100e] text-neutral-400 border-[#2c1e15]'}`}
                >
                  🍗 High Protein (25g+)
                </button>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal) => {
                  const isCompared = compareList.find(c => c.id === meal.id);
                  return (
                    <motion.div
                      key={meal.id}
                      whileHover={{ y: -4 }}
                      className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] overflow-hidden flex flex-col justify-between shadow-lg relative group"
                    >
                      {/* Aura Score badge */}
                      <div className="absolute top-4 left-4 z-20 bg-[#0a0807]/90 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white text-black font-semibold" />
                        <span className="text-[10px] text-neutral-300 font-black">{meal.auraScore}/100</span>
                      </div>

                      {/* Compare toggle */}
                      <button
                        onClick={() => handleToggleCompare(meal)}
                        className={`absolute top-4 right-4 z-20 p-2 rounded-full border transition-all cursor-pointer ${isCompared ? 'bg-white text-black font-semibold text-black border-white/20' : 'bg-[#0a0807]/80 text-neutral-400 border-white/5 hover:border-white/10'}`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>

                      {/* Header image representation */}
                      <div
                        className="h-32 w-full relative cursor-pointer"
                        onClick={() => {
                          const found = restaurants.find(r => r.id === meal.restaurantId || r.name === meal.restaurantName);
                          if (found) setSelectedRestaurant(found);
                        }}
                      >
                        <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14100e] via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-4">
                          <span className="text-[8px] bg-black/40 text-neutral-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/5 hover:border-white/10 transition-colors">
                            {meal.restaurantName}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-sm font-black text-white group-hover:text-neutral-300 transition-colors">{meal.name}</h3>

                          {/* Dynamic Detailed Scoring preview */}
                          <div className="flex gap-2.5 mt-2 flex-wrap">
                            <span className="text-[8px] bg-sky-950/40 text-sky-400 border border-sky-900/30 px-1.5 py-0.5 rounded">
                              Glycemic Load: {meal.nutrients.glycemicLoad}
                            </span>
                            <span className="text-[8px] bg-neutral-800/40 text-neutral-300 border border-neutral-700/30 px-1.5 py-0.5 rounded">
                              Processing: {meal.nutrients.processingLevel}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center text-[9px] bg-neutral-900 border border-white/5 rounded-xl p-2 mt-3">
                            <div>
                              <span className="text-neutral-500 block">Calories</span>
                              <span className="font-bold text-white">{meal.nutrients.calories}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block">Protein</span>
                              <span className="font-bold text-white">{meal.nutrients.proteinG}g</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block">Carbs</span>
                              <span className="font-bold text-white">{meal.nutrients.carbsG}g</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block">Fat</span>
                              <span className="font-bold text-white">{meal.nutrients.fatG}g</span>
                            </div>
                          </div>
                        </div>

                        {/* Recommendation Rationale */}
                        <div className="text-[10px] text-neutral-400 leading-relaxed bg-[#1c1613]/40 border border-[#2c1e15]/40 p-3 rounded-2xl">
                          <span className="font-black text-neutral-300 uppercase text-[8px] block mb-1">Why Recommended</span>
                          {meal.whyRecommend}
                        </div>

                        <div className="flex justify-between items-center gap-3 pt-2">
                          <div>
                            <span className="text-[9px] text-neutral-500 block">Est. Cost</span>
                            <span className="text-xs font-black text-white">₹{meal.price}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                const found = restaurants.find(r => r.id === meal.restaurantId || r.name === meal.restaurantName);
                                if (found) setSelectedRestaurant(found);
                                else toast.info('Restaurant details loading...');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-wider cursor-pointer text-neutral-300"
                            >
                              Menu
                            </button>
                            <button
                              onClick={() => setSelectedOptimizerMeal(meal)}
                              className="px-2.5 py-1.5 bg-[#1c1613] hover:bg-[#2c1f19] border border-white/10 text-neutral-300 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Optimize
                            </button>
                            <button
                              onClick={() => setCheckoutMeal(meal)}
                              className="px-3.5 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-xl text-[9px] uppercase tracking-wider cursor-pointer shadow-md"
                            >
                              Order Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Loader Trigger for Infinite Scroll */}
              {hasMore && (
                <div ref={loaderRef} className="h-14 w-full flex items-center justify-center pt-2 pb-6">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-xs text-neutral-300 font-bold uppercase tracking-wider animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white text-black font-semibold animate-ping" />
                      Loading global marketplace feed...
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'grocery' && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-white uppercase tracking-widest block">Healthy Grocery Mode</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groceries.map((item) => (
                  <div key={item.id} className="bg-[#14100e]/95 border border-[#2c1e15] p-5 rounded-[28px] space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-white/5 text-neutral-300 px-2 py-0.5 rounded font-black uppercase">{item.category}</span>
                        <span className="text-xs font-black text-white">{item.healthScore}/100</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 leading-relaxed mt-2">Suggested Meal/Recipe: <span className="text-neutral-300">{item.recipeSuggestion}</span></p>
                      <p className="text-[10px] text-neutral-500 mt-1">Rich in: {item.nutrients}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black text-white">₹{item.price}</span>
                      <button
                        onClick={() => toast.success(`${item.name} added to future grocery basket`)}
                        className="px-3.5 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-xl text-[10px] uppercase tracking-wider"
                      >
                        Add Basket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest block">7-Day Meal Planner</span>
                <select
                  id="live-order-planner-goal-select"
                  name="live-order-planner-goal-select"
                  value={plannerGoal}
                  onChange={(e) => setPlannerGoal(e.target.value as any)}
                  className="bg-black/50 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 py-1 uppercase tracking-wider cursor-pointer"
                >
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Keto">Keto</option>
                  <option value="Diabetic Friendly">Diabetic Friendly</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                {plannerDays.map((d, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1e1714] border border-[#2c1e15] p-4 rounded-3xl text-[10px]">
                    <div>
                      <span className="font-black text-neutral-300 uppercase text-[9px] block">{d.day}</span>
                      <span className="font-bold text-white block mt-1">B: {d.breakfast}</span>
                      <span className="text-neutral-400 block">L: {d.lunch} | D: {d.dinner}</span>
                      <span className="text-neutral-500 mt-1 block">Cal: {d.calories} | Protein: {d.protein}g</span>
                    </div>
                    <button
                      onClick={() => toast.success(`Ordered planner day meals: ${d.day}`)}
                      className="bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold px-3 py-2 rounded-xl uppercase tracking-wider text-[9px]"
                    >
                      Order Day
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] p-6 space-y-6">
              <div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest block">LIVE Order Insights</span>
                <h3 className="text-base font-bold text-white mt-1">Weekly Eating Behavior Summary</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e1714] border border-[#2c1e15] p-4 rounded-2xl">
                  <span className="text-[9px] text-neutral-500 block uppercase font-bold">Healthy Foods Consumed</span>
                  <span className="text-xl font-black text-emerald-400 mt-1 block">85%</span>
                </div>
                <div className="bg-[#1e1714] border border-[#2c1e15] p-4 rounded-2xl">
                  <span className="text-[9px] text-neutral-500 block uppercase font-bold">Avg. AURA Score</span>
                  <span className="text-xl font-black text-neutral-300 mt-1 block">91/100</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT RAILS - TIMING, RESTAURANTS, TIMELINE */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-start">

          {/* Active Meal Journey Timeline */}
          {activeOrderTimeline && (
            <div className="rounded-[32px] bg-[#14100e]/95 border border-white/10 p-5 shadow-lg space-y-4">
              <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Clock className="w-4 h-4" /> Active Meal Timeline
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Order Stage:</span>
                  <span className="text-white font-extrabold">{activeOrderTimeline}</span>
                </div>

                <div className="w-full bg-[#1e1714] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-white text-black font-semibold h-1.5 transition-all duration-500"
                    style={{ width: activeOrderTimeline === 'Preparing' ? '15%' : activeOrderTimeline === 'Cooking' ? '45%' : activeOrderTimeline === 'Picked Up' ? '70%' : activeOrderTimeline === 'Delivered' ? '90%' : '100%' }}
                  />
                </div>

                {activeOrderTimeline === 'Digesting' && (
                  <div className="bg-[#1e1714] p-3 rounded-2xl space-y-1.5">
                    <span className="text-[9px] text-neutral-300 block font-bold">Digestion Timer (Active)</span>
                    <div className="flex justify-between items-center text-[10px] text-neutral-400">
                      <span>Metabolism Active</span>
                      <span>{digestionProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Meal Timing Prediction */}
          <div className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] p-5 shadow-lg space-y-4">
            <span className="text-[10px] font-black text-white uppercase tracking-widest block">AI Meal Timing</span>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#1e1714] p-3 rounded-2xl text-[10px]">
                <div>
                  <span className="font-bold text-white block">Breakfast</span>
                  <span className="text-neutral-400 block">High protein sync</span>
                </div>
                <span className="bg-[#2c1d18] text-neutral-300 font-black px-2 py-0.5 rounded text-[9px]">08:20 AM</span>
              </div>

              <div className="flex justify-between items-center bg-[#1e1714] p-3 rounded-2xl text-[10px]">
                <div>
                  <span className="font-bold text-white block">Lunch</span>
                  <span className="text-neutral-400 block">Low Glycemic Load</span>
                </div>
                <span className="bg-[#2c1d18] text-neutral-300 font-black px-2 py-0.5 rounded text-[9px]">01:05 PM</span>
              </div>
            </div>
          </div>

          {/* Personalized Restaurant Ranking list */}
          <div className="rounded-[32px] bg-[#14100e]/95 border border-[#2c1e15] p-5 shadow-lg space-y-4">
            <span className="text-[10px] font-black text-neutral-400 uppercase block">Smart Restaurant Rankings</span>
            <div className="space-y-3">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className="bg-neutral-900 border border-white/5 p-3 rounded-2xl space-y-1 cursor-pointer hover:border-white/10 transition-all hover:scale-[1.01]"
                  onClick={() => setSelectedRestaurant(r)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">{r.name}</span>
                    <span className="text-[9px] text-neutral-300 font-black flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {r.healthRating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-neutral-400">
                    <span>Menu Health: {r.healthyMenuPercent}%</span>
                    <span>AURA Trust: {r.trustScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* COMPARE FLOATING BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#14100e] border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
          <div className="text-[10px]">
            <span className="font-bold text-white block">AI Compare Mode</span>
            <span className="text-neutral-400">{compareList.length} of 2 selected</span>
          </div>
          <div className="flex items-center gap-3">
            {compareList.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 bg-[#1e1714] px-2.5 py-1 rounded-xl text-[10px] border border-[#2c1e15]">
                <span className="text-white font-bold">{c.name.substring(0, 14)}...</span>
                <button onClick={() => handleToggleCompare(c)} className="text-neutral-500 hover:text-white">✕</button>
              </div>
            ))}
          </div>
          {compareList.length === 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="bg-white text-black font-semibold hover:bg-neutral-200 text-black text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-2xl shadow-md cursor-pointer"
            >
              Compare Now
            </button>
          )}
        </div>
      )}

      {/* COMPARISON MODAL */}
      <AnimatePresence>
        {showCompareModal && compareList.length === 2 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowCompareModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-3xl bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">AURA Side-by-Side Comparison</span>
                <button onClick={() => setShowCompareModal(false)} className="p-1 text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-6 items-stretch">
                {compareList.map((meal) => (
                  <div key={meal.id} className="bg-[#14100e] border border-[#2c1e15] p-5 rounded-[28px] space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-white/5 text-neutral-300 px-2 py-0.5 rounded font-black uppercase">{meal.restaurantName}</span>
                        <span className="text-xs font-black text-neutral-300">{meal.auraScore}/100</span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">{meal.name}</h4>

                      {/* Animated comparisons bars representation */}
                      <div className="mt-4 space-y-3 pt-3 border-t border-[#2c1e15]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Calories:</span>
                            <span className="font-bold text-white">{meal.nutrients.calories} kcal</span>
                          </div>
                          <div className="w-full bg-[#1e1714] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white text-black font-semibold h-1.5" style={{ width: `${(meal.nutrients.calories / 700) * 100}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Protein:</span>
                            <span className="font-bold text-white">{meal.nutrients.proteinG}g</span>
                          </div>
                          <div className="w-full bg-[#1e1714] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5" style={{ width: `${(meal.nutrients.proteinG / 55) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowCompareModal(false); setSelectedOptimizerMeal(meal); }}
                      className="w-full mt-4 py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-2xl text-[10px] uppercase tracking-wider cursor-pointer shadow-md"
                    >
                      Choose & Optimize
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OPTIMIZER & CHECKOUT SCREEN MODAL */}
      <AnimatePresence>
        {selectedOptimizerMeal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setSelectedOptimizerMeal(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-lg bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> AURA Upgrade Optimizer
                </span>
                <button onClick={() => setSelectedOptimizerMeal(null)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-white">{selectedOptimizerMeal.name}</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">By {selectedOptimizerMeal.restaurantName}</p>
                  </div>
                  <span className="text-lg font-black text-neutral-300">{calculateOptimizedStats(selectedOptimizerMeal).auraScore}/100</span>
                </div>

                {/* Optimizations Checklist */}
                <div className="bg-[#14100e] border border-[#2c1e15] p-4 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-neutral-300 uppercase tracking-wider block">Custom Upgrades</span>
                  <div className="space-y-2 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.lessOil}
                        onChange={(e) => setModifications({ ...modifications, lessOil: e.target.checked })}
                        className="rounded border-[#2c1e15] bg-[#1e1714] text-white focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Less Oil (-120 kcal)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.brownRice}
                        onChange={(e) => setModifications({ ...modifications, brownRice: e.target.checked })}
                        className="rounded border-[#2c1e15] bg-[#1e1714] text-white focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Brown Rice Base (-40 kcal)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.extraProtein}
                        onChange={(e) => setModifications({ ...modifications, extraProtein: e.target.checked })}
                        className="rounded border-[#2c1e15] bg-[#1e1714] text-white focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Extra Chicken / Paneer (+18g Protein, +₹90)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.noCheese}
                        onChange={(e) => setModifications({ ...modifications, noCheese: e.target.checked })}
                        className="rounded border-[#2c1e15] bg-[#1e1714] text-white focus:ring-0 focus:ring-offset-0"
                      />
                      <span>No Cheese (-150 kcal)</span>
                    </label>
                  </div>
                </div>

                {/* Recalculated dynamic macros */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-[#14100e] border border-[#2c1e15] p-3 rounded-2xl">
                  <div>
                    <span className="text-neutral-500 block">Energy</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).calories} kcal</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Protein</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).protein}g</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Carbs</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).carbs}g</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Fat</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).fat}g</span>
                  </div>
                </div>

                {/* AI Before & After Physiology Simulator */}
                <div className="bg-[#14100e] border border-white/20/10 p-4 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black text-neutral-300 uppercase tracking-wider block flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> AI 2-Hour Physiology Simulation
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-[10px] text-neutral-300">
                    <div className="space-y-1.5">
                      <span className="text-rose-400 font-bold block">❌ Raw Meal Profile</span>
                      <p>💥 High Glycemic spike in 30 mins</p>
                      <p>💤 Drowsiness & energy crash in 2 hrs</p>
                    </div>
                    <div className="space-y-1.5 border-l border-[#2c1e15] pl-3">
                      <span className="text-emerald-400 font-bold block">✓ Optimized Profile</span>
                      <p>📈 Stabilized blood sugar curve</p>
                      <p>⚡ Sustained energy & Focus (+25%)</p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 flex justify-between items-center font-black pt-1">
                  <span>Price: ₹{calculateOptimizedStats(selectedOptimizerMeal).price}</span>
                  <span className="text-neutral-300 font-bold">Saved: {calculateOptimizedStats(selectedOptimizerMeal).caloriesSaved} kcal</span>
                </div>

                <button
                  onClick={() => {
                    triggerOrderRedirection(selectedOptimizerMeal);
                    setSelectedOptimizerMeal(null);
                  }}
                  className="w-full py-3.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(249,115,22,0.35)]"
                >
                  Order on {selectedOptimizerMeal.platform} →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedMeal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setSelectedMeal(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-lg bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">AURA Dish Analysis</span>
                <button onClick={() => setSelectedMeal(null)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedMeal.name}</h3>
                    <p className="text-[10px] text-neutral-400">{selectedMeal.restaurantName} | {selectedMeal.platform}</p>
                  </div>
                  <span className="text-2xl font-black text-neutral-300">{selectedMeal.auraScore}/100</span>
                </div>

                {/* Macro & Micro details */}
                <div className="bg-[#14100e] border border-[#2c1e15] p-4.5 rounded-[24px] space-y-3">
                  <div>
                    <span className="text-[9px] text-neutral-300 font-black uppercase tracking-wider block">Expected Feeling After Eating</span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-xl bg-white/5 text-neutral-300 text-xs font-bold uppercase tracking-wider">{selectedMeal.expectedFeeling}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-neutral-300 font-black uppercase tracking-wider block">Why Recommended</span>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{selectedMeal.whyRecommend}</p>
                  </div>

                  <div>
                    <span className="text-[9px] text-neutral-300 font-black uppercase tracking-wider block">Why Avoid</span>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{selectedMeal.whyAvoid}</p>
                  </div>
                </div>

                {/* Alternatives */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">AI Healthy Alternatives</span>
                  <div className="bg-[#1e1714] border border-[#2c1e15] p-4 rounded-2xl text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Suggested Upgrade: {selectedMeal.alternativeName}</span>
                      <span className="text-neutral-500 block">Saves extra fats and carbohydrates.</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setSelectedMeal(null); setSelectedOptimizerMeal(selectedMeal); }}
                    className="flex-1 py-3.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Proceed with Optimizer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SMART LOCATION MODAL */}
      <AnimatePresence>
        {showLocationModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowLocationModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white uppercase tracking-widest block">Configure Delivery Location</span>
                <button onClick={() => setShowLocationModal(false)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={requestGPSLocation}
                  className="w-full py-3 bg-[#1e1714] border border-white/10 hover:border-white/20/40 text-neutral-300 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Compass className="w-4.5 h-4.5" /> Detect location using Browser GPS
                </button>

                <div className="space-y-2 pt-2 border-t border-[#2c1e15]">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Or Set Manually</span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City (e.g. Bengaluru)"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="bg-[#1e1714] border border-[#2c1e15] rounded-xl text-xs text-white p-2"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code (e.g. 560001)"
                      value={manualPIN}
                      onChange={(e) => setManualPIN(e.target.value)}
                      className="bg-[#1e1714] border border-[#2c1e15] rounded-xl text-xs text-white p-2"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentAddress(`${manualCity}, ${manualPIN} (Manual)`);
                    setShowLocationModal(false);
                    toast.success(`Location set manually to ${manualCity}`);
                  }}
                  className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md"
                >
                  Confirm Address
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SMART BUDGET MODAL */}
      <AnimatePresence>
        {showBudgetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white uppercase tracking-widest block">Configure Monthly Budget</span>
                <button onClick={() => setShowBudgetModal(false)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1">Monthly Spending Limit (₹)</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    className="w-full bg-[#1e1714] border border-[#2c1e15] rounded-xl text-xs text-white p-2"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Remaining Balance:</span>
                  <span className="text-white font-black">₹{monthlyLimit - spentThisMonth}</span>
                </div>

                <button
                  onClick={() => {
                    setShowBudgetModal(false);
                    toast.success('Budget settings updated');
                  }}
                  className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md"
                >
                  Save Budget Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FOOD CAMERA SCANNER MODAL */}
      <AnimatePresence>
        {showCameraModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowCameraModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0e0b0a] border border-[#2c1e15] rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white uppercase tracking-widest block flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-white" /> GAMA Food Camera Scanner
                </span>
                <button onClick={() => setShowCameraModal(false)} className="text-neutral-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                {/* Simulated viewfinder */}
                <div className="aspect-video bg-[#14100e] border border-[#2c1e15] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  {cameraScanning ? (
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin mx-auto" />
                      <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider block">AI parsing plate...</span>
                    </div>
                  ) : scannedResult ? (
                    <div className="p-4 text-center space-y-2">
                      <h4 className="text-sm font-black text-white">{scannedResult.name}</h4>
                      <p className="text-[11px] text-neutral-400">Calories: {scannedResult.calories} kcal | Protein: {scannedResult.protein}g</p>
                      <p className="text-[10px] text-rose-400">AURA Health Score: {scannedResult.score}/100</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="w-8 h-8 text-neutral-500 mx-auto" />
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Ready to Scan</span>
                    </div>
                  )}
                </div>

                {scannedResult && (
                  <div className="bg-[#1e1714] border border-[#2c1e15] p-3 rounded-2xl text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Healthy local match:</span>
                      <span className="text-neutral-500 block">{scannedResult.healthyMatch}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCameraModal(false);
                        const match = meals.find(m => m.name === scannedResult.healthyMatch);
                        if (match) setSelectedOptimizerMeal(match);
                      }}
                      className="px-3 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      Configure Match
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSimulatedCameraScan}
                  className="w-full py-3 bg-[#1e1714] border border-white/10 hover:border-white/20/40 text-neutral-300 font-bold rounded-2xl text-xs uppercase tracking-wider"
                >
                  Trigger Simulated Scan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RESTAURANT PAGE MENU OVERLAY */}
      <AnimatePresence>
        {selectedRestaurant && (
          <RestaurantOverlay
            restaurant={selectedRestaurant}
            meals={meals}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOptimize={(meal) => {
              setSelectedRestaurant(null);
              setSelectedOptimizerMeal(meal);
            }}
            onOrderNow={(meal) => {
              setSelectedRestaurant(null);
              setCheckoutMeal(meal);
            }}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </AnimatePresence>

      {/* PRE-ORDER BIOMETRICS CHECKLIST */}
      <AnimatePresence>
        {checkoutMeal && (
          <PreOrderChecklist
            meal={checkoutMeal}
            onClose={() => setCheckoutMeal(null)}
            onConfirmRedirect={() => {
              toast.success(`Redirecting to ${checkoutMeal.platform} deep-link for checkout...`);
              setCheckoutMeal(null);
              window.open(checkoutMeal.platform === 'Swiggy' ? 'https://www.swiggy.com' : 'https://www.zomato.com', '_blank');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
