import { drawConstellationLines } from '@/lib/canvas/constellationRenderer';
import type { ConstellationLine } from '@/types/constellation';
import type { Star } from '@/types/star';

function createMockContext() {
  return {
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    strokeStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

const starA: Star = {
  id: 1,
  ra: 0,
  dec: 0,
  vmag: 2,
  bv: 0.1,
  spectralType: 'A0',
  name: null,
  hd: null,
  hr: null,
  parallax: null,
  pmRA: null,
  pmDE: null,
};

const starB: Star = {
  ...starA,
  id: 2,
  ra: 5,
  dec: 5,
};

describe('drawConstellationLines', () => {
  it('draws line segments for available stars', () => {
    const ctx = createMockContext();
    const lines: ConstellationLine[] = [
      { constellationId: 'Ori', lines: [[1, 2]] },
    ];
    const stars = new Map<number, Star>([
      [1, starA],
      [2, starB],
    ]);

    const count = drawConstellationLines(
      ctx,
      lines,
      stars,
      { ra: 0, dec: 0 },
      1,
      800,
      600
    );

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(count).toBe(1);
  });

  it('skips segments when stars are missing', () => {
    const ctx = createMockContext();
    const lines: ConstellationLine[] = [
      { constellationId: 'Ori', lines: [[1, 3]] },
    ];
    const stars = { 1: starA, 2: starB };

    const count = drawConstellationLines(
      ctx,
      lines,
      stars,
      { ra: 0, dec: 0 },
      1,
      800,
      600
    );

    expect(count).toBe(0);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
