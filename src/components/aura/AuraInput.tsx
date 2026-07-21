'use client';

import * as React from 'react';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';

interface AuraInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function AuraInput({ input, setInput, handleSubmit, isLoading }: AuraInputProps) {
  return (
    <form onSubmit={handleSubmit} className="relative flex items-center bg-black/50 border border-white/10 rounded-2xl overflow-hidden shadow-inner focus-within:border-white/20/50 transition-colors">
      <button type="button" className="p-3 text-neutral-400 hover:text-white transition-colors">
        <Paperclip className="w-5 h-5" />
      </button>
      
      <input
        type="text"
        id="aura-chat-input"
        name="aura-chat-input"
        value={input || ''}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Ask AURA..."
        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-neutral-500 py-4"
      />
      
      <div className="flex items-center gap-1 pr-2">
        <button type="button" className="p-2 text-neutral-400 hover:text-white transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        <button 
          type="submit" 
          disabled={!input?.trim() || isLoading}
          className="p-1 bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl disabled:opacity-50 transition-colors w-10 h-10 flex items-center justify-center overflow-hidden border border-white/10 relative group"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <img src="/logo.jpg" alt="AURA Send" className="w-8 h-8 rounded-lg object-cover group-hover:scale-105 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
