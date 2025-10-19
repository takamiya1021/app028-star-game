import {
  celestialToScreen,
  magnitudeToRadius,
  adjustColorByMagnitude,
  equatorialToHorizontal,
} from '@/lib/canvas/coordinateUtils';

describe('coordinateUtils - celestialToScreen', () => {
  const canvasWidth = 800;
  const canvasHeight = 600;
  const viewCenter = { ra: 0, dec: 0 };

  it('projects view-center star to canvas center (orthographic)', () => {
    const result = celestialToScreen(
      0,
      0,
      viewCenter,
      1,
      canvasWidth,
      canvasHeight,
      'orthographic'
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(canvasWidth / 2, 3);
    expect(result!.y).toBeCloseTo(canvasHeight / 2, 3);
  });

  it('returns null for stars on the far side (orthographic)', () => {
    const result = celestialToScreen(
      180,
      0,
      viewCenter,
      1,
      canvasWidth,
      canvasHeight,
      'orthographic'
    );
    expect(result).toBeNull();
  });

  it('projects view-center star to canvas center (stereographic)', () => {
    const result = celestialToScreen(
      45,
      10,
      { ra: 45, dec: 10 },
      1.2,
      canvasWidth,
      canvasHeight,
      'stereographic'
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(canvasWidth / 2, 3);
    expect(result!.y).toBeCloseTo(canvasHeight / 2, 3);
  });
});

describe('coordinateUtils - magnitude helpers', () => {
  it('calculates radius inversely proportional to magnitude', () => {
    const bright = magnitudeToRadius(0);
    const dim = magnitudeToRadius(6);
    expect(bright).toBeGreaterThan(dim);
    expect(bright).toBeGreaterThan(0);
    expect(dim).toBeGreaterThan(0);
  });

  it('adjusts color brightness based on magnitude', () => {
    const brightHex = adjustColorByMagnitude('#8080ff', 1);
    const dimHex = adjustColorByMagnitude('#8080ff', 6);
    expect(brightHex).not.toEqual(dimHex);
    // １等星の方が明るい (RGB 値が大きい) ことを簡易チェック
    const parse = (hex: string) =>
      hex
        .slice(1)
        .match(/.{2}/g)!
        .map((v) => parseInt(v, 16));
    const [brightR] = parse(brightHex);
    const [dimR] = parse(dimHex);
    expect(brightR).toBeGreaterThan(dimR);
  });
});

describe('coordinateUtils - equatorialToHorizontal', () => {
  it('converts RA/Dec at zenith for an observer', () => {
    const observer = {
      latitude: 35,
      longitude: 140,
      date: new Date('2024-12-31T15:00:00Z'),
    };
    const horizontal = equatorialToHorizontal(0, observer.latitude, observer);
    expect(horizontal.altitude).toBeGreaterThan(0);
  });

  it('returns negative altitude for stars below horizon', () => {
    const observer = {
      latitude: 35,
      longitude: 140,
      date: new Date('2024-12-31T15:00:00Z'),
    };
    const horizontal = equatorialToHorizontal(180, -70, observer);
    expect(horizontal.altitude).toBeLessThan(0);
  });

  it('handles near-pole coordinates without projection errors', () => {
    const result = celestialToScreen(
      120,
      89.9,
      { ra: 120, dec: 60 },
      1.5,
      800,
      600,
      'orthographic'
    );
    expect(result).not.toBeNull();
  });
});
