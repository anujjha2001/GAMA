'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Play, Square, Navigation, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type VoiceState =
  | 'IDLE'
  | 'WAKE'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'RETRIEVING_CONTEXT'
  | 'SELECTING_AGENT'
  | 'CALLING_TOOL'
  | 'GENERATING'
  | 'STREAMING'
  | 'SPEAKING'
  | 'WAITING';

export default function AuraVoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [voiceState, setVoiceState] = React.useState<VoiceState>('IDLE');
  const [transcription, setTranscription] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [visualData, setVisualData] = React.useState<any>(null);
  const [activeModel, setActiveModel] = React.useState<'AURA-v1' | 'AURA-v2' | 'Thinking Bit'>('AURA-v1');
  const [isMuted, setIsMuted] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // Audio nodes and Speech Recognition refs
  const recognitionRef = React.useRef<any>(null);
  const wakeWordRecRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const audioStreamRef = React.useRef<MediaStream | null>(null);
  const premiumAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Synthesize clean wake chime tone using Web Audio API to prevent hotlink 403 blocks
  const playWakeChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      // First tone (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      // Second tone (C6) slightly delayed
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1046.50, ctx.currentTime);
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.35);
        } catch (e) { }
      }, 100);
    } catch (err) {
      console.warn('Could not synthesize chime:', err);
    }
  };

  // Keep latest state/functions in a ref to avoid stale closures in mount-only event listeners
  const stateRef = React.useRef({ isOpen, voiceState, transcription, activeModel, isMuted, sessionId });
  stateRef.current = { isOpen, voiceState, transcription, activeModel, isMuted, sessionId };

  const handleVoiceSubmitRef = React.useRef<any>(null);
  const startListeningRef = React.useRef<any>(null);
  const wakeUpRef = React.useRef<any>(null);

  const transcriptionRef = React.useRef('');
  const isSpeechRecActiveRef = React.useRef(false);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const unlockAudioAndTTS = () => {
    if (typeof window === 'undefined') return;
    try {
      // 1. Unlock SpeechSynthesis
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
      }
      
      // 2. Unlock AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    } catch (e) {
      console.warn('Audio/TTS unlock failed:', e);
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
      handleVoices();
    }
  }, []);


  // Initialize Speech Recognition
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        // 1. Setup Active Recognition
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setVoiceState('LISTENING');
          isSpeechRecActiveRef.current = true;
          // If AURA is currently speaking, barge-in!
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          if (premiumAudioRef.current) {
            premiumAudioRef.current.pause();
          }
        };

        rec.onresult = (event: any) => {
          setVoiceState('UNDERSTANDING');
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          setTranscription(currentText);
          transcriptionRef.current = currentText;
        };

        rec.onend = () => {
          isSpeechRecActiveRef.current = false;
          // If transcription has content, trigger completion
          const currentTranscription = transcriptionRef.current;
          if (currentTranscription.trim()) {
            handleVoiceSubmitRef.current(currentTranscription);
          } else {
            setVoiceState('WAITING');
            // Restart listening if still open
            if (stateRef.current.isOpen) {
              setTimeout(() => {
                if (stateRef.current.isOpen && stateRef.current.voiceState === 'WAITING') {
                  startListeningRef.current();
                }
              }, 1000);
            }
          }
        };

        rec.onerror = (e: any) => {
          isSpeechRecActiveRef.current = false;
          if (e.error === 'aborted' || e.error === 'no-speech') return;
          console.warn('Speech recognition error:', e.error);
          if (e.error === 'not-allowed') {
            toast.error('Microphone permission denied.');
            setIsOpen(false);
            setVoiceState('IDLE');
          }
        };

        recognitionRef.current = rec;

        // 2. Setup Standby Wake Word Recognition (Only on non-mobile to prevent continuous mic capture indicators on phones)
        const wakeRec = new SpeechRecognition();
        wakeRec.continuous = true;
        wakeRec.interimResults = false;
        wakeRec.lang = 'en-US';

        wakeRec.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log('[WakeWord] Heard:', lastResult);
          if (lastResult.includes('hey aura') || lastResult.includes('aura')) {
            wakeUpRef.current();
          }
        };

        wakeRec.onend = () => {
          // Keep wake word detection running in background if assistant is closed on desktop
          if (!stateRef.current.isOpen && !isMobileDevice()) {
            try { wakeRec.start(); } catch (e) { }
          }
        };

        wakeWordRecRef.current = wakeRec;
        // Start background wake word engine on non-mobile
        if (!isMobileDevice()) {
          try { wakeRec.start(); } catch (e) { }
        }
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (wakeWordRecRef.current) wakeWordRecRef.current.abort();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Wake Word Activation
  const wakeUp = () => {
    unlockAudioAndTTS();
    playWakeChime();
    setIsOpen(true);
    setVoiceState('WAKE');
    setTranscription('');
    transcriptionRef.current = '';
    setCaption('AURA: Online. Listening...');
    toast.success('AURA activated via wake word!');

    // Stop background wake word to prevent overlaps
    if (wakeWordRecRef.current) {
      wakeWordRecRef.current.abort();
    }

    setTimeout(() => {
      startListening();
    }, 800);
  };

  // Start active microphone streaming and analysis
  const startListening = async () => {
    unlockAudioAndTTS();
    setTranscription('');
    transcriptionRef.current = '';
    setCaption('');
    setVisualData(null);
    setVoiceState('LISTENING');

    // Start browser Speech Recognition safely
    if (recognitionRef.current && !isSpeechRecActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already started, ignore
      }
    }

    // Initialize Web Audio API Volume Waveform (Skip mic capture on mobile to prevent conflicts with SpeechRecognition)
    if (!isMobileDevice()) {
      try {
        if (!audioStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContextClass();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;

          source.connect(analyser);
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
        }
      } catch (err) {
        console.warn('Could not initialize audio visualizer:', err);
      }
    }
    drawWaveform();
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }
  };

  // Send voice query to central AI Orchestrator API
  const handleVoiceSubmit = async (queryText: string) => {
    setVoiceState('GENERATING');
    setCaption('Understanding query...');

    try {
      const response = await fetch('/api/v1/aura/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          sessionId: sessionId,
          modelOverride: activeModel === 'AURA-v1' ? 'llama-3.1-8b-instant' : activeModel === 'AURA-v2' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      if (data.success) {
        setCaption(data.caption);
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        if (data.visual && data.visual.enabled) {
          setVisualData(data.visual);
        }

        // Executing Tools from central Tool Registry
        if (data.tool && data.tool.name !== 'none') {
          setVoiceState('CALLING_TOOL');
          executeTool(data.tool.name, data.tool.actionType, data.tool.parameter);
        } else {
          setVoiceState('SPEAKING');
        }

        // Play Synthesized Voice Output (Premium with Fallback)
        if (data.premiumAudio && data.premiumAudio.audioBase64 && !stateRef.current.isMuted) {
          playPremiumTTS(data.premiumAudio.audioBase64);
        } else if (!stateRef.current.isMuted) {
          playBrowserTTS(data.message);
        } else {
          // If muted, return to listening after 3s delay
          setTimeout(() => {
            if (stateRef.current.isOpen) startListening();
          }, 3000);
        }

      } else {
        throw new Error(data.error || 'AURA failed to process');
      }

    } catch (err: any) {
      toast.error(err.message || 'Connection failure');
      setCaption('AURA experienced an error. Please try again.');
      setVoiceState('WAITING');
      setTimeout(() => {
        if (stateRef.current.isOpen) startListening();
      }, 2500);
    }
  };

  // Tool Executor
  const executeTool = (toolName: string, actionType: string, parameter: string) => {
    toast.info(`Executing voice tool: ${toolName.replace('_', ' ')}`);

    if (actionType === 'NAVIGATE') {
      let targetPath = parameter;
      if (!targetPath || typeof targetPath !== 'string' || !targetPath.startsWith('/')) {
        // Fallback mapping based on tool name
        if (toolName === 'meal_guide') targetPath = '/meals';
        else if (toolName === 'health_vault') targetPath = '/vault';
        else if (toolName === 'insights') targetPath = '/insights';
        else if (toolName === 'schedule') targetPath = '/schedule';
        else if (toolName === 'settings') targetPath = '/settings';
        else targetPath = '/dashboard';
      }
      router.push(targetPath);
      setVoiceState('SPEAKING');
    } else if (toolName === 'food_scanner' || actionType === 'TRIGGER_SCANNER') {
      router.push('/meals');
      setVoiceState('SPEAKING');
      // Delay to let route load, then trigger scanner click
      setTimeout(() => {
        const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
          toast.success('Food plate scanner initiated!');
        } else {
          toast.error('Could not locate the scanner camera input.');
        }
      }, 1000);
    }
  };

  // Play Premium Voice Synthesis
  const playPremiumTTS = (base64Audio: string) => {
    if (premiumAudioRef.current) {
      premiumAudioRef.current.pause();
    }
    const audio = new Audio(base64Audio);
    audio.play().catch(() => {
      // Fallback to browser TTS if audio block is blocked
      playBrowserTTS(caption);
    });
    premiumAudioRef.current = audio;
    audio.onended = () => {
      if (stateRef.current.isOpen) startListening();
    };
  };

  // Fallback Web Speech Synthesis
  const playBrowserTTS = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Choose premium sounding voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Aria') || v.name.includes('David')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 1.05; // Slightly faster for natural latency feel
    utterance.pitch = 1.0;

    utterance.onend = () => {
      utteranceRef.current = null;
      if (stateRef.current.isOpen) startListening();
    };

    utterance.onerror = () => {
      utteranceRef.current = null;
      if (stateRef.current.isOpen) startListening();
    };

    // Android/Chrome reset synthesis engine: speak empty silence first
    try {
      const resetUtterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(resetUtterance);
    } catch (e) {}

    window.speechSynthesis.speak(utterance);

    // Chrome bug: SpeechSynthesis can hang if we don't trigger resume
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  // Render volume waveform on Canvas (Uses microphone data on laptop, smooth fallback wave on mobile)
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const draw = () => {
      if (voiceState !== 'LISTENING' && voiceState !== 'UNDERSTANDING' && voiceState !== 'SPEAKING') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
      phase += 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.1)'); // Indigo/Purple
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)'); // Blue
      ctx.strokeStyle = gradient;

      if (analyser && !isMobileDevice()) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        // Beautiful simulated sine wave on mobile to avoid mic capture clashing
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const angle = (x / canvas.width) * Math.PI * 4 + phase;
          const baseAmp = voiceState === 'LISTENING' ? 12 : voiceState === 'SPEAKING' ? 8 : 4;
          const y = canvas.height / 2 + Math.sin(angle) * baseAmp * Math.sin((x / canvas.width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    draw();
  };

  // Close voice session safely
  const closeSession = () => {
    setIsOpen(false);
    setVoiceState('IDLE');
    setTranscription('');
    transcriptionRef.current = '';
    setCaption('');
    setVisualData(null);
    setSessionId(null);

    // Cancel synthesis and media streams
    window.speechSynthesis.cancel();
    if (premiumAudioRef.current) {
      premiumAudioRef.current.pause();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Restart standby wake-word recognition on desktop
    if (wakeWordRecRef.current && !isMobileDevice()) {
      try { wakeWordRecRef.current.start(); } catch (e) { }
    }
  };

  handleVoiceSubmitRef.current = handleVoiceSubmit;
  startListeningRef.current = startListening;
  wakeUpRef.current = wakeUp;

  return (
    <>
      {/* FLOATING TRIGGER ORB */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <span className="text-[10px] uppercase font-bold text-neutral-400 bg-black/60 border border-white/5 px-2.5 py-1 rounded-md tracking-wider">
                Say "Hey Aura"
              </span>
              <button
                onClick={() => wakeUp()}
                className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_4px_30px_rgba(99,102,241,0.4)] border border-indigo-400/20 hover:scale-105 transition-all cursor-pointer relative group overflow-hidden"
              >
                {/* Floating Glow effects */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                <img src="/logo.jpg?v=2" alt="GAMA" className="w-8 h-8 rounded-full object-cover" />
                <span className="absolute -inset-0.5 rounded-full border border-white/20 animate-ping opacity-25" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAILED INTERACTIVE INTERFACE PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] rounded-[32px] border border-blue/10 bg-black/80 backdrop-blur-2xl shadow-[0_24px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header controls */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-white">AURA Biological Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Model Selector */}
                <select
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value as any)}
                  className="bg-black/50 border border-white/10 rounded-lg text-[10px] font-bold text-white px-2 py-1 focus:outline-none uppercase tracking-wider cursor-pointer"
                >
                  <option value="AURA-v1">AURA-v1 (Fast)</option>
                  <option value="AURA-v2">AURA-v2 (Deep)</option>
                  <option value="Thinking Bit">Thinking Bit</option>
                </select>

                {/* Mute Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={closeSession}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Panel Area */}
            <div className="p-6 flex flex-col items-center justify-between min-h-[320px]">

              {/* Multimodal response display visualizer bubble */}
              <AnimatePresence>
                {visualData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 mb-4 flex items-center justify-center relative"
                  >
                    {visualData.url ? (
                      <img
                        src={visualData.url}
                        alt="AURA visual context"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Loading {visualData.type.replace('_', ' ')}</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 border border-white/10 rounded text-[9px] font-semibold text-neutral-300 uppercase tracking-widest">
                      {visualData.type}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glowing Orb Animation */}
              <div className="relative w-36 h-36 flex items-center justify-center my-6">

                {/* Outer Glow Spheres */}
                <div className={`absolute w-32 h-32 rounded-full blur-[45px] opacity-65 transition-all duration-700 ${
                  voiceState === 'LISTENING' ? 'bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-cyan-500 scale-105 animate-pulse' :
                  voiceState === 'UNDERSTANDING' ? 'bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-rose-500 scale-110' :
                  (voiceState === 'GENERATING' || voiceState === 'RETRIEVING_CONTEXT') ? 'bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 animate-spin duration-3000' :
                  voiceState === 'CALLING_TOOL' ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 scale-105' :
                  voiceState === 'SPEAKING' ? 'bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-rose-500 scale-105 animate-pulse' :
                  'bg-fuchsia-950/20'
                }`} />

                {/* Orb Ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
                  voiceState === 'GENERATING' ? 'border-fuchsia-500/50 animate-spin' :
                  voiceState === 'LISTENING' ? 'border-cyan-500/50 animate-pulse' :
                  voiceState === 'SPEAKING' ? 'border-rose-500/50 animate-pulse' :
                  'border-white/10'
                }`} />

                {/* Main Orb Center */}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-tr transition-all duration-700 relative shadow-2xl ${
                  voiceState === 'LISTENING' ? 'from-rose-500 via-fuchsia-500 to-cyan-500 scale-105' :
                  voiceState === 'UNDERSTANDING' ? 'from-fuchsia-500 via-pink-500 to-rose-500 scale-105' :
                  (voiceState === 'GENERATING' || voiceState === 'RETRIEVING_CONTEXT') ? 'from-violet-600 via-purple-500 to-pink-500 scale-95' :
                  voiceState === 'CALLING_TOOL' ? 'from-purple-600 via-indigo-500 to-blue-500 scale-105' :
                  voiceState === 'SPEAKING' ? 'from-cyan-400 via-fuchsia-500 to-rose-500 scale-105' :
                  'from-neutral-800 via-[#1f1715] to-[#2c1a14]'
                }`}>
                  <div className="absolute inset-1.5 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center overflow-hidden">
                    {/* Inner GAMA logo with active indicators based on voice state */}
                    {voiceState === 'LISTENING' ? (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover animate-pulse" alt="GAMA Logo" />
                        <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-75" />
                      </div>
                    ) : voiceState === 'WAITING' ? (
                      <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover opacity-50 grayscale" alt="GAMA Logo" />
                    ) : voiceState === 'SPEAKING' ? (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover" alt="GAMA Logo" />
                        <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-75" />
                      </div>
                    ) : (voiceState === 'GENERATING' || voiceState === 'RETRIEVING_CONTEXT') ? (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover" alt="GAMA Logo" />
                        <div className="absolute inset-0 border-2 border-white/45 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : voiceState === 'CALLING_TOOL' ? (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover" alt="GAMA Logo" />
                        <Navigation className="absolute bottom-0 right-0 w-4 h-4 text-purple-500 bg-black rounded-full p-0.5" />
                      </div>
                    ) : (
                      <img src="/logo.jpg?v=2" className="w-10 h-10 rounded-full object-cover" alt="GAMA Logo" />
                    )}
                  </div>
                </div>

                {/* Pulse wave ring */}
                {voiceState === 'LISTENING' && (
                  <span className="absolute -inset-2 rounded-full border border-fuchsia-500/40 animate-ping" />
                )}
              </div>

              {/* Waveform visualizer Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-12 rounded-xl mb-4 bg-transparent"
                width={360}
                height={48}
              />

              {/* Status & Subtitle captions */}
              <div className="w-full text-center px-4 mb-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                  Status: {voiceState.replace('_', ' ')}
                </span>

                {/* Visual state guide without rendering actual transcription or caption text */}
                <p className="text-sm font-semibold text-neutral-400 leading-relaxed">
                  {voiceState === 'LISTENING' ? 'AURA is listening to your voice...' :
                   voiceState === 'SPEAKING' ? 'AURA is speaking...' :
                   (voiceState === 'GENERATING' || voiceState === 'RETRIEVING_CONTEXT') ? 'AURA is thinking...' :
                   voiceState === 'CALLING_TOOL' ? 'Executing command...' :
                   'Silence. Say "Hey Aura" to interact.'}
                </p>
              </div>

              {/* Interactive buttons */}
              <div className="w-full flex justify-center gap-4 border-t border-white/5 pt-4">
                {voiceState === 'WAITING' || voiceState === 'IDLE' ? (
                  <button
                    onClick={startListening}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop Listening
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
