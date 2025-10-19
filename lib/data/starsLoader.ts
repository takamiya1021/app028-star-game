import type { Star } from '@/types/star';

const STARS_DATA_PATH = '/data/stars.json';

export interface LoadStarsOptions {
  /** 等級の上限（例: 6.5 で6.5等より明るい星のみ） */
  maxMagnitude?: number;
  /** テストなどで差し替えるfetch実装 */
  fetcher?: typeof fetch;
}

type JsonFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let starsCache: Star[] | null = null;

async function fetchJson<T>(path: string, fetcher?: JsonFetcher): Promise<T> {
  if (fetcher) {
    const response = await fetcher(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  if (path === STARS_DATA_PATH) {
    const module = await import('@/public/data/stars.json');
    return module.default as T;
  }

  throw new Error(`Unable to load ${path}`);
}

async function ensureStars(fetcher?: JsonFetcher): Promise<Star[]> {
  if (!starsCache) {
    const stars = await fetchJson<Star[]>(STARS_DATA_PATH, fetcher);
    starsCache = stars;
  }
  return starsCache;
}

export async function loadStars(options: LoadStarsOptions = {}): Promise<Star[]> {
  const { maxMagnitude, fetcher } = options;
  const stars = await ensureStars(fetcher);

  if (typeof maxMagnitude === 'number') {
    return stars.filter(star => star.vmag !== null && star.vmag <= maxMagnitude);
  }

  return stars;
}

export function clearStarsCache(): void {
  starsCache = null;
}
