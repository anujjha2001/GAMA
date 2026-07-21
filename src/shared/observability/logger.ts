export class Logger {
  static info(message: string, context?: any) {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, context }));
  }

  static warn(message: string, context?: any) {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, context }));
  }

  static error(message: string, context?: any) {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, context }));
  }
}
