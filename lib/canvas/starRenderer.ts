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

const BAYER_PATTERN = /Alp|Bet|Gam|Del|Eps|Zet|Eta|The|Iot|Kap|Lam|Mu |Nu |Xi |Omi|Pi |Rho|Sig|Tau|Ups|Phi|Chi|Psi|Ome/;

const BAYER_TO_GREEK: Record<string, string> = {
  Alp: 'α', Bet: 'β', Gam: 'γ', Del: 'δ',
  Eps: 'ε', Zet: 'ζ', Eta: 'η', The: 'θ',
  Iot: 'ι', Kap: 'κ', Lam: 'λ', 'Mu ': 'μ',
  'Nu ': 'ν', 'Xi ': 'ξ', 'Omi': 'ο', 'Pi ': 'π',
  'Rho': 'ρ', 'Sig': 'σ', 'Tau': 'τ', Ups: 'υ',
  Phi: 'φ', Chi: 'χ', Psi: 'ψ', Ome: 'ω',
};

const starLabelCache = new Map<number, string | null>();

function deriveStarLabel(star: Star): string | null {
  if (star.vmag == null || star.vmag > 3.0) {
    return null;
  }

  if (star.properName) {
    return star.properName;
  }

  if (star.name && BAYER_PATTERN.test(star.name)) {
    for (const [abbr, greek] of Object.entries(BAYER_TO_GREEK)) {
      if (star.name.includes(abbr)) {
        return greek;
      }
    }
  }

  return null;
}

function getStarLabel(star: Star): string | null {
  if (starLabelCache.has(star.id)) {
    return starLabelCache.get(star.id) ?? null;
  }
  const label = deriveStarLabel(star);
  starLabelCache.set(star.id, label);
  return label;
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
  observer?: ObserverLocation
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
  const color = bvToColor(star.bv ?? 0);

  // 瞬きアニメーション（明るい星ほど瞬く）
  const twinklePhase = star.id * 0.1 + time * 0.001;
  const twinkle = Math.sin(twinklePhase) * 0.2 + 1; // 0.8 ~ 1.2倍
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
  gradient.addColorStop(0.3, color + 'CC'); // 70%不透明
  gradient.addColorStop(0.6, color + '66'); // 40%不透明
  gradient.addColorStop(1, 'transparent');

  // 星を描画
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y, animatedRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // 明るい星（1等星以上）は中心部をさらに明るく
  if (star.vmag <= 1) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // 星の名前を描画（等級が3.0以下で、固有名またはバイエル符号がある場合）
  const label = getStarLabel(star);

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

interface DrawStarsOptions {
  skipOverlay?: boolean;
  drawGrid?: boolean;
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
  const { skipOverlay = false, drawGrid = true } = options;

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

  background = applyLevelOfDetail(background, zoom);
  background.sort(sortByMagnitude);
  highlighted.sort(sortByMagnitude);

  let visibleCount = 0;

  const drawOrder = background.concat(highlighted);

  const observerCallback = getDrawStarsObserver();
  const start = observerCallback ? perfNow() : 0;

  for (const star of drawOrder) {
    const drawn = drawStar(
      ctx,
      star,
      viewCenter,
      zoom,
      canvasWidth,
      canvasHeight,
      time,
      projectionMode,
      observer
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
  starLabelCache.clear();
}
function applyLevelOfDetail(stars: Star[], zoom: number): Star[] {
  const BASE_THRESHOLD = 8000;
  const threshold = Math.max(1500, Math.round(BASE_THRESHOLD / Math.max(0.5, zoom)));
  if (stars.length <= threshold) {
    return stars;
  }

  const brightQuota = Math.floor(threshold * 0.6);
  const brightCandidates = stars
    .filter((star) => star.vmag !== null)
    .sort((a, b) => (a.vmag ?? 99) - (b.vmag ?? 99));

  const selected: Star[] = brightCandidates.slice(0, Math.min(brightQuota, brightCandidates.length));
  const selectedIds = new Set(selected.map((star) => star.id));

  const remaining: Star[] = [];
  for (const star of stars) {
    if (!selectedIds.has(star.id)) {
      remaining.push(star);
    }
  }

  const slotsLeft = threshold - selected.length;
  if (slotsLeft <= 0) {
    return selected;
  }

  const step = Math.max(1, Math.floor(remaining.length / slotsLeft));
  for (let i = 0; i < remaining.length && selected.length < threshold; i += step) {
    selected.push(remaining[i]);
  }

  return selected;
}
