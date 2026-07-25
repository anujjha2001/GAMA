'use client';

import * as React from 'react';
import { Landmark3D } from '../../lib/workout-studio/BiomechanicsEngine';
import { useCamera } from '../../lib/camera/useCamera';
import { usePose } from '../../lib/pose/usePose';
import { PoseRenderer } from '../../lib/pose/pose-renderer';
// Debug Panel removed per requirements

interface PoseCameraProps {
  onPoseData: (landmarks: Landmark3D[], confidence: number) => void;
  onCameraStateChange: (isActive: boolean) => void;
  jointWarnings: string[];
}

export default function PoseCamera({ onPoseData, onCameraStateChange, jointWarnings }: PoseCameraProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rendererRef = React.useRef<PoseRenderer | null>(null);

  // Initialize modular hooks
  const { videoRef, cameraState, error: cameraError, startCamera } = useCamera();
  const isStreaming = cameraState === 'streaming';
  
  const { poseState, error: poseError, landmarks, confidence } = usePose(videoRef, isStreaming);

  // Expose camera active state to parent
  React.useEffect(() => {
    onCameraStateChange(isStreaming);
  }, [isStreaming, onCameraStateChange]);

  // Expose pose data to parent
  React.useEffect(() => {
    onPoseData(landmarks, confidence);
  }, [landmarks, confidence, onPoseData]);

  // Start camera on mount
  React.useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Render loop
  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new PoseRenderer(canvasRef.current);
    }

    const renderer = rendererRef.current;
    renderer.clear();

    // Draw the raw video frame if streaming
    if (isStreaming && videoRef.current && videoRef.current.readyState >= 2) {
      renderer.drawFrame(videoRef.current);
    }

    // Draw skeleton if we have landmarks
    if (landmarks.length > 0) {
      renderer.drawSkeleton(landmarks, jointWarnings.length > 0);
    }
  }, [landmarks, isStreaming, jointWarnings]);

  // Determine UI State
  const loading = cameraState === 'starting' || cameraState === 'requesting_permission' || poseState === 'loading';
  const hasError = cameraState === 'error' || cameraState === 'permission_denied' || poseState === 'error';
  const errorMessage = cameraError || poseError;

  return (
    <div className="relative w-full h-full rounded-[24px] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl shadow-xl flex items-center justify-center">
      
      {/* Premium Loading Overlay */}
      {loading && !hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 overflow-hidden">
          {/* Glass Shimmer Effects */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-emerald-500/10 animate-pulse" />
          <div className="absolute inset-0 backdrop-blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
             {/* Holographic scanning element */}
             <div className="w-24 h-32 border border-white/20 rounded-xl relative overflow-hidden flex items-center justify-center bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="w-8 h-8 opacity-40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
             </div>

             <div className="text-center space-y-2">
               <h4 className="text-xs font-black text-white/90 uppercase tracking-[0.2em] animate-pulse">
                 {cameraState === 'requesting_permission' ? 'Requesting Access' : 
                  cameraState === 'starting' ? 'Preparing Camera' :
                  poseState === 'loading' ? 'Calibrating Body' :
                  'Almost Ready'}
               </h4>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                 GAMA Vision Intelligence
               </p>
             </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0%, 100% { transform: translateY(0); opacity: 0; }
              50% { transform: translateY(128px); opacity: 1; }
            }
          `}} />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-40 gap-5">
          <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-3xl">!</div>
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wide">Camera Error</h4>
            <p className="text-sm text-neutral-400 mt-2 max-w-[280px] leading-relaxed">{errorMessage}</p>
          </div>
          <button 
            onClick={() => startCamera()}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors border border-white/10"
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* 
        Video is intentionally moved OUT of the regular document flow to prevent 
        browsers from pausing its playback when "hidden".
      */}
      <video
        ref={videoRef}
        className="fixed top-[-9999px] left-[-9999px] w-[640px] h-[480px]"
        autoPlay
        playsInline
        muted
      />
      
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none scale-x-[-1]"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* No mini HUD - zero confidence/debug spam */}
    </div>
  );
}
