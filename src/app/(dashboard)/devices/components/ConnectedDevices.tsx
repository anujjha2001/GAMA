'use client';

import { useState, useRef } from "react";
import { Heart, Moon, Flame, Zap, Droplet, ChevronRight, Watch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import DeviceDetailsModal from "./DeviceDetailsModal";

export default function ConnectedDevices() {
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const devices = [
    {
      id: "apple-watch",
      name: "Apple Watch",
      model: "Ultra 2",
      status: "Connected",
      battery: 84,
      lastSync: "2 min ago",
      image: "/images/devices/apple-watch.png", 
      metrics: ["Heart", "Sleep", "Calories", "Activity"]
    },
    {
      id: "galaxy-watch",
      name: "Galaxy Watch",
      model: "6 Classic",
      status: "Connected",
      battery: 71,
      lastSync: "3 min ago",
      image: "/images/devices/galaxy-watch.png",
      metrics: ["Heart", "Sleep", "Calories", "Activity"]
    },
    {
      id: "fitbit",
      name: "Fitbit Charge 6",
      model: "Tracker",
      status: "Connected",
      battery: 68,
      lastSync: "5 min ago",
      image: "/images/devices/fitbit.png",
      metrics: ["Heart", "Activity", "Calories"]
    },
    {
      id: "oura",
      name: "Oura Ring",
      model: "Gen3",
      status: "Connected",
      battery: 72,
      lastSync: "8 min ago",
      image: "/images/devices/oura.png",
      metrics: ["Sleep", "Recovery", "Heart"]
    },
    {
      id: "garmin",
      name: "Garmin",
      model: "Fenix 7X",
      status: "Connected",
      battery: 55,
      lastSync: "10 min ago",
      image: "/images/devices/garmin.png",
      metrics: ["Heart", "Activity", "Calories"]
    }
  ];

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "Heart": return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />;
      case "Sleep": return <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />;
      case "Calories": return <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />;
      case "Activity": return <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />;
      case "Recovery": return <Droplet className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />;
      default: return null;
    }
  };

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 glass-panel border-white/5 bg-white/[0.01] rounded-3xl mt-4 border-dashed border-white/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-1000" />
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10">
          <Watch className="w-8 h-8 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
        </div>
        <h3 className="text-xl font-display font-medium text-white mb-2 relative z-10">No Devices Connected</h3>
        <p className="text-muted-foreground text-sm max-w-md text-center mb-8 relative z-10">Connect your first wearable or medical device to start syncing your health metrics to GAMA automatically.</p>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full px-8 relative z-10 transition-transform active:scale-95">
          <Zap className="w-4 h-4 mr-2" />
          Connect Device
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      
      {/* Horizontal Draggable Container */}
      <motion.div 
        ref={containerRef}
        className="flex gap-4 pb-4 overflow-hidden w-full px-2"
      >
        <motion.div 
          drag="x" 
          dragConstraints={containerRef} 
          className="flex gap-4 pr-12 cursor-grab active:cursor-grabbing"
          whileTap={{ cursor: "grabbing" }}
        >
          {devices.map((device, idx) => (
            <motion.div 
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -8 }}
              className="min-w-[220px] max-w-[220px] shrink-0"
            >
              <Card className="glass-panel h-full relative group hover:bg-white/10 transition-colors border-white/5 bg-white/[0.03] overflow-hidden">
                <CardContent className="p-5 flex flex-col gap-4 relative z-10 pointer-events-none">
                  
                  {/* Floating Product Image Area */}
                  <motion.div 
                    className="h-32 w-full relative flex items-center justify-center p-2 mt-2"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4 + (idx * 0.5), repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Fallback styling for images handled inside onError */}
                    <img 
                      src={device.image} 
                      alt={device.name}
                      className="max-h-full max-w-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                        (e.target as HTMLImageElement).classList.add('rounded-full', 'opacity-30', 'grayscale');
                      }}
                    />
                  </motion.div>

                  {/* Info Area */}
                  <div className="flex flex-col gap-0.5 mt-2">
                    <h3 className="font-semibold text-white leading-tight">{device.name}</h3>
                    <p className="text-muted-foreground text-xs">{device.model || "Standard"}</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[11px] mt-1 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Battery</span>
                      <div className="flex items-center gap-2">
                         <span className="text-white font-medium">{device.battery}%</span>
                         <div className="w-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: `${device.battery}%` }} 
                             className="h-full bg-emerald-400"
                           />
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="text-white font-medium">{device.lastSync}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 mt-1">
                    {device.metrics.map((metric, i) => (
                      <div key={i} title={metric} className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        {getMetricIcon(metric)}
                      </div>
                    ))}
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Hint Arrow (desktop only) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-full bg-gradient-to-l from-background to-transparent flex items-center justify-end pointer-events-none hidden md:flex">
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto cursor-pointer hover:bg-white/20 transition-colors mr-2 shadow-xl animate-pulse">
           <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      <DeviceDetailsModal 
        device={selectedDevice} 
        isOpen={!!selectedDevice} 
        onClose={() => setSelectedDevice(null)} 
      />
    </div>
  );
}
