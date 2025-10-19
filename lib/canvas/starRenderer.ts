// 星描画ロジック
import { Star } from '@/types/star';
import {
  celestialToScreen,
  magnitudeToRadius,
  ProjectionMode,
  ObserverLocation,
} from './coordinateUtils';
import { getDrawStarsObserver, now as perfNow } from '@/performance/drawStarsObserver';
import { drawCelestialGrid } from './gridRenderer';

const BAYER_TO_GREEK: Record<string, string> = {
  Alp: 'α', Bet: 'β', Gam: 'γ', Del: 'δ',
  Eps: 'ε', Zet: 'ζ', Eta: 'η', The: 'θ',
  Iot: 'ι', Kap: 'κ', Lam: 'λ', 'Mu ': 'μ',
  'Nu ': 'ν', 'Xi ': 'ξ', 'Omi': 'ο', 'Pi ': 'π',
  'Rho': 'ρ', 'Sig': 'σ', 'Tau': 'τ', Ups: 'υ',
  Phi: 'φ', Chi: 'χ', Psi: 'ψ', Ome: 'ω',
};

interface LabelOptions {
  showProperNames: boolean;
  showBayerDesignations: boolean;
}

function isLabelEligible(star: Star): boolean {
  return star.vmag !== null && star.vmag <= 3.0;
}

function deriveBayerLabel(star: Star): string | null {
  if (!star.name) return null;
  for (const [abbr, greek] of Object.entries(BAYER_TO_GREEK)) {
    if (star.name.includes(abbr)) {
      return greek;
    }
  }
  return null;
}
/**
 * B-V色指数から星の色を計算
 * @param bv B-V色指数
 * @returns RGB hex色
 */
function bvToColor(bv: number): string {
  if (bv < -0.3) return '#9bb0ff';
  if (bv < 0) return '#cad7ff';
  if (bv < 0.3) return '#fff4ea';
  if (bv < 0.6) return '#fffaf0';
  if (bv < 1.4) return '#ffd2a1';
  return '#ff7f00';
}

function mixWithWhite(color: string, amount: number): string {
  const clampAmount = Math.min(Math.max(amount, 0), 1);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const mix = (component: number) =>
    Math.round(component + (255 - component) * clampAmount).toString(16).padStart(2, '0');
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

/**
 * 星を描画
 * @param ctx キャンバスコンテキスト
 * @param star 星データ
 * @param viewCenter 視野中心
 * @param zoom ズーム倍率
 * @param canvasWidth キャンバスの幅
 * @param canvasHeight キャンバスの高さ
 * @param time アニメーション用時間
 * @param projectionMode 投影モード
 * @param observer 観測地点情報（ステレオ図法で使用）
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  projectionMode: ProjectionMode = 'orthographic',
  observer?: ObserverLocation,
  labelOptions: LabelOptions = { showProperNames: true, showBayerDesignations: true }
): boolean {
  // 座標変換
  const screenPos = celestialToScreen(
    star.ra,
    star.dec,
    viewCenter,
    zoom,
    canvasWidth,
    canvasHeight,
    projectionMode,
    observer
  );

  if (!screenPos || star.vmag === null) {
    return false;
  }

  // 半径計算
  const radius = magnitudeToRadius(star.vmag);

  // B-V色指数から色を計算
  const baseColor = bvToColor(star.bv ?? 0);
  const faintness = star.vmag !== null ? Math.min(Math.max((star.vmag - 3.5) / 2.5, 0), 1) : 0;
  const color = faintness > 0 ? mixWithWhite(baseColor, faintness) : baseColor;

  // 瞬きアニメーション（明るい星ほど瞬く）
  const twinklePhase = star.id * 0.1 + time * 0.001;
  const noise = Math.sin(star.id * 12.9898 + time * 0.004);
  const baseTwinkle = Math.sin(twinklePhase) * 0.18;
  const brightBoost = star.vmag !== null && star.vmag <= 2 ? 0.28 : 0.18;
  const twinkle = 1 + baseTwinkle + noise * 0.12 + brightBoost * Math.sin(twinklePhase * 0.6 + star.id * 0.5);
  const clampedTwinkle = Math.min(Math.max(twinkle, 0.6), 1.6);
  const animatedRadius = radius * twinkle;

  // グラデーションで光の広がりを表現
  const gradient = ctx.createRadialGradient(
    screenPos.x,
    screenPos.y,
    0,
    screenPos.x,
    screenPos.y,
    animatedRadius * 2
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.3, color + 'CC'); // 透明度つき
  gradient.addColorStop(0.6, color + '55');
  gradient.addColorStop(1, 'transparent');

  // 星を描画
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y, animatedRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // 明るい星（1等星以上）は中心部をさらに明るく
  if (star.vmag <= 1) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.min(Math.max(clampedTwinkle, 0.5), 1);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // 星の名前を描画（等級が3.0以下で、表示設定に応じて決定）
  let label: string | null = null;
  if (isLabelEligible(star)) {
    if (labelOptions.showProperNames && star.properName) {
      label = star.properName;
    } else if (labelOptions.showBayerDesignations) {
      label = deriveBayerLabel(star);
    }
  }

  if (label) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // 少し透明な白
    ctx.font = '14px "Geist", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // テキストの描画位置を星の右上に調整
    const textX = screenPos.x + radius + 5;
    const textY = screenPos.y - radius - 2;

    ctx.fillText(label, textX, textY);
  }

  return true; // 描画成功
}

/**
 * 複数の星を描画
 * @param ctx キャンバスコンテキスト
 * @param stars 星データ配列
 * @param viewCenter 視野中心
 * @param zoom ズーム倍率
 * @param canvasWidth キャンバスの幅
 * @param canvasHeight キャンバスの高さ
 * @param time アニメーション用時間
 * @param projectionMode 投影モード
 * @param observer 観測地点情報（ステレオ図法で使用）
 * @returns 実際に描画された星の数
 */
const sortByMagnitude = (a: Star, b: Star) => (b.vmag ?? 99) - (a.vmag ?? 99);

const MILKY_WAY_MAGNITUDE_LIMIT = 7.5;
const MILKY_WAY_GRID_COLS = 96;
const MILKY_WAY_GRID_ROWS = 48;
const MILKY_WAY_INTENSITY = {
  telescope: {
    baseAlpha: 0.26,
    power: 0.65,
    radiusScale: 1.45,
  },
  nakedEye: {
    baseAlpha: 0.12,
    power: 0.85,
    radiusScale: 0.95,
  },
};

interface DrawStarsOptions {
  skipOverlay?: boolean;
  drawGrid?: boolean;
  showProperNames?: boolean;
  showBayerDesignations?: boolean;
  milkyWayGlow?: 'telescope' | 'naked-eye' | false;
}

export function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  projectionMode: ProjectionMode = 'orthographic',
  observer?: ObserverLocation,
  options: DrawStarsOptions = {}
): number {
  const {
    skipOverlay = false,
    drawGrid = true,
    showProperNames = true,
    showBayerDesignations = true,
    milkyWayGlow = 'telescope',
  } = options;

  // 天球グリッドを先に描画（星の下に）
  if (drawGrid) {
    drawCelestialGrid(ctx, viewCenter, zoom, canvasWidth, canvasHeight, projectionMode);
  }

  const highlighted: Star[] = [];
  let background: Star[] = [];

  for (const star of stars) {
    if (star.properName || (star.vmag !== null && star.vmag <= 2.0)) {
      highlighted.push(star);
    } else {
      background.push(star);
    }
  }

  background = applyLevelOfDetail(background);
  background.sort(sortByMagnitude);
  highlighted.sort(sortByMagnitude);

  const drawOrder = background.concat(highlighted);
  const projected: Star[] = [];

  let densityGrid: Float32Array | null = null;
  let maxDensity = 0;

  if (milkyWayGlow) {
    densityGrid = new Float32Array(MILKY_WAY_GRID_COLS * MILKY_WAY_GRID_ROWS);
  }

  const accumulateMilkyWayDensity = (screenPos: { x: number; y: number }, star: Star) => {
    if (!densityGrid || star.vmag === null || star.vmag > MILKY_WAY_MAGNITUDE_LIMIT) {
      return;
    }

    const gx = (screenPos.x / canvasWidth) * MILKY_WAY_GRID_COLS;
    const gy = (screenPos.y / canvasHeight) * MILKY_WAY_GRID_ROWS;
    const baseX = Math.floor(gx);
    const baseY = Math.floor(gy);
    const fracX = gx - baseX;
    const fracY = gy - baseY;
    const weight = Math.max(0, MILKY_WAY_MAGNITUDE_LIMIT - star.vmag);

    for (let dx = 0; dx <= 1; dx += 1) {
      const col = baseX + dx;
      if (col < 0 || col >= MILKY_WAY_GRID_COLS) continue;
      const wx = dx === 0 ? 1 - fracX : fracX;

      for (let dy = 0; dy <= 1; dy += 1) {
        const row = baseY + dy;
        if (row < 0 || row >= MILKY_WAY_GRID_ROWS) continue;
        const wy = dy === 0 ? 1 - fracY : fracY;
        const cellWeight = weight * wx * wy;
        const idx = row * MILKY_WAY_GRID_COLS + col;
        const value = densityGrid[idx] + cellWeight;
        densityGrid[idx] = value;
        if (value > maxDensity) {
          maxDensity = value;
        }
      }
    }
  };

  for (const star of drawOrder) {
    const screenPos = celestialToScreen(
      star.ra,
      star.dec,
      viewCenter,
      zoom,
      canvasWidth,
      canvasHeight,
      projectionMode,
      observer
    );

    if (!screenPos) {
      continue;
    }

    if (milkyWayGlow) {
      accumulateMilkyWayDensity(screenPos, star);
    }

    projected.push(star);
  }

  if (densityGrid && maxDensity > 0) {
    const modeIntensity = milkyWayGlow === 'naked-eye' ? MILKY_WAY_INTENSITY.nakedEye : MILKY_WAY_INTENSITY.telescope;
    const cellWidth = canvasWidth / MILKY_WAY_GRID_COLS;
    const cellHeight = canvasHeight / MILKY_WAY_GRID_ROWS;
    const baseAlpha = modeIntensity.baseAlpha;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let row = 0; row < MILKY_WAY_GRID_ROWS; row += 1) {
      for (let col = 0; col < MILKY_WAY_GRID_COLS; col += 1) {
        const value = densityGrid[row * MILKY_WAY_GRID_COLS + col];
        if (value <= 0) continue;
        const normalized = Math.pow(value / maxDensity, modeIntensity.power);
        const alpha = baseAlpha * normalized;
        if (alpha < 0.005) continue;

        const cx = col * cellWidth + cellWidth / 2;
        const cy = row * cellHeight + cellHeight / 2;
        const radius = Math.sqrt(cellWidth * cellWidth + cellHeight * cellHeight) * modeIntensity.radiusScale;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(130, 160, 255, ${alpha})`);
        gradient.addColorStop(0.6, `rgba(80, 120, 210, ${alpha * 0.55})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }
    }
    ctx.restore();
  }

  let visibleCount = 0;

  const observerCallback = getDrawStarsObserver();
  const start = observerCallback ? perfNow() : 0;

  for (const star of projected) {
    const drawn = drawStar(
      ctx,
      star,
      viewCenter,
      zoom,
      canvasWidth,
      canvasHeight,
      time,
      projectionMode,
      observer,
      { showProperNames, showBayerDesignations }
    );
    if (drawn) visibleCount++;
  }

  // 表示範囲の情報を画面に表示
  if (!skipOverlay) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 350, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`📊 表示情報`, 15, 25);

    ctx.font = '14px monospace';
    ctx.fillText(`星の数: ${visibleCount} / ${stars.length}`, 15, 50);
    ctx.fillText(`視野中心: 赤経 ${viewCenter.ra}° / 赤緯 ${viewCenter.dec}°`, 15, 70);

    const fov = 90 / zoom; // 視野角
    ctx.fillText(`表示範囲:`, 15, 95);
    ctx.fillText(`  視野角: ${Math.round(fov)}°`, 15, 115);
    ctx.fillText(`  ズーム: ${zoom.toFixed(1)}x`, 15, 135);
  }

  if (observerCallback) {
    observerCallback(perfNow() - start, { count: visibleCount });
  }

  return visibleCount;
}

export function clearStarRendererCaches(): void {
  // キャッシュは現在未使用だが、互換性のために関数を残す
}
function applyLevelOfDetail(stars: Star[]): Star[] {
  // 精度優先モード: 可能な限り全ての星を描画する
  return stars;
}
