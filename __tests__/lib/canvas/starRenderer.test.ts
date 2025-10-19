import { performance } from 'perf_hooks';
import { drawStar, drawStars } from '@/lib/canvas/starRenderer';
import type { Star } from '@/types/star';

function createMockContext(): CanvasRenderingContext2D {
  let fillStyleValue = '';
  let globalAlphaValue = 1;
  const createGradient = () => ({ addColorStop: jest.fn() });
  const radialMock = jest.fn(() => createGradient());
  const linearMock = jest.fn(() => createGradient());
  const arcMock = jest.fn();
  return {
    beginPath: jest.fn(),
    arc: arcMock,
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    createRadialGradient: radialMock,
    createLinearGradient: linearMock,
    rect: jest.fn(),
    clip: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    get fillStyle() {
      return fillStyleValue;
    },
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      fillStyleValue = value as string;
    },
    get globalAlpha() {
      return globalAlphaValue;
    },
    set globalAlpha(value: number) {
      globalAlphaValue = value;
    },
    // 以下は未使用だが型のためにダミー実装を提供
    canvas: document.createElement('canvas'),
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    font: '',
    createImageData: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    setTransform: jest.fn(),
    getLineDash: jest.fn(),
    setLineDash: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    transform: jest.fn(),
    resetTransform: jest.fn(),
    drawImage: jest.fn(),
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    isPointInPath: jest.fn(),
    isPointInStroke: jest.fn(),
    strokeRect: jest.fn(),
    strokeText: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
}

const baseStar: Star = {
  id: 1,
  ra: 0,
  dec: 0,
  vmag: 1,
  bv: 0.2,
  spectralType: 'A0',
  name: 'Alp Ori',
  hd: 12345,
  hr: 1234,
  parallax: 7.6,
  pmRA: 1.2,
  pmDE: -0.5,
  properName: 'ベテルギウス',
};

describe('starRenderer drawStar', () => {
  it('draws a bright star and returns true', () => {
    const ctx = createMockContext();
    const result = drawStar(
      ctx,
      baseStar,
      { ra: 0, dec: 0 },
      1,
      800,
      600,
      1000,
      'orthographic'
    );
    expect(result).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    // properName があるためテキスト描画される
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('ベテルギウス'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('skips stars with null magnitude', () => {
    const ctx = createMockContext();
    const dimStar = { ...baseStar, id: 2, vmag: null };
    const result = drawStar(
      ctx,
      dimStar,
      { ra: 0, dec: 0 },
      1,
      800,
      600,
      500,
      'orthographic'
    );
    expect(result).toBe(false);
  });
});

describe('starRenderer drawStars', () => {
  it('draws all visible stars and returns the count', () => {
    const ctx = createMockContext();
    const stars: Star[] = [
      baseStar,
      {
        ...baseStar,
        id: 3,
        ra: 5,
        dec: 2,
        vmag: 5,
        properName: undefined,
        name: 'Del Ori',
      },
    ];

    const count = drawStars(
      ctx,
      stars,
      { ra: 0, dec: 0 },
      1.5,
      800,
      600,
      2000,
      'orthographic'
    );

    expect(count).toBe(stars.length);
    expect(ctx.fillRect).toHaveBeenCalled(); // 情報オーバーレイ描画を検証
  });

  it('respects projection mode stereographic', () => {
    const ctx = createMockContext();
    const stars: Star[] = [
      { ...baseStar, id: 10, ra: 10, dec: 15 },
      { ...baseStar, id: 11, ra: 12, dec: 16 },
    ];

  const count = drawStars(
      ctx,
      stars,
      { ra: 10, dec: 15 },
      1.2,
      1024,
      768,
      500,
      'stereographic'
    );

    expect(count).toBe(stars.length);
  });

  it('draws without labels when properName absent', () => {
    const ctx = createMockContext();
    const stars: Star[] = [
      {
        ...baseStar,
        id: 12,
        properName: undefined,
        name: undefined,
      },
    ];

    drawStars(
      ctx,
      stars,
      { ra: 0, dec: 0 },
      1,
      640,
      480,
      100,
      'orthographic'
    );

    expect(ctx.fillText).not.toHaveBeenCalledWith(
      expect.stringContaining('ベテルギウス'),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('uses smaller radius for dim stars', () => {
    const ctx = createMockContext();
    const bright = { ...baseStar, id: 20, vmag: 0.5 };
    const dim = { ...baseStar, id: 21, vmag: 6 };

    drawStar(ctx, bright, { ra: 0, dec: 0 }, 1, 800, 600, 0, 'orthographic');
    drawStar(ctx, dim, { ra: 0, dec: 0 }, 1, 800, 600, 0, 'orthographic');

    const arcMock = ctx.arc as unknown as jest.Mock;
    expect(arcMock).toHaveBeenCalled();
    const calls = arcMock.mock.calls as Array<[number, number, number, number, number, boolean?]>;
    const brightRadius = calls[0][2];
    const dimRadius = calls[1][2];
    expect(brightRadius).toBeGreaterThan(dimRadius);
  });

  it('uses B-V index to configure gradient stops', () => {
    const ctx = createMockContext();
    const hotStar = { ...baseStar, id: 30, bv: -0.2 };

    drawStar(ctx, hotStar, { ra: 0, dec: 0 }, 1, 800, 600, 0, 'orthographic');

    const radialMock = ctx.createRadialGradient as unknown as jest.Mock;
    const gradient = radialMock.mock.results[0].value as { addColorStop: jest.Mock };
    expect(gradient.addColorStop).toHaveBeenNthCalledWith(1, 0, '#cad7ff');
    expect(gradient.addColorStop).toHaveBeenNthCalledWith(4, 1, 'transparent');
  });

  it('twinkles radius based on time', () => {
    const ctxEarly = createMockContext();
    drawStar(ctxEarly, baseStar, { ra: 0, dec: 0 }, 1, 800, 600, 0, 'orthographic');
    const earlyRadius = (ctxEarly.createRadialGradient as unknown as jest.Mock).mock.calls[0][5];

    const ctxLate = createMockContext();
    drawStar(ctxLate, baseStar, { ra: 0, dec: 0 }, 1, 800, 600, 5000, 'orthographic');
    const lateRadius = (ctxLate.createRadialGradient as unknown as jest.Mock).mock.calls[0][5];

    expect(lateRadius).not.toBeCloseTo(earlyRadius);
  });

  it('renders 120k stars within reasonable time', () => {
    const ctx = createMockContext();
    const stars: Star[] = Array.from({ length: 120000 }, (_, i) => ({
      ...baseStar,
      id: i,
      ra: (i % 360) + 0.01,
      dec: ((i % 180) - 90) + 0.01,
      vmag: 6 + (i % 3) * 0.1,
      properName: undefined,
      name: undefined,
    }));

    const start = performance.now();
    const count = drawStars(
      ctx,
      stars,
      { ra: 0, dec: 0 },
      1,
      800,
      600,
      0,
      'orthographic'
    );
    const duration = performance.now() - start;

    expect(count).toBeGreaterThan(3000);
    expect(duration).toBeLessThan(2500);
  });
});
