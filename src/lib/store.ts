import { create } from 'zustand';

export interface MemoryTag {
  id: string;
  category: 'preference' | 'medical' | 'dislike' | 'goal' | 'general';
  value: string;
  timestamp: string;
}

export interface HealthStory {
  id: string;
  title: string;
  subtitle: string;
  category: 'anomaly' | 'correlation' | 'progress' | 'optimization';
  content: string;
  metricType: 'hrv' | 'stress' | 'sleep' | 'steps' | 'heart';
  impactValue: string;
  impactType: 'positive' | 'negative' | 'neutral';
  timestamp: string;
}

export interface VaultDoc {
  id: string;
  name: string;
  uploadDate: string;
  status: 'scanning' | 'analyzed' | 'failed';
  fileSize: string;
  extractedGoals: string[];
  actionPlan: {
    title: string;
    description: string;
    schedule: string;
  }[];
}

interface HealthState {
  // Wearables Data
  steps: number;
  sleepHours: number;
  hrv: number;
  stressLevel: number;
  heartRate: number;
  
  // AURA's Memory
  memoryTags: MemoryTag[];
  
  // Documents
  documents: VaultDoc[];
  
  // Story Analytics Feed
  stories: HealthStory[];

  // Environmental Context
  weather: {
    temp: number;
    condition: string;
    location: string;
  };
  timeOfDay: string;

  // Providers & Simulation Context
  provider: "apple" | "garmin" | "fitbit" | "oura" | "manual" | "mock";
  simulatedHour: number;
  manualInputs: {
    steps?: number;
    sleepHours?: number;
    hrv?: number;
    restingHeartRate?: number;
    currentHeartRate?: number;
    bloodOxygen?: number;
    systolic?: number;
    diastolic?: number;
    waterIntakeMl?: number;
    activeCalories?: number;
    mood?: number;
    screenTimeMin?: number;
    deepWorkMin?: number;
  };

  // Actions
  setSteps: (steps: number | ((prev: number) => number)) => void;
  setSleepHours: (hours: number | ((prev: number) => number)) => void;
  setHrv: (hrv: number | ((prev: number) => number)) => void;
  setStressLevel: (level: number | ((prev: number) => number)) => void;
  setHeartRate: (rate: number | ((prev: number) => number)) => void;
  
  setProvider: (prov: "apple" | "garmin" | "fitbit" | "oura" | "manual" | "mock") => void;
  setSimulatedHour: (hour: number) => void;
  setManualInputs: (inputs: Partial<HealthState['manualInputs']>) => void;

  addMemoryTag: (category: MemoryTag['category'], value: string) => void;
  removeMemoryTag: (id: string) => void;
  
  uploadDocument: (name: string, size: string) => void;
  updateDocStatus: (id: string, status: VaultDoc['status'], goals?: string[], plan?: VaultDoc['actionPlan']) => void;
  
  addStory: (story: Omit<HealthStory, 'id' | 'timestamp'>) => void;
}

// Helper to compute wellness score
export const calculateWellness = (sleep: number, hrv: number, steps: number, stress: number) => {
  const sleepWeight = sleep * 10;
  const stepsWeight = steps / 250;
  const rawWellness = (sleepWeight + hrv + stepsWeight) / stress;
  return Math.min(100, Math.max(10, Math.round(rawWellness)));
};

export const useHealthStore = create<HealthState>((set, get) => ({
  // Default values
  steps: 19840,
  sleepHours: 7.75,
  hrv: 80,
  stressLevel: 2.7,
  heartRate: 63,
  
  memoryTags: [
    { id: 'm1', category: 'preference', value: 'Prefers plant-based proteins', timestamp: '2026-07-10' },
    { id: 'm2', category: 'preference', value: 'Loves mungfali (peanuts)', timestamp: '2026-07-12' },
    { id: 'm3', category: 'medical', value: 'Mild lactose sensitivity', timestamp: '2026-07-08' },
    { id: 'm4', category: 'goal', value: 'Aiming for 8.0 hrs average sleep', timestamp: '2026-07-01' }
  ],
  
  documents: [
    {
      id: 'doc1',
      name: 'Q2_Cardiology_Report.pdf',
      uploadDate: '2026-06-15',
      status: 'analyzed',
      fileSize: '2.4 MB',
      extractedGoals: [
        'Maintain resting heart rate between 55-65 BPM',
        'Target zone 2 cardio exercises (3x per week)',
        'Reduce sodium intake below 2000mg daily'
      ],
      actionPlan: [
        { title: 'Morning Cardio Walk', description: '30 min zone 2 activity matching circadian peak', schedule: 'Mon, Wed, Fri at 07:30' },
        { title: 'Electrolyte Balance Monitor', description: 'Focus on potassium rich food sources (avocado, spinach)', schedule: 'Daily check-in' }
      ]
    }
  ],
  
  stories: [
    {
      id: 's1',
      title: 'Circadian Realignment',
      subtitle: 'HRV vs Sleep Schedule Correlation',
      category: 'correlation',
      metricType: 'hrv',
      content: 'AURA analyzed your last 7 days of sleep consistency. On nights you slept after 23:30, your next-day HRV dropped by an average of 14ms (18% decline). Adjusting your wind-down schedule to 22:45 is highly recommended.',
      impactValue: '+14ms HRV',
      impactType: 'positive',
      timestamp: '2 hours ago'
    },
    {
      id: 's2',
      title: 'Stress Response Index',
      subtitle: 'Physiological stress spike detected',
      category: 'anomaly',
      metricType: 'stress',
      content: 'We noticed a critical autonomic stress level spike (4.2/5) at 14:15. This was highly correlated with a sudden 12% drop in skin temperature. Correlating this with your calendar, AURA suggests a 2-minute box breathing session prior to your next executive review meeting.',
      impactValue: '-1.5 Stress',
      impactType: 'negative',
      timestamp: '3 hours ago'
    },
    {
      id: 's3',
      title: 'Cardio Efficiency Peak',
      subtitle: 'Aerobic threshold analysis',
      category: 'optimization',
      metricType: 'steps',
      content: 'Your current activity volume of 19,840 steps is optimizing cardiovascular load. Your aerobic capacity during active windows has improved by 4% over the last fortnight. Maintain this recovery-to-load ratio.',
      impactValue: '+4% VO2 Est.',
      impactType: 'positive',
      timestamp: '1 day ago'
    }
  ],
  
  weather: {
    temp: 24,
    condition: 'Clear Sky',
    location: 'Silicon Valley'
  },
  
  timeOfDay: 'Evening',

  // Default Providers & Simulation values
  provider: 'mock',
  simulatedHour: 18, // defaults to Evening (18:00)
  manualInputs: {},

  // Actions
  setSteps: (val) => set((state) => ({ steps: typeof val === 'function' ? val(state.steps) : val })),
  setSleepHours: (val) => set((state) => ({ sleepHours: typeof val === 'function' ? val(state.sleepHours) : val })),
  setHrv: (val) => set((state) => ({ hrv: typeof val === 'function' ? val(state.hrv) : val })),
  setStressLevel: (val) => set((state) => ({ stressLevel: typeof val === 'function' ? val(state.stressLevel) : val })),
  setHeartRate: (val) => set((state) => ({ heartRate: typeof val === 'function' ? val(state.heartRate) : val })),
  
  setProvider: (prov) => set(() => ({ provider: prov })),
  setSimulatedHour: (hour) => set(() => ({ simulatedHour: hour })),
  setManualInputs: (inputs) => set((state) => ({ manualInputs: { ...state.manualInputs, ...inputs } })),

  addMemoryTag: (category, value) => set((state) => ({
    memoryTags: [
      ...state.memoryTags,
      {
        id: 'm_' + Math.random().toString(36).substring(2, 9),
        category,
        value,
        timestamp: new Date().toISOString().split('T')[0]
      }
    ]
  })),
  
  removeMemoryTag: (id) => set((state) => ({
    memoryTags: state.memoryTags.filter(t => t.id !== id)
  })),
  
  uploadDocument: (name, size) => set((state) => {
    const newDoc: VaultDoc = {
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      name,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'scanning',
      fileSize: size,
      extractedGoals: [],
      actionPlan: []
    };
    return { documents: [newDoc, ...state.documents] };
  }),
  
  updateDocStatus: (id, status, goals = [], plan = []) => set((state) => ({
    documents: state.documents.map(d => d.id === id ? { ...d, status, extractedGoals: goals, actionPlan: plan } : d)
  })),
  
  addStory: (story) => set((state) => ({
    stories: [
      {
        ...story,
        id: 's_' + Math.random().toString(36).substring(2, 9),
        timestamp: 'Just now'
      },
      ...state.stories
    ]
  }))
}));
