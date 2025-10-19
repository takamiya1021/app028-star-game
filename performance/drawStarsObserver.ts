export type DrawStarsObserver = (durationMs: number, context: { count: number }) => void;

let observer: DrawStarsObserver | null = null;

export function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export function setDrawStarsObserver(fn: DrawStarsObserver | null) {
  observer = fn;
}

export function getDrawStarsObserver(): DrawStarsObserver | null {
  return observer;
}
