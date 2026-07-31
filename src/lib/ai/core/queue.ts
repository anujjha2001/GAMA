export interface IQueueProvider {
  enqueue<T>(queueName: string, task: () => Promise<T>): Promise<T>;
}

export class MemoryQueueProvider implements IQueueProvider {
  private queues: Record<string, {
    tasks: { id: string, fn: () => Promise<any>, resolve: (val: any) => void, reject: (err: any) => void }[];
    isProcessing: boolean;
  }> = {};

  async enqueue<T>(queueName: string, task: () => Promise<T>): Promise<T> {
    if (!this.queues[queueName]) {
      this.queues[queueName] = { tasks: [], isProcessing: false };
    }

    return new Promise<T>((resolve, reject) => {
      this.queues[queueName].tasks.push({ id: Math.random().toString(), fn: task, resolve, reject });
      this.processQueue(queueName);
    });
  }

  private async processQueue(queueName: string) {
    const q = this.queues[queueName];
    if (q.isProcessing || q.tasks.length === 0) return;

    q.isProcessing = true;
    while (q.tasks.length > 0) {
      const taskObj = q.tasks.shift();
      if (!taskObj) continue;

      try {
        const result = await taskObj.fn();
        taskObj.resolve(result);
      } catch (err) {
        taskObj.reject(err);
      }
    }
    q.isProcessing = false;
  }
}

// In production, you would conditionally export RedisQueueProvider here
export const globalQueue = new MemoryQueueProvider();
