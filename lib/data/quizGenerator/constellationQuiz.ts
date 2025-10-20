import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';

/**
 * 星座の中心座標を計算
 */
function calculateConstellationCenter(stars: Star[]): { ra: number; dec: number } {
  const avgRA = stars.reduce((sum, s) => sum + s.ra, 0) / stars.length;
  const avgDec = stars.reduce((sum, s) => sum + s.dec, 0) / stars.length;

  return { ra: avgRA, dec: avgDec };
}

/**
 * 星座のサイズに基づいてズームレベルを計算
 */
function calculateZoomForConstellation(stars: Star[]): number {
  const raValues = stars.map(s => s.ra);
  const decValues = stars.map(s => s.dec);

  const raSpan = Math.max(...raValues) - Math.min(...raValues);
  const decSpan = Math.max(...decValues) - Math.min(...decValues);

  const maxSpan = Math.max(raSpan, decSpan);

  // 星座のサイズに応じてズームレベルを調整
  if (maxSpan > 50) return 0.5;
  if (maxSpan > 30) return 0.8;
  if (maxSpan > 20) return 1.0;
  if (maxSpan > 15) return 1.2;
  return 1.5;
}

/**
 * 「星座の形当て」クイズを生成
 * @param difficulty 難易度
 * @param category カテゴリー（北半球/南半球/全天）
 * @param stars 星データ配列
 * @returns 生成されたクイズ
 */
export function generateConstellationQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  stars: Star[]
): Quiz {
  // 難易度別の最小星数フィルタ
  const minStarCount = difficulty === 'easy' ? 5
    : difficulty === 'medium' ? 4
    : 3;

  // 星座ごとにグループ化
  const constellationGroups = new Map<string, Star[]>();
  for (const star of stars) {
    if (!star.constellation || star.vmag === null || star.vmag > 3.0) continue;

    if (!constellationGroups.has(star.constellation)) {
      constellationGroups.set(star.constellation, []);
    }
    constellationGroups.get(star.constellation)!.push(star);
  }

  // 難易度フィルタ: 最小星数を満たす星座のみ
  const candidates: { name: string; stars: Star[] }[] = [];
  Array.from(constellationGroups.entries()).forEach(([name, constellationStars]) => {
    if (constellationStars.length >= minStarCount) {
      candidates.push({ name, stars: constellationStars });
    }
  });

  if (candidates.length === 0) {
    throw new Error('No constellations available for constellation quiz');
  }

  // カテゴリーフィルタ: 星座の平均赤緯で判定
  const filteredCandidates = candidates.filter(({ stars: constellationStars }) => {
    if (category === 'all') return true;

    const avgDec = constellationStars.reduce((sum, s) => sum + s.dec, 0) / constellationStars.length;
    if (category === 'north') return avgDec >= 0;
    return avgDec < 0;
  });

  if (filteredCandidates.length === 0) {
    throw new Error('No constellations available for constellation quiz');
  }

  // 選択肢作成のため、最低4つの星座が必要
  const allConstellationNames = Array.from(constellationGroups.keys());
  if (allConstellationNames.length < 4) {
    throw new Error('Not enough constellations for choices');
  }

  // ランダムに1つ選択
  const target = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];

  // 選択肢を作成（正解 + ダミー3つ）
  const incorrectChoices = allConstellationNames
    .filter(name => name !== target.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [target.name, ...incorrectChoices].sort(() => Math.random() - 0.5);

  // 視野中心は星座の中心
  const viewCenter = calculateConstellationCenter(target.stars);

  // ズームレベルは星座のサイズに応じて調整
  const zoomLevel = calculateZoomForConstellation(target.stars);

  return {
    id: `constellation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'constellation',
    questionType: 'visual',
    question: `この星の並びは、どの星座でしょうか？`,
    correctAnswer: target.name,
    choices,
    difficulty,
    targetConstellation: target.name,
    viewCenter,
    zoomLevel,
  };
}
