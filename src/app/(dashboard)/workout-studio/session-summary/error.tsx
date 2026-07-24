'use client';
import * as React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-[24px] backdrop-blur-xl flex flex-col items-center gap-4 text-center">
      <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Health OS Error</h3>
        <p className="text-xs text-neutral-400 mt-1">{error.message || 'An unexpected error occurred in Health OS.'}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded-xl hover:bg-white/10 transition-all text-white cursor-pointer"
      >
        Retry Diagnostic
      </button>
    </div>
  );
}
