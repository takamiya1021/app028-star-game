import type { Constellation } from '@/types/constellation';
import { createCachedJsonLoader, JsonFetcher } from './cachedJsonLoader';

const CONSTELLATIONS_DATA_PATH = '/data/constellations.json';

export interface LoadConstellationsOptions {
  fetcher?: JsonFetcher;
}

const allowedHemisphere = new Set<Constellation['hemisphere']>(['north', 'south', 'both']);
const allowedDifficulty = new Set<Constellation['difficulty']>(['easy', 'medium', 'hard']);

interface RawConstellation {
  id: string;
  name: string;
  nameJa: string;
  hemisphere?: string;
  difficulty?: string;
  mythology?: unknown;
  season?: unknown;
  mainStars?: unknown;
  illustrationPath?: unknown;
}

function normalizeConstellation(raw: RawConstellation): Constellation {
  const hemisphere = raw.hemisphere && allowedHemisphere.has(raw.hemisphere as Constellation['hemisphere'])
    ? (raw.hemisphere as Constellation['hemisphere'])
    : 'both';
  const difficulty = raw.difficulty && allowedDifficulty.has(raw.difficulty as Constellation['difficulty'])
    ? (raw.difficulty as Constellation['difficulty'])
    : 'medium';

  return {
    id: raw.id,
    name: raw.name,
    nameJa: raw.nameJa,
    mythology: typeof raw.mythology === 'string' ? raw.mythology : undefined,
    season: typeof raw.season === 'string' ? raw.season : undefined,
    hemisphere,
    mainStars: Array.isArray(raw.mainStars) ? raw.mainStars : [],
    illustrationPath: typeof raw.illustrationPath === 'string' ? raw.illustrationPath : undefined,
    difficulty,
  };
}

const constellationsLoader = createCachedJsonLoader<RawConstellation[]>({
  path: CONSTELLATIONS_DATA_PATH,
  importData: () => import('@/public/data/constellations.json'),
});

async function ensureConstellations(fetcher?: JsonFetcher): Promise<Constellation[]> {
  const rawConstellations = await constellationsLoader.load(fetcher);
  return rawConstellations.map((item) => normalizeConstellation(item));
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
