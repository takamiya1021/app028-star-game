import { createPublicFetcher } from '../../helpers/createPublicFetcher';
import { loadStars, clearStarsCache } from '@/lib/data/starsLoader';

describe('starsLoader', () => {
  const fetcher = createPublicFetcher();

  beforeEach(() => {
    clearStarsCache();
  });

  it('loads all star data from JSON', async () => {
    const stars = await loadStars({ fetcher });
    expect(stars.length).toBeGreaterThan(40000);
    expect(stars.every(star => typeof star.id === 'number')).toBe(true);
  });

  it('applies magnitude filtering when maxMagnitude is provided', async () => {
    const stars = await loadStars({ fetcher, maxMagnitude: 2 });
    expect(stars.length).toBeGreaterThan(0);
    const maxMagnitude = Math.max(...stars.map(star => star.vmag ?? Number.NEGATIVE_INFINITY));
    expect(maxMagnitude).toBeLessThanOrEqual(2);
  });

  it('keeps key reference stars with expected metadata', async () => {
    const stars = await loadStars({ fetcher });
    const sirius = stars.find(star => star.id === 32349);
    expect(sirius).toBeDefined();
    expect(sirius?.properName ?? sirius?.name).toBeDefined();
    expect(typeof sirius?.ra).toBe('number');
    expect(typeof sirius?.dec).toBe('number');
  });
});
