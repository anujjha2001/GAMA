const fs = require('fs');
const path = require('path');

const features = [
  'dashboard',
  'exercise-detail',
  'live-camera',
  'workout-session',
  'workout-history',
  'personal-records',
  'recovery',
  'ai-coach',
  'analytics',
  'anatomy-viewer',
  'exercise-library',
  'session-summary',
  'nutrition-companion',
  'injury-prevention',
  'settings'
];

const basePath = path.join(__dirname, '..', 'src', 'app', '(dashboard)', 'workout-studio');

features.forEach(feat => {
  const featDir = path.join(basePath, feat);
  console.log(`Creating directories for: ${feat}`);

  // Create directories
  const dirs = [
    featDir,
    path.join(featDir, 'components'),
    path.join(featDir, 'hooks'),
    path.join(featDir, 'types'),
    path.join(featDir, 'services'),
    path.join(featDir, 'actions')
  ];

  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  // Create loading.tsx
  const loadingCode = `'use client';
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
`;
  fs.writeFileSync(path.join(featDir, 'loading.tsx'), loadingCode);

  // Create error.tsx
  const errorCode = `'use client';
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
`;
  fs.writeFileSync(path.join(featDir, 'error.tsx'), errorCode);

  // Create a template page.tsx
  const pageCode = `'use client';
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
        <h1 className="text-3xl font-black tracking-tight">${feat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
        <p className="text-sm text-neutral-400 max-w-md">Dedicated feature view for GAMA Health OS. Live sync with active exercise: {store.activeExercise.name}</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(featDir, 'page.tsx'), pageCode);
});

console.log('Successfully initialized all 15 Health OS sub-feature directory trees!');
