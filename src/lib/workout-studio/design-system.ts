// GAMA Workout Studio - Apple Design System & Tokens

export const DESIGN_TOKENS = {
  colors: {
    background: '#070709', // Matte Premium Dark Black
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    accentBlue: '#0a84ff', // Premium Apple Blue
    accentGreen: '#30d158', // Apple Green for Safe / Perfect Form
    accentYellow: '#ffd60a', // Apple Yellow for Warnings
    accentRed: '#ff453a', // Apple Red for Danger / Unsafe Limits
    textMuted: '#8e8e93',
  },
  radius: {
    container: '32px', // Apple-style card
    panel: '24px',
    control: '16px',
  },
  spacing: {
    containerGap: '24px',
    paddingCard: '20px',
  },
  motion: {
    springConfig: {
      type: 'spring',
      stiffness: 80,
      damping: 18,
      mass: 1,
    } as const,
    hoverScale: 1.02,
    transitionFast: '0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    transitionMedium: '0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
};

export type PerformancePreset = 'Ultra' | 'High' | 'Balanced' | 'Battery';

export interface PerformanceConfig {
  preset: PerformancePreset;
  shadows: boolean;
  antialias: boolean;
  pixelRatio: number;
  particles: number;
  enablePostprocessing: boolean;
}

export const PERFORMANCE_PRESETS: Record<PerformancePreset, PerformanceConfig> = {
  Ultra: {
    preset: 'Ultra',
    shadows: true,
    antialias: true,
    pixelRatio: 2,
    particles: 200,
    enablePostprocessing: true,
  },
  High: {
    preset: 'High',
    shadows: true,
    antialias: true,
    pixelRatio: 1.5,
    particles: 100,
    enablePostprocessing: false,
  },
  Balanced: {
    preset: 'Balanced',
    shadows: false,
    antialias: false,
    pixelRatio: 1.0,
    particles: 50,
    enablePostprocessing: false,
  },
  Battery: {
    preset: 'Battery',
    shadows: false,
    antialias: false,
    pixelRatio: 0.8,
    particles: 20,
    enablePostprocessing: false,
  },
};
