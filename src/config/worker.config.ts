export const WORKER_CONFIG = {
  queues: {
    healthTasks: 'health-tasks-queue',
  },
  concurrency: {
    ocr: 2,
    foodAnalysis: 2,
    predictions: 1,
  },
  retryLimits: 3
};
