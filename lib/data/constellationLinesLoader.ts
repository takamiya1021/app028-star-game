import type { ConstellationLine } from '@/types/constellation';

const CONSTELLATION_LINES_PATH = '/data/constellation-lines.json';

export interface LoadConstellationLinesOptions {
  fetcher?: typeof fetch;
}

type JsonFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let constellationLinesCache: ConstellationLine[] | null = null;

async function fetchJson<T>(path: string, fetcher?: JsonFetcher): Promise<T> {
  if (fetcher) {
    const response = await fetcher(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  if (path === CONSTELLATION_LINES_PATH) {
    const module = await import('@/public/data/constellation-lines.json');
    return module.default as T;
  }

  throw new Error(`Unable to load ${path}`);
}

async function ensureConstellationLines(fetcher?: JsonFetcher): Promise<ConstellationLine[]> {
  if (!constellationLinesCache) {
    const data = await fetchJson<ConstellationLine[]>(CONSTELLATION_LINES_PATH, fetcher);
    constellationLinesCache = data;
  }
  return constellationLinesCache;
}

export async function loadConstellationLines(
  options: LoadConstellationLinesOptions = {}
): Promise<ConstellationLine[]> {
  const { fetcher } = options;
  return ensureConstellationLines(fetcher);
}

export function clearConstellationLinesCache(): void {
  constellationLinesCache = null;
}
