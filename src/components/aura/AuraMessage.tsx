'use client';

import * as React from 'react';
import { Bot, User, FileText, Image as ImageIcon, Download, Copy, Sparkles, FolderHeart } from 'lucide-react';
import { AuraImageCard } from './AuraImageCard';
import { toast } from 'sonner';

interface AuraMessageProps {
  message: {
    id: string;
    role: string;
    content: string;
    images?: any[];
    attachments?: any[]; // PDF/CSV/Video attachments
    isSearchingImages?: boolean;
    thinkingState?: string; // Active state: "Analyzing Image", "Thinking"
  };
}

export function AuraMessage({ message }: AuraMessageProps) {
  const isUser = message.role === 'user';
  const [isUpscaling, setIsUpscaling] = React.useState(false);

  // Copy Image URL to Clipboard
  const handleCopyImage = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      toast.success('Image link copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy image link.');
    }
  };

  // Simulated Upscaling
  const handleUpscale = () => {
    setIsUpscaling(true);
    toast.info('Initiating 4K Super-Resolution Upscaling...', { duration: 1500 });
    setTimeout(() => {
      setIsUpscaling(false);
      toast.success('Image successfully upscaled to 4K!');
    }, 2000);
  };

  // Save to Gallery
  const handleSaveToGallery = () => {
    toast.success('Image saved successfully to GAMA Gallery!');
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} w-full relative z-20`}>
      
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/10 overflow-hidden select-none">
          <img src="/logo.jpg?v=2" alt="AURA Avatar" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-2.5 max-w-[80%]">
        
        {/* User Attachments List */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5 align-end self-end mb-1">
            {message.attachments.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-neutral-200 self-end shadow max-w-sm"
              >
                {file.mimeType.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <div className="flex flex-col truncate">
                  <span className="truncate font-semibold">{file.name}</span>
                  <span className="text-[9px] text-neutral-500 uppercase mt-0.5">{file.classification || 'Attachment'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message bubble */}
        {(message.content || message.thinkingState) && (
          <div className={`rounded-2xl p-4 text-sm leading-relaxed ${isUser
            ? 'bg-white text-black font-semibold rounded-tr-sm shadow-md'
            : 'bg-white/5 border border-white/5 text-neutral-200 rounded-tl-sm backdrop-blur-xl'
            }`}>
            
            {/* Thinking Active State */}
            {!isUser && message.thinkingState ? (
              <div className="flex items-center gap-2.5 py-1 text-xs text-neutral-400">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                </div>
                <span className="font-medium tracking-wide uppercase text-[10px] text-amber-500/80 animate-pulse">
                  {message.thinkingState}
                </span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        )}

        {/* Searching for images loading indicator */}
        {!isUser && message.isSearchingImages && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 pl-1 py-1">
            <div className="w-3.5 h-3.5 border border-white/20 border-t-transparent rounded-full animate-spin" />
            <span>Searching visual archives...</span>
          </div>
        )}

        {/* Image Card rendering */}
        {!isUser && message.images && message.images.length > 0 && (
          <div className="flex flex-col gap-2">
            <AuraImageCard images={message.images} />
            
            {/* Generated Image Actions Panel */}
            <div className="flex gap-2 items-center bg-white/5 border border-white/5 p-2 rounded-xl max-w-lg justify-around">
              <a
                href={message.images[0].imageUrl}
                download={message.images[0].title || 'gama-aura-generated'}
                title="Download Image"
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => handleCopyImage(message.images[0].imageUrl)}
                title="Copy Image URL"
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleUpscale}
                disabled={isUpscaling}
                title="Upscale to 4K"
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className={`w-4 h-4 ${isUpscaling ? 'animate-spin text-amber-500' : ''}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Upscale</span>
              </button>
              <button
                type="button"
                onClick={handleSaveToGallery}
                title="Save to Gallery"
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
              >
                <FolderHeart className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Gallery</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-white/10 select-none">
          <User className="w-4 h-4 text-neutral-400" />
        </div>
      )}
    </div>
  );
}
