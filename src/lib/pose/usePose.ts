import { useEffect, useState, useRef, useCallback } from 'react';
import { PoseEngine, PoseState } from './pose-engine';
import { Landmark3D } from '../workout-studio/BiomechanicsEngine';

export interface UsePoseResult {
  poseState: PoseState;
  error: string | null;
  landmarks: Landmark3D[];
  confidence: number;
  rawResults: any | null;
}

export function usePose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isStreaming: boolean
): UsePoseResult {
  const [poseState, setPoseState] = useState<PoseState>('uninitialized');
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark3D[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [rawResults, setRawResults] = useState<any | null>(null);

  const engineRef = useRef<PoseEngine | null>(null);
  const frameIdRef = useRef<number>(0);

  // Initialize Pose Engine exactly once
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new PoseEngine({
        onStateChange: (state, newError) => {
          setPoseState(state);
          if (newError) setError(newError);
          else setError(null);
        },
        onResults: (lms, conf, results) => {
          setLandmarks(lms);
          setConfidence(conf);
          setRawResults(results);
        }
      });
      engineRef.current.initialize();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Frame processing loop
  useEffect(() => {
    let active = true;

    const processVideoFrame = async () => {
      if (!active) return;
      
      const video = videoRef.current;
      const engine = engineRef.current;

      if (video && isStreaming && engine && engine.getState() === 'ready') {
        // Wait until video is fully playing and has dimensions
        if (video.readyState >= 4 && video.videoWidth > 0 && !video.paused) {
          await engine.processFrame(video);
        }
      }
      
      // Schedule next frame
      // Fallback to requestAnimationFrame if requestVideoFrameCallback is not available
      if (active) {
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && video) {
           frameIdRef.current = (video as any).requestVideoFrameCallback(processVideoFrame);
        } else {
           frameIdRef.current = requestAnimationFrame(processVideoFrame);
        }
      }
    };

    if (isStreaming) {
       // Start the loop
       processVideoFrame();
    }

    return () => {
      active = false;
      if (frameIdRef.current) {
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && videoRef.current) {
          (videoRef.current as any).cancelVideoFrameCallback(frameIdRef.current);
        } else {
          cancelAnimationFrame(frameIdRef.current);
        }
      }
    };
  }, [isStreaming, videoRef]);

  return { poseState, error, landmarks, confidence, rawResults };
}
