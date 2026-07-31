export type Priority = 'EMERGENCY' | 'PREMIUM' | 'NORMAL' | 'BACKGROUND';

interface QueueTask<T> {
  id: string;
  priority: Priority;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export class GlobalQueue {
  private static queues: Record<Priority, QueueTask<any>[]> = {
    'EMERGENCY': [],
    'PREMIUM': [],
    'NORMAL': [],
    'BACKGROUND': []
  };
  
  private static activeCount = 0;
  private static MAX_CONCURRENT = 100; // Configurable based on scaling

  /**
   * Enqueues a task based on priority. 
   * In a true distributed system (Redis/BullMQ), this would push to a Redis list.
   */
  static enqueue<T>(priority: Priority, execute: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: QueueTask<T> = {
        id: crypto.randomUUID(),
        priority,
        execute,
        resolve,
        reject
      };
      
      this.queues[priority].push(task);
      this.processNext();
    });
  }

  private static processNext() {
    if (this.activeCount >= this.MAX_CONCURRENT) {
      return; // Max capacity reached, back-pressure applied
    }

    // Pull from highest priority first
    let taskToRun: QueueTask<any> | undefined;
    
    if (this.queues['EMERGENCY'].length > 0) {
      taskToRun = this.queues['EMERGENCY'].shift();
    } else if (this.queues['PREMIUM'].length > 0) {
      taskToRun = this.queues['PREMIUM'].shift();
    } else if (this.queues['NORMAL'].length > 0) {
      taskToRun = this.queues['NORMAL'].shift();
    } else if (this.queues['BACKGROUND'].length > 0) {
      taskToRun = this.queues['BACKGROUND'].shift();
    }

    if (!taskToRun) return;

    this.activeCount++;
    
    taskToRun.execute()
      .then(taskToRun.resolve)
      .catch(taskToRun.reject)
      .finally(() => {
        this.activeCount--;
        this.processNext();
      });
  }
}
