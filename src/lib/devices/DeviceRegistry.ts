export type DeviceCategory = 
  | 'Wearables' 
  | 'Health Rings' 
  | 'Smart Scales' 
  | 'Blood Pressure' 
  | 'CGM' 
  | 'Medical Devices' 
  | 'Developer Devices';

export interface DeviceRegistryEntry {
  id: string;
  brand: string;
  model: string;
  category: DeviceCategory;
  imagePath: string; // Path to transparent PNG/WebP
  supportedMetrics: string[];
  connectionMethod: 'oauth' | 'ble';
  firmwareSupport: boolean;
  status: 'available' | 'coming_soon' | 'beta';
  providerId?: string; // If oauth, the associated provider ID
}

// Data-driven registry for marketplace and capability discovery
export const DeviceRegistry: DeviceRegistryEntry[] = [
  {
    id: 'garmin_fenix_8',
    brand: 'Garmin',
    model: 'Fenix 8 Solar',
    category: 'Wearables',
    imagePath: '/images/devices/garmin_fenix_8.png',
    supportedMetrics: ['heart_rate', 'hrv', 'spo2', 'sleep', 'body_battery', 'steps', 'vo2_max'],
    connectionMethod: 'oauth',
    firmwareSupport: true,
    status: 'beta',
    providerId: 'garmin'
  },
  {
    id: 'apple_watch_ultra_2',
    brand: 'Apple',
    model: 'Watch Ultra 2',
    category: 'Wearables',
    imagePath: '/images/devices/apple_watch_ultra_2.png',
    supportedMetrics: ['heart_rate', 'hrv', 'spo2', 'ecg', 'sleep', 'steps'],
    connectionMethod: 'oauth', // Demo UI only
    firmwareSupport: false,
    status: 'coming_soon'
  },
  {
    id: 'oura_ring_gen3',
    brand: 'Oura',
    model: 'Ring Gen3',
    category: 'Health Rings',
    imagePath: '/images/devices/oura_ring_gen3.png',
    supportedMetrics: ['heart_rate', 'hrv', 'sleep', 'temperature', 'readiness'],
    connectionMethod: 'oauth',
    firmwareSupport: true,
    status: 'available',
    providerId: 'oura'
  },
  {
    id: 'fitbit_charge_6',
    brand: 'Fitbit',
    model: 'Charge 6',
    category: 'Wearables',
    imagePath: '/images/devices/fitbit_charge_6.png',
    supportedMetrics: ['heart_rate', 'hrv', 'sleep', 'steps', 'ecg', 'stress'],
    connectionMethod: 'oauth',
    firmwareSupport: true,
    status: 'available',
    providerId: 'fitbit'
  },
  {
    id: 'dexcom_g7',
    brand: 'Dexcom',
    model: 'G7 CGM',
    category: 'CGM',
    imagePath: '/images/devices/dexcom_g7.png',
    supportedMetrics: ['glucose'],
    connectionMethod: 'oauth',
    firmwareSupport: false,
    status: 'coming_soon',
    providerId: 'dexcom'
  }
];

export function getDeviceById(id: string): DeviceRegistryEntry | undefined {
  return DeviceRegistry.find(device => device.id === id);
}

export function getDevicesByCategory(category: DeviceCategory): DeviceRegistryEntry[] {
  return DeviceRegistry.filter(device => device.category === category);
}

export function getAllAvailableDevices(): DeviceRegistryEntry[] {
  return DeviceRegistry.filter(device => device.status === 'available' || device.status === 'beta');
}
