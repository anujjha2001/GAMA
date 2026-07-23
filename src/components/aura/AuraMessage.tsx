'use client';

import * as React from 'react';
import { Bot, User } from 'lucide-react';

import { AuraImageCard } from './AuraImageCard';

interface AuraMessageProps {
  message: {
    id: string;
    role: string;
    content: string;
    images?: any[];
    isSearchingImages?: boolean;
  };
}

export function AuraMessage({ message }: AuraMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
          <img src="/logo.webp" alt="AURA" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className={`rounded-2xl p-4 text-sm leading-relaxed ${isUser
          ? 'bg-white text-black font-semibold text-black font-semibold rounded-tr-sm'
          : 'bg-white/5 border border-white/5 text-neutral-200 rounded-tl-sm'
        }`}>
          {message.content}
        </div>

        {/* Searching for images loading indicator */}
        {!isUser && message.isSearchingImages && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 pl-1 py-1">
            <div className="w-3.5 h-3.5 border border-white/20 border-t-transparent rounded-full animate-spin" />
            <span>Searching visual archives...</span>
          </div>
        )}

        {/* Image Card rendering */}
        {!isUser && message.images && message.images.length > 0 && (
          <AuraImageCard images={message.images} />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-white/10">
          <User className="w-4 h-4 text-neutral-400" />
        </div>
      )}
    </div>
  );
}
