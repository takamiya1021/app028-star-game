import type { ConstellationLine } from '@/types/constellation';
import type { Star } from '@/types/star';
import { celestialToScreen, ProjectionMode, ObserverLocation } from './coordinateUtils';

export type StarIndex = Map<number, Star> | Record<number, Star | undefined>;

function getStar(starIndex: StarIndex, id: number): Star | undefined {
  if (starIndex instanceof Map) {
    return starIndex.get(id);
  }
  return starIndex[id];
}

export interface DrawConstellationOptions {
  color?: string;
  lineWidth?: number;
  projectionMode?: ProjectionMode;
  observer?: ObserverLocation;
}

export function drawConstellationLines(
  ctx: CanvasRenderingContext2D,
  constellations: ConstellationLine[],
  starIndex: StarIndex,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  options: DrawConstellationOptions = {}
): number {
  const {
    color = 'rgba(255, 215, 0, 0.6)',
    lineWidth = 1,
    projectionMode = 'orthographic',
    observer,
  } = options;

  let drawnSegments = 0;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  constellations.forEach((constellation) => {
    constellation.lines.forEach(([a, b]) => {
      const starA = getStar(starIndex, a);
      const starB = getStar(starIndex, b);
      if (!starA || !starB) {
        return;
      }

      const screenA = celestialToScreen(
        starA.ra,
        starA.dec,
        viewCenter,
        zoom,
        canvasWidth,
        canvasHeight,
        projectionMode,
        observer
      );
      const screenB = celestialToScreen(
        starB.ra,
        starB.dec,
        viewCenter,
        zoom,
        canvasWidth,
        canvasHeight,
        projectionMode,
        observer
      );

      if (!screenA || !screenB) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(screenA.x, screenA.y);
      ctx.lineTo(screenB.x, screenB.y);
      ctx.stroke();
      drawnSegments += 1;
    });
  });

  ctx.restore();
  return drawnSegments;
}
