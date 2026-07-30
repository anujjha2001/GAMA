'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, Filter, CheckCircle2, ChevronRight, Wifi, Smartphone, Bluetooth, ShieldCheck, Activity } from 'lucide-react';
import { DeviceRegistry, DeviceRegistryEntry, DeviceCategory } from '@/lib/devices/DeviceRegistry';

const categories: DeviceCategory[] = [
  'Wearables', 'Health Rings', 'Smart Scales', 'Blood Pressure', 'CGM', 'Medical Devices', 'Developer Devices'
];

export default function ConnectNewDevice({ onCompleteAction }: { onCompleteAction?: () => void }) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('Wearables');
  const [searchQuery, setSearchQuery] = useState('');
  const [pairingDevice, setPairingDevice] = useState<DeviceRegistryEntry | null>(null);

  const filteredDevices = DeviceRegistry.filter((device: DeviceRegistryEntry) => 
    device.category === activeCategory &&
    (device.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
     device.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Marketplace Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all backdrop-blur-md"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDevices.map((device: DeviceRegistryEntry, i: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              key={device.id}
              onClick={() => setPairingDevice(device)}
              className="group cursor-pointer p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between h-64 relative overflow-hidden"
            >
              {/* Soft glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="text-lg font-medium text-white">{device.brand}</h3>
                  <p className="text-sm text-slate-400">{device.model}</p>
                </div>
                {device.status === 'beta' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/20">Beta</span>
                )}
                {device.status === 'coming_soon' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/20">Coming Soon</span>
                )}
              </div>

              <div className="relative flex-1 flex items-center justify-center my-4 z-10">
                <div className="w-32 h-32 relative group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                  <Image 
                    src={device.imagePath} 
                    alt={device.model} 
                    fill 
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between z-10">
                <div className="flex gap-1.5">
                  {device.supportedMetrics.slice(0, 3).map((metric: string) => (
                    <div key={metric} className="w-6 h-6 rounded-full bg-black/40 border border-white/5 flex items-center justify-center" title={metric}>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                    </div>
                  ))}
                  {device.supportedMetrics.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-[9px] text-slate-400">
                      +{device.supportedMetrics.length - 3}
                    </div>
                  )}
                </div>
                
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredDevices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400"
            >
              <Smartphone className="w-12 h-12 mb-4 opacity-20" />
              <p>No devices found in this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pairing Modal Mock */}
      <AnimatePresence>
        {pairingDevice && (
          <PairingModal 
            device={pairingDevice} 
            onClose={() => {
              setPairingDevice(null);
              if (onCompleteAction) onCompleteAction();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PairingModal({ device, onClose }: { device: DeviceRegistryEntry, onClose: () => void }) {
  const [stage, setStage] = useState(0);
  
  // Premium pairing flow simulation
  // Cloud (OAuth): Connect Account -> Authenticating -> Permissions -> Import -> Connected
  // BLE: Scan Nearby -> Found -> Fetch Info -> Connected
  
  const cloudStages = [
    { title: "Connect Account", desc: `Redirecting to ${device.brand} secure login...`, icon: <Wifi className="w-6 h-6 text-sky-400" /> },
    { title: "Authenticating", desc: "Verifying credentials and creating secure session...", icon: <ShieldCheck className="w-6 h-6 text-indigo-400" /> },
    { title: "Discovering Capabilities", desc: "Analyzing device sensors and supported metrics...", icon: <Search className="w-6 h-6 text-amber-400" /> },
    { title: "Importing History", desc: "Syncing the last 30 days of health data...", icon: <Activity className="w-6 h-6 text-emerald-400 animate-pulse" /> },
    { title: "Connected", desc: `${device.brand} ${device.model} is now actively syncing.`, icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" /> }
  ];

  const bleStages = [
    { title: "Scan Nearby Devices", desc: "Looking for active Bluetooth signals...", icon: <Bluetooth className="w-6 h-6 text-blue-400 animate-pulse" /> },
    { title: "Device Found", desc: `Negotiating connection with ${device.model}...`, icon: <Smartphone className="w-6 h-6 text-indigo-400" /> },
    { title: "Fetching Information", desc: "Reading firmware and capability profile...", icon: <Search className="w-6 h-6 text-amber-400" /> },
    { title: "Connected", desc: "BLE stream established successfully.", icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" /> }
  ];

  const stages = device.connectionMethod === 'oauth' ? cloudStages : bleStages;

  useEffect(() => {
    // 1. Trigger the actual backend connection process exactly once
    if (stage === 0) {
      fetch('/api/v1/devices/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id })
      }).catch(err => console.error("Connection failed", err));
    }

    // 2. Step through the visual stages to maintain the premium feel
    if (stage < stages.length - 1) {
      const timer = setTimeout(() => {
        setStage(s => s + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, stages.length, device.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
          ✕
        </button>
        
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-32 h-32 relative mb-8 drop-shadow-2xl">
            <Image 
              src={device.imagePath} 
              alt={device.model} 
              fill 
              className="object-contain"
              sizes="128px"
            />
          </div>
          
          <h2 className="text-2xl font-display font-medium text-white mb-2">
            {stages[stage].title}
          </h2>
          <p className="text-sm text-slate-400 h-10">
            {stages[stage].desc}
          </p>

          {/* Premium Progress Bar (Monochrome) */}
          <div className="w-full h-1 bg-white/5 rounded-full mt-8 overflow-hidden relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {stage === stages.length - 1 && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onClose}
              className="mt-8 w-full py-3 rounded-full bg-white hover:bg-white/90 text-black font-medium transition-colors"
            >
              Continue to Dashboard
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
