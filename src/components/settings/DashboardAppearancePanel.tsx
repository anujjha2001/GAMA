'use client';

import * as React from 'react';
import { useHealthStore } from '@/lib/store';
import { Upload, Image as ImageIcon, Video, SlidersHorizontal, Eye, Save, Move } from 'lucide-react';
import { toast } from 'sonner';

const PRESETS = [
  { id: 'p1', type: 'preset', url: '/dashboard.mp4.gif', thumb: '/dashboard.mp4.gif' },
  { id: 'p2', type: 'video', url: '/dashboard-1-motion.mp4', thumb: '/dashboard-1.png' },
  { id: 'p3', type: 'video', url: '/dashboard-2-motion.mp4', thumb: '/dashboard-2.png' },
  { id: 'p4', type: 'video', url: '/dashboard-3-motion.mp4', thumb: '/dashboard-3.png' },
  { id: 'p5', type: 'motion', url: 'css-motion', thumb: '/dashboard-bg-clean.png' },
  { id: 'p6', type: 'moveable', url: '/dashboard-4.png', thumb: '/dashboard-4.png' },
  { id: 'p7', type: 'moveable', url: '/dashboard-5.png', thumb: '/dashboard-5.png' },
  { id: 'p8', type: 'moveable', url: '/dashboard-6.png', thumb: '/dashboard-6.png' },
  { id: 'p9', type: 'video', url: '/dashboard-7.mp4.mp4', thumb: '/dashboard-7.mp4.mp4' },
  { id: 'p10', type: 'video', url: '/dashboard-8.mp4.mp4', thumb: '/dashboard-8.mp4.mp4' },
];

export function DashboardAppearancePanel() {
  const {
    dashboardBackgroundType,
    dashboardBackgroundUrl,
    dashboardBackgroundOverlay,
    setDashboardBackground,
    setDashboardOverlay
  } = useHealthStore();

  const overlay = {
    blur: dashboardBackgroundOverlay?.blur ?? 0,
    brightness: dashboardBackgroundOverlay?.brightness ?? 110,
    opacity: dashboardBackgroundOverlay?.opacity ?? 100,
    darkOverlay: dashboardBackgroundOverlay?.darkOverlay ?? 20,
    contrast: dashboardBackgroundOverlay?.contrast ?? 110,
    saturation: dashboardBackgroundOverlay?.saturation ?? 125,
    scale: (dashboardBackgroundOverlay as any)?.scale ?? 100,
  };

  const [isUploading, setIsUploading] = React.useState(false);

  const handleSelectPreset = (type: string, url: string) => {
    setDashboardBackground(type, url);
    saveSettings(type, url, overlay);
  };

  const handleOverlayChange = (key: keyof typeof overlay, value: number) => {
    const newOverlay = { ...overlay, [key]: value };
    setDashboardOverlay({ [key]: value });
    // Debounce save in real app, here we save immediately for simplicity or just on release
  };

  const saveSettings = async (type = dashboardBackgroundType, url = dashboardBackgroundUrl, overlayData: any = overlay) => {
    try {
      await fetch('/api/settings/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          url,
          overlay: overlayData,
          playback: { autoplay: true, loop: true, muted: true }
        })
      });
      toast.success('Dashboard appearance saved');
    } catch (e) {
      toast.error('Failed to save appearance');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/background', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        handleSelectPreset(type, data.url);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 border border-white/10 space-y-6 hover:border-white/20 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Dashboard Appearance</h3>
          <p className="text-[10px] text-neutral-400">
            Personalize your intelligence center. Select a motion background or upload your own.
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
          <ImageIcon className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Presets & Uploads */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Presets & Motion Library</h4>
          <div className="grid grid-cols-3 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.type, p.url)}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  dashboardBackgroundUrl === p.url ? 'border-white' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {p.thumb.includes('.mp4') ? (
                  <video src={p.thumb} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img src={p.thumb} className="w-full h-full object-cover" alt="preset" />
                )}
                {p.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="w-4 h-4 text-white/70" />
                  </div>
                )}
                {p.type === 'motion' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-[9px] font-black tracking-widest text-white">CSS FX</span>
                  </div>
                )}
                {p.type === 'moveable' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 gap-1">
                    <Move className="w-4 h-4 text-white/80 animate-pulse" />
                    <span className="text-[7px] font-black tracking-widest text-white bg-black/55 px-1.5 py-0.5 rounded-md">MOVEABLE</span>
                  </div>
                )}
              </button>
            ))}

            <label className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-white/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 bg-white/5">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-neutral-400" />
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Upload</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*,video/mp4,video/webm" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* Overlays */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Lens Overlays</h4>
            <button onClick={() => saveSettings()} className="text-[10px] flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition">
              <Save className="w-3 h-3" /> Save Layout
            </button>
          </div>
          
          <div className="space-y-3 bg-white/5 p-4 rounded-[20px] border border-white/5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Blur</span>
                <span className="font-semibold">{overlay.blur}px</span>
              </div>
              <input type="range" min="0" max="20" step="1" value={overlay.blur} onChange={(e) => handleOverlayChange('blur', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Dark Overlay</span>
                <span className="font-semibold">{overlay.darkOverlay}%</span>
              </div>
              <input type="range" min="0" max="90" step="5" value={overlay.darkOverlay} onChange={(e) => handleOverlayChange('darkOverlay', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Brightness</span>
                <span className="font-semibold">{overlay.brightness}%</span>
              </div>
              <input type="range" min="30" max="150" step="5" value={overlay.brightness} onChange={(e) => handleOverlayChange('brightness', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Saturation</span>
                <span className="font-semibold">{overlay.saturation}%</span>
              </div>
              <input type="range" min="0" max="200" step="10" value={overlay.saturation} onChange={(e) => handleOverlayChange('saturation', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Background Scale / Size</span>
                <span className="font-semibold">{overlay.scale ?? 100}%</span>
              </div>
              <input type="range" min="50" max="200" step="5" value={overlay.scale ?? 100} onChange={(e) => handleOverlayChange('scale', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
