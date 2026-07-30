'use client';

import { Sparkles, BrainCircuit, Activity, HeartPulse, Moon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';

export default function AuraAIPanel() {
  const [activeInsight, setActiveInsight] = useState(0);
  const [dbInsights, setDbInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/v1/insights/devices');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          // Map DB model to UI model
          setDbInsights(json.data.map((d: any) => ({
            id: d.id,
            title: d.summary?.title || "Insight",
            description: d.summary?.description || "No description provided.",
            severity: d.summary?.severity || "low",
            confidence: Math.round(d.confidence * 100) || 85,
            generated: new Date(d.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evidence: d.summary?.evidence || []
          })));
        }
      } catch (err) {
        console.error("Failed to fetch AI insights", err);
      }
    };
    fetchInsights();
  }, []);

  // Fallback data structure if DB is empty (for demo/development)
  const fallbackInsights = [
    {
      id: 'ins-1',
      title: 'Recovery Score Low',
      description: 'Your recovery score dropped to 42% due to elevated resting heart rate and insufficient deep sleep. Consider a rest day or light active recovery.',
      severity: 'high',
      confidence: 97.5,
      evidence: ['Sleep', 'HRV', 'Training Load'],
      generated: '8:34 AM',
      provider: 'Oura'
    },
    {
      id: 'ins-2',
      title: 'Primary HR Source Mismatch',
      description: 'Your Garmin Fenix 8 has a higher accuracy confidence (99%) than your Fitbit (85%) during intense workouts. Recommend switching primary source for Activities.',
      severity: 'medium',
      confidence: 94.2,
      evidence: ['Historical Accuracy', 'Sensor Capability'],
      generated: '9:15 AM',
      provider: 'Garmin'
    },
    {
      id: 'ins-3',
      title: 'Optimal Training Window',
      description: 'Based on your circadian rhythm and current HRV recovery, you are primed for a high-intensity workout between 4 PM and 6 PM today.',
      severity: 'low',
      confidence: 88.0,
      evidence: ['HRV Trend', 'Circadian Preference'],
      generated: '10:00 AM',
      provider: 'Health Engine'
    }
  ];

  const insights = dbInsights.length > 0 ? dbInsights : fallbackInsights;

  return (
    <div className="h-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col">
      {/* Premium glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-lg">
            <img src="/logo.jpg?v=2" alt="GAMA" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-display font-medium text-white tracking-tight flex items-center gap-2">
              GAMA Intelligence
            </h2>
            <p className="text-xs text-slate-400">Explainable health insights driven by your connected devices</p>
          </div>
        </div>
        <button className="text-xs text-slate-400 hover:text-white transition-colors">
          View All Insights
        </button>
      </div>

      <div className="flex-1 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInsight}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide ${insights[activeInsight].severity === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                insights[activeInsight].severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                {insights[activeInsight].severity} Priority
              </span>
              <span className="text-xs text-slate-500">{insights[activeInsight].generated}</span>
            </div>

            <h3 className="text-2xl font-medium text-white mb-4 leading-snug">
              {insights[activeInsight].title}
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {insights[activeInsight].description}
            </p>

            <div className="mt-auto bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Confidence</span>
                <span className="text-emerald-400 font-medium text-sm">{insights[activeInsight].confidence}%</span>
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-400"
                  style={{ width: `${insights[activeInsight].confidence}%` }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Evidence Sources</span>
                <div className="flex flex-wrap gap-2">
                  {insights[activeInsight].evidence.map((ev: string, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-3 h-3 text-slate-500" />
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 mt-6 relative z-10 pt-4 border-t border-white/5">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveInsight(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeInsight ? 'w-8 bg-sky-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
