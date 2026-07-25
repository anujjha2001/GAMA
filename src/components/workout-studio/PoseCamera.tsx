'use client';

import * as React from 'react';
import { Landmark3D } from '../../lib/workout-studio/BiomechanicsEngine';
import { useCamera } from '../../lib/camera/useCamera';
import { usePose } from '../../lib/pose/usePose';
import { PoseRenderer } from '../../lib/pose/pose-renderer';
import { DebugPanel } from './DebugPanel';

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
      
      {/* Dev Debug Panel */}
      <DebugPanel 
        cameraState={cameraState} 
        poseState={poseState} 
        videoRef={videoRef}
        landmarksCount={landmarks.length}
      />

      {/* Loading Overlay */}
      {loading && !hasError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
          <div className="text-center">
             <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
               {cameraState === 'requesting_permission' ? 'Waiting for Permission...' : 
                cameraState === 'starting' ? 'Starting Camera...' :
                'Loading AI Model...'}
             </h4>
             <p className="text-xs text-neutral-400">Please wait while the vision engine initializes.</p>
          </div>
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

      {/* Mini HUD overlay */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-black/75 backdrop-blur-md rounded-xl border border-white/5 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${confidence > 0.65 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-extrabold">
          {poseState === 'ready' && isStreaming ? (confidence > 0.65 ? `AI Active • ${Math.round(confidence * 100)}% Conf` : 'Scanning...') : 'Connecting...'}
        </span>
      </div>
    </div>
  );
}
