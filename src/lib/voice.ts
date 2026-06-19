/* ============================================
   PATHWISE — ElevenLabs & Web Speech API Wrapper
   ============================================ */
import { db } from './db';
import { networkManager } from './network';
import { useAppStore } from '../store/appStore';

export const ELEVENLABS_VOICE_EN = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Pre-made standard voice, works on Free Tier)
export const ELEVENLABS_VOICE_HI = 'EXAVITQu4vr4xnSDxMaL'; // Bella (Pre-made standard voice, works on Free Tier)

/**
 * Detect language of text (English vs Hindi) to choose the right voice
 */
export function detectLanguage(text: string): 'en' | 'hi' {
  // Simple check for Hindi characters (Unicode range for Devanagari is 0900-097F)
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text) ? 'hi' : 'en';
}

/**
 * Generate a hash or unique key for text + voice ID
 */
function getCacheKey(text: string, voiceId: string): string {
  const cleanText = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${voiceId}_${cleanText.substring(0, 100)}_${cleanText.length}`;
}

interface PlaybackControls {
  audio: HTMLAudioElement | null;
  synth: SpeechSynthesis | null;
  utterance: SpeechSynthesisUtterance | null;
  stop: () => void;
}

/**
 * Fallback to browser's native speech synthesis (Web Speech API)
 */
function speakViaBrowser(
  text: string,
  lang: 'en' | 'hi',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): PlaybackControls {
  const synth = window.speechSynthesis;
  if (!synth) {
    const err = new Error('Browser speech synthesis not supported.');
    onError?.(err);
    throw err;
  }

  // Cancel any ongoing speech
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

  // Find a suitable voice for the language
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (voice) {
    utterance.voice = voice;
  }

  const controls: PlaybackControls = {
    audio: null,
    synth,
    utterance,
    stop: () => {
      synth.cancel();
    }
  };

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => onError?.(e);

  synth.speak(utterance);
  return controls;
}

/**
 * Synthesize and play text via server-side ElevenLabs Proxy
 */
export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<PlaybackControls> {
  // Use the global language setting from the app store rather than auto-detecting
  const store = useAppStore.getState();
  const lang = store.language || detectLanguage(text);
  const voiceId = lang === 'hi' ? ELEVENLABS_VOICE_HI : ELEVENLABS_VOICE_EN;
  const cacheKey = getCacheKey(text, voiceId);

  const controls: PlaybackControls = {
    audio: null,
    synth: null,
    utterance: null,
    stop: () => {},
  };

  try {
    // 1. Check local IndexedDB cache first
    const cached = await db.voiceCache.get(cacheKey);
    if (cached) {
      const audioUrl = URL.createObjectURL(cached.audioBlob);
      const audio = new Audio(audioUrl);
      controls.audio = audio;
      controls.stop = () => {
        audio.pause();
        audio.currentTime = 0;
      };

      audio.onplay = () => onStart?.();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        onError?.(e);
      };

      await audio.play();
      return controls;
    }

    const online = networkManager.isOnline();
    if (!online) {
      console.log('[Voice] Offline, falling back to browser speech synthesis');
      return speakViaBrowser(text, lang, onStart, onEnd, onError);
    }

    onStart?.();
    const startTime = Date.now();
    const store = useAppStore.getState();

    // 2. Fetch from server-side ElevenLabs Proxy
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      throw new Error('Voice services temporarily unavailable.');
    }

    const audioBlob = await response.blob();
    const latency = Date.now() - startTime;
    store.setLastGenTime(latency);
    
    // Store debug stats
    store.incrementAudioCount();
    store.setVoiceStatus('connected');
    store.setVoiceError('');
    
    // Store in IndexedDB for offline playback
    await db.voiceCache.put({
      id: cacheKey,
      text,
      voiceId,
      audioBlob,
      createdAt: Date.now(),
    });

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    controls.audio = audio;
    controls.stop = () => {
      audio.pause();
      audio.currentTime = 0;
    };

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      onEnd?.();
    };
    audio.play().catch(err => {
      URL.revokeObjectURL(audioUrl);
      onError?.(err);
    });

    return controls;
  } catch (error: any) {
    console.warn('[Voice] ElevenLabs synthesis failed, falling back to browser speech synthesis:', error);
    try {
      return speakViaBrowser(text, lang, onStart, onEnd, onError);
    } catch (fallbackErr) {
      console.error('[Voice] Browser speech synthesis fallback failed:', fallbackErr);
      const cleanErr = new Error('Voice services temporarily unavailable.');
      onError?.(cleanErr);
      throw cleanErr;
    }
  }
}

/**
 * Offline-Ready Speech-to-Text Speech Recognition Hook
 */
export function getSpeechRecognizer(
  lang: 'en' | 'hi',
  onResult: (text: string) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  if (onEnd) recognition.onend = onEnd;
  if (onError) recognition.onerror = onError;

  return recognition;
}
