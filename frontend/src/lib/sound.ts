import { PREF_KEYS, readStored, setSoundEnabled, writeStored } from './prefs';

/* ---------------------------------------------------------------------------
   Sound foundation.

   Every effect is synthesised in the browser with the Web Audio API — there
   are no third-party audio files and nothing to licence. See
   docs/AUDIO_CREDITS.md.

   Rules:
   * default OFF, preference persisted in localStorage with a safe fallback
   * no AudioContext is created before a user gesture
   * if Web Audio is unavailable the manager is a no-op, never an error
   --------------------------------------------------------------------------- */

export type SoundName =
  | 'seal-break'
  | 'cover-open'
  | 'page-turn'
  | 'book-open'
  | 'object-tap'
  | 'drawer';

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export class SoundManager {
  private context: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = false;

  constructor() {
    this.enabled = readStored(PREF_KEYS.sound, 'off') === 'on';
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Call from a user gesture. Never creates audio when disabled. */
  setEnabled(next: boolean): void {
    this.enabled = next;
    setSoundEnabled(next);
    if (next) this.ensureContext();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    if (!this.context) {
      try {
        this.context = new Ctor();
      } catch {
        this.context = null;
        return null;
      }
    }
    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => undefined);
    }
    if (!this.noise) {
      try {
        this.noise = noiseBuffer(this.context, 1);
      } catch {
        this.noise = null;
      }
    }
    return this.context;
  }

  private noiseSource(ctx: AudioContext): AudioBufferSourceNode | null {
    if (!this.noise) return null;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    return source;
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    try {
      switch (name) {
        case 'seal-break':
          this.sealBreak(ctx);
          break;
        case 'cover-open':
          this.coverOpen(ctx);
          break;
        case 'page-turn':
          this.pageTurn(ctx);
          break;
        case 'book-open':
          this.bookOpen(ctx);
          break;
        case 'object-tap':
          this.objectTap(ctx);
          break;
        case 'drawer':
          this.drawer(ctx);
          break;
      }
    } catch {
      /* audio must never break the interface */
    }
  }

  private sealBreak(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const source = this.noiseSource(ctx);
    if (source) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.4;
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(420, now + 0.34);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(now);
      source.stop(now + 0.4);
    }
    // small crack fragments
    for (let i = 0; i < 4; i += 1) {
      const t = now + 0.03 + i * 0.045;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 - i * 180, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  private coverOpen(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const source = this.noiseSource(ctx);
    if (source) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.1);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(now);
      source.stop(now + 1.2);
    }
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 1.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  private pageTurn(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const source = this.noiseSource(ctx);
    if (!source) return;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(520, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.55);
  }

  private bookOpen(ctx: AudioContext): void {
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i += 1) {
      const t = now + i * 0.14;
      const source = this.noiseSource(ctx);
      if (!source) continue;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.1;
      filter.frequency.setValueAtTime(900 + i * 400, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.24, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(t);
      source.stop(t + 0.26);
    }
  }

  private objectTap(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  private drawer(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const source = this.noiseSource(ctx);
    if (!source) return;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.2;
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.26);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.55);
  }
}

export const sound = new SoundManager();

export function playSound(name: SoundName): void {
  sound.play(name);
}

/** Persisting through this helper keeps every write in one place (tested). */
export function persistSoundPreference(enabled: boolean): void {
  writeStored(PREF_KEYS.sound, enabled ? 'on' : 'off');
}
