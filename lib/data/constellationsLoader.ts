import type { Constellation } from '@/types/constellation';

const CONSTELLATIONS_DATA_PATH = '/data/constellations.json';

export interface LoadConstellationsOptions {
  fetcher?: typeof fetch;
}

type JsonFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let constellationsCache: Constellation[] | null = null;

async function fetchJson<T>(path: string, fetcher?: JsonFetcher): Promise<T> {
  if (fetcher) {
    const response = await fetcher(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  if (path === CONSTELLATIONS_DATA_PATH) {
    const dataModule = await import('@/public/data/constellations.json');
    return dataModule.default as T;
  }

  throw new Error(`Unable to load ${path}`);
}

async function ensureConstellations(fetcher?: JsonFetcher): Promise<Constellation[]> {
  if (!constellationsCache) {
    const data = await fetchJson<Constellation[]>(CONSTELLATIONS_DATA_PATH, fetcher);
    constellationsCache = data;
  }
  return constellationsCache;
}

export async function loadConstellations(
  options: LoadConstellationsOptions = {}
): Promise<Constellation[]> {
  const { fetcher } = options;
  return ensureConstellations(fetcher);
}

export function clearConstellationsCache(): void {
  constellationsCache = null;
}
