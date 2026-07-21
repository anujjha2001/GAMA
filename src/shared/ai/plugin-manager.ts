import { Capability } from './sdk/capability';
import { CAPABILITY_REGISTRY } from './capability-registry';

export class PluginManager {
  static loadPlugins(): Capability[] {
    return Object.values(CAPABILITY_REGISTRY);
  }

  static registerPlugin(capability: Capability) {
    CAPABILITY_REGISTRY[capability.id] = capability;
    console.log(`[PluginManager] Dynamic plugin loaded: ${capability.name}`);
  }
}
