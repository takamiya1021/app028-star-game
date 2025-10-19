import type { ConstellationLine } from '@/types/constellation';
import { createCachedJsonLoader, JsonFetcher } from './cachedJsonLoader';

const CONSTELLATION_LINES_PATH = '/data/constellation-lines.json';

export interface LoadConstellationLinesOptions {
  fetcher?: JsonFetcher;
}

const constellationLinesLoader = createCachedJsonLoader<ConstellationLine[]>({
  path: CONSTELLATION_LINES_PATH,
  importData: () => import('@/public/data/constellation-lines.json'),
});

async function ensureConstellationLines(fetcher?: JsonFetcher): Promise<ConstellationLine[]> {
  return constellationLinesLoader.load(fetcher);
}

export async function loadConstellationLines(
  options: LoadConstellationLinesOptions = {}
): Promise<ConstellationLine[]> {
  const { fetcher } = options;
  return ensureConstellationLines(fetcher);
}

export function clearConstellationLinesCache(): void {
  constellationLinesLoader.clear();
}
