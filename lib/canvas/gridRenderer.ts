// 天球グリッド描画ロジック
import { celestialToScreen, ProjectionMode } from './coordinateUtils';

/**
 * 天球のグリッド線を描画
 * @param ctx キャンバスコンテキスト
 * @param viewCenter 視野中心
 * @param zoom ズーム倍率
 * @param canvasWidth キャンバスの幅
 * @param canvasHeight キャンバスの高さ
 * @param projectionMode 投影モード
 */
export function drawCelestialGrid(
  ctx: CanvasRenderingContext2D,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  projectionMode: ProjectionMode = 'orthographic'
): void {
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.25)'; // 淡い青色
  ctx.lineWidth = 1;

  // 赤経線を描画（経度線のような縦線、15度間隔）
  for (let ra = 0; ra < 360; ra += 15) {
    ctx.beginPath();
    let firstPoint = true;

    for (let dec = -90; dec <= 90; dec += 2) {
      const pos = celestialToScreen(ra, dec, viewCenter, zoom, canvasWidth, canvasHeight, projectionMode);
      if (pos) {
        if (firstPoint) {
          ctx.moveTo(pos.x, pos.y);
          firstPoint = false;
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
  }

  // 赤緯線を描画（緯度線のような横線、15度間隔）
  for (let dec = -75; dec <= 75; dec += 15) {
    ctx.beginPath();
    let firstPoint = true;

    for (let ra = 0; ra <= 360; ra += 1) {
      const pos = celestialToScreen(ra, dec, viewCenter, zoom, canvasWidth, canvasHeight, projectionMode);
      if (pos) {
        if (firstPoint) {
          ctx.moveTo(pos.x, pos.y);
          firstPoint = false;
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
  }

  // 天の赤道（DEC=0）を強調表示
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let firstPoint = true;

  for (let ra = 0; ra <= 360; ra += 0.5) {
    const pos = celestialToScreen(ra, 0, viewCenter, zoom, canvasWidth, canvasHeight, projectionMode);
    if (pos) {
      if (firstPoint) {
        ctx.moveTo(pos.x, pos.y);
        firstPoint = false;
      } else {
        ctx.lineTo(pos.x, pos.y);
      }
    } else {
      firstPoint = true;
    }
  }
  ctx.stroke();
}

/**
 * 視野範囲を示す円を描画
 * @param ctx キャンバスコンテキスト
 * @param canvasWidth キャンバスの幅
 * @param canvasHeight キャンバスの高さ
 */
export function drawViewBorder(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.45;

  ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}
