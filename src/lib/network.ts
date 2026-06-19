/* ============================================
   VIDYA AI — Network Detection & State Management
   ============================================ */

import type { NetworkState } from '../types';

type NetworkListener = (state: NetworkState) => void;

class NetworkManager {
  private state: NetworkState = 'online';
  private listeners: Set<NetworkListener> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private rtt: number = 0;

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen to browser online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Initial state
    this.state = navigator.onLine ? 'online' : 'offline';

    // Periodic connection quality check
    this.checkInterval = setInterval(() => this.checkConnectionQuality(), 30000);
    this.checkConnectionQuality();
  }

  private handleOnline(): void {
    this.setState('syncing');
    // After brief sync, transition to online
    setTimeout(() => {
      this.checkConnectionQuality();
    }, 1000);
  }

  private handleOffline(): void {
    this.setState('offline');
  }

  private async checkConnectionQuality(): Promise<void> {
    if (!navigator.onLine) {
      this.setState('offline');
      return;
    }

    try {
      const start = performance.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      this.rtt = performance.now() - start;

      if (this.rtt > 3000) {
        this.setState('poor');
      } else {
        this.setState('online');
      }
    } catch {
      if (navigator.onLine) {
        this.setState('poor');
      } else {
        this.setState('offline');
      }
    }
  }

  private setState(newState: NetworkState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.listeners.forEach((listener) => listener(newState));
    }
  }

  getState(): NetworkState {
    return this.state;
  }

  getRTT(): number {
    return this.rtt;
  }

  isOnline(): boolean {
    return this.state === 'online' || this.state === 'syncing';
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
  }
}

export const networkManager = new NetworkManager();
