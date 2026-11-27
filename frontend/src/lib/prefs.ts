import { useEffect, useSyncExternalStore } from 'react';

/* ---------------------------------------------------------------------------
   Safe storage: localStorage can throw (private mode, blocked cookies).
   Every read/write falls back to a defaults-only in-memory shim.
   --------------------------------------------------------------------------- */

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const memory = new Map<string, string>();
const memoryStorage: StorageLike = {
  getItem: (key) => (memory.has(key) ? (memory.get(key) as string) : null),
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};

let resolved: StorageLike | null | undefined;

export function getStorage(): StorageLike | null {
  if (resolved !== undefined) return resolved;
  try {
    const probe = '__barbie_probe__';
    const ls = globalThis.localStorage;
    if (!ls) {
      resolved = null;
      return resolved;
    }
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    resolved = ls;
  } catch {
    resolved = null;
  }
  return resolved;
}

/** Read a persisted value; never throws, never returns a bad value. */
export function readStored(key: string, fallback: string): string {
  try {
    const store = getStorage() ?? memoryStorage;
    return store.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    (getStorage() ?? memoryStorage).setItem(key, value);
  } catch {
    /* preference simply does not persist */
  }
}

/* ---------------------------------------------------------------------------
   Preferences store
   --------------------------------------------------------------------------- */

export const PREF_KEYS = {
  sound: 'barbie:sound',
  motion: 'barbie:motion',
  textSize: 'barbie:text-size',
} as const;

/** 'system' follows the OS setting; 'off' forces reduced motion on. */
export type MotionPref = 'system' | 'on' | 'off';

export type Prefs = {
  sound: boolean;
  motion: MotionPref;
  textSize: number;
};

export const DEFAULT_PREFS: Prefs = { sound: false, motion: 'system', textSize: 1 };

function parseMotion(value: string): MotionPref {
  return value === 'on' || value === 'off' ? value : 'system';
}

function parseTextSize(value: string): number {
  const size = Number(value);
  if (!Number.isFinite(size)) return 1;
  return Math.min(2, Math.max(0.8, size));
}

function load(): Prefs {
  return {
    sound: readStored(PREF_KEYS.sound, 'off') === 'on',
    motion: parseMotion(readStored(PREF_KEYS.motion, 'system')),
    textSize: parseTextSize(readStored(PREF_KEYS.textSize, '1')),
  };
}

let prefs: Prefs = load();
const listeners = new Set<() => void>();

function setPrefs(next: Prefs): void {
  prefs = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Prefs {
  return prefs;
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setSoundEnabled(enabled: boolean): void {
  writeStored(PREF_KEYS.sound, enabled ? 'on' : 'off');
  setPrefs({ ...prefs, sound: enabled });
}

export function setMotionPref(next: MotionPref): void {
  writeStored(PREF_KEYS.motion, next);
  setPrefs({ ...prefs, motion: next });
}

export function setTextSize(size: number): void {
  const clamped = parseTextSize(String(size));
  writeStored(PREF_KEYS.textSize, String(clamped));
  setPrefs({ ...prefs, textSize: clamped });
}

/* ---------------------------------------------------------------------------
   Reduced motion: OS setting ∨ in-app override
   --------------------------------------------------------------------------- */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeSystemReduced(listener: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

function systemReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_QUERY).matches;
}

export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribeSystemReduced, systemReduced, () => false);
}

export function useReducedMotionPref(): boolean {
  const { motion } = usePrefs();
  const system = useSystemReducedMotion();
  if (motion === 'off') return true;
  if (motion === 'on') return false;
  return system;
}

/** Toggle the in-app override so the effective state flips. */
export function toggleReducedMotion(effectiveReduced: boolean): void {
  setMotionPref(effectiveReduced ? 'on' : 'off');
}

/* ---------------------------------------------------------------------------
   Environment flags written to <html> so CSS can respond
   --------------------------------------------------------------------------- */

export function useDocumentPrefs(): { reduced: boolean; sound: boolean; textSize: number } {
  const prefsValue = usePrefs();
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  useEffect(() => {
    document.documentElement.style.setProperty('--reading-scale', String(prefsValue.textSize));
  }, [prefsValue.textSize]);

  useEffect(() => {
    const sync = () => {
      document.documentElement.dataset.hidden = document.hidden ? 'true' : 'false';
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return { reduced, sound: prefsValue.sound, textSize: prefsValue.textSize };
}
