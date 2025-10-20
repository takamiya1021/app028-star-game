import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

/**
 * 「この星を探せ！」クイズを生成
 * @param difficulty 難易度
 * @param category カテゴリー（北半球/南半球/全天）
 * @param stars 星データ配列
 * @returns 生成されたクイズ
 */
export function generateFindStarQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  stars: Star[]
): Quiz {
  // 難易度別の等級フィルタ
  const magFilter = difficulty === 'easy' ? (s: Star) => s.vmag !== null && s.vmag <= 1.5
    : difficulty === 'medium' ? (s: Star) => s.vmag !== null && s.vmag <= 2.5
    : (s: Star) => s.vmag !== null && s.vmag <= 4.0;

  // カテゴリーフィルタ
  const categoryFilter = (s: Star) => {
    if (category === 'all') return true;
    if (s.dec == null) return false;
    if (category === 'north') return s.dec >= 0;
    return s.dec < 0;
  };

  // 固有名を持つ星のみ（星座名は後でチェック）
  const candidates = stars.filter(
    (s) => s.properName && magFilter(s) && categoryFilter(s)
  );

  if (candidates.length === 0) {
    throw new Error('No stars available for find-star quiz');
  }

  // ランダムに1つ選択
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  // 星座名の取得（ない場合は「その星座」と表示）
  const constellationText = target.constellation ? `「${target.constellation}座」の` : '';

  // フィルタでproperNameが存在することを保証しているが、TypeScriptにはわからないので確認
  if (!target.properName) {
    throw new Error('Target star lacks properName');
  }

  return {
    id: `find-star-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'find-star',
    questionType: 'interactive',
    question: `${constellationText}「${target.properName}」を探してクリック/タップしてください`,
    correctAnswer: target.properName,
    choices: [],
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 3.0,
  };
}
