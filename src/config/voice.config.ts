export const VOICE_CONFIG = {
  vad: {
    minVolumeThreshold: 0.015, // minimum RMS volume
    silenceTimeoutMs: 1500, // time in ms before ending speech detection
  },
  tts: {
    defaultProvider: (process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : (process.env.OPENAI_API_KEY ? 'openai' : 'browser')) as 'elevenlabs' | 'openai' | 'browser',
    openai: {
      voice: 'alloy',
      model: 'tts-1',
    },
    elevenlabs: {
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      modelId: 'eleven_monolingual_v1',
    }
  },
  wakeWord: {
    phrases: ['hey aura', 'aura'],
  }
};
