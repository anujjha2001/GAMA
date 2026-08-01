import { AI_CONFIG } from '../config';

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitState {
  state: State;
  failures: number;
  lastFailureTime: number;
}

export class CircuitBreaker {
  private static circuits = new Map<string, CircuitState>();

  private static getState(id: string): CircuitState {
    if (!this.circuits.has(id)) {
      this.circuits.set(id, { state: 'CLOSED', failures: 0, lastFailureTime: 0 });
    }
    return this.circuits.get(id)!;
  }

  static isAvailable(id: string): boolean {
    const circuit = this.getState(id);
    
    if (circuit.state === 'CLOSED') {
      return true;
    }

    if (circuit.state === 'OPEN') {
      const now = Date.now();
      // Auto-recover to HALF_OPEN after cooldown
      if (now - circuit.lastFailureTime > AI_CONFIG.circuitBreaker.cooldownMs) {
        circuit.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker] Provider ${id} transitioned to HALF_OPEN`);
        return true;
      }
      return false;
    }

    // HALF_OPEN allows 1 request to pass through
    return true; 
  }

  static recordSuccess(id: string) {
    const circuit = this.getState(id);
    if (circuit.state === 'HALF_OPEN' || circuit.failures > 0) {
      circuit.state = 'CLOSED';
      circuit.failures = 0;
      console.log(`[CircuitBreaker] Provider ${id} recovered, transitioned to CLOSED`);
    }
  }

  static recordFailure(id: string) {
    const circuit = this.getState(id);
    circuit.failures += 1;
    circuit.lastFailureTime = Date.now();

    if (circuit.state === 'HALF_OPEN' || circuit.failures >= AI_CONFIG.circuitBreaker.failureThreshold) {
      circuit.state = 'OPEN';
      console.warn(`[CircuitBreaker] Provider ${id} tripped OPEN after ${circuit.failures} failures`);
    }
  }
}
