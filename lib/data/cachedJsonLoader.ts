export type JsonFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface CreateCachedJsonLoaderOptions<T> {
  path: string;
  importData: () => Promise<{ default: T } | T>;
  transform?: (data: T) => T;
}

export function createCachedJsonLoader<T>({
  path,
  importData,
  transform,
}: CreateCachedJsonLoaderOptions<T>) {
  let cache: T | null = null;

  const resolveData = async (): Promise<T> => {
    const imported = await importData();
    const data = (imported as { default: T }).default ?? (imported as T);
    return transform ? transform(data) : data;
  };

  const load = async (fetcher?: JsonFetcher): Promise<T> => {
    if (fetcher) {
      const response = await fetcher(path);
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      const processed = transform ? transform(data) : data;
      cache = processed;
      return processed;
    }

    if (!cache) {
      cache = await resolveData();
    }

    return cache;
  };

  const clear = () => {
    cache = null;
  };

  return { load, clear };
}
