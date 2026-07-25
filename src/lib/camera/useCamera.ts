import { useEffect, useState, useRef, useCallback } from 'react';
import { CameraManager, CameraState } from './camera-manager';

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Keep manager in a ref so it's not recreated on every render
  const managerRef = useRef<CameraManager | null>(null);

  useEffect(() => {
    // Initialize manager exactly once
    if (!managerRef.current) {
      managerRef.current = new CameraManager({
        width: 640,
        height: 480,
        facingMode: 'user',
        onStateChange: (state, newError) => {
          setCameraState(state);
          if (newError) setError(newError);
          else setError(null);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (managerRef.current) {
        managerRef.current.stop();
        managerRef.current = null;
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (!managerRef.current || !videoRef.current) return;
    await managerRef.current.start(videoRef.current);
  }, []);

  const stopCamera = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stop();
    }
  }, []);

  return {
    videoRef,
    cameraState,
    error,
    startCamera,
    stopCamera
  };
}
