'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Search, Plus, 
  MapPin, Clock, Calendar, AlertCircle
} from 'lucide-react';

interface EventBlock {
  id: string;
  title: string;
  time: string;
  duration: string;
  day: number; // 2 = Sun, 3 = Mon, 4 = Tue, 5 = Wed, 6 = Thu, 7 = Fri, 8 = Sat
  top: number; // grid row start position or offset in px
  height: number; // duration height in px
  color: 'turquoise' | 'grey' | 'green' | 'orange' | 'blue-grey';
  icon?: string;
}

export default function SchedulePage() {
  const days = [
    { num: 2, label: 'Sunday' },
    { num: 3, label: 'Monday' },
    { num: 4, label: 'Tuesday' },
    { num: 5, label: 'Wednesday' },
    { num: 6, label: 'Thursday' },
    { num: 7, label: 'Friday' },
    { num: 8, label: 'Saturday' }
  ];

  const hours = [
    '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00'
  ];

  const events: EventBlock[] = [
    {
      id: '1',
      title: 'Restorative Yoga',
      time: '6:30 AM',
      duration: '30min',
      day: 2,
      top: 40,
      height: 75,
      color: 'turquoise'
    },
    {
      id: '2',
      title: 'Running',
      time: '7:30 AM',
      duration: '45min',
      day: 2,
      top: 130,
      height: 90,
      color: 'grey'
    },
    {
      id: '3',
      title: 'Fried Egg',
      time: '9:00 AM',
      duration: '15min',
      day: 2,
      top: 250,
      height: 60,
      color: 'grey'
    },
    {
      id: '4',
      title: 'Running',
      time: '11:00 AM',
      duration: '30min',
      day: 2,
      top: 370,
      height: 75,
      color: 'grey'
    },
    {
      id: '5',
      title: 'Functional Core',
      time: '6:30 AM',
      duration: '30min',
      day: 3,
      top: 40,
      height: 75,
      color: 'grey'
    },
    {
      id: '6',
      title: 'Pull-Ups',
      time: '9:45 AM',
      duration: '30min',
      day: 5,
      top: 310,
      height: 75,
      color: 'grey'
    },
    {
      id: '7',
      title: 'Restorative Yoga',
      time: '6:30 AM',
      duration: '30min',
      day: 6,
      top: 40,
      height: 75,
      color: 'green'
    },
    {
      id: '8',
      title: 'Running',
      time: '6:30 AM',
      duration: '30min',
      day: 7,
      top: 40,
      height: 75,
      color: 'grey'
    },
    {
      id: '9',
      title: 'Fried Egg',
      time: '11:30 AM',
      duration: '45min',
      day: 6,
      top: 400,
      height: 90,
      color: 'orange'
    },
    {
      id: '10',
      title: 'Steak',
      time: '7:30 AM',
      duration: '45min',
      day: 8,
      top: 130,
      height: 90,
      color: 'grey'
    },
    {
      id: '11',
      title: 'Mountain Climbers',
      time: '10:30 AM',
      duration: '30min',
      day: 8,
      top: 370,
      height: 75,
      color: 'blue-grey'
    }
  ];

  const getColorClasses = (color: EventBlock['color']) => {
    switch (color) {
      case 'turquoise':
        return 'bg-[#15343d] border-[#1f5866] text-[#4dd0e1]';
      case 'green':
        return 'bg-[#1b3a1e] border-[#295c2e] text-[#66bb6a]';
      case 'orange':
        return 'bg-[#402a15] border-[#664320] text-[#ffb74d]';
      case 'blue-grey':
        return 'bg-[#1e2530] border-[#2e3745] text-[#90a4ae]';
      case 'grey':
      default:
        return 'bg-[#161719] border-[#25272a] text-[#a3a3a3]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="relative rounded-[32px] overflow-hidden bg-black/35 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center min-h-[120px] border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Chronobiological Schedule Loop
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Coordinator</h1>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Search activity..." 
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-orange-500/15">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Main Container mirroring the visual style */}
      <div className="w-full bg-black/35 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl hover:border-white/20 transition-all duration-300">
        
        {/* Calendar Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-wide text-neutral-200">November 2025</h2>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs px-2 text-neutral-300 font-medium">5 Mon - 11 Sun</span>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="bg-white/5 border border-white/10 text-xs rounded-xl px-3 py-1.5 text-neutral-300 focus:outline-none">
              <option>All Categories</option>
              <option>Workouts</option>
              <option>Nutrition</option>
              <option>Recovery</option>
            </select>
            
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button className="px-3 py-1 text-neutral-400 hover:text-white transition-colors">Day</button>
              <button className="px-3 py-1 bg-white/10 text-white rounded-lg font-semibold shadow-md">Week</button>
              <button className="px-3 py-1 text-neutral-400 hover:text-white transition-colors">Month</button>
            </div>
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="relative overflow-x-auto min-w-[700px] select-none scrollbar-thin">
          <div className="grid grid-cols-8 border-b border-white/5 pb-3">
            {/* Hour label placeholder column */}
            <div className="col-span-1 text-xs text-neutral-500 font-bold uppercase tracking-wider pl-4">Time</div>
            {days.map((day) => (
              <div key={day.num} className="col-span-1 text-center">
                <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">{day.label.slice(0, 3)}</span>
                <span className="text-base font-bold text-neutral-200 mt-1 block">{day.num}</span>
              </div>
            ))}
          </div>

          {/* Grid Rows / Events Panel */}
          <div className="relative h-[650px] w-full mt-4">
            
            {/* Background horizontal lines representing hours */}
            {hours.map((hour, idx) => (
              <div 
                key={hour} 
                className="absolute left-0 right-0 border-t border-white/[0.03] flex items-start"
                style={{ top: `${idx * 80}px`, height: '80px' }}
              >
                <span className="text-xs text-neutral-600 font-medium pl-4 -mt-2.5 w-16">{hour}</span>
                <div className="flex-1 h-full border-l border-white/[0.03]" />
              </div>
            ))}

            {/* Vertical grid separators */}
            <div className="absolute inset-y-0 left-16 right-0 grid grid-cols-7 pointer-events-none">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="col-span-1 border-r border-white/[0.02] h-full" />
              ))}
            </div>

            {/* Absolute Positioned Event Blocks */}
            {events.map((event) => {
              const columnOffset = event.day - 2; // 0 = Sun, 1 = Mon ...
              const leftPercent = 16 + (columnOffset * (100 - 16) / 7);
              const widthPercent = (100 - 16) / 7;

              return (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className={`absolute p-3 rounded-2xl border ${getColorClasses(event.color)} shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 8px)`,
                    top: `${event.top}px`,
                    height: `${event.height}px`,
                    marginLeft: '4px',
                    marginRight: '4px',
                  }}
                >
                  <div>
                    <h4 className="text-xs font-bold leading-tight tracking-wide truncate">{event.title}</h4>
                    <span className="text-[10px] opacity-70 font-semibold mt-1 block">{event.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-1.5">
                    <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">{event.duration}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
