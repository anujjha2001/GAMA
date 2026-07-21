'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Search, Star, Clock, ChevronRight,
  ExternalLink, RefreshCw, Utensils, Leaf, Phone, Globe,
  AlertTriangle, Wifi, WifiOff, X, Filter, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  totalRatings: number;
  distanceKm: number;
  isOpen: boolean;
  priceLevel: number;
  healthScore: number;
  phone?: string;
  website?: string;
  vegOptions: boolean;
  deliveryAvailable: boolean;
  zomatoUrl: string;
  swiggyUrl: string;
  specialties: string[];
  openingHours: string;
  highlights: string[];
}

interface NearbyRestaurantsPanelProps {
  onSelectRestaurant?: (place: NearbyPlace) => void;
}

export default function NearbyRestaurantsPanel({ onSelectRestaurant }: NearbyRestaurantsPanelProps) {
  const [places, setPlaces] = React.useState<NearbyPlace[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [locationStatus, setLocationStatus] = React.useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('healthy restaurant');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'veg' | 'open' | 'topRated'>('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [lastFetched, setLastFetched] = React.useState<Date | null>(null);

  const fetchNearbyPlaces = async (lat: number, lng: number, query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&query=${encodeURIComponent(query)}&radius=2000`);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setPlaces(data.places);
        setLastFetched(new Date());
        toast.success(`Found ${data.places.length} healthy spots near you`);
      } else {
        toast.error('Could not load nearby places');
      }
    } catch (err) {
      toast.error('Network error fetching nearby places');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        setAddress(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);

        // Reverse geocode via a simple lookup using coordinates
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'GAMA-Health-OS/1.0' } }
          );
          const geoData = await geoRes.json();
          if (geoData?.display_name) {
            const parts = geoData.display_name.split(',');
            setAddress(parts.slice(0, 3).join(',').trim());
          }
        } catch {}

        toast.success('GPS location acquired!');
        await fetchNearbyPlaces(latitude, longitude, searchQuery);
      },
      (err) => {
        setLocationStatus('denied');
        toast.error('Location access denied. Enable GPS permissions to see nearby restaurants.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSearch = async () => {
    if (!coords) {
      toast.warning('Please enable location first');
      return;
    }
    await fetchNearbyPlaces(coords.lat, coords.lng, searchQuery);
  };

  const filteredPlaces = places.filter(p => {
    if (activeFilter === 'veg') return p.vegOptions;
    if (activeFilter === 'open') return p.isOpen;
    if (activeFilter === 'topRated') return p.rating >= 4.0;
    return true;
  });

  const getPriceLevelSymbol = (level: number) => '₹'.repeat(Math.max(1, Math.min(level || 1, 4)));
  const getHealthColor = (score: number) => score >= 75 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-red-400';
  const getHealthBg = (score: number) => score >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 55 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="rounded-[32px] bg-[#0e0c0a]/95 backdrop-blur-xl border border-white/8 p-5 shadow-2xl space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${locationStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            LIVE Nearby Intelligence
          </span>
          <h3 className="text-sm font-black text-white mt-0.5">Google Places + AI</h3>
        </div>
        {lastFetched && (
          <button
            onClick={() => coords && fetchNearbyPlaces(coords.lat, coords.lng, searchQuery)}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* GPS Location Button */}
      {locationStatus === 'idle' && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={requestLocation}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-2xl py-4 text-sm font-bold text-orange-300 hover:from-orange-600/30 hover:to-amber-600/30 transition-all"
        >
          <Navigation className="w-4 h-4" />
          Enable GPS — Find Healthy Spots Near Me
        </motion.button>
      )}

      {locationStatus === 'requesting' && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">Acquiring GPS coordinates...</span>
        </div>
      )}

      {locationStatus === 'denied' && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-400">Location Access Denied</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Enable location in browser settings and refresh.</p>
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <>
          {/* Location indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-emerald-300 font-semibold flex-1 truncate">{address}</span>
            <span className="text-[9px] text-neutral-500 shrink-0">LIVE</span>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#1a1410] border border-white/8 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="healthy restaurant, salad bar, cafe..."
                className="bg-transparent text-xs text-white placeholder:text-neutral-500 flex-1 focus:outline-none"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </motion.button>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'veg', 'open', 'topRated'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${
                  activeFilter === f
                    ? 'bg-white/15 border-white/20 text-white'
                    : 'bg-white/3 border-white/8 text-neutral-400 hover:border-white/15'
                }`}
              >
                {f === 'all' ? 'All' : f === 'veg' ? '🌿 Veg Options' : f === 'open' ? '🟢 Open Now' : '⭐ 4.0+'}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-white/3 border border-white/5 p-4 animate-pulse space-y-2">
              <div className="h-3 bg-white/10 rounded w-2/3" />
              <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Places list */}
      {!loading && filteredPlaces.length > 0 && (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {filteredPlaces.map((place, idx) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className={`rounded-2xl border transition-all cursor-pointer ${
                  expandedId === place.id
                    ? 'bg-white/6 border-white/15'
                    : 'bg-white/3 border-white/8 hover:border-white/15 hover:bg-white/5'
                }`}
                onClick={() => setExpandedId(expandedId === place.id ? null : place.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{place.name}</h4>
                        {place.isOpen ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Open</span>
                        ) : (
                          <span className="text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Closed</span>
                        )}
                        {place.vegOptions && (
                          <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">🌿 Veg</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{place.address}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{place.cuisine} • {getPriceLevelSymbol(place.priceLevel)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Health Score */}
                      <div className={`px-2 py-1 rounded-xl border text-[10px] font-black ${getHealthBg(place.healthScore)} ${getHealthColor(place.healthScore)}`}>
                        {place.healthScore}
                      </div>
                      {/* Distance */}
                      <span className="text-[9px] text-neutral-400">{place.distanceKm.toFixed(1)}km</span>
                      {/* Rating */}
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-white">{place.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties preview */}
                  {place.specialties.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {place.specialties.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[9px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedId === place.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/8"
                    >
                      <div className="p-4 space-y-3">
                        {/* Highlights */}
                        {place.highlights.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {place.highlights.map((h, i) => (
                              <span key={i} className="text-[9px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Leaf className="w-2.5 h-2.5" />{h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Opening hours + phone */}
                        <div className="flex items-center gap-4 text-[10px] text-neutral-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{place.openingHours}</span>
                          </div>
                          {place.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{place.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-2">
                          <a
                            href={place.swiggyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-600/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold hover:bg-orange-600/25 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Order on Swiggy
                          </a>
                          <a
                            href={place.zomatoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600/15 border border-red-500/25 text-red-300 text-[10px] font-bold hover:bg-red-600/25 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Order on Zomato
                          </a>
                        </div>

                        {onSelectRestaurant && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onSelectRestaurant(place); }}
                            className="w-full py-2 rounded-xl bg-white/8 border border-white/12 text-white text-[10px] font-bold hover:bg-white/12 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-3 h-3" />
                            Analyze with GAMA AI
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && locationStatus === 'granted' && filteredPlaces.length === 0 && places.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
          <Utensils className="w-8 h-8 text-neutral-600" />
          <p className="text-xs text-neutral-500">Press Search to find real nearby restaurants</p>
        </div>
      )}

      {!loading && locationStatus === 'granted' && filteredPlaces.length === 0 && places.length > 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-neutral-500">No places match filter. Try "All".</p>
        </div>
      )}

      {/* Attribution */}
      {lastFetched && (
        <p className="text-[9px] text-neutral-600 text-center">
          Updated {lastFetched.toLocaleTimeString()} • Powered by GAMA AI + Google Places
        </p>
      )}
    </div>
  );
}
