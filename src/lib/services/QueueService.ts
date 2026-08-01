export interface QueueJob {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}

export class QueueService {
  // In development, we use an in-memory queue.
  // In production, this would integrate with Redis + BullMQ.
  private static jobs: Map<string, QueueJob> = new Map();

  static async enqueue(type: string, payload: any): Promise<string> {
    const jobId = Math.random().toString(36).substring(7);
    this.jobs.set(jobId, { id: jobId, type, payload, status: 'pending' });
    
    // Simulate async processing
    setTimeout(() => this.processJob(jobId), 100);
    
    return jobId;
  }

  static async getJobStatus(jobId: string): Promise<QueueJob | undefined> {
    return this.jobs.get(jobId);
  }

  private static async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    
    try {
      // Simulate real-world processing
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Based on type, hit different providers (mocked for now)
      if (job.type === 'CHECK_AVAILABILITY') {
        job.result = {
          isAvailable: true,
          price: 320,
          etaMin: 20,
          etaMax: 30,
          deliveryFee: 40,
        };
      }
      
      job.status = 'completed';
    } catch (e) {
      job.status = 'failed';
      job.result = e;
    }
  }
}
