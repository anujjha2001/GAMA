'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Battery, Bluetooth, Activity, Settings2, ShieldCheck, 
  ChevronRight, HeartPulse, Moon, Zap, Watch, Trash2
} from 'lucide-react';
import { deviceRealtimeService } from '@/lib/devices/services/DeviceRealtimeService';
import { DeviceConnection } from '@prisma/client';

export default function ConnectedDevices() {
  const [connections, setConnections] = useState<Partial<DeviceConnection>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/v1/devices/connections');
        const json = await res.json();
        if (json.success) {
          setConnections(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch connections', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();

    // Subscribe to realtime updates
    const unsubscribe = deviceRealtimeService.subscribeToConnections('mock', (payload: any) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setConnections(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return;
    try {
      const res = await fetch(`/api/v1/devices/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setConnections(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to remove device');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to remove device');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {connections.map((device, i) => (
        <DeviceCard key={device.id || i} device={device} index={i} onRemove={handleRemove} />
      ))}
    </div>
  );
}

function DeviceCard({ device, index, onRemove }: { device: Partial<DeviceConnection>; index: number; onRemove: (id: string) => void }) {
  // Universal premium grey glass theme (Apple style)
  const theme = {
    bg: 'bg-white/[0.03]',
    border: 'border-white/[0.08]',
    glow: 'group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group-hover:bg-white/[0.05]',
    accent: 'text-white',
    image: device.brand?.toLowerCase() === 'garmin' ? '/images/devices/garmin_fenix_8.png' :
           device.brand?.toLowerCase() === 'oura' ? '/images/devices/oura_ring_gen3.png' :
           device.brand?.toLowerCase() === 'apple' ? '/images/devices/apple_watch_ultra_2.png' : null
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative overflow-hidden rounded-3xl backdrop-blur-2xl ${theme.bg} border ${theme.border} ${theme.glow} transition-all duration-500`}
    >
      {/* Ambient Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      
      {/* Soft Reflection */}
      <div className="absolute -inset-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transform rotate-12 translate-y-full group-hover:translate-y-[-100%] transition-all duration-1000 ease-out pointer-events-none" />

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center h-full relative z-10">
        
        {/* Device Render (Floating Image) */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
          {theme.image ? (
            <motion.div 
              className="w-full h-full relative drop-shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Image 
                src={theme.image}
                alt={device.modelName || 'Device'}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 160px, 192px"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-full border border-white/10">
              <Watch className="w-12 h-12 text-slate-500" />
            </div>
          )}
          
          {/* Connection Status Badge */}
          <div className="absolute -bottom-2 right-4 bg-slate-900/90 backdrop-blur border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
            {device.connectionStatus === 'HEALTHY' && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {device.connectionStatus === 'SYNCING' && (
              <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
            )}
            <span className="text-[10px] font-medium tracking-wider uppercase text-slate-300">
              {device.connectionStatus}
            </span>
          </div>
        </div>

        {/* Device Information */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-2xl font-display font-medium text-white tracking-tight">
                {device.brand} {device.modelName}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => device.id && onRemove(device.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-full transition-colors border border-transparent hover:border-rose-500/20"
                  title="Remove Device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/10">
                  <Settings2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> FW: {device.firmwareVersion || 'Unknown'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bluetooth className="w-3.5 h-3.5 text-blue-400" /> Connected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Battery Status */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden group/metric">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Battery</span>
                <Battery className={`w-4 h-4 ${device.batteryLevel && device.batteryLevel > 20 ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-display text-white">{device.batteryLevel ?? '--'}</span>
                <span className="text-sm text-slate-400 mb-1">%</span>
              </div>
              {/* Battery visual bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <div 
                  className={`h-full ${device.batteryLevel && device.batteryLevel > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${device.batteryLevel || 0}%` }}
                />
              </div>
            </div>

            {/* Primary Source Badges */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Primary For</span>
              <div className="flex flex-wrap gap-2">
                {device.primaryFor?.map(metric => (
                  <span key={metric} className={`text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 ${theme.accent} flex items-center gap-1 capitalize`}>
                    {metric === 'heart_rate' && <HeartPulse className="w-3 h-3" />}
                    {metric === 'sleep' && <Moon className="w-3 h-3" />}
                    {metric === 'recovery' && <Zap className="w-3 h-3" />}
                    {metric.replace('_', ' ')}
                  </span>
                ))}
                {(!device.primaryFor || device.primaryFor.length === 0) && (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleTimeString() : 'Never'}
            </span>
            <button className={`text-xs font-medium ${theme.accent} flex items-center gap-1 hover:underline`}>
              View Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
