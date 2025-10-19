export type DrawStarsObserver = (durationMs: number, context: { count: number }) => void;

let observer: DrawStarsObserver | null = null;

const fallbackPerformance = {
  now: () => Date.now(),
};

export function now(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  try {
    // eslint-disable-next-line global-require
    const { performance: perfHooks } = require('perf_hooks');
    return perfHooks.now();
  } catch {
    return fallbackPerformance.now();
  }
}

export function setDrawStarsObserver(fn: DrawStarsObserver | null) {
  observer = fn;
}

export function getDrawStarsObserver(): DrawStarsObserver | null {
  return observer;
}
