import type { Constellation } from '@/types/constellation';
import { createCachedJsonLoader, JsonFetcher } from './cachedJsonLoader';

const CONSTELLATIONS_DATA_PATH = '/data/constellations.json';

export interface LoadConstellationsOptions {
  fetcher?: JsonFetcher;
}

const constellationsLoader = createCachedJsonLoader<Constellation[]>({
  path: CONSTELLATIONS_DATA_PATH,
  importData: () => import('@/public/data/constellations.json'),
});

async function ensureConstellations(fetcher?: JsonFetcher): Promise<Constellation[]> {
  return constellationsLoader.load(fetcher);
}

export async function loadConstellations(
  options: LoadConstellationsOptions = {}
): Promise<Constellation[]> {
  const { fetcher } = options;
  return ensureConstellations(fetcher);
}

export function clearConstellationsCache(): void {
  constellationsLoader.clear();
}
