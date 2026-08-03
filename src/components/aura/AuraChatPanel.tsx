'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraModelSelector } from './AuraModelSelector';
import { AuraMessage } from './AuraMessage';
import { AuraInput } from './AuraInput';
import { type Message } from '@/hooks/useAura';
import { Camera, X, Play, Square, Eye, EyeOff, Video } from 'lucide-react';
import { toast } from 'sonner';

interface AuraChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: any) => Promise<void>;
  isLoading: boolean;
  conversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  attachments?: any[];
  uploadFile?: (file: File) => Promise<void>;
  removeAttachment?: (index: number) => void;
  uploadingFiles?: Record<string, { stage: string; progress: number }>;
}

export function AuraChatPanel({ 
  isOpen, 
  onClose,
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  conversationId,
  onSelectConversation,
  onNewChat,
  attachments = [],
  uploadFile,
  removeAttachment,
  uploadingFiles = {}
}: AuraChatPanelProps) {
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [historyList, setHistoryList] = React.useState<any[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  // Live Camera Vision States
  const [isLiveCameraActive, setIsLiveCameraActive] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const visionTimerRef = React.useRef<any>(null);

  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // 1. Smooth auto-scroll to newest message
  React.useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const timer = setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);

  // 2. Scroll panel into view smoothly if not fully visible
  React.useEffect(() => {
    if (isOpen && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
      if (!isVisible) {
        setTimeout(() => {
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    }
  }, [isOpen]);

  // 3. Keyboard shortcuts listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Toggle History: Ctrl/Cmd + Shift + H
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen(prev => !prev);
      }
      // Toggle Live Vision: Ctrl/Cmd + Shift + V
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleLiveCamera();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLiveCameraActive]);

  // 4. Load History
  React.useEffect(() => {
    if (isHistoryOpen && isOpen) {
      fetch('/api/aura/history')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.conversations) {
            setHistoryList(data.conversations);
          }
        })
        .catch(err => console.error('Failed to fetch conversation history:', err));
    }
  }, [isHistoryOpen, conversationId, isOpen]);


  // 4. Drag and Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && uploadFile) {
      Array.from(e.dataTransfer.files).forEach(file => {
        uploadFile(file);
      });
    }
  };

  // 5. Live Camera Vision setup & capture loops
  const toggleLiveCamera = async () => {
    if (isLiveCameraActive) {
      stopLiveCamera();
    } else {
      await startLiveCamera();
    }
  };

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'environment' } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCameraActive(true);
      toast.success('Live Camera Vision stream initiated!');

      // Set up recurring frame analysis (every 4 seconds)
      visionTimerRef.current = setInterval(captureAndAnalyzeFrame, 4000);
    } catch (err: any) {
      console.error('[Live Vision Camera failed]:', err);
      toast.error('Could not activate camera. Please grant camera permissions.');
    }
  };

  const stopLiveCamera = () => {
    if (visionTimerRef.current) {
      clearInterval(visionTimerRef.current);
      visionTimerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
    toast.info('Live Vision Mode disabled.');
  };

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 data url
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Mock upload/analysis injection or call direct handleSubmit
    toast.info('AURA analyzing live camera frame...', { duration: 1500 });
    
    // Automatically upload frame as an attachment
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `live_vision_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (uploadFile) {
        await uploadFile(file);
      }
      // Trigger submission
      handleSubmit("Live camera vision check: Analyze this posture/surroundings.");
    } catch (e) {
      console.warn('Frame capture analysis upload failed:', e);
    }
  };

  // Clean up stream on unmount/close
  React.useEffect(() => {
    return () => {
      if (visionTimerRef.current) clearInterval(visionTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 600, marginTop: 24 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="w-full max-w-5xl mx-auto aura-overlay backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl relative z-40 flex flex-col md:flex-row overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* 1. Drag & Drop File Upload Visual Overlay */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragLeave={handleDragLeave}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 p-8 border-4 border-dashed border-amber-500/40 rounded-[32px]"
              >
                <Video className="w-16 h-16 text-amber-500 animate-pulse" />
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Drop files to upload</h3>
                <p className="text-xs text-neutral-400">Attach reports, CSV, images or videos instantly to GAMA AURA</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. History Sidebar */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:flex flex-col border-r border-white/10 p-6 overflow-hidden bg-black/20 shrink-0"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">History</h3>
                  <button
                    onClick={onNewChat}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    title="New Chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 hover:text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-2 text-xs">
                  {historyList.length === 0 ? (
                    <div className="text-neutral-500 text-center py-4 italic">No history yet.</div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectConversation?.(item.id)}
                        className={`p-3 border rounded-xl cursor-pointer transition-colors text-left line-clamp-2 ${
                          conversationId === item.id
                            ? 'bg-white/10 border-white/20 text-white font-medium shadow-sm'
                            : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-300'
                        }`}
                      >
                        {item.title}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Live Vision Camera Feed Panel */}
          {isLiveCameraActive && (
            <div className="w-full md:w-[380px] border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/40 relative shrink-0 h-[220px] md:h-auto overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Live Vision Feed
                </span>
                <button
                  onClick={stopLiveCamera}
                  className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Camera element container */}
              <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
                <video 
                  ref={videoRef}
                  className="w-full h-full rounded-2xl bg-neutral-900 border border-white/10 object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="p-4 border-t border-white/5 text-[11px] text-neutral-400 leading-normal bg-black/20 shrink-0">
                AURA is watching in real-time. Frame snapshots will automatically feed every 4 seconds. Focus the camera on postures, food items, or prescriptions.
              </div>
            </div>
          )}

          {/* 4. Main Chat Workspace Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-neutral-950/20">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors mr-1 border-none bg-transparent cursor-pointer"
                    title="Toggle History (Ctrl+Shift+H)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 hover:text-white"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </button>
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[14px] font-extrabold text-white uppercase tracking-widest">AURA</span>
                </div>
                
                <AuraModelSelector />
              </div>
              
              <div className="flex items-center gap-3">
                {/* Live Vision Mode Toggle button */}
                <button
                  onClick={toggleLiveCamera}
                  title="Toggle Live Camera Vision Mode (Ctrl+Shift+V)"
                  className={`px-3 py-1.5 rounded-xl border text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLiveCameraActive 
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow'
                      : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isLiveCameraActive ? 'Disable Vision' : 'Live Vision'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-wider border-none bg-transparent"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-4 px-6 py-6 scrollbar-thin"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-neutral-500">
                  <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">Ask GAMA AURA</span>
                  <p className="text-xs max-w-sm">I can analyze medical reports, optimize training form, or recommend nutrition plans. What can I do for you today?</p>
                </div>
              ) : (
                messages.map(msg => (
                  <AuraMessage key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer Area */}
            <div className="px-6 pb-6 pt-2 border-t border-white/5">
              <AuraInput 
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                attachments={attachments}
                uploadFile={uploadFile}
                removeAttachment={removeAttachment}
                uploadingFiles={uploadingFiles}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
