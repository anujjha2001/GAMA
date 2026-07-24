'use client';
import * as React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-48 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">Syncing GAMA Health OS...</span>
      </div>
    </div>
  );
}
