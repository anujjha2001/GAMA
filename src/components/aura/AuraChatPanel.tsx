'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraModelSelector } from './AuraModelSelector';
import { AuraMessage } from './AuraMessage';
import { AuraInput } from './AuraInput';
import { type Message } from '@/hooks/useAura';

interface AuraChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | string) => Promise<void>;
  isLoading: boolean;
}

export function AuraChatPanel({ 
  isOpen, 
  onClose,
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading
}: AuraChatPanelProps) {
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-5xl mx-auto aura-overlay backdrop-blur-3xl rounded-[32px] border border-white/10 p-5 md:p-6 shadow-2xl relative z-40 mt-1 flex gap-6 overflow-hidden h-[600px]"
        >
          {/* Sidebar - History */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:flex flex-col border-r border-white/10 pr-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">History</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-2 text-xs">
                  <div className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors text-neutral-300 font-medium">
                    What should I eat to boost my Vitamin C?
                  </div>
                  <div className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors text-neutral-400">
                    Explain my Wellness Score
                  </div>
                  <div className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors text-neutral-400">
                    Nutrition tracking plan
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors mr-1"
                    title="Toggle History"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 hover:text-white"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <span className="h-2 w-2 rounded-full bg-white text-black font-semibold animate-pulse" />
                  <span className="text-[15px] font-extrabold text-white uppercase tracking-widest">AURA</span>
                </div>
                
                <AuraModelSelector />
              </div>
              
              <button
                onClick={onClose}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-wider"
              >
                Minimize
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 scrollbar-thin">
              {messages.map(msg => (
                <AuraMessage key={msg.id} message={msg} />
              ))}
            </div>

            {/* Input Area */}
            <div className="pt-2">
              <AuraInput 
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading} 
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
