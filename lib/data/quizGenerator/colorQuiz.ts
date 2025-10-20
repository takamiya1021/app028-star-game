import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

/**
 * スペクトル型から色を判定
 */
function getColorFromSpectralType(spectralType: string): string {
  const type = spectralType.charAt(0).toUpperCase();

  switch (type) {
    case 'O':
    case 'B':
      return '青白い';
    case 'A':
      return '白い';
    case 'F':
      // F型は白〜黄色の境界だが、ここでは白寄りとして扱う
      return '白い';
    case 'G':
      return '黄色い';
    case 'K':
      return 'オレンジ';
    case 'M':
      return '赤い';
    default:
      return '白い'; // デフォルトは白
  }
}

/**
 * 難易度に応じた選択肢セットを取得
 */
function getColorChoices(difficulty: 'easy' | 'medium' | 'hard'): string[] {
  const allColors = ['青白い', '白い', '黄色い', 'オレンジ', '赤い'];

  if (difficulty === 'easy') {
    // Easy: 明確に異なる色のみ（青白・白・黄・赤）
    return ['青白い', '白い', '黄色い', '赤い'];
  } else if (difficulty === 'medium') {
    // Medium: すべての色
    return allColors;
  } else {
    // Hard: すべての色
    return allColors;
  }
}

/**
 * 「色あて」クイズを生成
 * @param difficulty 難易度
 * @param category カテゴリー（北半球/南半球/全天）
 * @param stars 星データ配列
 * @returns 生成されたクイズ
 */
export function generateColorQuiz(
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

  // 固有名とスペクトル型を持つ星のみ
  const candidates = stars.filter(
    (s) => s.properName && s.spectralType && categoryFilter(s)
  );

  if (candidates.length === 0) {
    throw new Error('No stars available for color quiz');
  }

  // ランダムに1つ選択
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  // 正解の色
  const correctColor = getColorFromSpectralType(target.spectralType!);

  // 難易度に応じた選択肢
  const choices = getColorChoices(difficulty);

  return {
    id: `color-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'color',
    questionType: 'description',
    question: `「${target.properName}」は何色に輝いている星でしょうか？`,
    correctAnswer: correctColor,
    choices,
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 4.0,
    explanation: `正解は「${correctColor}」です。${target.properName}はスペクトル型${target.spectralType}の星で、${correctColor}色に輝いています。`,
  };
}
