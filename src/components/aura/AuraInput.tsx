'use client';

import * as React from 'react';
import { Send, Mic, Paperclip, Loader2, X, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuraInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: any) => void;
  isLoading: boolean;
  attachments?: any[];
  uploadFile?: (file: File) => Promise<void>;
  removeAttachment?: (index: number) => void;
  uploadingFiles?: Record<string, { stage: string; progress: number }>;
}

export function AuraInput({ 
  input, 
  setInput, 
  handleSubmit, 
  isLoading,
  attachments = [],
  uploadFile,
  removeAttachment,
  uploadingFiles = {}
}: AuraInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [showSlashMenu, setShowSlashMenu] = React.useState(false);

  // Slash commands catalog
  const slashCommands = [
    { cmd: '/image', desc: 'Generate a health/fitness image', prompt: '/image ' },
    { cmd: '/scan', desc: 'Analyze medical documents or reports', prompt: 'Analyze this report: ' },
    { cmd: '/meal', desc: 'Scan food or structure a meal plan', prompt: 'Log this meal: ' },
    { cmd: '/workout', desc: 'Evaluate training posture/workouts', prompt: 'Critique my workout form: ' },
    { cmd: '/history', desc: 'Review recent health timelines', prompt: 'Summarize my recent health history.' },
    { cmd: '/help', desc: 'Show all GAMA AURA command capabilities', prompt: 'Show me the available command options.' }
  ];

  // Auto-trigger slash command dropdown
  React.useEffect(() => {
    if (input === '/') {
      setShowSlashMenu(true);
    } else if (!input.startsWith('/')) {
      setShowSlashMenu(false);
    }
  }, [input]);

  const handleCommandClick = (promptText: string) => {
    setInput(promptText);
    setShowSlashMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && uploadFile) {
      Array.from(files).forEach(file => {
        uploadFile(file);
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceClick = () => {
    // Dispatch event to open voice assistant orb
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gama-trigger-voice-assistant'));
      toast.info("AURA Voice Assistant listening...", { duration: 2500 });
    }
  };

  // Keyboard support: Enter sends, Shift+Enter new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full relative z-30">
      
      {/* 1. Slash Commands Menu */}
      {showSlashMenu && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-neutral-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-1 z-50">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-3.5 py-1.5 border-b border-white/5">
            Aura Commands
          </p>
          {slashCommands.map((command) => (
            <button
              key={command.cmd}
              type="button"
              onClick={() => handleCommandClick(command.prompt)}
              className="w-full text-left px-3.5 py-2 hover:bg-white/5 rounded-xl transition-colors flex flex-col border-none bg-transparent cursor-pointer"
            >
              <span className="text-xs font-semibold text-white">{command.cmd}</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">{command.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. File Upload Progress Bar flow */}
      {Object.keys(uploadingFiles).length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/5 rounded-2xl max-w-md">
          {Object.entries(uploadingFiles).map(([name, state]) => (
            <div key={name} className="flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="truncate font-semibold max-w-[70%]">{name}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{state.stage}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Pre-send Attached Files Chips row */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 py-1">
          {attachments.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white backdrop-blur-md shadow"
            >
              {file.mimeType.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              )}
              <span className="max-w-[120px] truncate font-medium">{file.name}</span>
              <span className="text-[9px] text-neutral-400 uppercase px-1.5 py-0.5 bg-white/5 rounded-md">
                {file.classification || 'Document'}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment && removeAttachment(idx)}
                className="p-0.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md transition-all border-none bg-transparent cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        multiple
        accept="image/*,video/*,application/pdf,text/csv,text/plain"
      />

      {/* 4. Main Composer Shell */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} 
        className="relative flex items-end bg-black/40 border border-white/5 focus-within:border-white/15 focus-within:shadow-[0_0_24px_rgba(245,158,11,0.05)] rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl"
      >
        <button 
          type="button" 
          onClick={triggerFileInput}
          title="Attach file (Images, Videos, PDFs, CSVs)"
          className="p-3.5 text-neutral-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer self-end mb-1"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          id="aura-chat-textarea"
          name="aura-chat-textarea"
          value={input || ''}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          autoFocus
          placeholder="Ask AURA... (Type '/' for commands or drag files here)"
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-neutral-500 py-3.5 max-h-32 min-h-[44px] overflow-y-auto scrollbar-thin resize-none leading-relaxed"
        />

        <div className="flex items-center gap-1.5 pr-2.5 pb-2">
          <button 
            type="button" 
            onClick={handleVoiceClick}
            title="Start voice conversation"
            className="p-2 text-neutral-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={(!input?.trim() && attachments.length === 0) || isLoading}
            className="p-1 bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl disabled:opacity-40 transition-all duration-300 w-9 h-9 flex items-center justify-center overflow-hidden border border-white/10 relative group shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <img src="/logo.jpg?v=2" alt="AURA Send" className="w-7 h-7 rounded-lg object-cover group-hover:scale-105 transition-transform" />
            )}
          </button>
        </div>
      </form>

      {/* Suggestive Slash Commands quick toolbar */}
      {input.trim() === '' && (
        <div className="flex gap-2 items-center overflow-x-auto scrollbar-none pb-1">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold shrink-0">Shortcuts:</span>
          {slashCommands.slice(0, 4).map((c) => (
            <button
              key={c.cmd}
              type="button"
              onClick={() => handleCommandClick(c.prompt)}
              className="text-[10px] text-neutral-400 hover:text-white px-2.5 py-1 bg-white/5 border border-white/5 hover:border-white/10 rounded-full transition-colors cursor-pointer shrink-0 font-medium"
            >
              {c.cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
