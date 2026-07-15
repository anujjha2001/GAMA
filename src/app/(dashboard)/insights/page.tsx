'use client';

import * as React from 'react';
import { useHealthStore, HealthStory, calculateWellness } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight, Compass, Calendar, RefreshCw, Send, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function InsightsPage() {
  const { 
    stories, steps, sleepHours, hrv, stressLevel, heartRate, weather, addStory
  } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeStoryId, setActiveStoryId] = React.useState<string | null>(null);
  const [askBox, setAskBox] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
    if (stories.length > 0) {
      setActiveStoryId(stories[0].id);
    }
  }, [stories]);

  if (!mounted) return null;

  const wellnessScore = calculateWellness(sleepHours, hrv, steps, stressLevel);

  const activeStory = stories.find(s => s.id === activeStoryId) || stories[0];

  const handleAskAura = (title: string) => {
    if (!askBox.trim()) return;
    toast.success(`Query queued: "${askBox}" relating to "${title}"`);
    setAskBox('');
  };

  const handleSimulateNewAnomaly = () => {
    addStory({
      title: 'Dehydration Wave',
      subtitle: 'Correlating high activity and low humidity',
      category: 'anomaly',
      metricType: 'heart',
      content: `Your heart rate average rose to 76 BPM during passive sitting intervals. Combined with current weather conditions (${weather.temp}°C, dry breeze), AURA identifies a moderate cellular dehydration risk. We recommend consuming 650ml water mixed with mineral electrolytes.`,
      impactValue: '+12 BPM Rest',
      impactType: 'negative'
    });
    toast.success("AURA simulated a physiological anomaly story!");
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="relative rounded-[32px] overflow-hidden bg-black/35 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center min-h-[160px] border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Autonomic Correlation Engine
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Insight Engine</h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Story-based diagnostics and real-time biological correlation feeds. Cross-referencing wearable biometrics, memory, and environment.
          </p>
        </div>

        <button 
          onClick={handleSimulateNewAnomaly}
          className="mt-4 md:mt-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Simulate Anomaly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Story Feed */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Biometric Correlation Log</h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {stories.map((story) => {
                const isActive = story.id === activeStoryId;
                return (
                  <motion.div
                    key={story.id}
                    layoutId={`story-card-${story.id}`}
                    onClick={() => setActiveStoryId(story.id)}
                    className={`p-4 rounded-[24px] border transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-white/10 border-emerald-500/30 shadow-md ring-1 ring-emerald-500/20 text-white' 
                        : 'bg-black/35 border-white/5 hover:border-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        story.category === 'anomaly' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : story.category === 'correlation'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                      }`}>
                        {story.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{story.timestamp}</span>
                    </div>

                    <h4 className="text-xs font-bold">{story.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{story.subtitle}</p>

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
                      <span className="text-[10px] font-semibold text-muted-foreground">Impact</span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        story.impactType === 'positive' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {story.impactType === 'positive' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {story.impactValue}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: High Fidelity Deep-dive Panel */}
        <div className="lg:col-span-2">
          {activeStory ? (
            <motion.div 
              key={activeStory.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 md:p-8 border border-white/10 space-y-6 flex flex-col justify-between h-full min-h-[500px] hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{activeStory.category} analysis</span>
                    <h2 className="text-xl font-bold">{activeStory.title}</h2>
                    <p className="text-xs text-muted-foreground">{activeStory.subtitle}</p>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-2xl border text-center ${
                    activeStory.impactType === 'positive' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                  }`}>
                    <div className="text-[9px] uppercase tracking-wider font-semibold opacity-60">Calculated Impact</div>
                    <div className="text-xs font-bold mt-0.5">{activeStory.impactValue}</div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs leading-relaxed text-neutral-300">
                  {activeStory.content}
                </div>

                {/* Correlations Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-[20px] space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Wearable context</span>
                    <div className="flex justify-between items-center text-xs">
                      <span>HRV State:</span>
                      <span className="font-semibold">{hrv} ms</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Stress Score:</span>
                      <span className="font-semibold">{stressLevel} / 5.0</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-[20px] space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Environment data</span>
                    <div className="flex justify-between items-center text-xs">
                      <span>Temperature:</span>
                      <span className="font-semibold">{weather.temp}°C</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Conditions:</span>
                      <span className="font-semibold">{weather.condition}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-[20px] space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Global Medical Cross-ref</span>
                    <div className="text-[10px] text-neutral-450 leading-normal flex items-start gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Validated against circadian cardiac rhythm guidelines.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ask AURA about this story block */}
              <div className="border-t border-white/5 pt-6 mt-6">
                <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-full pl-5 pr-2 py-2">
                  <input
                    type="text"
                    placeholder={`Ask AURA: "Why did my ${activeStory.metricType} drop?"`}
                    value={askBox}
                    onChange={(e) => setAskBox(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskAura(activeStory.title);
                    }}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder-neutral-500 focus:outline-none py-1"
                  />
                  <button
                    onClick={() => handleAskAura(activeStory.title)}
                    className="p-2.5 bg-foreground text-background hover:opacity-90 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-[32px] bg-black/35 backdrop-blur-xl border border-white/10 p-12 text-center text-muted-foreground hover:border-white/20 transition-all duration-300">
              Select a correlation story from the log to display analysis details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
