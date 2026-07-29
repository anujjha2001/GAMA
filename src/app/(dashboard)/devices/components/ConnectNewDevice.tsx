'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Filter, Watch, Smartphone, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectNewDevice() {
  const [filter, setFilter] = useState("all");

  const availableDevices = [
    { id: "apple", name: "Apple Watch", provider: "HealthKit", image: "/images/devices/apple-watch.png", cat: "watch" },
    { id: "galaxy", name: "Galaxy Watch", provider: "Health Connect", image: "/images/devices/galaxy-watch.png", cat: "watch" },
    { id: "fitbit-new", name: "Fitbit", provider: "Fitbit API", image: "/images/devices/fitbit.png", cat: "tracker" },
    { id: "garmin-new", name: "Garmin", provider: "Garmin Health", image: "/images/devices/garmin.png", cat: "watch" },
    { id: "oura-new", name: "Oura Ring", provider: "Oura Cloud", image: "/images/devices/oura.png", cat: "ring" },
    { id: "whoop", name: "WHOOP", provider: "WHOOP API", image: "/images/devices/whoop.png", cat: "tracker" },
    { id: "xiaomi", name: "Xiaomi Band", provider: "Health Connect", image: "/images/devices/xiaomi.png", cat: "tracker" },
    { id: "amazfit", name: "Amazfit", provider: "Health Connect", image: "/images/devices/amazfit.png", cat: "watch" },
    { id: "withings", name: "Withings Scale", provider: "Withings API", image: "/images/devices/withings.png", cat: "scale" },
    { id: "bp-monitor", name: "BP Monitor", provider: "Omron API", image: "/images/devices/bp-monitor.png", cat: "medical" },
    { id: "glucose", name: "Glucose Monitor", provider: "Dexcom API", image: "/images/devices/glucose.png", cat: "medical" },
    { id: "polar", name: "Polar", provider: "Polar Flow", image: "/images/devices/polar.png", cat: "watch" }
  ];

  const filteredDevices = availableDevices.filter(d => filter === "all" || d.cat === filter);

  return (
    <div className="flex flex-col gap-6 mt-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-display font-medium text-white">Connect New Device</h3>
          <p className="text-sm text-muted-foreground">Marketplace of supported integrations.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Search devices..." 
               className="h-10 w-full md:w-64 rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
             />
           </div>
           <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
             <Filter className="w-4 h-4 text-white" />
           </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {[
          { id: "all", label: "All Devices" },
          { id: "watch", label: "Smartwatches", icon: <Watch className="w-3.5 h-3.5" /> },
          { id: "tracker", label: "Fitness Trackers", icon: <Activity className="w-3.5 h-3.5" /> },
          { id: "ring", label: "Smart Rings" },
          { id: "medical", label: "Medical Devices" }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              filter === f.id ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>
      
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {filteredDevices.map((device) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={device.id}
            >
              <Card className="glass-panel group cursor-pointer hover:bg-white/10 transition-colors overflow-hidden flex flex-col items-center relative border-white/5 bg-white/[0.02]">
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-300" />
                <CardContent className="p-5 flex flex-col items-center gap-4 w-full relative z-10">
                  
                  <div className="w-24 h-24 relative flex items-center justify-center">
                    <img 
                      src={device.image} 
                      alt={device.name}
                      className="max-h-full max-w-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                        (e.target as HTMLImageElement).classList.add('rounded-full', 'opacity-30', 'grayscale');
                      }}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1 w-full text-center">
                    <span className="text-sm font-semibold text-white leading-tight">{device.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{device.provider}</span>
                  </div>

                  <button className="w-full mt-2 py-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-2 text-xs font-medium text-white group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black transition-all">
                    <Plus className="w-3 h-3" />
                    Connect
                  </button>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
