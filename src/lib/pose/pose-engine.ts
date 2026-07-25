import { Landmark3D } from '../workout-studio/BiomechanicsEngine';

export type PoseState = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface PoseEngineOptions {
  onStateChange?: (state: PoseState, error?: string) => void;
  onResults?: (landmarks: Landmark3D[], confidence: number, rawResults: any) => void;
}

export class PoseEngine {
  private pose: any = null;
  private state: PoseState = 'uninitialized';
  private isProcessingFrame: boolean = false;
  private isDestroyed: boolean = false;
  private options: PoseEngineOptions;

  constructor(options: PoseEngineOptions = {}) {
    this.options = options;
  }

  private setState(newState: PoseState, error?: string) {
    if (this.state === newState && !error) return;
    this.state = newState;
    if (this.options.onStateChange) {
      this.options.onStateChange(newState, error);
    }
  }

  public getState(): PoseState {
    return this.state;
  }

  private async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already in DOM
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  public async initialize(): Promise<void> {
    if (this.state === 'ready' || this.state === 'loading') return;

    try {
      this.setState('loading');

      // Load CDN scripts globally
      if (!(window as any).Pose) {
        if (!(window as any).poseScriptPromise) {
          (window as any).poseScriptPromise = (async () => {
            // Load from CDN without version pinning to ensure synchronized internal dependencies
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
          })();
        }
        await (window as any).poseScriptPromise;
      }

      const PoseConstructor = (window as any).Pose;
      if (!PoseConstructor) {
        throw new Error('MediaPipe Pose failed to inject into window.');
      }

      // Reuse global instance to survive React Strict Mode / HMR
      if (!(window as any).globalPoseInstance) {
        (window as any).globalPoseInstance = new PoseConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        (window as any).globalPoseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });
      }

      this.pose = (window as any).globalPoseInstance;

      // Register the callback BEFORE initialize
      this.pose.onResults(this.handleResults.bind(this));

      // Explicitly wait for WASM initialization
      await this.pose.initialize();

      this.setState('ready');
    } catch (err: any) {
      console.error('PoseEngine init error:', err);
      this.setState('error', err.message || 'Failed to initialize AI model.');
    }
  }

  private handleResults(results: any) {
    if (this.isDestroyed) return;

    if (results.poseLandmarks && this.options.onResults) {
      const landmarks: Landmark3D[] = results.poseLandmarks;
      
      // Calculate average pose visibility
      let totalVis = 0;
      landmarks.forEach(lm => totalVis += lm.visibility || 0);
      const avgConfidence = totalVis / landmarks.length;
      
      this.options.onResults(landmarks, avgConfidence, results);
    } else if (this.options.onResults) {
      this.options.onResults([], 0, results);
    }
    
    // Unlock the processing flag so the next frame can be processed
    this.isProcessingFrame = false;
  }

  public async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (this.state !== 'ready' || this.isDestroyed || !this.pose) return;

    // Prevent concurrent sends which crash the WASM engine
    if (this.isProcessingFrame) return;

    this.isProcessingFrame = true;
    try {
      await this.pose.send({ image: videoElement });
    } catch (err) {
      console.error('Pose inference error:', err);
      this.isProcessingFrame = false; // unlock on error
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.pose) {
      // We purposefully DO NOT close the pose instance because it's a global singleton
      // and closing it would crash the WASM runtime on the next hot reload.
      // We just detach our callbacks.
      this.pose.onResults(() => {});
    }
  }
}
