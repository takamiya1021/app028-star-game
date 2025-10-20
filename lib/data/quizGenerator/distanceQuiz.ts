import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

/**
 * 視差（mas）から距離（光年）を計算
 * @param parallax 視差（ミリ秒角）
 * @returns 距離（光年）
 */
function calculateDistance(parallax: number): number {
  // 視差（mas）からパーセク（pc）への変換: d(pc) = 1000 / p(mas)
  // パーセクから光年への変換: 1 pc ≈ 3.26 ly
  const distanceInParsecs = 1000 / parallax;
  const distanceInLightYears = distanceInParsecs * 3.26;
  return distanceInLightYears;
}

/**
 * 距離を人間が読みやすい形式にフォーマット
 * @param distance 距離（光年）
 * @returns フォーマットされた距離文字列
 */
function formatDistance(distance: number): string {
  if (distance < 10) {
    return `約${Math.round(distance)}光年`;
  } else if (distance < 100) {
    return `約${Math.round(distance / 5) * 5}光年`;
  } else if (distance < 500) {
    return `約${Math.round(distance / 10) * 10}光年`;
  } else {
    return `約${Math.round(distance / 50) * 50}光年`;
  }
}

/**
 * 難易度に応じた距離選択肢を生成
 * @param correctDistance 正解の距離
 * @param difficulty 難易度
 * @returns 選択肢配列
 */
function generateDistanceChoices(correctDistance: number, difficulty: 'easy' | 'medium' | 'hard'): string[] {
  const correct = formatDistance(correctDistance);

  // 難易度別の選択肢生成ロジック
  const choices = new Set<string>([correct]);

  if (difficulty === 'easy') {
    // Easy: 大きく異なる距離
    choices.add(formatDistance(correctDistance * 0.1));
    choices.add(formatDistance(correctDistance * 2));
    choices.add(formatDistance(correctDistance * 10));
  } else if (difficulty === 'medium') {
    // Medium: やや異なる距離
    choices.add(formatDistance(correctDistance * 0.5));
    choices.add(formatDistance(correctDistance * 1.5));
    choices.add(formatDistance(correctDistance * 3));
  } else {
    // Hard: 近い距離
    choices.add(formatDistance(correctDistance * 0.7));
    choices.add(formatDistance(correctDistance * 1.3));
    choices.add(formatDistance(correctDistance * 2));
  }

  // 選択肢が4つに満たない場合は追加
  while (choices.size < 4) {
    const randomFactor = Math.random() * 5 + 0.5;
    choices.add(formatDistance(correctDistance * randomFactor));
  }

  // ランダムな順序で返す
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

/**
 * 「距離」クイズを生成
 * @param difficulty 難易度
 * @param category カテゴリー（北半球/南半球/全天）
 * @param stars 星データ配列
 * @returns 生成されたクイズ
 */
export function generateDistanceQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  stars: Star[]
): Quiz {
  // カテゴリーフィルタ
  const categoryFilter = (s: Star) => {
    if (category === 'all') return true;
    if (s.dec == null) return false;
    if (category === 'north') return s.dec >= 0;
    return s.dec < 0;
  };

  // 固有名と視差を持つ星のみ
  const candidates = stars.filter(
    (s) => s.properName && s.parallax !== null && s.parallax > 0 && categoryFilter(s)
  );

  if (candidates.length === 0) {
    throw new Error('No stars available for distance quiz');
  }

  // ランダムに1つ選択
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  // 距離を計算
  const distance = calculateDistance(target.parallax!);
  const correctAnswer = formatDistance(distance);

  // 選択肢を生成
  const choices = generateDistanceChoices(distance, difficulty);

  return {
    id: `distance-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'distance',
    questionType: 'description',
    question: `「${target.properName}」は地球からどれくらい離れているでしょうか？`,
    correctAnswer,
    choices,
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 3.5,
    explanation: `正解は「${correctAnswer}」です。${target.properName}は地球から約${Math.round(distance)}光年離れた場所にあります。`,
  };
}
