/** Feature detection for the 3D page-turn / cover hinge. */

export function has3dSupport(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
  try {
    return CSS.supports('transform-style', 'preserve-3d') && CSS.supports('perspective', '1px');
  } catch {
    return false;
  }
}

export function hasWebAudio(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown };
  return Boolean(w.AudioContext ?? w.webkitAudioContext);
}

export function hasCanvas(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return Boolean(document.createElement('canvas').getContext);
  } catch {
    return false;
  }
}
