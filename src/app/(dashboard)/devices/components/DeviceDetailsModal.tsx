'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Battery, ShieldCheck, Database, Zap, Sparkles, Terminal, Settings2 } from 'lucide-react';
import Image from 'next/image';

type Tab = 'Overview' | 'Live Metrics' | 'Sensors' | 'Capabilities' | 'Diagnostics' | 'Sync History' | 'AI Insights' | 'Developer';

const TABS: { id: Tab, icon: any }[] = [
  { id: 'Overview', icon: Activity },
  { id: 'Live Metrics', icon: Zap },
  { id: 'Sensors', icon: ShieldCheck },
  { id: 'Capabilities', icon: Settings2 },
  { id: 'Diagnostics', icon: Battery },
  { id: 'Sync History', icon: Database },
  { id: 'AI Insights', icon: Sparkles },
  { id: 'Developer', icon: Terminal },
];

export default function DeviceDetailsModal({ device, onClose }: { device: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full h-full max-w-6xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative bg-white/5 rounded-full p-2 border border-white/10 flex items-center justify-center">
               <Image src={device.imagePath || '/images/devices/garmin_fenix_8.png'} alt="Device" fill className="object-contain p-2" sizes="48px" />
            </div>
            <div>
              <h2 className="text-xl font-display font-medium text-white">{device.brand} {device.modelName || device.model}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-medium">Connected & Syncing</span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-r border-white/5 p-4 overflow-y-auto scrollbar-hide flex md:flex-col gap-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap \${
                    isActive 
                      ? 'bg-white/10 text-white shadow-[0_4px_20px_rgba(255,255,255,0.05)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 \${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {tab.id}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-transparent to-white/[0.01]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'Overview' && <OverviewTab device={device} />}
                {activeTab === 'Sensors' && <SensorsTab device={device} />}
                {activeTab === 'Capabilities' && <CapabilitiesTab />}
                {/* Fallback for other tabs during development */}
                {['Live Metrics', 'Diagnostics', 'Sync History', 'AI Insights', 'Developer'].includes(activeTab) && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <Activity className="w-12 h-12 opacity-20" />
                    <p>Advanced metrics and logs are seamlessly injected during realtime sync.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function OverviewTab({ device }: { device: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Firmware</span>
          <p className="text-xl font-medium text-white mt-2">{device.firmwareVersion || '12.4.1'}</p>
          <p className="text-xs text-emerald-400 mt-1">Up to date</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Battery</span>
          <p className="text-xl font-medium text-white mt-2">{device.batteryLevel || 82}%</p>
          <p className="text-xs text-slate-500 mt-1">Approx. 4 days remaining</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Last Sync</span>
          <p className="text-xl font-medium text-white mt-2">Just now</p>
          <p className="text-xs text-slate-500 mt-1">Via Background Engine</p>
        </div>
      </div>
      
      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-white mb-4">Device Priority</h3>
        <p className="text-sm text-slate-400 mb-6">This device is configured as the primary source for the following metrics:</p>
        
        <div className="flex flex-wrap gap-3">
          {['Heart Rate', 'Steps', 'Sleep Stages', 'SpO2'].map(metric => (
            <div key={metric} className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {metric}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SensorsTab({ device }: { device: any }) {
  const sensors = [
    { name: 'Optical Heart Rate', status: 'Healthy', active: true },
    { name: 'Pulse Ox (SpO2)', status: 'Healthy', active: true },
    { name: 'Multi-band GPS', status: 'Disabled', active: false },
    { name: 'Accelerometer', status: 'Healthy', active: true },
    { name: 'Thermometer', status: 'Unavailable', active: false },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-2">Sensor Diagnostics</h3>
      {sensors.map((sensor, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full \${sensor.active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className="text-slate-200">{sensor.name}</span>
          </div>
          <span className={`text-sm \${sensor.status === 'Healthy' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {sensor.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function CapabilitiesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Discovered Capabilities</h3>
          <p className="text-sm text-slate-400 mt-1">Automatically detected via Provider Adapter</p>
        </div>
        <button className="text-sm text-emerald-400 hover:underline">Re-discover</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['Heart Rate (Live)', 'HRV', 'Sleep Stages', 'Stress', 'Body Battery', 'Respiration', 'VO2 Max', 'Training Load'].map(cap => (
          <div key={cap} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-sm text-slate-200">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
