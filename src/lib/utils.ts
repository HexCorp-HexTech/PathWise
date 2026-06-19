/* ============================================
   VIDYA AI — Utility Functions
   ============================================ */

// Generate a UUID v4
export function generateId(): string {
  return crypto.randomUUID?.() ?? 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

// Format time ago
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Format duration in seconds to readable string
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
}

// Format number with commas
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

// Clamp a number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

// Hash a string (for PIN hashing simulation)
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// Get initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Percentage with bounds
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return clamp(Math.round((value / total) * 100), 0, 100);
}

// Delay/sleep
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Storage helpers
export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('localStorage write failed:', key);
  }
}

// Color helpers
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Grade display
export function gradeDisplay(grade: number): string {
  if (grade === 1) return '1st';
  if (grade === 2) return '2nd';
  if (grade === 3) return '3rd';
  return `${grade}th`;
}

// XP to Level calculation
export function xpToLevel(xp: number): { level: number; current: number; needed: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelXp = (level - 1) * (level - 1) * 100;
  const nextLevelXp = level * level * 100;
  return {
    level,
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
  };
}

// Day of week short
export function getDayShort(date: Date): string {
  return date.toLocaleDateString('en', { weekday: 'short' });
}

// Format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Classify mastery level
export function masteryLevel(score: number): { label: string; color: string } {
  if (score >= 0.9) return { label: 'Mastered', color: 'var(--color-success)' };
  if (score >= 0.7) return { label: 'Proficient', color: '#4ECDC4' };
  if (score >= 0.5) return { label: 'Developing', color: 'var(--color-warning)' };
  if (score >= 0.3) return { label: 'Emerging', color: '#FF8C42' };
  return { label: 'Needs Practice', color: 'var(--color-error)' };
}
