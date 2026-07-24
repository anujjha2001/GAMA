'use client';
import * as React from 'react';
import { useHealthOS } from '@/hooks/useHealthOS';
import { motion } from 'framer-motion';

export default function Page() {
  const store = useHealthOS();
  return (
    <div className="min-h-screen bg-[#070709] text-white p-6 flex flex-col gap-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col gap-4">
        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">Health OS Portal</span>
        <h1 className="text-3xl font-black tracking-tight">Anatomy Viewer</h1>
        <p className="text-sm text-neutral-400 max-w-md">Dedicated feature view for GAMA Health OS. Live sync with active exercise: {store.activeExercise.name}</p>
      </div>
    </div>
  );
}
