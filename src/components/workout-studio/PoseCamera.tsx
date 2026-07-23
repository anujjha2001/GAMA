// GAMA Workout Studio - MediaPipe AI Pose Estimation Camera

'use client';

import * as React from 'react';
import { Landmark3D } from '../../lib/workout-studio/BiomechanicsEngine';

interface PoseCameraProps {
  onPoseData: (landmarks: Landmark3D[], confidence: number) => void;
  onCameraStateChange: (isActive: boolean) => void;
  jointWarnings: string[];
}

export default function PoseCamera({ onPoseData, onCameraStateChange, jointWarnings }: PoseCameraProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = React.useState(true);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);
  const [confidence, setConfidence] = React.useState(0);

  React.useEffect(() => {
    let activeCamera: any = null;
    let poseInstance: any = null;
    let isCancelled = false;

    // Load MediaPipe Pose from jsDelivr CDN
    const loadMediaPipe = async () => {
      try {
        setLoading(true);
        
        // Check if already loaded globally
        if (!(window as any).Pose) {
          const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.crossOrigin = 'anonymous';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          };

          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
        }

        if (isCancelled) return;
        initializePose();
      } catch (err) {
        console.error('Error loading MediaPipe:', err);
        setPermissionError('Failed to load pose estimation assets.');
      }
    };

    const initializePose = async () => {
      const Pose = (window as any).Pose;
      const Camera = (window as any).Camera;

      if (!Pose || !Camera) {
        setPermissionError('MediaPipe assets not available.');
        return;
      }

      // Initialize Pose Model
      poseInstance = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      poseInstance.onResults((results: any) => {
        if (isCancelled) return;
        setLoading(false);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          const landmarks: Landmark3D[] = results.poseLandmarks;
          
          // Calculate average pose visibility
          let totalVis = 0;
          landmarks.forEach(lm => totalVis += lm.visibility || 0);
          const avgConfidence = totalVis / landmarks.length;
          
          setConfidence(avgConfidence);
          onPoseData(landmarks, avgConfidence);

          // Draw skeleton overlay
          drawSkeleton(ctx, landmarks, results.poseLandmarks[0].visibility || 0.8);
        } else {
          setConfidence(0);
        }
      });

      // Start Camera stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        onCameraStateChange(true);

        activeCamera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseInstance) {
              await poseInstance.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        activeCamera.start();
      } catch (err) {
        console.error('Camera permission denied:', err);
        setPermissionError('Camera access denied. Please allow permission to estimate pose.');
        onCameraStateChange(false);
      }
    };

    const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], visibility: number) => {
      const connections = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
        [11, 23], [12, 24], [23, 24], // Torso
        [23, 25], [24, 26], [25, 27], [26, 28] // Lower body
      ];

      ctx.lineWidth = 3;

      // Draw Connection lines
      connections.forEach(([i1, i2]) => {
        const p1 = landmarks[i1];
        const p2 = landmarks[i2];
        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x * 640, p1.y * 480);
          ctx.lineTo(p2.x * 640, p2.y * 480);
          
          // Color code based on active form warnings
          if (jointWarnings.length > 0) {
            ctx.strokeStyle = '#ff453a'; // Alert Red
          } else {
            ctx.strokeStyle = '#30d158'; // Safe Green
          }
          ctx.stroke();
        }
      });

      // Draw Joint points
      landmarks.forEach((p, idx) => {
        if (p.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(p.x * 640, p.y * 480, 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(p.x * 640, p.y * 480, 7, 0, 2 * Math.PI);
          ctx.strokeStyle = '#0a84ff'; // Tech glow outline
          ctx.stroke();
        }
      });
    };

    loadMediaPipe();

    return () => {
      isCancelled = true;
      if (activeCamera) {
        activeCamera.stop();
      }
      if (poseInstance) {
        poseInstance.close();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onPoseData, onCameraStateChange, jointWarnings]);

  return (
    <div className="relative w-full h-full rounded-[24px] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl shadow-xl flex items-center justify-center">
      {/* Loading Overlay */}
      {loading && !permissionError && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading AI Vision Engine...</span>
        </div>
      )}

      {/* Permission Error Display */}
      {permissionError && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20 gap-4">
          <div className="w-12 h-12 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-xl">!</div>
          <div>
            <h4 className="text-sm font-semibold text-white">Camera Access Blocked</h4>
            <p className="text-xs text-neutral-400 mt-1.5 max-w-[240px] leading-relaxed">{permissionError}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        autoPlay
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
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
          {confidence > 0.65 ? `AI Active • ${Math.round(confidence * 100)}% Conf` : 'Scanning...'}
        </span>
      </div>
    </div>
  );
}
