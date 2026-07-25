import { Landmark3D } from '../workout-studio/BiomechanicsEngine';

export class PoseRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  public clear() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  public drawFrame(imageSource: CanvasImageSource) {
    this.ctx.save();
    this.ctx.drawImage(imageSource, 0, 0, this.width, this.height);
    this.ctx.restore();
  }

  public drawSkeleton(landmarks: Landmark3D[], hasWarnings: boolean) {
    this.ctx.save();
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [24, 26], [25, 27], [26, 28] // Lower body
    ];

    this.ctx.lineWidth = 3;

    // Draw Connection lines
    connections.forEach(([i1, i2]) => {
      const p1 = landmarks[i1];
      const p2 = landmarks[i2];
      if (p1 && p2 && p1.visibility! > 0.5 && p2.visibility! > 0.5) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.width, p1.y * this.height);
        this.ctx.lineTo(p2.x * this.width, p2.y * this.height);
        
        // Color code based on active form warnings
        if (hasWarnings) {
          this.ctx.strokeStyle = '#ff453a'; // Alert Red
        } else {
          this.ctx.strokeStyle = '#30d158'; // Safe Green
        }
        this.ctx.stroke();
      }
    });

    // Draw Joint points
    landmarks.forEach((p) => {
      if (p.visibility! > 0.5) {
        this.ctx.beginPath();
        this.ctx.arc(p.x * this.width, p.y * this.height, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(p.x * this.width, p.y * this.height, 7, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#0a84ff'; // Tech glow outline
        this.ctx.stroke();
      }
    });
    this.ctx.restore();
  }
}
