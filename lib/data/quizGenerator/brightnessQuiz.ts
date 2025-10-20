import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

/**
 * 2つの星の中点を計算
 */
function calculateMidpoint(star1: Star, star2: Star): { ra: number; dec: number } {
  return {
    ra: (star1.ra + star2.ra) / 2,
    dec: (star1.dec + star2.dec) / 2,
  };
}

/**
 * 2つの星を表示するのに適したズームレベルを計算
 * 両方の星が視野に収まるように調整
 */
function calculateZoomForTwoStars(star1: Star, star2: Star): number {
  const raDistance = Math.abs(star1.ra - star2.ra);
  const decDistance = Math.abs(star1.dec - star2.dec);

  // 赤経の距離は360度での折り返しを考慮
  const normalizedRADistance = Math.min(raDistance, 360 - raDistance);

  // 最大距離を基準にズームレベルを計算
  const maxDistance = Math.max(normalizedRADistance, decDistance);

  // 視野角90度をベースに、両方の星が見えるようにズーム調整
  // 距離が大きいほどズームアウト（小さい値）
  if (maxDistance > 60) return 0.8;
  if (maxDistance > 40) return 1.0;
  if (maxDistance > 20) return 1.5;
  return 2.0;
}

/**
 * 「明るさ比べ」クイズを生成
 * @param difficulty 難易度
 * @param category カテゴリー（北半球/南半球/全天）
 * @param stars 星データ配列
 * @returns 生成されたクイズ
 */
export function generateBrightnessQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  stars: Star[]
): Quiz {
  // 難易度別の等級差フィルタ
  const minMagDiff = difficulty === 'easy' ? 1.5
    : difficulty === 'medium' ? 0.8
    : 0.3;

  // カテゴリーフィルタ
  const categoryFilter = (s: Star) => {
    if (category === 'all') return true;
    if (s.dec == null) return false;
    if (category === 'north') return s.dec >= 0;
    return s.dec < 0;
  };

  // 固有名を持つ星のみ
  const candidates = stars.filter(
    (s) => s.properName && s.vmag !== null && categoryFilter(s)
  );

  // 全ペアを生成し、等級差でフィルタ
  const pairs: [Star, Star][] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const magDiff = Math.abs(candidates[i].vmag! - candidates[j].vmag!);
      if (magDiff >= minMagDiff) {
        pairs.push([candidates[i], candidates[j]]);
      }
    }
  }

  if (pairs.length === 0) {
    throw new Error('No star pairs available for brightness quiz');
  }

  // ランダムに1ペア選択
  const [star1, star2] = pairs[Math.floor(Math.random() * pairs.length)];

  // 明るい星（等級が小さい方）が正解
  const brighterStar = star1.vmag! < star2.vmag! ? star1 : star2;
  const dimmerStar = star1.vmag! < star2.vmag! ? star2 : star1;

  // 選択肢はランダムな順序で
  const choices = Math.random() < 0.5
    ? [star1.properName!, star2.properName!]
    : [star2.properName!, star1.properName!];

  // 視野中心は2つの星の中点
  const viewCenter = calculateMidpoint(star1, star2);

  // ズームレベルは両方の星が見えるように調整
  const zoomLevel = calculateZoomForTwoStars(star1, star2);

  return {
    id: `brightness-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'brightness',
    questionType: 'description',
    question: `「${star1.properName}」と「${star2.properName}」、どちらが明るいでしょうか？`,
    correctAnswer: brighterStar.properName!,
    choices,
    difficulty,
    targetStar: brighterStar,
    compareStar: dimmerStar,
    viewCenter,
    zoomLevel,
    explanation: `正解は「${brighterStar.properName}」です。${brighterStar.properName}は${brighterStar.vmag!.toFixed(2)}等級、${dimmerStar.properName}は${dimmerStar.vmag!.toFixed(2)}等級で、等級の数値が小さいほど明るい星です。`,
  };
}
