'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Sparkles, Filter, Check, ArrowRight, Info,
  Flame, Droplets, Zap, ShieldAlert, Award, Star, Compass, Clock,
  Maximize2, Plus, Sliders, ChevronRight, X, Heart, ShieldCheck, Soup, Smile, Calendar, Trash2,
  Camera, Volume2, CloudSun, MapPin, AlertTriangle, Brain, RefreshCw, BarChart3, TrendingUp, Landmark, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { toast } from 'sonner';

import { useHealthStore } from '@/lib/store';
import { FoodProviderManager, Restaurant, Meal, GroceryItem } from '@/lib/ai/marketplace/food-provider';
import { MockProvider } from '@/lib/ai/marketplace/mock-provider';
import RestaurantOverlay from '@/components/live-order/RestaurantOverlay';
import PreOrderChecklist from '@/components/live-order/PreOrderChecklist';
import NearbyRestaurantsPanel from '@/components/live-order/NearbyRestaurantsPanel';
import EdamamNutritionPanel from '@/components/live-order/EdamamNutritionPanel';

// Initialize Pluggable Mock Provider
if (typeof window !== 'undefined') {
  FoodProviderManager.setProvider(new MockProvider());
}

export default function LiveOrderPage() {
  const { sleepHours, stressLevel, hrv, heartRate, steps } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [checkingRole, setCheckingRole] = React.useState(true);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const provider = React.useMemo(() => FoodProviderManager.getProvider(), []);

  // UI Modes & States
  const [activeTab, setActiveTab] = React.useState<'favorites' | 'nearby' | 'planner' | 'grocery' | 'insights'>('favorites');
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
  const [currentAddress, setCurrentAddress] = React.useState('Bengaluru Corporate Park, Block 4B');
  const [manualCity, setManualCity] = React.useState('Bengaluru');
  const [manualPIN, setManualPIN] = React.useState('560001');
  const [showLocationModal, setShowLocationModal] = React.useState(false);

  // Mood & Weather Intelligence States
  const [currentWeather, setCurrentWeather] = React.useState<'Hot & Humid' | 'Monsoon Rain' | 'Cool Winter'>('Hot & Humid');
  const [currentMood, setCurrentMood] = React.useState<'Stressed' | 'Low Energy' | 'High Recovery' | ''>('');

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
    bloating: ['Paneer Tikka Fiber Wrap', 'Double Cheese Burger'],
    recovery: ['Avocado Quinoa Greens Bowl', 'Omega-3 Salmon Superbowl'],
    sleep: ['Ginger Garlic Lentil Soup', 'Chamomile Tea']
  });

  // Loaded Catalog Data
  const [favRestaurants, setFavRestaurants] = React.useState<any[]>([]);
  const [favMeals, setFavMeals] = React.useState<any[]>([]);
  const [favOnlyFilter, setFavOnlyFilter] = React.useState(false);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [groceries, setGroceries] = React.useState<GroceryItem[]>([]);

  // Testimonials Carousel Slide State
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);

  const testimonials = [
    {
      quote: "GAMA has completely synchronized my eating with my fitness loops. Ordering calorie-optimized foods on Swiggy has never been this seamless!",
      author: "Rohan Sharma",
      role: "Marathon Runner",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60"
    },
    {
      quote: "The GPS scanning for healthy food options near my office is a lifesaver. Plus, custom macro adjustment actually recalculated everything for me.",
      author: "Aditi Rao",
      role: "Product Manager",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    },
    {
      quote: "I saved almost 400 calories on my favorite paneer wraps last week using the AI custom recommendations. Extremely premium layout!",
      author: "Kabir Mehta",
      role: "Software Architect",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60"
    }
  ];

  // Default Healthy Favorites when search is empty
  const defaultFavorites: Meal[] = [
    {
      id: "fav-1",
      name: "Garden Fresh Chicken Salad",
      restaurantId: "954281",
      restaurantName: "Green Olive Deli",
      platform: "Swiggy",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      price: 320,
      category: "Salads",
      auraScore: 94,
      nutrients: {
        calories: 320,
        proteinG: 28,
        carbsG: 18,
        fatG: 14,
        fiberG: 6,
        sugarG: 4,
        sodiumMg: 340,
        glycemicLoad: 4,
        processingLevel: "Minimally Processed",
        vitamins: ["Vitamin A", "Vitamin C"],
        minerals: ["Iron", "Calcium"]
      },
      scores: {
        overall: 94, recovery: 92, protein: 90, digestion: 95, sleep: 90, workout: 92, hydration: 80, brain: 85, longevity: 90, gut: 94, inflammation: 90
      },
      whyRecommend: "High lean protein, rich in organic dietary fiber, and low glycemic index.",
      whyAvoid: "Dressing contains sunflower oil. Ask for olive oil dressing on side.",
      alternativeName: "Keto Greens Bowl",
      alternativeId: "fav-alt-1",
      expectedFeeling: "Energized"
    },
    {
      id: "fav-2",
      name: "Avocado Chocolate Chia Mousse",
      restaurantId: "969857",
      restaurantName: "Pure Green Confectionery",
      platform: "Swiggy",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      price: 180,
      category: "Desserts",
      auraScore: 95,
      nutrients: {
        calories: 160,
        proteinG: 6,
        carbsG: 12,
        fatG: 10,
        fiberG: 6,
        sugarG: 2,
        sodiumMg: 45,
        glycemicLoad: 2,
        processingLevel: "Minimally Processed",
        vitamins: ["Vitamin E", "B-Complex"],
        minerals: ["Magnesium", "Potassium"]
      },
      scores: {
        overall: 95, recovery: 90, protein: 70, digestion: 96, sleep: 92, workout: 80, hydration: 75, brain: 85, longevity: 92, gut: 94, inflammation: 95
      },
      whyRecommend: "Rich in healthy monounsaturated fats, sugar-free, loaded with prebiotic fiber from chia seeds.",
      whyAvoid: "None. Premium guilt-free dessert.",
      alternativeName: "Low-GI Almond Berry Tart",
      alternativeId: "fav-alt-2",
      expectedFeeling: "Energized"
    },
    {
      id: "fav-3",
      name: "Protein Power Bowl",
      restaurantId: "235825",
      restaurantName: "The Healthy Kitchen",
      platform: "Swiggy",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
      price: 420,
      category: "Main Dish",
      auraScore: 97,
      nutrients: {
        calories: 520,
        proteinG: 38,
        carbsG: 45,
        fatG: 16,
        fiberG: 8,
        sugarG: 2,
        sodiumMg: 420,
        glycemicLoad: 6,
        processingLevel: "Unprocessed",
        vitamins: ["Vitamin K", "B-Complex"],
        minerals: ["Magnesium", "Zinc"]
      },
      scores: {
        overall: 97, recovery: 98, protein: 99, digestion: 92, sleep: 85, workout: 98, hydration: 80, brain: 90, longevity: 95, gut: 92, inflammation: 95
      },
      whyRecommend: "Perfect macronutrient distribution for post-training cell repair. Contains quinoa, black beans, and grilled chicken breast.",
      whyAvoid: "None. This is an AURA Gold standard meal.",
      alternativeName: "Wild Salmon Bowl",
      alternativeId: "fav-alt-3",
      expectedFeeling: "Perfect Before Workout"
    },
    {
      id: "fav-4",
      name: "Cold-Pressed Green Detox Juice",
      restaurantId: "12345",
      restaurantName: "Green Grocer Cafe",
      platform: "Swiggy",
      imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60",
      price: 190,
      category: "Drinks",
      auraScore: 96,
      nutrients: {
        calories: 70,
        proteinG: 2,
        carbsG: 14,
        fatG: 0,
        fiberG: 4,
        sugarG: 4,
        sodiumMg: 50,
        glycemicLoad: 1,
        processingLevel: "Unprocessed",
        vitamins: ["Vitamin A", "Vitamin C", "Vitamin K"],
        minerals: ["Potassium", "Calcium"]
      },
      scores: {
        overall: 96, recovery: 92, protein: 50, digestion: 98, sleep: 90, workout: 75, hydration: 98, brain: 90, longevity: 96, gut: 96, inflammation: 98
      },
      whyRecommend: "100% cold-pressed celery, cucumber, kale, spinach, and lemon. High chlorophyll & alkaline hydration.",
      whyAvoid: "None. Ideal cellular recovery intake.",
      alternativeName: "Organic Matcha Oat Latte",
      alternativeId: "fav-alt-4",
      expectedFeeling: "Energized"
    }
  ];

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (data.success) {
        setFavRestaurants(data.restaurants || []);
        setFavMeals(data.meals || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const toggleFavoriteRestaurant = async (restaurant: Restaurant) => {
    const isFav = favRestaurants.some(r => r.restaurantId === restaurant.id);
    try {
      if (isFav) {
        const res = await fetch(`/api/favorites?type=restaurant&id=${restaurant.id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          setFavRestaurants(prev => prev.filter(r => r.restaurantId !== restaurant.id));
          toast.success(`${restaurant.name} removed from favorites`);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'restaurant',
            restaurantId: restaurant.id,
            name: restaurant.name,
            platform: restaurant.platform || 'Swiggy',
            healthRating: restaurant.healthRating
          })
        });
        const data = await res.json();
        if (data.success) {
          setFavRestaurants(prev => [data.restaurant, ...prev]);
          toast.success(`${restaurant.name} added to favorites`);
        }
      }
    } catch (err) {
      console.error('Error toggling restaurant favorite:', err);
      toast.error('Failed to update favorites');
    }
  };

  const toggleFavoriteMeal = async (meal: Meal) => {
    const isFav = favMeals.some(m => m.mealId === meal.id);
    try {
      if (isFav) {
        const res = await fetch(`/api/favorites?type=meal&id=${meal.id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          setFavMeals(prev => prev.filter(m => m.mealId !== meal.id));
          toast.success(`${meal.name} removed from favorites`);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'meal',
            mealId: meal.id,
            name: meal.name,
            restaurantName: meal.restaurantName,
            platform: meal.platform || 'Swiggy',
            auraScore: meal.auraScore,
            calories: meal.nutrients.calories,
            protein: meal.nutrients.proteinG
          })
        });
        const data = await res.json();
        if (data.success) {
          setFavMeals(prev => [data.meal, ...prev]);
          toast.success(`${meal.name} added to favorites`);
        }
      }
    } catch (err) {
      console.error('Error toggling meal favorite:', err);
      toast.error('Failed to update favorites');
    }
  };

  const isFavoriteRestaurant = (id: string) => favRestaurants.some(r => r.restaurantId === id);
  const isFavoriteMeal = (id: string) => favMeals.some(m => m.mealId === id);

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
    fetchFavorites();

    // Fetch user details for Gating Check
    setCheckingRole(true);
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUserRole(data.user.role || 'USER');
        }
      })
      .catch(err => console.error('Error fetching role:', err))
      .finally(() => setCheckingRole(false));
  }, [provider]);

  // Load Catalog from Pluggable active provider with pagination
  const loadCatalog = async (resetPage = false) => {
    if (!provider) return;
    const targetPage = resetPage ? 1 : page;
    setIsLoadingMore(true);

    const rData = await provider.getRestaurants({ vegOnly: vegFilter, favOnly: favOnlyFilter, query: debouncedQuery, page: targetPage });
    const mData = await provider.getMeals({ vegOnly: vegFilter, highProtein: highProteinFilter, favOnly: favOnlyFilter, query: debouncedQuery, page: targetPage });
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
  }, [vegFilter, highProteinFilter, favOnlyFilter, debouncedQuery]);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradeClick = async () => {
    setShowVideoModal(true);

    // Start loading Razorpay script in background
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway. Please check your internet connection.");
      setShowVideoModal(false);
      return;
    }

    // Play video for 4.5 seconds
    setTimeout(async () => {
      try {
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (!data.success) {
          toast.error(data.error || 'Failed to create payment order.');
          setShowVideoModal(false);
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'GAMA PRO Plan',
          description: 'Sovereign Health Intelligence Core Access',
          order_id: data.orderId,
          handler: async function (response: any) {
            setShowVideoModal(false);
            const verifyRes = await fetch('/api/payment/verify-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success('GAMA PRO subscription activated successfully!');
              setUserRole('PRO');
            } else {
              toast.error(verifyData.error || 'Payment signature verification failed.');
            }
          },
          prefill: {
            name: 'User',
            email: 'user@gama.fit'
          },
          theme: {
            color: '#06b6d4'
          },
          modal: {
            ondismiss: function () {
              setShowVideoModal(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error('Payment initialization error:', err);
        toast.error('An error occurred during payment checkout.');
        setShowVideoModal(false);
      }
    }, 4500); // 4.5 seconds of video
  };

  if (!mounted || checkingRole) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  // Gated Access Screen for Non-PRO
  if (userRole !== 'PRO' && userRole !== 'pro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-6 py-12 relative overflow-hidden select-none bg-[#070709] w-full">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        {/* Pricing/Gating Container */}
        <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-3xl p-8 rounded-[36px] text-center shadow-2xl flex flex-col justify-between min-h-[500px]">
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10 text-amber-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 font-display-jakarta">Pro Marketplace</span>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase mt-2 font-serif-retro">LIVE Order Gated</h2>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed mt-2 font-sans">
                Order custom, personalized chronobiological meals synced live with Swiggy catalog. GAMA PRO unlocks biometric nutrition optimization.
              </p>
            </div>

            <div className="border-t border-b border-white/5 py-5 my-2">
              <div className="flex justify-between items-center px-4">
                <span className="text-xs text-neutral-500 font-bold uppercase font-display-jakarta">Pro Core Subscription</span>
                <span className="text-xl font-black text-white font-serif-retro">999 INR <span className="text-[10px] font-bold text-neutral-500">/ month</span></span>
              </div>
            </div>

            <ul className="text-left text-xs text-neutral-300 space-y-2.5 max-w-xs mx-auto py-2 font-sans">
              <li className="flex items-center gap-2">✓ Unlimited Personalized Calorie Ordering</li>
              <li className="flex items-center gap-2">✓ Climate-Adapted Food Intelligence</li>
              <li className="flex items-center gap-2">✓ Auto Macronutrient Tracking</li>
              <li className="flex items-center gap-2">✓ Real-time Swiggy Catalog Integrations</li>
            </ul>
          </div>

          <button
            onClick={handleUpgradeClick}
            className="w-full py-4 mt-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Upgrade to PRO
          </button>
        </div>

        {/* Video Pop-up Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <video
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                src="/subscrption_pop_up_video.mp4.mp4"
              />
              <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-neutral-300">
                Preparing checkout portal...
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Geolocation triggers
  const requestGPSLocation = () => {
    setLocationPermission('prompt');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission('granted');
        setCurrentAddress(`GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
        toast.success('GPS coordinates retrieved successfully');
      },
      () => {
        setLocationPermission('denied');
        toast.error('Location permission denied. Enter details manually.');
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
    toast.success(`Redirecting to Swiggy/Zomato search query for ${meal.restaurantName}...`);

    const platform = (meal.platform || 'Swiggy') as 'Swiggy' | 'Zomato';
    const encodedName = encodeURIComponent(meal.restaurantName);
    const webUri = platform === 'Swiggy'
      ? `https://www.swiggy.com/search?query=${encodedName}`
      : `https://www.zomato.com/search?q=${encodedName}`;

    window.open(webUri, '_blank');

    // Start post-meal digestion tracking timeline
    setActiveOrderTimeline('Preparing');
    setTimeout(() => setActiveOrderTimeline('Cooking'), 4000);
    setTimeout(() => setActiveOrderTimeline('Picked Up'), 8000);
    setTimeout(() => setActiveOrderTimeline('Delivered'), 12000);
    setTimeout(() => {
      setActiveOrderTimeline('Digesting');
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

  // Camera scanner simulator
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
        healthyMatch: 'Protein Power Bowl'
      });
      toast.success('AI Scanner completed successfully!');
    }, 2000);
  };

  // Voice Command simulator
  const triggerVoiceCommand = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setIsListeningVoice(false);
      setVoiceQueryInput('High protein breakfast under ₹350');
      setSearchQuery('Chicken');
      setActiveTab('favorites');
      toast.success('Searching "High protein breakfast under ₹350"');
    }, 2500);
  };

  // Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Dynamic Meals mapping
  const mealsListToRender = searchQuery.trim() === '' ? defaultFavorites : meals;

  return (
    <div className="min-h-screen bg-[#070709] text-[#eae3dc] relative overflow-x-hidden font-sans">

      {/* Background cinematic glowing layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black flex items-center justify-center">
            <img src="/logo.jpg?v=2" alt="GAMA" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif-retro italic font-black text-xl tracking-wider text-[#eae3dc]">GAMA</span>
        </div>

        {/* Clean top header links */}
        <nav className="flex items-center gap-4 md:gap-8 text-[11px] font-black uppercase tracking-wider text-neutral-400 font-display-jakarta">
          <button onClick={() => toast.info('Career openings loading...')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Career</button>
          <button onClick={() => scrollToSection('customer-favorites')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Menu</button>
          <button onClick={() => scrollToSection('app-download')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">The App</button>
          <button onClick={() => toast.info('Franchise information inquiry sent')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Franchise</button>
          <button onClick={() => setShowLocationModal(true)} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 bg-transparent border-none">📍 Delivery</button>
          <button onClick={() => toast.info('View open positions')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Jobs</button>
        </nav>

        {/* Delivery & Budget action pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 bg-[#141110] border border-white/10 px-3 py-1.5 rounded-full text-[10px] hover:border-white/20 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-white font-extrabold max-w-[120px] truncate">{currentAddress}</span>
          </button>

          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-1.5 bg-[#141110] border border-[#2c2018] px-3 py-1.5 rounded-full text-[10px] hover:border-amber-500/20 transition-colors"
          >
            <Landmark className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-300 font-extrabold">₹{spentThisMonth}/₹{monthlyLimit}</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION ("A good BUNCH") */}
      <section className="relative w-full py-16 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="relative w-full aspect-16/10 md:aspect-21/9 rounded-[36px] overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-end p-6 md:p-12">

          {/* Background image of dining friends */}
          <div className="absolute inset-0 z-0">
            <img
              src="/live_order_vibe.png"
              className="w-full h-full object-cover filter brightness-[0.5] contrast-[1.05]"
              alt="Premium Salad"
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl space-y-4 md:space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] md:text-xs font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/25 px-3.5 py-1 rounded-full font-display-jakarta inline-block">
                Biometric Live Ordering
              </span>
              <h1 className="text-5xl md:text-7xl font-serif-retro italic text-white leading-none tracking-tight">
                A good <br className="hidden sm:inline" /><span className="font-extrabold tracking-normal">BUNCH</span>
              </h1>
            </div>

            <p className="text-sm md:text-base italic text-neutral-300 font-serif-retro">
              "For the best experience, eat at 'full volume'"
            </p>

            <button
              onClick={() => scrollToSection('customer-favorites')}
              className="group inline-flex items-center gap-3 bg-white text-black hover:bg-neutral-200 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-white/10 cursor-pointer"
            >
              See the menu
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES / COMFORT SECTION */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="w-full bg-[#eae3dc]/95 text-[#0d2e27] border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden">

          <div className="text-center max-w-md mx-auto space-y-2 mb-10">
            <h2 className="text-3xl md:text-4xl font-serif-retro italic font-extrabold tracking-tight">
              Mediterranean Food.<br />Universal Comfort.
            </h2>
            <div className="h-[2px] w-12 bg-[#0d2e27]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Category 1 */}
            <div className="group rounded-[32px] overflow-hidden bg-white/40 border border-[#0d2e27]/10 p-3 flex flex-col justify-between aspect-3/4 hover:shadow-xl transition-all duration-300">
              <div className="w-full aspect-square rounded-[24px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Main Dish"
                />
              </div>
              <div className="pt-4 pb-2 px-2 flex justify-between items-center">
                <span className="font-serif-retro italic font-extrabold text-[#0d2e27] text-lg">Main Dish</span>
                <button
                  onClick={() => { setSearchQuery('Healthy Bowl'); scrollToSection('customer-favorites'); }}
                  className="px-4 py-1.5 bg-[#0d2e27] text-[#eae3dc] rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer border-none"
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Category 2 */}
            <div className="group rounded-[32px] overflow-hidden bg-white/40 border border-[#0d2e27]/10 p-3 flex flex-col justify-between aspect-3/4 hover:shadow-xl transition-all duration-300">
              <div className="w-full aspect-square rounded-[24px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Dessert"
                />
              </div>
              <div className="pt-4 pb-2 px-2 flex justify-between items-center">
                <span className="font-serif-retro italic font-extrabold text-[#0d2e27] text-lg">Dessert</span>
                <button
                  onClick={() => { setSearchQuery('Cake'); scrollToSection('customer-favorites'); }}
                  className="px-4 py-1.5 bg-[#0d2e27] text-[#eae3dc] rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer border-none"
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Category 3 */}
            <div className="group rounded-[32px] overflow-hidden bg-white/40 border border-[#0d2e27]/10 p-3 flex flex-col justify-between aspect-3/4 hover:shadow-xl transition-all duration-300">
              <div className="w-full aspect-square rounded-[24px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Drinks"
                />
              </div>
              <div className="pt-4 pb-2 px-2 flex justify-between items-center">
                <span className="font-serif-retro italic font-extrabold text-[#0d2e27] text-lg">Drinks</span>
                <button
                  onClick={() => { setSearchQuery('Latte'); scrollToSection('customer-favorites'); }}
                  className="px-4 py-1.5 bg-[#0d2e27] text-[#eae3dc] rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer border-none"
                >
                  Explore
                </button>
              </div>
            </div>

          </div>

          {/* Bottom styling border */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-[#0d2e27]" />
        </div>
      </section>

      {/* 4. PROMOTIONAL GREEN BANNER */}
      <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="w-full bg-[#0d2e27] border border-white/5 rounded-[36px] px-6 py-12 md:py-16 text-center relative overflow-hidden flex items-center justify-center shadow-xl">
          {/* Subtle wave overlays */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <p className="text-2xl md:text-4xl font-serif-retro italic text-[#eae3dc] leading-relaxed font-light tracking-wide px-4">
              "To make your mouth water, put a smile on your lips <span className="text-yellow-400 not-italic"></span> and brighten up your lunch breaks"
            </p>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER FAVORITES (LIVE HEALTHY COUNTER) */}
      <section id="customer-favorites" className="py-12 px-4 md:px-8 max-w-7xl mx-auto z-10 space-y-8 scroll-mt-24">

        {/* Title */}
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest font-display-jakarta block">Real-Time Healthy Counter</span>
          <h2 className="text-4xl md:text-5xl font-serif-retro italic font-extrabold tracking-tight text-white">Customer Favorites</h2>
          <p className="text-xs text-neutral-400 font-sans">
            Personalized meal builder integrated with GPS search coordinates. Order from local outlets on Swiggy and Zomato.
          </p>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="bg-[#141110] border border-white/5 rounded-[32px] p-6 shadow-2xl space-y-6">

          {/* Geolocation Scan console & search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

            {/* Tabs */}
            <div className="flex flex-wrap bg-[#1a1614] p-1 rounded-full border border-white/5 gap-1 self-start">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${activeTab === 'favorites' ? 'bg-white text-black font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                ★ Favorites
              </button>
              <button
                onClick={() => setActiveTab('nearby')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1 ${activeTab === 'nearby' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:text-white border border-emerald-500/10'}`}
              >
                📍 Nearby spots
              </button>
              <button
                onClick={() => setActiveTab('planner')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${activeTab === 'planner' ? 'bg-white text-black font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                📅 Weekly Planner
              </button>
              <button
                onClick={() => setActiveTab('grocery')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${activeTab === 'grocery' ? 'bg-white text-black font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                🛒 Grocery List
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${activeTab === 'insights' ? 'bg-white text-black font-semibold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                📊 Insights
              </button>
            </div>

            {/* GPS & Search Panel */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <button
                onClick={requestGPSLocation}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-bold px-4 py-3 rounded-full text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0"
              >
                <Compass className="w-4 h-4" /> Scan Nearby Areas
              </button>

              {/* Global Search Input */}
              <div className="flex-1 relative flex items-center bg-[#1d1917] border border-white/5 rounded-full px-5 py-2.5">
                <Search className="w-4 h-4 text-neutral-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search macro dishes, calories, cuisine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 border-0 focus:outline-none"
                />
                <button
                  onClick={() => setShowCameraModal(true)}
                  className="p-1 hover:bg-[#2c2018] rounded-full text-neutral-400 hover:text-white transition-colors bg-transparent border-none"
                  title="Scan Plate"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Context Adaptors sub-rail */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#1a1614] rounded-2xl border border-white/5">
            <div>
              <span className="text-[9px] text-neutral-500 font-bold block mb-1 uppercase font-display-jakarta">Weather Sync</span>
              <select
                value={currentWeather}
                onChange={(e) => setCurrentWeather(e.target.value as any)}
                className="w-full bg-[#141110] border border-white/5 rounded-xl text-xs text-white p-2 focus:ring-0 focus:outline-none"
              >
                <option value="Hot & Humid">☀️ Hot & Humid (Cooling Foods)</option>
                <option value="Monsoon Rain">🌧️ Monsoon Rain (Warm Comfort)</option>
                <option value="Cool Winter">❄️ Cool Winter (High Cal Comfort)</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] text-neutral-500 font-bold block mb-1 uppercase font-display-jakarta">Biometric Stress Mode</span>
              <select
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value as any)}
                className="w-full bg-[#141110] border border-white/5 rounded-xl text-xs text-white p-2 focus:ring-0 focus:outline-none"
              >
                <option value="">🧘 Normal State</option>
                <option value="Stressed">😫 High Stress (Low Cortisol)</option>
                <option value="Low Energy">🔋 Low Energy (Complex Carbs)</option>
                <option value="High Recovery">🏋️ Heavy Workout Recovery</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] text-neutral-500 font-bold block mb-1 uppercase font-display-jakarta">Weather Adaptation</span>
              <div className="bg-[#141110] border border-white/5 rounded-xl text-xs text-neutral-300 p-2 text-center font-bold">
                {currentWeather === 'Hot & Humid' ? '🍃 Alkaline meals suggested' : currentWeather === 'Monsoon Rain' ? '🍲 Warm thermogenic soups' : '🪵 Comfort protein meals'}
              </div>
            </div>

            <div>
              <span className="text-[9px] text-neutral-500 font-bold block mb-1 uppercase font-display-jakarta">Partner Sync</span>
              <div className="flex gap-2 justify-center py-1">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${swiggyConnected ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25' : 'bg-neutral-800 text-neutral-500'}`}>Swiggy</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${zomatoConnected ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' : 'bg-neutral-800 text-neutral-500'}`}>Zomato</span>
              </div>
            </div>
          </div>

          {/* ACTIVE TAB CONTENTS */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setVegFilter(!vegFilter)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${vegFilter ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#1a1614] text-neutral-400 border-white/5'}`}
                >
                  🥦 Veg Only
                </button>
                <button
                  onClick={() => setHighProteinFilter(!highProteinFilter)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${highProteinFilter ? 'bg-white/15 text-neutral-300 border-white/20' : 'bg-[#1a1614] text-neutral-400 border-white/5'}`}
                >
                  🍗 High Protein (25g+)
                </button>
                <button
                  onClick={() => setFavOnlyFilter(!favOnlyFilter)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${favOnlyFilter ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-[#1a1614] text-neutral-400 border-white/5'}`}
                >
                  ❤️ Saved Spots Only
                </button>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mealsListToRender.map((meal) => {
                  const isCompared = compareList.find(c => c.id === meal.id);
                  const isFav = favMeals.some(m => m.mealId === meal.id || m.mealId === `meal-${searchQuery}-${meal.restaurantId}`);
                  return (
                    <motion.div
                      key={meal.id}
                      whileHover={{ y: -4 }}
                      className="rounded-[28px] bg-[#1a1614] border border-white/5 overflow-hidden flex flex-col justify-between shadow-lg relative group transition-all"
                    >
                      {/* Aura Score badge */}
                      <div className="absolute top-3 left-3 z-20 bg-black/80 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[9px] text-[#eae3dc] font-black font-display-jakarta">{meal.auraScore}/100</span>
                      </div>

                      {/* Top right actions */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        {/* Favorite toggle */}
                        <button
                          onClick={() => toggleFavoriteMeal(meal)}
                          className={`p-2 rounded-full border transition-all cursor-pointer ${isFav ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-black/60 text-neutral-400 border-white/5 hover:border-white/10'}`}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        {/* Compare toggle */}
                        <button
                          onClick={() => handleToggleCompare(meal)}
                          className={`p-2 rounded-full border transition-all cursor-pointer ${isCompared ? 'bg-white text-black border-white' : 'bg-black/60 text-neutral-400 border-white/5 hover:border-white/10'}`}
                          title="Compare Meal"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Food image wrapper */}
                      <div className="h-44 w-full relative overflow-hidden">
                        <img src={meal.imageUrl} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt={meal.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1614] via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <button
                            onClick={() => {
                              const foundRest = restaurants.find(r => r.id === meal.restaurantId);
                              if (foundRest) {
                                setSelectedRestaurant(foundRest);
                              } else {
                                setSelectedRestaurant({
                                  id: meal.restaurantId,
                                  name: meal.restaurantName,
                                  cuisine: meal.category,
                                  platform: meal.platform || 'Swiggy',
                                  healthRating: 4.5,
                                  trustScore: 90,
                                  healthyMenuPercent: 95,
                                  freshScore: 90,
                                  lowOilAvailable: true,
                                  vegScore: 80,
                                  deliveryReliability: 95,
                                  distanceKm: 2.0,
                                  deliveryTimeMins: 25,
                                  priceForTwo: 300,
                                  isBusyNow: false,
                                  offers: ['Flat 15% OFF with GAMA Pro'],
                                  imageUrl: meal.imageUrl,
                                  scores: { overall: 90, nutrition: 90, recovery: 85, value: 85 }
                                });
                              }
                            }}
                            className="text-[8px] bg-black/60 hover:bg-black/80 text-neutral-300 hover:text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/5 cursor-pointer transition-colors"
                          >
                            {meal.restaurantName}
                          </button>
                        </div>
                      </div>

                      {/* Details block */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-sm font-serif-retro italic font-extrabold text-white group-hover:text-amber-300 transition-colors">{meal.name}</h3>

                          {/* Nutrients preview bar */}
                          <div className="grid grid-cols-4 gap-1 text-center text-[9px] bg-black/40 border border-white/5 rounded-xl p-2 mt-3 font-display-jakarta">
                            <div>
                              <span className="text-neutral-500 block text-[7px] uppercase">Cal</span>
                              <span className="font-bold text-neutral-200">{meal.nutrients.calories}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[7px] uppercase">Pro</span>
                              <span className="font-bold text-neutral-200">{meal.nutrients.proteinG}g</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[7px] uppercase">Carb</span>
                              <span className="font-bold text-neutral-200">{meal.nutrients.carbsG}g</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[7px] uppercase">Fat</span>
                              <span className="font-bold text-neutral-200">{meal.nutrients.fatG}g</span>
                            </div>
                          </div>
                        </div>

                        {/* Rationale explanation box */}
                        <div className="text-[10px] text-neutral-400 leading-relaxed bg-black/30 border border-white/5 p-3 rounded-xl font-sans">
                          <span className="font-black text-amber-500/80 uppercase text-[8px] block mb-1 font-display-jakarta">AURA Sync suggestion</span>
                          {meal.whyRecommend}
                        </div>

                        {/* Action footer */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <div>
                            <span className="text-[8px] text-neutral-500 block uppercase font-display-jakarta">Est. Cost</span>
                            <span className="text-xs font-black text-white">₹{meal.price}</span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => setSelectedOptimizerMeal(meal)}
                              className="px-2.5 py-1.5 bg-[#2c2018] hover:bg-[#3c2a1e] border border-white/5 text-amber-400 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Optimize
                            </button>
                            <button
                              onClick={() => triggerOrderRedirection(meal)}
                              className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none"
                            >
                              Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {searchQuery.trim() !== '' && hasMore && (
                <div ref={loaderRef} className="h-10 w-full flex items-center justify-center pt-4">
                  {isLoadingMore && <span className="text-xs text-neutral-500 font-bold uppercase animate-pulse">Loading verified dishes...</span>}
                </div>
              )}

              {/* Bottom "See full menu" CTA trigger */}
              <div className="text-center pt-4">
                <button
                  onClick={() => { setSearchQuery('Healthy'); toast.info('Loading complete marketplace database...'); }}
                  className="px-6 py-2.5 bg-neutral-900 border border-white/5 hover:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-neutral-300"
                >
                  See The Full Menu
                </button>
              </div>
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <NearbyRestaurantsPanel />
              <EdamamNutritionPanel />
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center bg-[#1a1614] border border-white/5 p-4 rounded-2xl">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-300 font-display-jakarta">7-Day Biometric Meal Plan</span>
                <select
                  value={plannerGoal}
                  onChange={(e) => setPlannerGoal(e.target.value as any)}
                  className="bg-black/60 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 py-1 uppercase tracking-wider focus:outline-none"
                >
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Keto">Keto</option>
                  <option value="Diabetic Friendly">Diabetic Friendly</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plannerDays.map((d, i) => (
                  <div key={i} className="bg-[#1a1614] border border-white/5 p-5 rounded-2xl text-[11px] space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-serif-retro italic font-extrabold text-white text-sm">{d.day}</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black font-display-jakarta">{d.calories} kcal</span>
                    </div>
                    <div className="space-y-1.5 text-neutral-300">
                      <p><span className="text-neutral-500 font-bold uppercase text-[9px] font-display-jakarta block">Breakfast</span> {d.breakfast}</p>
                      <p><span className="text-neutral-500 font-bold uppercase text-[9px] font-display-jakarta block">Lunch</span> {d.lunch}</p>
                      <p><span className="text-neutral-500 font-bold uppercase text-[9px] font-display-jakarta block">Dinner</span> {d.dinner}</p>
                    </div>
                    <button
                      onClick={() => toast.success(`Simulated order triggered for ${d.day}`)}
                      className="w-full mt-2 bg-white hover:bg-neutral-200 text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none"
                    >
                      Order Day Meals (₹{d.cost})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'grocery' && (
            <div className="space-y-4 pt-4">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300 font-display-jakarta block">AI Healthy Grocery list items</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groceries.length > 0 ? groceries.map((item) => (
                  <div key={item.id} className="bg-[#1a1614] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-[9px] font-display-jakarta">
                        <span className="bg-white/5 text-neutral-400 px-2 py-0.5 rounded uppercase font-bold">{item.category}</span>
                        <span className="text-amber-400 font-black">Score: {item.healthScore}/100</span>
                      </div>
                      <h4 className="text-sm font-serif-retro italic font-extrabold text-white mt-2">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 mt-2">Suggest Recipe: <span className="text-neutral-200">{item.recipeSuggestion}</span></p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                      <span className="text-xs font-bold text-white">₹{item.price}</span>
                      <button
                        onClick={() => toast.success(`${item.name} added to your grocery basket`)}
                        className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer border-none"
                      >
                        Add Basket
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-10 bg-[#1a1614] rounded-2xl border border-white/5">
                    <p className="text-xs text-neutral-500 uppercase font-black font-display-jakarta">No query groceries. Search "fruit" or "protein" to load.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="bg-[#1a1614] border border-white/5 rounded-2xl p-6 space-y-6 pt-4">
              <div>
                <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest font-display-jakarta">Eating Behavior Analysis</span>
                <h3 className="text-lg font-serif-retro italic font-extrabold text-white mt-1">GAMA Weekly Nutritional Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                  <span className="text-[8px] text-neutral-500 block uppercase font-display-jakarta">Metabolism Index</span>
                  <span className="text-2xl font-black text-[#eae3dc] font-serif-retro italic block mt-1">94% Optimal</span>
                </div>
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                  <span className="text-[8px] text-neutral-500 block uppercase font-display-jakarta">Sodium Overload risk</span>
                  <span className="text-2xl font-black text-emerald-400 font-serif-retro italic block mt-1">Minimal (3%)</span>
                </div>
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                  <span className="text-[8px] text-neutral-500 block uppercase font-display-jakarta">Average AURA Rating</span>
                  <span className="text-2xl font-black text-amber-400 font-serif-retro italic block mt-1">91 / 100</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 6. EAT MORE SAVE MORE COMBO BANNER */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="w-full bg-[#e2843b] border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Wave background pattern overlays */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

          {/* Left panel */}
          <div className="relative z-10 max-w-lg space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif-retro italic font-black text-white leading-none tracking-tight">
              Eat More<br />Save More
            </h2>

            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-3 bg-white/10 border border-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl">
                <span className="text-base font-bold text-white font-serif-retro">20% Off</span>
                <span className="text-xs text-white/80 font-bold border-l border-white/20 pl-3">First App Order</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 border border-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl">
                <span className="text-base font-bold text-white font-serif-retro">Happy Hour Drinks</span>
                <span className="text-xs text-white/80 font-bold border-l border-white/20 pl-3">Daily between 5-7 PM</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 border border-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl">
                <span className="text-base font-bold text-white font-serif-retro">Combo Deals</span>
                <span className="text-xs text-white/80 font-bold border-l border-white/20 pl-3">Main + Drink + Dessert combos</span>
              </div>
            </div>
          </div>

          {/* Right panel child image and floating seal badge */}
          <div className="relative w-full max-w-sm aspect-square md:aspect-4/3 rounded-3xl overflow-hidden bg-white/10 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80"
              className="w-full h-full object-cover filter brightness-[0.9]"
              alt="Dining healthy"
            />
            {/* Spinning/glowing ORDER NOW seal */}
            <button
              onClick={() => scrollToSection('customer-favorites')}
              className="absolute bottom-6 right-6 w-20 h-20 bg-amber-300 hover:bg-amber-400 border border-white rounded-full flex flex-col items-center justify-center text-center text-[#0d2e27] font-black uppercase text-[10px] leading-tight font-display-jakarta shadow-lg hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
            >
              <span>ORDER</span>
              <span>NOW</span>
            </button>
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS & APP DOWNLOAD */}
      <section id="app-download" className="py-12 px-4 md:px-8 max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">

        {/* Testimonials Carousel (Left) */}
        <div className="lg:col-span-5 bg-[#141110] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between shadow-2xl relative">

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest font-display-jakarta block">Guest Testimonials</span>
            <div className="flex gap-1">
              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={testimonialIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-lg md:text-xl font-serif-retro italic text-[#eae3dc] leading-relaxed pt-2"
              >
                "{testimonials[testimonialIndex].quote}"
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
            <div className="flex items-center gap-3">
              <img
                src={testimonials[testimonialIndex].avatar}
                className="w-10 h-10 rounded-full border border-white/10 object-cover"
                alt="User Avatar"
              />
              <div>
                <span className="text-xs font-black text-white block">{testimonials[testimonialIndex].author}</span>
                <span className="text-[9px] text-neutral-500 block uppercase font-display-jakarta">{testimonials[testimonialIndex].role}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTestimonialIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTestimonialIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* App Download block (Right) */}
        <div className="lg:col-span-7 bg-linear-to-b from-[#141110] to-black border border-white/5 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">

          <div className="space-y-6 max-w-md relative z-10">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest font-display-jakarta block">Mobile Integration</span>
            <h2 className="text-3xl md:text-5xl font-serif-retro italic font-extrabold text-white leading-tight">
              Order your healthy meals Anytime With Our Website
            </h2>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Scan calorie counts, track glycemic load, and check recovery schedules on the go. Available for Apple iOS and Android devices.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => toast.success('Redirecting to Apple App Store...')}
                className="bg-white hover:bg-neutral-200 text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-none font-bold"
              >
                 App Store
              </button>
              <button
                onClick={() => toast.success('Redirecting to Google Play Store...')}
                className="bg-neutral-900 border border-white/10 hover:bg-[#1a1614] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer font-bold"
              >
                ▶ Play Store
              </button>
            </div>
          </div>

          {/* Interactive Phone Graphics Mockup */}
          <div className="relative w-48 h-80 rounded-[32px] border-4 border-neutral-800 bg-[#070709] p-3 flex flex-col justify-between shadow-2xl shrink-0 overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-neutral-800 rounded-full z-20" />

            {/* Screen layout */}
            <div className="flex-1 flex flex-col justify-between pt-4 space-y-3 relative z-10 font-sans">
              <div className="space-y-1">
                <span className="text-[7px] text-amber-500 uppercase tracking-widest block font-bold">Biometrics</span>
                <span className="text-[10px] text-white font-extrabold block">AURA Health OS</span>
              </div>

              {/* Heart rate graph animation representation */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-2 space-y-1">
                <div className="flex justify-between text-[7px] text-neutral-400">
                  <span>Heart Rate</span>
                  <span className="text-red-500 font-bold">{heartRate || 72} BPM</span>
                </div>
                <div className="h-8 flex items-end gap-0.5">
                  <div className="w-1.5 bg-red-500/30 h-3 rounded-sm" />
                  <div className="w-1.5 bg-red-500/50 h-5 rounded-sm" />
                  <div className="w-1.5 bg-red-500/20 h-2 rounded-sm" />
                  <div className="w-1.5 bg-red-500/80 h-7 rounded-sm" />
                  <div className="w-1.5 bg-red-500 h-6 rounded-sm" />
                  <div className="w-1.5 bg-red-500/40 h-4 rounded-sm" />
                </div>
              </div>

              {/* Steps Progress block */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-2 space-y-1.5">
                <div className="flex justify-between text-[7px] text-neutral-400">
                  <span>Daily Steps</span>
                  <span className="text-white font-bold">{steps || 4200} / 10000</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              {/* Calories consumed block */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex justify-between items-center text-[7px]">
                <div>
                  <span className="text-neutral-400 block">Today's Target</span>
                  <span className="text-white font-bold">1,840 kcal remaining</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-[6px] font-bold text-amber-500">
                  42%
                </div>
              </div>
            </div>

            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
          </div>

        </div>
      </section>

      {/* 8. ACTIVE ORDER FLOATING TIMELINE DRAWER */}
      {activeOrderTimeline && (
        <div className="fixed bottom-6 right-6 z-50 w-72 bg-[#141110] border border-white/10 p-5 rounded-3xl shadow-2xl space-y-3 font-sans">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest font-display-jakarta flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Active Order Journey
            </span>
            <button onClick={() => setActiveOrderTimeline(null)} className="text-neutral-500 hover:text-white bg-transparent border-none">✕</button>
          </div>

          <div className="text-[10px] space-y-2">
            <div className="flex justify-between text-neutral-300">
              <span>Status:</span>
              <span className="font-extrabold text-white">{activeOrderTimeline}</span>
            </div>

            <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-amber-500 h-1 transition-all duration-500"
                style={{ width: activeOrderTimeline === 'Preparing' ? '15%' : activeOrderTimeline === 'Cooking' ? '45%' : activeOrderTimeline === 'Picked Up' ? '70%' : activeOrderTimeline === 'Delivered' ? '90%' : '100%' }}
              />
            </div>

            {activeOrderTimeline === 'Digesting' && (
              <div className="bg-black/30 p-2.5 rounded-xl text-[9px] space-y-1">
                <span className="text-neutral-400 block">Metabolic absorption active:</span>
                <div className="w-full bg-neutral-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1" style={{ width: `${digestionProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. COMPARE FLOATING BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#141110] border border-white/10 px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl">
          <div className="text-[10px] font-display-jakarta">
            <span className="font-bold text-white block uppercase font-bold">AI Compare</span>
            <span className="text-neutral-400">{compareList.length} of 2 selected</span>
          </div>
          <div className="flex items-center gap-3">
            {compareList.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 bg-[#1d1917] px-2.5 py-1 rounded-full text-[10px] border border-white/5">
                <span className="text-white font-bold">{c.name.substring(0, 14)}...</span>
                <button onClick={() => handleToggleCompare(c)} className="text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>
            ))}
          </div>
          {compareList.length === 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="bg-white hover:bg-neutral-200 text-black text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-md cursor-pointer border-none font-bold"
            >
              Compare
            </button>
          )}
        </div>
      )}

      {/* 10. COMPARISON MODAL */}
      <AnimatePresence>
        {showCompareModal && compareList.length === 2 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowCompareModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-2xl bg-[#0f0c0b] border border-white/10 rounded-[36px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-display-jakarta">AURA Side-by-Side Analysis</span>
                <button onClick={() => setShowCompareModal(false)} className="p-1 text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-6 items-stretch">
                {compareList.map((meal) => (
                  <div key={meal.id} className="bg-[#141110] border border-white/5 p-5 rounded-[28px] space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded font-black uppercase font-display-jakarta">{meal.restaurantName}</span>
                        <span className="text-xs font-black text-amber-400 font-display-jakarta">{meal.auraScore}/100</span>
                      </div>
                      <h4 className="text-sm font-serif-retro italic font-extrabold text-white mt-2">{meal.name}</h4>

                      {/* Nutrient comparisons */}
                      <div className="mt-4 space-y-3 pt-3 border-t border-white/5 font-sans">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Calories:</span>
                            <span className="font-bold text-white">{meal.nutrients.calories} kcal</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                            <div className="bg-white h-1" style={{ width: `${(meal.nutrients.calories / 700) * 100}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Protein:</span>
                            <span className="font-bold text-white">{meal.nutrients.proteinG}g</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                            <div className="bg-emerald-500 h-1" style={{ width: `${(meal.nutrients.proteinG / 55) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowCompareModal(false); setSelectedOptimizerMeal(meal); }}
                      className="w-full mt-4 py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-black rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-md border-none font-bold"
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

      {/* 11. OPTIMIZER & CHECKOUT SCREEN MODAL */}
      <AnimatePresence>
        {selectedOptimizerMeal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setSelectedOptimizerMeal(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-lg bg-[#0f0c0b] border border-white/10 rounded-[36px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-display-jakarta flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" /> AURA Upgrade Optimizer
                </span>
                <button onClick={() => setSelectedOptimizerMeal(null)} className="text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-serif-retro italic font-extrabold text-white">{selectedOptimizerMeal.name}</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">By {selectedOptimizerMeal.restaurantName}</p>
                  </div>
                  <span className="text-lg font-black text-amber-400 font-display-jakarta">{calculateOptimizedStats(selectedOptimizerMeal).auraScore}/100</span>
                </div>

                {/* Checklist options */}
                <div className="bg-[#141110] border border-white/5 p-4 rounded-xl space-y-3">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block font-display-jakarta">Biometric adjustments</span>
                  <div className="space-y-2 text-neutral-200">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.lessOil}
                        onChange={(e) => setModifications({ ...modifications, lessOil: e.target.checked })}
                        className="rounded border-white/10 bg-[#1d1917] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Less Oil & Fats (-120 kcal)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.brownRice}
                        onChange={(e) => setModifications({ ...modifications, brownRice: e.target.checked })}
                        className="rounded border-white/10 bg-[#1d1917] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Switch to Brown Rice Base (-40 kcal)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.extraProtein}
                        onChange={(e) => setModifications({ ...modifications, extraProtein: e.target.checked })}
                        className="rounded border-white/10 bg-[#1d1917] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Extra Protein booster (+18g Lean Protein, +₹90)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modifications.noCheese}
                        onChange={(e) => setModifications({ ...modifications, noCheese: e.target.checked })}
                        className="rounded border-white/10 bg-[#1d1917] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Zero Cheese & Lactose (-150 kcal)</span>
                    </label>
                  </div>
                </div>

                {/* Updated statistics */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-[#141110] border border-white/5 p-3 rounded-xl font-display-jakarta">
                  <div>
                    <span className="text-neutral-500 block text-[8px] uppercase">Calories</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).calories} kcal</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[8px] uppercase">Protein</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).protein}g</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[8px] uppercase">Carbs</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).carbs}g</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[8px] uppercase">Fat</span>
                    <span className="font-bold text-white">{calculateOptimizedStats(selectedOptimizerMeal).fat}g</span>
                  </div>
                </div>

                {/* Physiology Simulation Panel */}
                <div className="bg-[#141110] border border-white/5 p-4 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block font-display-jakarta flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-amber-500" /> AI 2-Hour Metabolism Simulation
                  </span>

                  <div className="grid grid-cols-2 gap-4 text-[10px] text-neutral-300">
                    <div className="space-y-1">
                      <span className="text-rose-400 font-bold block">🚨 Un-optimized Meal</span>
                      <p>• Fast glycemic insulin spike</p>
                      <p>• Post-meal fatigue & sleepiness</p>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-4">
                      <span className="text-emerald-400 font-bold block">✓ GAMA Optimized Meal</span>
                      <p>• Stable blood glucose curve</p>
                      <p>• +24% sustained focus index</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-neutral-300 flex justify-between items-center font-bold pt-1">
                  <span>Price: ₹{calculateOptimizedStats(selectedOptimizerMeal).price}</span>
                  <span className="text-emerald-400">Saved: {calculateOptimizedStats(selectedOptimizerMeal).caloriesSaved} kcal</span>
                </div>

                <button
                  onClick={() => {
                    triggerOrderRedirection(selectedOptimizerMeal);
                    setSelectedOptimizerMeal(null);
                  }}
                  className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-white/5 border-none font-bold"
                >
                  Order on {selectedOptimizerMeal.platform} →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 12. SMART LOCATION MODAL */}
      <AnimatePresence>
        {showLocationModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowLocationModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0f0c0b] border border-white/10 rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-display-jakarta block">Configure Delivery Location</span>
                <button onClick={() => setShowLocationModal(false)} className="text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <button
                  onClick={() => { requestGPSLocation(); setShowLocationModal(false); }}
                  className="w-full py-3 bg-[#1c1614] border border-white/5 hover:border-white/10 text-neutral-300 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors border-none"
                >
                  <Compass className="w-4 h-4 text-amber-500" /> Detect location using Browser GPS
                </button>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-display-jakarta block">Or Set Manually</span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City (e.g. Bengaluru)"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="bg-[#1c1614] border border-white/5 rounded-xl text-xs text-white p-2.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code (e.g. 560001)"
                      value={manualPIN}
                      onChange={(e) => setManualPIN(e.target.value)}
                      className="bg-[#1c1614] border border-white/5 rounded-xl text-xs text-white p-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentAddress(`${manualCity}, ${manualPIN}`);
                    setShowLocationModal(false);
                    toast.success(`Location set manually to ${manualCity}`);
                  }}
                  className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl uppercase tracking-wider shadow-md cursor-pointer transition-all border-none font-bold"
                >
                  Confirm Address
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 13. BUDGET SETTING MODAL */}
      <AnimatePresence>
        {showBudgetModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0f0c0b] border border-white/10 rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-display-jakarta block">Configure Monthly Budget</span>
                <button onClick={() => setShowBudgetModal(false)} className="text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 font-bold block mb-1 font-display-jakarta uppercase">Monthly Spending Limit (₹)</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    className="w-full bg-[#1c1614] border border-white/5 rounded-xl text-xs text-white p-2.5 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center font-bold">
                  <span className="text-neutral-400 font-medium">Remaining Balance:</span>
                  <span className="text-white">₹{monthlyLimit - spentThisMonth}</span>
                </div>

                <button
                  onClick={() => {
                    setShowBudgetModal(false);
                    toast.success('Budget settings updated');
                  }}
                  className="w-full py-3 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold rounded-2xl uppercase tracking-wider shadow-md cursor-pointer transition-all border-none font-bold"
                >
                  Save Budget Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 14. FOOD CAMERA SCANNER MODAL */}
      <AnimatePresence>
        {showCameraModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setShowCameraModal(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-[#0f0c0b] border border-white/10 rounded-[36px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-display-jakarta block flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-white" /> GAMA Food Camera Scanner
                </span>
                <button onClick={() => setShowCameraModal(false)} className="text-neutral-500 hover:text-white cursor-pointer bg-transparent border-none">✕</button>
              </div>

              <div className="space-y-4 font-sans text-xs">
                {/* Simulated viewfinder */}
                <div className="aspect-video bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  {cameraScanning ? (
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider block font-display-jakarta">AI parsing plate...</span>
                    </div>
                  ) : scannedResult ? (
                    <div className="p-4 text-center space-y-2">
                      <h4 className="text-sm font-serif-retro italic font-extrabold text-white">{scannedResult.name}</h4>
                      <p className="text-[11px] text-neutral-400">Calories: {scannedResult.calories} kcal | Protein: {scannedResult.protein}g</p>
                      <p className="text-[10px] text-amber-400 font-bold font-display-jakarta">AURA Match Health Score: {scannedResult.score}/100</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block font-display-jakarta">Camera Feed Ready</span>
                    </div>
                  )}
                </div>

                {scannedResult && (
                  <div className="bg-[#1c1614] border border-white/5 p-3 rounded-2xl text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Suggested Local Alternative:</span>
                      <span className="text-neutral-400 block">{scannedResult.healthyMatch}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCameraModal(false);
                        const match = defaultFavorites.find(m => m.name === scannedResult.healthyMatch);
                        if (match) setSelectedOptimizerMeal(match);
                      }}
                      className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[9px] uppercase tracking-wider font-black cursor-pointer border-none font-bold"
                    >
                      Optimize Match
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSimulatedCameraScan}
                  className="w-full py-3 bg-[#1c1614] border border-white/5 hover:border-white/10 text-neutral-300 font-bold rounded-2xl uppercase tracking-wider cursor-pointer transition-colors text-[10px] border-none font-bold"
                >
                  Trigger Simulated Camera Scan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 15. RESTAURANT OVERLAY MODAL */}
      <AnimatePresence>
        {selectedRestaurant && (
          <RestaurantOverlay
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            meals={Array.from(
              new Map(
                [...defaultFavorites, ...meals].map((m) => [m.id, m])
              ).values()
            ).filter((m) => m.restaurantId === selectedRestaurant.id)}
            onOptimize={(meal) => {
              setSelectedRestaurant(null);
              setSelectedOptimizerMeal(meal);
            }}
            onOrderNow={triggerOrderRedirection}
            onToggleCompare={handleToggleCompare}
            compareList={compareList}
            onToggleFavoriteRestaurant={toggleFavoriteRestaurant}
            isFavoriteRestaurant={isFavoriteRestaurant}
            onToggleFavoriteMeal={toggleFavoriteMeal}
            isFavoriteMeal={isFavoriteMeal}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
