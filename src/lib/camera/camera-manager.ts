export type CameraState =
  | 'idle'
  | 'requesting_permission'
  | 'permission_denied'
  | 'starting'
  | 'streaming'
  | 'error'
  | 'reconnecting';

export interface CameraManagerOptions {
  onStateChange?: (state: CameraState, error?: string) => void;
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private state: CameraState = 'idle';
  private options: CameraManagerOptions;

  constructor(options: CameraManagerOptions = {}) {
    this.options = {
      width: 640,
      height: 480,
      facingMode: 'user',
      ...options,
    };
  }

  private setState(newState: CameraState, error?: string) {
    if (this.state === newState && !error) return;
    this.state = newState;
    if (this.options.onStateChange) {
      this.options.onStateChange(newState, error);
    }
  }

  public getState(): CameraState {
    return this.state;
  }

  public async start(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    if (this.state === 'streaming' && this.stream && this.stream.active) {
      return; // Already streaming
    }

    try {
      this.setState('requesting_permission');

      // Stop existing stream if any
      this.stop();

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.options.width },
          height: { ideal: this.options.height },
          facingMode: this.options.facingMode,
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Handle track ended unexpectedly (e.g. device disconnected)
      this.stream.getVideoTracks()[0].onended = () => {
        this.handleTrackEnded();
      };

      this.setState('starting');

      this.videoElement.srcObject = this.stream;
      
      // We must wait for the video to be ready before declaring it streaming
      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();
        
        const onLoadedMetadata = async () => {
          this.videoElement?.removeEventListener('loadedmetadata', onLoadedMetadata);
          try {
            await this.videoElement?.play();
            resolve();
          } catch (e) {
            console.error('Failed to play video', e);
            resolve(); // Resolve anyway so we can handle the error in the UI
          }
        };

        if (this.videoElement.readyState >= 1) {
           onLoadedMetadata();
        } else {
           this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        }
      });

      this.setState('streaming');

    } catch (err: any) {
      console.error('CameraManager start error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.setState('permission_denied', 'Camera permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.setState('error', 'No camera detected on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        this.setState('error', 'Camera is already in use by another application.');
      } else {
        this.setState('error', err.message || 'An unknown camera error occurred.');
      }
    }
  }

  private handleTrackEnded() {
    console.warn('Camera track ended unexpectedly.');
    this.setState('error', 'Camera disconnected.');
    // In a real app we might attempt a reconnect interval here
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.setState('idle');
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }
}
