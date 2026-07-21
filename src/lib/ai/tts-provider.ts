import { NextRequest, NextResponse } from 'next/server';

/**
 * Backend TTS Abstraction.
 * If API keys are present, this function fetches premium audio.
 * Otherwise, it returns null, signaling the client to fallback to browser Web Speech API synthesis.
 */
export async function generatePremiumSpeech(text: string): Promise<{ audioBase64: string; format: string } | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

  if (elevenlabsKey) {
    try {
      console.log('[TTS-Provider] Using ElevenLabs synthesis');
      const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - Natural voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.75, similarity_boost: 0.75 }
        })
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return { audioBase64: `data:audio/mp3;base64,${base64}`, format: 'mp3' };
      }
    } catch (e) {
      console.warn('[TTS-Provider] ElevenLabs failed, falling back...', e);
    }
  }

  if (openaiKey) {
    try {
      console.log('[TTS-Provider] Using OpenAI TTS synthesis');
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy'
        })
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return { audioBase64: `data:audio/mp3;base64,${base64}`, format: 'mp3' };
      }
    } catch (e) {
      console.warn('[TTS-Provider] OpenAI TTS failed, falling back...', e);
    }
  }

  // Fallback to browser synthesis
  return null;
}
