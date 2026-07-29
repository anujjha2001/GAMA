'use client';

import { useState } from "react";
import { Heart, Activity, Droplet, Flame, Moon, Zap, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveMetrics() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const metrics = [
    {
      id: "heart",
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      icon: <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />,
      ranges: { "1m": "72", "5m": "75", "30m": "84", "Today": "68-142" },
      chart: (
         <svg viewBox="0 0 100 30" className="w-16 h-8 stroke-rose-500 fill-none opacity-80" strokeWidth="2">
           <motion.path 
             d="M0,15 L10,15 L15,5 L25,25 L30,10 L35,20 L40,15 L100,15" 
             strokeLinecap="round" strokeLinejoin="round" 
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
           />
         </svg>
      )
    },
    {
      id: "hrv",
      label: "HRV",
      value: "82",
      unit: "ms",
      icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
      ranges: { "1m": "82", "5m": "81", "30m": "78", "Today": "74-88" },
      chart: (
         <svg viewBox="0 0 100 30" className="w-16 h-8 stroke-emerald-500 fill-none opacity-80" strokeWidth="2">
           <path d="M0,15 L15,15 L20,0 L25,25 L35,5 L45,20 L50,15 L100,15" strokeLinecap="round" strokeLinejoin="round" />
         </svg>
      )
    },
    {
      id: "spo2",
      label: "SpO₂",
      value: "98",
      unit: "%",
      icon: <Droplet className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />,
      ranges: { "1m": "98", "5m": "98", "30m": "99", "Today": "96-100" },
      chart: <Droplet className="w-6 h-6 text-blue-500 fill-blue-500/20 opacity-80 animate-pulse" />
    },
    {
      id: "steps",
      label: "Steps",
      value: "9,324",
      unit: "steps",
      icon: <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />,
      ranges: { "1h": "+420", "3h": "+1,240", "Today": "9,324", "Goal": "10,000" },
      chart: <Zap className="w-6 h-6 text-orange-500 fill-orange-500/20 opacity-80" />
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-display font-medium text-white">All Metrics</h3>
        <span className="text-emerald-400 font-medium text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {metrics.map((metric, i) => (
          <div 
            key={i} 
            className="relative flex-1 min-w-[180px]"
            onMouseEnter={() => setHoveredMetric(metric.id)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <Card className="glass-panel h-full hover:bg-white/10 transition-colors cursor-pointer border-white/5 bg-white/[0.02] relative z-10">
              <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                
                <AnimatePresence mode="wait">
                  {hoveredMetric === metric.id ? (
                    <motion.div 
                      key="hover-state"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-1 w-full"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                        <span className="text-[10px] text-muted-foreground uppercase">{metric.label} Trends</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                         {Object.entries(metric.ranges).map(([key, val]) => (
                           <div key={key} className="flex items-center justify-between text-[11px]">
                             <span className="text-muted-foreground">{key}</span>
                             <span className="text-white font-medium">{val}</span>
                           </div>
                         ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="default-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between gap-4 h-full"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-white flex items-center gap-1.5 uppercase tracking-wide">
                          {metric.icon}
                          {metric.label}
                        </span>
                        
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-display font-semibold text-white tracking-tight">
                            {metric.value}
                          </span>
                          {metric.unit && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {metric.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right Side Visual */}
                      <div className="flex items-center justify-center min-w-[40px]">
                        {metric.chart}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
