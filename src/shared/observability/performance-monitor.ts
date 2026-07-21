export class PerformanceMonitor {
  static getResourceUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      return {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      };
    }
    return null;
  }
}
