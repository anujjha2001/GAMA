'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Brain, Microscope } from 'lucide-react';

const MODELS = [
  { id: 'aura-v1', name: ' AURA-v1', desc: 'Fast everyday assistant' },
  { id: 'thinking-bit', name: ' Thinking Bit', desc: 'Deep reasoning & logic' },
  { id: 'aura-v2', name: ' AURA-v2', desc: 'Research & expert analysis' },
];

export function AuraModelSelector() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState(MODELS[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold text-neutral-200"
      >
        {selectedModel.name}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50"
          >
            {MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => { setSelectedModel(model); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${selectedModel.id === model.id ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-white/5 text-neutral-300'
                  }`}
              >
                <span className="font-bold">{model.name}</span>
                <span className="text-[10px] opacity-70">{model.desc}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
