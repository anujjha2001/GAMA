import React, { useEffect, useState } from 'react';
import { CameraState } from '../../lib/camera/camera-manager';
import { PoseState } from '../../lib/pose/pose-engine';

interface DebugPanelProps {
  cameraState: CameraState;
  poseState: PoseState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarksCount: number;
}

export function DebugPanel({ cameraState, poseState, videoRef, landmarksCount }: DebugPanelProps) {
  const [fps, setFps] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        
        if (videoRef.current) {
          setVideoDimensions({
            w: videoRef.current.videoWidth,
            h: videoRef.current.videoHeight
          });
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef]);

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/20 p-4 rounded-xl text-xs font-mono text-neutral-300 z-50 flex flex-col gap-1 w-64 shadow-2xl">
      <h4 className="text-white font-bold mb-2 uppercase border-b border-white/10 pb-1">Debug Panel</h4>
      
      <div className="flex justify-between">
        <span>Camera State:</span>
        <span className={cameraState === 'streaming' ? 'text-emerald-400' : 'text-amber-400'}>{cameraState}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Pose Engine:</span>
        <span className={poseState === 'ready' ? 'text-emerald-400' : 'text-amber-400'}>{poseState}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Video Res:</span>
        <span>{videoDimensions.w}x{videoDimensions.h}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Render FPS:</span>
        <span className={fps >= 24 ? 'text-emerald-400' : 'text-red-400'}>{fps}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Landmarks:</span>
        <span className={landmarksCount > 0 ? 'text-emerald-400' : 'text-neutral-500'}>{landmarksCount}/33</span>
      </div>
    </div>
  );
}
