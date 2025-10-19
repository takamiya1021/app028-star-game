// 星描画ロジック
import { Star } from '@/types/star';
import {
  celestialToScreen,
  magnitudeToRadius,
  ProjectionMode,
  ObserverLocation,
} from './coordinateUtils';
import { drawCelestialGrid } from './gridRenderer';

/**
 * B-V色指数から星の色を計算
 * @param bv B-V色指数
 * @returns RGB hex色
 */
function bvToColor(bv: number): string {
  if (bv < -0.3) {
    return '#9bb0ff'; // 青白い星（O,B型）
  } else if (bv < 0) {
    return '#cad7ff'; // 白い星（A型）
  } else if (bv < 0.3) {
    return '#fff4ea'; // 黄白い星（F型）
  } else if (bv < 0.6) {
    return '#fffaf0'; // 黄色い星（G型）
  } else if (bv < 1.4) {
    return '#ffd2a1'; // オレンジ色の星（K型）
  } else {
    return '#ff7f00'; // 赤い星（M型）
  }
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

  if (!screenPos) {
    return false; // 画面外の星は描画しない
  }

  // vmag が null の場合はスキップ
  if (star.vmag === null) {
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
  let label: string | null = null;

  // 固有名（カタカナ）を最優先
  if (star.vmag <= 3.0 && star.properName) {
    label = star.properName;
  }
  // 固有名がない場合はバイエル符号を表示（フラムスティード番号は除外）
  else if (star.vmag <= 3.0 && star.name) {
    // バイエル符号のパターン（Alp, Bet, Gam等）が含まれているかチェック
    const bayerPattern = /Alp|Bet|Gam|Del|Eps|Zet|Eta|The|Iot|Kap|Lam|Mu |Nu |Xi |Omi|Pi |Rho|Sig|Tau|Ups|Phi|Chi|Psi|Ome/;

    if (bayerPattern.test(star.name)) {
      // ギリシャ文字部分のみを抽出して表示（例: "11Bet Cas" → "β", "9Alp CMa" → "α"）
      const greekMap: { [key: string]: string } = {
        'Alp': 'α', 'Bet': 'β', 'Gam': 'γ', 'Del': 'δ',
        'Eps': 'ε', 'Zet': 'ζ', 'Eta': 'η', 'The': 'θ',
        'Iot': 'ι', 'Kap': 'κ', 'Lam': 'λ', 'Mu': 'μ',
        'Nu': 'ν', 'Xi': 'ξ', 'Omi': 'ο', 'Pi': 'π',
        'Rho': 'ρ', 'Sig': 'σ', 'Tau': 'τ', 'Ups': 'υ',
        'Phi': 'φ', 'Chi': 'χ', 'Psi': 'ψ', 'Ome': 'ω'
      };

      // ギリシャ文字略号を検索して変換
      for (const [abbr, greek] of Object.entries(greekMap)) {
        if (star.name.includes(abbr)) {
          label = greek;
          break;
        }
      }
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
export function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  projectionMode: ProjectionMode = 'orthographic',
  observer?: ObserverLocation
): number {
  // 天球グリッドを先に描画（星の下に）
  drawCelestialGrid(ctx, viewCenter, zoom, canvasWidth, canvasHeight, projectionMode);

  // 有名な星（固有名がある星、または2等星以上）と普通の星を分ける
  const famousStars = stars.filter(star => star.properName || (star.vmag !== null && star.vmag <= 2.0));
  const normalStars = stars.filter(star => !star.properName && (star.vmag === null || star.vmag > 2.0));

  // 等級でソート（暗い星から描画して、明るい星を上に重ねる）
  const sortedFamousStars = [...famousStars].sort((a, b) => (b.vmag ?? 99) - (a.vmag ?? 99));
  const sortedNormalStars = [...normalStars].sort((a, b) => (b.vmag ?? 99) - (a.vmag ?? 99));

  let visibleCount = 0;

  // 普通の星を先に描画
  sortedNormalStars.forEach((star) => {
    const drawn = drawStar(ctx, star, viewCenter, zoom, canvasWidth, canvasHeight, time, projectionMode, observer);
    if (drawn) visibleCount++;
  });

  // 有名な星を後から描画（必ず上に重ねる）
  sortedFamousStars.forEach((star) => {
    const drawn = drawStar(ctx, star, viewCenter, zoom, canvasWidth, canvasHeight, time, projectionMode, observer);
    if (drawn) visibleCount++;
  });

  // 表示範囲の情報を画面に表示
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(5, 5, 350, 150);

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`📊 表示情報`, 15, 25);

  ctx.font = '14px monospace';
  ctx.fillText(`星の数: ${visibleCount} / ${stars.length}`, 15, 50);
  ctx.fillText(`視野中心: 赤経 ${viewCenter.ra}° / 赤緯 ${viewCenter.dec}°`, 15, 70);

  // 表示範囲を計算（正射図法用）
  const fov = 90 / zoom; // 視野角

  ctx.fillText(`表示範囲:`, 15, 95);
  ctx.fillText(`  視野角: ${Math.round(fov)}°`, 15, 115);
  ctx.fillText(`  ズーム: ${zoom.toFixed(1)}x`, 15, 135);

  return visibleCount;
}
