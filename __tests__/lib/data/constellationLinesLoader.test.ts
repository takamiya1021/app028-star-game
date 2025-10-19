import { createPublicFetcher } from '../../helpers/createPublicFetcher';
import { loadConstellationLines, clearConstellationLinesCache } from '@/lib/data/constellationLinesLoader';

describe('constellationLinesLoader', () => {
  const fetcher = createPublicFetcher();

  beforeEach(() => {
    clearConstellationLinesCache();
  });

  it('loads constellation line definitions for all constellations', async () => {
    const lines = await loadConstellationLines({ fetcher });
    expect(lines).toHaveLength(88);
    expect(lines.every(entry => Array.isArray(entry.lines))).toBe(true);
  });

  it('contains Orion line segments with HIP IDs as pairs', async () => {
    const lines = await loadConstellationLines({ fetcher });
    const orion = lines.find(entry => entry.constellationId === 'Ori');
    expect(orion).toBeDefined();
    expect(orion?.lines.length).toBeGreaterThan(0);
    orion?.lines.forEach(segment => {
      expect(segment).toHaveLength(2);
      segment.forEach(id => expect(typeof id).toBe('number'));
    });
  });
});
