import type { Star } from '@/types/star';
import { createCachedJsonLoader, JsonFetcher } from './cachedJsonLoader';

const STARS_DATA_PATH = '/data/stars.json';

export interface LoadStarsOptions {
  /** 等級の上限（例: 6.5 で6.5等より明るい星のみ） */
  maxMagnitude?: number;
  /** テストなどで差し替えるfetch実装 */
  fetcher?: JsonFetcher;
}

const starsLoader = createCachedJsonLoader<Star[]>({
  path: STARS_DATA_PATH,
  importData: () => import('@/public/data/stars.json'),
});

async function ensureStars(fetcher?: JsonFetcher): Promise<Star[]> {
  return starsLoader.load(fetcher);
}

export async function loadStars(options: LoadStarsOptions = {}): Promise<Star[]> {
  const { maxMagnitude, fetcher } = options;
  const stars = await ensureStars(fetcher);

  if (typeof maxMagnitude === 'number') {
    return stars.filter((star) => star.vmag !== null && star.vmag <= maxMagnitude);
  }

  return stars;
}

export function clearStarsCache(): void {
  starsLoader.clear();
}
