import type { QuizType } from '@/types/quiz';

/**
 * クイズタイプの重み設定
 * 合計100になるように設定
 */
export const QUIZ_WEIGHTS: Record<QuizType, number> = {
  'find-star': 30,        // 最も頻繁に出題（体験型の核）
  'constellation': 25,    // 2番目に頻繁（ビジュアル認識）
  'brightness': 20,       // 3番目（比較型）
  'color': 15,           // 4番目（知識型）
  'distance': 10,        // 最も低頻度（専門的）
};

/**
 * 重み付きランダムでクイズタイプを選択
 * @param lastType 前回のクイズタイプ（連続防止用）
 * @returns 選択されたクイズタイプ
 */
export function selectQuizType(lastType?: QuizType): QuizType {
  // 前回と同じタイプ、およびウェイトが0のタイプを除外
  const availableTypes = (Object.keys(QUIZ_WEIGHTS) as QuizType[]).filter(
    (type) => type !== lastType && QUIZ_WEIGHTS[type] > 0
  );

  // 利用可能なタイプの重みを取得
  const availableWeights = availableTypes.map((type) => QUIZ_WEIGHTS[type]);
  const totalWeight = availableWeights.reduce((sum, weight) => sum + weight, 0);

  // 重み付きランダム選択
  let random = Math.random() * totalWeight;

  for (let i = 0; i < availableTypes.length; i++) {
    random -= availableWeights[i];
    if (random <= 0) {
      return availableTypes[i];
    }
  }

  // フォールバック（理論的には到達しない）
  return availableTypes[availableTypes.length - 1];
}
