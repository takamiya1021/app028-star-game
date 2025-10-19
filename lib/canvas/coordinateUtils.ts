// 座標変換ユーティリティ

export type ProjectionMode = 'orthographic' | 'stereographic';

/**
 * 観測地点の情報
 */
export interface ObserverLocation {
  latitude: number;  // 緯度（度）
  longitude: number; // 経度（度）
  date: Date;        // 観測日時（UTC）
}

/**
 * 地平座標（方位角・高度）
 */
export interface HorizontalCoordinates {
  azimuth: number;  // 方位角（度、北=0、東=90、南=180、西=270）
  altitude: number; // 高度（度、地平線=0、天頂=90）
}

/**
 * ユリウス日を計算
 */
function getJulianDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + b - 1524.5 +
             (hour + minute / 60 + second / 3600) / 24;

  return jd;
}

/**
 * 地方恒星時（LST）を計算
 * @param date 観測日時（UTC）
 * @param longitude 経度（度）
 * @returns 地方恒星時（度）
 */
function getLocalSiderealTime(date: Date, longitude: number): number {
  const jd = getJulianDate(date);
  const t = (jd - 2451545.0) / 36525.0;

  // グリニッジ恒星時（度）
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
            t * t * (0.000387933 - t / 38710000.0);

  // 0-360度に正規化
  gst = gst % 360;
  if (gst < 0) gst += 360;

  // 地方恒星時 = グリニッジ恒星時 + 経度
  let lst = gst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;

  return lst;
}

/**
 * 天球座標（赤経・赤緯）を地平座標（方位角・高度）に変換
 * @param ra 赤経（度）
 * @param dec 赤緯（度）
 * @param observer 観測地点の情報
 * @returns 地平座標（方位角・高度）
 */
export function equatorialToHorizontal(
  ra: number,
  dec: number,
  observer: ObserverLocation
): HorizontalCoordinates {
  const lat = observer.latitude * Math.PI / 180;
  const lst = getLocalSiderealTime(observer.date, observer.longitude);

  // 時角 = 地方恒星時 - 赤経
  let ha = lst - ra;
  if (ha < 0) ha += 360;
  const haRad = ha * Math.PI / 180;
  const decRad = dec * Math.PI / 180;

  // 高度の計算
  const sinAlt = Math.sin(lat) * Math.sin(decRad) +
                 Math.cos(lat) * Math.cos(decRad) * Math.cos(haRad);
  const altitude = Math.asin(sinAlt) * 180 / Math.PI;

  // 方位角の計算
  const cosAz = (Math.sin(decRad) - Math.sin(lat) * sinAlt) /
                (Math.cos(lat) * Math.cos(Math.asin(sinAlt)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;

  // 時角が180度より大きい場合、方位角を調整
  if (Math.sin(haRad) > 0) {
    azimuth = 360 - azimuth;
  }

  return { azimuth, altitude };
}

/**
 * 天球座標（赤経・赤緯）をスクリーン座標（x, y）に変換
 * @param ra 赤経（度）0-360
 * @param dec 赤緯（度）-90～+90
 * @param viewCenter 視野中心の赤経・赤緯
 * @param zoom ズーム倍率（大きいほど狭い範囲を拡大表示）
 * @param canvasWidth キャンバスの幅
 * @param canvasHeight キャンバスの高さ
 * @param projectionMode 投影モード（orthographic: 宇宙シミュレーター, stereographic: プラネタリウム）
 * @returns スクリーン座標 {x, y} または null（画面外の場合）
 */
export function celestialToScreen(
  ra: number,
  dec: number,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number,
  projectionMode: ProjectionMode = 'orthographic',
  observer?: ObserverLocation
): { x: number; y: number } | null {
  if (observer) {
    // TODO: 観測者位置を考慮した投影を実装する際に使用
  }
  if (projectionMode === 'stereographic') {
    return celestialToScreenStereographic(ra, dec, viewCenter, zoom, canvasWidth, canvasHeight);
  } else {
    return celestialToScreenOrthographic(ra, dec, viewCenter, zoom, canvasWidth, canvasHeight);
  }
}

/**
 * 正射図法（Orthographic Projection）：天球を無限遠から眺めるように平面に投影
 * 宇宙シミュレーター表示
 */
function celestialToScreenOrthographic(
  ra: number,
  dec: number,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } | null {
  // 視野（Field of View）をzoomから計算
  // zoom=1で90度、zoom=2で45度（狭い範囲）
  const fov = 90 / zoom;

  // 正射図法では天球を真円に保つ（縦横同じスケール）
  const scale = Math.min(canvasWidth, canvasHeight) / 2 / Math.tan(fov * Math.PI / 360);
  const scaleX = scale;
  const scaleY = scale;

  // 各角度をラジアンに変換
  const raRad = ra * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const centerRaRad = viewCenter.ra * Math.PI / 180;
  const centerDecRad = viewCenter.dec * Math.PI / 180;

  // 正射図法の計算式
  const cosC = Math.sin(centerDecRad) * Math.sin(decRad) +
               Math.cos(centerDecRad) * Math.cos(decRad) * Math.cos(raRad - centerRaRad);

  // 画面の中心から見て、星が裏側にある場合は表示しない
  if (cosC < 0) {
    return null;
  }

  const x = Math.cos(decRad) * Math.sin(raRad - centerRaRad);
  const y = Math.cos(centerDecRad) * Math.sin(decRad) -
            Math.sin(centerDecRad) * Math.cos(decRad) * Math.cos(raRad - centerRaRad);

  // 宇宙シミュレーター（外から見る）は反転なし
  const screenX = canvasWidth / 2 + x * scaleX;
  const screenY = canvasHeight / 2 - y * scaleY;

  // 画面外判定（少し広めに）
  const margin = 100;
  if (
    screenX < -margin ||
    screenX > canvasWidth + margin ||
    screenY < -margin ||
    screenY > canvasHeight + margin
  ) {
    return null;
  }

  return { x: screenX, y: screenY };
}

/**
 * ステレオ図法（Stereographic Projection）：地球から夜空を見上げる視点
 * プラネタリウム表示
 */
function celestialToScreenStereographic(
  ra: number,
  dec: number,
  viewCenter: { ra: number; dec: number },
  zoom: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } | null {

  // 視野（Field of View）をzoomから計算
  const fov = 90 / zoom;

  // プラネタリウムと同じように縦横で同じスケールを使う（真円を保つ）
  const scale = Math.min(canvasWidth, canvasHeight) / 2 / Math.tan(fov * Math.PI / 360);
  const scaleX = scale;
  const scaleY = scale;

  // 各角度をラジアンに変換
  const raRad = ra * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const centerRaRad = viewCenter.ra * Math.PI / 180;
  const centerDecRad = viewCenter.dec * Math.PI / 180;

  // ステレオ図法の計算式
  const cosC = Math.sin(centerDecRad) * Math.sin(decRad) +
               Math.cos(centerDecRad) * Math.cos(decRad) * Math.cos(raRad - centerRaRad);

  // 視野内判定（ステレオ図法では裏側も表示可能だが、視野角で制限）
  const maxAngle = Math.cos((fov / 2 + 30) * Math.PI / 180); // 視野角+余裕
  if (cosC < maxAngle) {
    return null;
  }

  // ステレオ図法の投影計算
  const k = 2 / (1 + cosC);
  const x = k * Math.cos(decRad) * Math.sin(raRad - centerRaRad);
  const y = k * (Math.cos(centerDecRad) * Math.sin(decRad) -
                 Math.sin(centerDecRad) * Math.cos(decRad) * Math.cos(raRad - centerRaRad));

  // プラネタリウム（内から見る）は反転
  const screenX = canvasWidth / 2 - x * scaleX;
  const screenY = canvasHeight / 2 - y * scaleY;

  // 画面外判定
  const margin = 100;
  if (
    screenX < -margin ||
    screenX > canvasWidth + margin ||
    screenY < -margin ||
    screenY > canvasHeight + margin
  ) {
    return null;
  }

  return { x: screenX, y: screenY };
}

/**
 * 等級から星の半径を計算
 * @param magnitude 視等級
 * @returns 半径（ピクセル）
 */
export function magnitudeToRadius(magnitude: number): number {
  // 等級が低い（明るい）ほど大きく描画
  // -1等級: 半径 8px、0等級: 半径 6px、1等級: 半径 4px...
  const baseRadius = 10 - magnitude * 1.5;
  return Math.max(1, Math.min(baseRadius, 15)); // 最小1px、最大15px
}

/**
 * 星の色を明るさに応じて調整
 * @param baseColor 基本色（RGB hex）
 * @param magnitude 視等級
 * @returns 調整された色（RGB hex）
 */
export function adjustColorByMagnitude(
  baseColor: string,
  magnitude: number
): string {
  // 明るい星ほど輝度を上げる
  const brightness = Math.max(0.5, 1.5 - magnitude * 0.1);

  // RGB値を抽出
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  // 明るさ調整
  const newR = Math.min(255, Math.floor(r * brightness));
  const newG = Math.min(255, Math.floor(g * brightness));
  const newB = Math.min(255, Math.floor(b * brightness));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
