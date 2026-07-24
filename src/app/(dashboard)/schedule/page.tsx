'use client';

import * as React from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Clock, Thermometer, Wind, Zap, Play, Pause,
  RotateCcw, Sparkles, ChevronRight, X, AlertTriangle, Star
} from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API error');
  return res.json();
});

interface ScheduleBlock {
  id?: string;
  title: string;
  category: 'WORKOUT' | 'NUTRITION' | 'RECOVERY' | 'DEEP_WORK' | 'SLEEP' | 'MEDICINE' | 'TRAVEL' | 'GENERAL';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  purpose: string;
  priority: number;
  energyCost: number;
  recoveryCost: number;
  healthImpact: string;
  aiReasoning: string;
  confidenceScore: number;
}

export default function SchedulePage() {
  const { data, error, mutate } = useSWR('/api/v1/schedule', fetcher);
  const [selectedTask, setSelectedTask] = React.useState<ScheduleBlock | null>(null);
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  // Custom Timer States
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(1800); // 30:00 minutes
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // New Event Form State
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<'WORKOUT' | 'NUTRITION' | 'RECOVERY' | 'DEEP_WORK' | 'SLEEP'>('WORKOUT');
  const [newStartTime, setNewStartTime] = React.useState('');
  const [newEndTime, setNewEndTime] = React.useState('');
  const [newPurpose, setNewPurpose] = React.useState('');

  React.useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  React.useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            toast.success("Timer session completed!");
            return 1800;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  if (error || (data && !data.success)) return <div className="p-10 text-rose-500 font-mono">SYSTEM ERROR: FAILED TO LOAD HEALTH OS SCHEDULE.</div>;
  if (!data || !data.blocks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400 font-medium">Calibrating Circadian Clock Loops...</span>
      </div>
    );
  }

  const { blocks, predictions, habits, weather } = data;

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartTime || !newEndTime) {
      toast.error('Please enter title, start time, and end time.');
      return;
    }

    try {
      const res = await fetch('/api/v1/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          startTime: new Date(newStartTime).toISOString(),
          endTime: new Date(newEndTime).toISOString(),
          purpose: newPurpose
        })
      });

      if (res.ok) {
        toast.success('New event successfully logged to Health OS.');
        setShowAddEvent(false);
        setNewTitle('');
        setNewPurpose('');
        mutate(); // trigger SWR revalidation
      } else {
        toast.error('Failed to save event.');
      }
    } catch (err) {
      toast.error('Network error. Failed to save.');
    }
  };

  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date();
    // Get past 2 days and next 4 days to build a 7-day schedule view
    for (let i = -2; i <= 4; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push({
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: i === 0,
        fullDate: d
      });
    }
    return days;
  };

  // Convert seconds to MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 relative pb-10 min-h-screen text-white font-sans">

      {/* HUD Header Bar */}
      <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Aura Clock OS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => { mutate(); toast.success('Chronobiological schedule updated live.'); }}
            className="flex items-center gap-1 px-3 py-1 bg-white text-black font-extrabold text-[10px] uppercase rounded-full hover:bg-neutral-200 cursor-pointer"
          >
            Sync OS
          </button>
        </div>
      </div>

      {/* CORE SPATIAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* LEFT COLUMN: WORKOUT IMAGE CARD & TIMELINE */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* PREMIUM WORKOUT HEADER CARD */}
          <div className="relative h-60 rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl flex flex-col justify-end p-8 bg-black/40">
            <img
              src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop"
              alt="Workout"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            <div className="relative z-10 space-y-1">
              <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Active Target Session</span>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">Workout</h2>

              <div className="flex items-end gap-6 pt-4">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase">Timestack</span>
                  <span className="text-3xl font-black text-white mt-1 block">30 <span className="text-xs font-bold text-neutral-400">Min</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase">Intensity</span>

                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE LIST CARD (WITH OVERLAPPING BIKE BACKGROUND) */}
          <div className="relative bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl overflow-hidden flex-1 shadow-2xl">
            {/* Matte-black overlay bike image covering whole box background */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none">
              <img src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop" alt="Bike background" className="w-full h-full object-cover" />
            </div>

            <h3 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest mb-4">Routine Sequence</h3>

            <div className="space-y-3 relative z-10">
              {blocks.slice(0, 5).map((block: ScheduleBlock, idx: number) => {
                const start = new Date(block.startTime);
                const day = start.getDate();
                const weekday = start.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedTask(block)}
                    className="flex items-center gap-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 p-3.5 rounded-2xl cursor-pointer transition-all duration-300"
                  >
                    <div className="w-12 text-center border-r border-white/10 pr-3">
                      <span className="text-[9px] text-neutral-500 font-bold uppercase block leading-none">{weekday}</span>
                      <span className="text-base font-black text-white mt-1 block leading-none">{day}</span>
                    </div>

                    <div className="flex-1">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-neutral-400 uppercase tracking-widest">
                        {block.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{block.title}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{block.purpose}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white block">{block.durationMinutes} min</span>
                      <span className="text-[9px] text-neutral-500 block font-mono mt-0.5">{block.energyCost} kcal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY ACTIVITY, ENVIRONMENT & CIRCULAR TIMER */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* DAILY ACTIVITY CARD */}
          <div className="bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily activity</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-white/45" />
            </div>

            {/* Horizontal week calendar */}
            <div className="flex justify-between items-center bg-white/3 border border-white/5 p-2 rounded-2xl">
              {getWeekDays().map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded-xl text-center w-8 transition-all ${day.isToday ? 'bg-white text-black font-black' : 'text-neutral-400'}`}
                >
                  <span className="text-[9px] font-bold block uppercase leading-none">{day.dayName}</span>
                  <span className="text-xs font-extrabold block mt-1 leading-none">{day.dayNum}</span>
                </div>
              ))}
            </div>

            {/* Metric tags layout */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white/2 border border-white/5 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Routine Target</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  10th Times
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Today's routine</span>
                <span className="text-xs font-mono font-bold text-white">31m 04s</span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Total amount</span>
                <span className="text-xs font-mono font-bold text-white">120m 45s</span>
              </div>
            </div>
          </div>

          {/* NEW LIVE ENVIRONMENT CARD */}
          <div className="bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest">Live Environment</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/3 border border-white/5 p-3 rounded-xl flex items-center gap-2.5">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase font-bold">Temp</span>
                  <span className="text-base font-black text-white">{weather?.tempC || 38}°C</span>
                </div>
              </div>
              <div className="bg-white/3 border border-white/5 p-3 rounded-xl flex items-center gap-2.5">
                <Wind className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase font-bold">AQI</span>
                  <span className="text-base font-black text-sky-400">{weather?.aqi || 162} <span className="text-[8px] font-normal text-neutral-500">Poor</span></span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-2.5 text-[11px] text-orange-300 leading-relaxed font-medium">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p>Hydration targets increased by +900ml due to high temperature and heavy humidity factors.</p>
            </div>
          </div>

          {/* CIRCULAR TIMER CARD (WITH + CREATE BUTTON) */}
          <div className="bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            {/* Plus add event trigger button */}
            <button
              onClick={() => setShowAddEvent(true)}
              className="absolute top-4 left-4 w-9 h-9 bg-white hover:bg-neutral-200 text-black rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg active:scale-90"
              title="Create Event"
            >
              <Plus className="w-4 h-4 text-black stroke-[3px]" />
            </button>

            {/* Circular Progress Ring HUD */}
            <div className="flex flex-col items-center justify-center mt-3 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-white/5 fill-transparent" strokeWidth="6" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-emerald-400 fill-transparent transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - timeLeft / 1800)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white tracking-tight">{formatTimer(timeLeft)}</span>
                <span className="text-[8px] text-neutral-500 uppercase mt-0.5">Finish at 6:30pm</span>
              </div>
            </div>

            {/* Interactive Timer Controls */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-neutral-300 hover:text-white cursor-pointer"
              >
                {timerRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={() => { setTimerRunning(false); setTimeLeft(1800); }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-neutral-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CREATE EVENT GLASS SHEET OVERLAY */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0c0c0e]/95 border border-white/10 p-6 rounded-[28px] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Create Custom Event</h3>
                <button onClick={() => setShowAddEvent(false)} className="p-1.5 hover:bg-white/10 rounded-full">
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1.5 font-bold">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Jog, Cardio HIIT"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1.5 font-bold">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/20"
                    >
                      <option value="WORKOUT" className="bg-[#0c0c0e]">Workout</option>
                      <option value="NUTRITION" className="bg-[#0c0c0e]">Nutrition</option>
                      <option value="RECOVERY" className="bg-[#0c0c0e]">Recovery</option>
                      <option value="DEEP_WORK" className="bg-[#0c0c0e]">Deep Work</option>
                      <option value="SLEEP" className="bg-[#0c0c0e]">Sleep</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1.5 font-bold">Purpose</label>
                    <input
                      type="text"
                      placeholder="e.g. Heart health, focus"
                      value={newPurpose}
                      onChange={e => setNewPurpose(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1.5 font-bold">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newStartTime}
                      onChange={e => setNewStartTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1.5 font-bold">End Time</label>
                    <input
                      type="datetime-local"
                      value={newEndTime}
                      onChange={e => setNewEndTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-extrabold rounded-xl hover:bg-neutral-200 cursor-pointer shadow-lg active:scale-95 transition-all text-xs"
                >
                  Create Event Block
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED EXPLAINER DRAWER */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-md bg-[#0c0c0e]/95 border-l border-white/10 h-full p-8 overflow-y-auto space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">AURA Decision Trace</span>
                <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-white/10 rounded-full">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div>
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                  {selectedTask.category}
                </span>
                <h2 className="text-2xl font-black mt-3">{selectedTask.title}</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-neutral-500 block">AI Reasoning</span>
                  <p className="text-neutral-200 mt-1 leading-relaxed">{selectedTask.aiReasoning}</p>
                </div>

                <div>
                  <span className="text-xs text-neutral-500 block">Expected Health Impact</span>
                  <p className="text-neutral-200 mt-1">{selectedTask.healthImpact}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 font-mono">
                  <div>
                    <span className="text-xs text-neutral-500">Duration</span>
                    <span className="text-lg font-black text-white mt-1 block">{selectedTask.durationMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500">Confidence Score</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">{(selectedTask.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div >
  );
}
