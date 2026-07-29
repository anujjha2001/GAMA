'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Battery, Activity, Zap, CheckCircle2, AlertTriangle, Smartphone, Watch, Shield, Settings, Info, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeviceDetailsModal({ device, isOpen, onClose }: { device: any, isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!device) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { id: "metrics", label: "Metrics", icon: <Activity className="w-4 h-4" /> },
    { id: "permissions", label: "Permissions", icon: <Shield className="w-4 h-4" /> },
    { id: "sync", label: "Sync History", icon: <Zap className="w-4 h-4" /> },
    { id: "diagnostics", label: "Diagnostics", icon: <Cpu className="w-4 h-4" /> },
    { id: "ai", label: "AI Insights", icon: <Sparkles className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl max-h-[90vh] glass-panel bg-neutral-950/80 border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Left Sidebar: Device Render & Actions */}
            <div className="w-full md:w-80 bg-white/5 border-r border-white/10 p-8 flex flex-col items-center shrink-0">
              <motion.div 
                className="w-48 h-48 relative flex items-center justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={device.image} 
                  alt={device.name} 
                  className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </motion.div>
              
              <div className="mt-8 w-full text-center">
                <h2 className="text-2xl font-display font-semibold text-white">{device.name}</h2>
                <p className="text-muted-foreground">{device.model || "Standard"}</p>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {device.status}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 w-full">
                <Button className="w-full bg-white hover:bg-white/90 text-black font-semibold rounded-xl h-11">
                  Sync Now
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 rounded-xl h-11 text-white">
                  Rename Device
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 rounded-xl h-11 text-rose-400 hover:text-rose-300">
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar border-b border-white/10 px-6 pt-6 gap-6 w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                      activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Health Score */}
                      <div className="glass-panel p-5 bg-white/5 border-white/10 flex flex-col gap-2 rounded-2xl">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Device Health</span>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-display font-semibold text-white">98</span>
                          <span className="text-sm text-muted-foreground mb-1">/100</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-medium">Excellent Condition</span>
                      </div>
                      
                      {/* Battery */}
                      <div className="glass-panel p-5 bg-white/5 border-white/10 flex flex-col gap-2 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Battery</span>
                          <Battery className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-4xl font-display font-semibold text-white">{device.battery}%</span>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${device.battery}%` }} 
                            className="h-full bg-emerald-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-5 bg-white/5 border-white/10 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-white">Device Information</h4>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Firmware</span>
                          <span className="text-white mt-1">WatchOS 10.4 (Latest)</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Serial Number</span>
                          <span className="text-white mt-1">X8N9M2P4Q1</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Last Sync</span>
                          <span className="text-white mt-1">{device.lastSync}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Primary Device</span>
                          <span className="text-white mt-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Yes</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "diagnostics" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                    <div className="glass-panel p-4 bg-white/5 border-white/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Bluetooth Status</span>
                          <span className="text-xs text-muted-foreground">Connected directly to host device</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">Optimal</span>
                    </div>
                    
                    <div className="glass-panel p-4 bg-white/5 border-white/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Provider API Latency</span>
                          <span className="text-xs text-muted-foreground">HealthKit / Health Connect</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">38 ms</span>
                    </div>

                    <div className="glass-panel p-4 bg-white/5 border-white/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Last Error</span>
                          <span className="text-xs text-muted-foreground">Background App Refresh timeout</span>
                        </div>
                      </div>
                      <span className="text-rose-400 text-sm font-medium">2 days ago</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "ai" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                    <div className="glass-panel p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 rounded-2xl flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-indigo-400 font-medium">
                         <Sparkles className="w-4 h-4" />
                         Aura AI Optimization
                       </div>
                       <p className="text-white text-sm leading-relaxed">
                         "Your {device.name} is currently syncing every minute in the background. While this provides ultra-live data, it is draining battery 15% faster than average. I recommend changing the sync interval to 5 minutes."
                       </p>
                       <Button className="w-max mt-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl h-9 text-xs">
                         Apply 5-Min Interval
                       </Button>
                    </div>
                  </motion.div>
                )}

                {/* Dummy fallback for other tabs */}
                {["metrics", "permissions", "sync", "settings"].includes(activeTab) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 opacity-50">
                    <span className="text-muted-foreground text-sm">Simulated Data Module Loading...</span>
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
