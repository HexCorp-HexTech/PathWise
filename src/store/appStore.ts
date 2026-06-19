/* ============================================
   VIDYA AI — Zustand App Store (General State)
   ============================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Theme, NetworkState } from '../types';

interface AppState {
  // UI
  theme: Theme;
  language: Language;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  isMobile: boolean;

  // Network
  networkState: NetworkState;
  pendingSyncCount: number;

  // ElevenLabs Voice Debug
  voiceStatus: 'idle' | 'validating' | 'connected' | 'error';
  voiceError: string;
  audioCount: number;
  lastGenTime: number;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  setNetworkState: (state: NetworkState) => void;
  setPendingSyncCount: (count: number) => void;
  setVoiceStatus: (status: 'idle' | 'validating' | 'connected' | 'error') => void;
  setVoiceError: (err: string) => void;
  incrementAudioCount: () => void;
  setLastGenTime: (ms: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      fontSize: 'medium',
      sidebarCollapsed: false,
      isMobile: window.innerWidth < 768,
      networkState: 'online',
      pendingSyncCount: 0,
      voiceStatus: 'idle',
      voiceError: '',
      audioCount: 0,
      lastGenTime: 0,

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setIsMobile: (isMobile) => set({ isMobile }),
      setNetworkState: (networkState) => set({ networkState }),
      setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
      setVoiceStatus: (voiceStatus) => set({ voiceStatus }),
      setVoiceError: (voiceError) => set({ voiceError }),
      incrementAudioCount: () => set((s) => ({ audioCount: s.audioCount + 1 })),
      setLastGenTime: (lastGenTime) => set({ lastGenTime }),
    }),
    {
      name: 'pathwise-app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        fontSize: state.fontSize,
        sidebarCollapsed: state.sidebarCollapsed,
        audioCount: state.audioCount,
      }),
    }
  )
);
