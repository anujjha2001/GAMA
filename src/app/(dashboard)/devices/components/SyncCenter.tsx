'use client';

import { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, Settings, ShieldAlert, Smartphone, Watch, Server, Activity, ArrowRight, Zap, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function SyncCenter() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState("Just now");

  useEffect(() => {
    if (isSyncing) {
      const timer = setTimeout(() => {
        setIsSyncing(false);
        setSyncTime("Just now");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing && syncTime === "Just now") {
        setSyncTime("1 min ago");
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [syncTime, isSyncing]);

  const syncHistory = [
    { device: "Apple Watch", metric: "Heart Rate", time: "Just now", icon: <Watch className="w-4 h-4 text-white" /> },
    { device: "Galaxy Watch", metric: "Sleep", time: "3 min ago", icon: <Watch className="w-4 h-4 text-white" /> },
    { device: "Fitbit Charge 6", metric: "Steps", time: "5 min ago", icon: <Activity className="w-4 h-4 text-white" /> },
    { device: "Oura Ring", metric: "Readiness", time: "8 min ago", icon: <Zap className="w-4 h-4 text-white" /> },
    { device: "Garmin Fenix 7X", metric: "Workout", time: "10 min ago", icon: <Watch className="w-4 h-4 text-white" /> }
  ];

  const aiTimeline = [
    "Apple Watch synced",
    "Recovery updated",
    "Sleep recalculated",
    "Calories adjusted",
    "AI Recommendation generated"
  ];

  return (
    <Card className="glass-panel overflow-hidden h-full border-white/5 bg-white/[0.02] col-span-1 lg:col-span-2">
      <CardContent className="p-0 h-full flex flex-col md:flex-row">
        
        {/* Sync Status Circle (Left) */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center min-w-[280px] bg-gradient-to-b from-white/[0.02] to-transparent relative">
          <h3 className="text-[13px] font-semibold text-white self-start mb-6 w-full tracking-wide flex items-center justify-between">
            Synchronization
            <Server className="w-4 h-4 text-emerald-400" />
          </h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center my-4 group cursor-pointer" onClick={() => setIsSyncing(true)}>
            {/* Animated Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle 
                cx="96" cy="96" r="92" 
                className="stroke-white/5 transition-all duration-300" 
                strokeWidth="1.5" 
                fill="none" 
              />
              <motion.circle 
                cx="96" cy="96" r="92" 
                className={`stroke-emerald-400 transition-all duration-300 ${isSyncing ? "opacity-100" : "opacity-80"}`}
                strokeWidth="3" 
                fill="none" 
                strokeDasharray="578" 
                strokeDashoffset="0" 
                strokeLinecap="round"
                animate={isSyncing ? { strokeDashoffset: [578, 0], rotate: [0, 360] } : {}}
                transition={isSyncing ? { duration: 1.5, repeat: Infinity, ease: "linear" } : {}}
              />
            </svg>
            
            <div className="flex flex-col items-center justify-center text-center z-10 p-4 w-40 h-40 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md shadow-2xl">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <p className="text-sm font-medium leading-tight text-white">Syncing...</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium leading-tight text-white">All Devices</p>
                  <p className="text-sm font-medium leading-tight text-emerald-400 mt-0.5">Synced</p>
                  <p className="text-xs text-muted-foreground mt-1">{syncTime}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full mt-6 px-2">
            <span className="text-xs text-muted-foreground">Queue Status</span>
            <span className="text-xs text-white">Idle (0 pending)</span>
          </div>
          
          <div className="flex items-center justify-between w-full mt-3 px-2">
            <span className="text-xs text-white">Auto Sync</span>
            <div className="flex items-center gap-2 cursor-pointer">
               <span className="text-[10px] text-muted-foreground">On</span>
               <div className="w-9 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative shadow-inner flex items-center transition-colors hover:bg-emerald-500/30">
                 <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full absolute right-1 shadow-sm"></div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Sync History & Timeline (Middle) */}
        <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
          <h3 className="text-[13px] font-semibold text-white mb-6 tracking-wide flex justify-between items-center">
            AI Event Timeline
            <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase text-muted-foreground hover:text-white px-2">View All</Button>
          </h3>
          
          <div className="flex flex-col gap-6 relative flex-1">
            {/* Timeline connection line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />
            
            {/* Event Chain */}
            <div className="flex flex-col gap-4 relative z-10">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 ml-10">Latest Chain</span>
              {aiTimeline.map((event, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg border ${
                    i === 0 ? "bg-emerald-500/20 border-emerald-500/30" : 
                    i === aiTimeline.length - 1 ? "bg-indigo-500/20 border-indigo-500/30" : 
                    "bg-white/5 border-white/10"
                  }`}>
                    {i === 0 ? <Watch className="w-3.5 h-3.5 text-emerald-400" /> : 
                     i === aiTimeline.length - 1 ? <Activity className="w-3.5 h-3.5 text-indigo-400" /> : 
                     <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className={`text-sm ${i === aiTimeline.length - 1 ? "text-indigo-300 font-medium" : "text-neutral-300"}`}>
                    {event}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (Right) */}
        <div className="p-6 md:p-8 flex flex-col gap-4 min-w-[260px] bg-white/[0.01]">
          <h3 className="text-[13px] font-semibold text-white mb-2 tracking-wide">Quick Actions</h3>
          
          <Button 
            variant="outline" 
            onClick={() => setIsSyncing(true)}
            disabled={isSyncing}
            className="w-full justify-start h-11 bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 rounded-xl text-white font-medium text-xs transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <RefreshCw className={`w-4 h-4 mr-3 text-white ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync All Devices"}
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-11 bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 rounded-xl text-white font-medium text-xs transition-colors">
            <ShieldAlert className="w-4 h-4 mr-3 text-white" />
            Manage Permissions
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-11 bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 rounded-xl text-white font-medium text-xs transition-colors">
            <Settings className="w-4 h-4 mr-3 text-white" />
            Device Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-11 bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 rounded-xl text-rose-400/80 hover:text-rose-400 font-medium text-xs transition-colors border-rose-500/10">
            <Smartphone className="w-4 h-4 mr-3" />
            Troubleshoot Provider
          </Button>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Provider Health</span>
            <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
