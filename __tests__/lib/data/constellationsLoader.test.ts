import { createPublicFetcher } from '../../helpers/createPublicFetcher';
import { loadConstellations, clearConstellationsCache } from '@/lib/data/constellationsLoader';

describe('constellationsLoader', () => {
  const fetcher = createPublicFetcher();

  beforeEach(() => {
    clearConstellationsCache();
  });

  it('loads 88 IAU constellations', async () => {
    const constellations = await loadConstellations({ fetcher });
    expect(constellations).toHaveLength(88);
  });

  it('includes Orion with expected metadata', async () => {
    const constellations = await loadConstellations({ fetcher });
    const orion = constellations.find(constellation => constellation.id === 'Ori');
    expect(orion).toBeDefined();
    expect(orion?.name).toBe('Orion');
    expect(orion?.nameJa).toBe('オリオン座');
  });
});
