import { selectQuizType, QUIZ_WEIGHTS } from '@/lib/data/quizGenerator/selectQuizType';
import type { QuizType } from '@/types/quiz';

describe('selectQuizType', () => {
  describe('QUIZ_WEIGHTS configuration', () => {
    it('should have all quiz types defined', () => {
      expect(QUIZ_WEIGHTS).toHaveProperty('find-star');
      expect(QUIZ_WEIGHTS).toHaveProperty('constellation');
      expect(QUIZ_WEIGHTS).toHaveProperty('brightness');
      expect(QUIZ_WEIGHTS).toHaveProperty('color');
      expect(QUIZ_WEIGHTS).toHaveProperty('distance');
    });

    it('should have correct weight values', () => {
      expect(QUIZ_WEIGHTS['find-star']).toBe(30);
      expect(QUIZ_WEIGHTS['constellation']).toBe(25);
      expect(QUIZ_WEIGHTS['brightness']).toBe(20);
      expect(QUIZ_WEIGHTS['color']).toBe(15);
      expect(QUIZ_WEIGHTS['distance']).toBe(10);
    });

    it('should total to 100', () => {
      const total = Object.values(QUIZ_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
      expect(total).toBe(100);
    });
  });

  describe('Weighted random selection', () => {
    it('should return a valid QuizType', () => {
      const validTypes: QuizType[] = ['find-star', 'constellation', 'brightness', 'color', 'distance'];
      const selected = selectQuizType();

      expect(validTypes).toContain(selected);
    });

    it('should return different types over multiple calls', () => {
      const types = new Set<QuizType>();

      // 100回実行して最低3種類以上のクイズが選ばれることを確認
      for (let i = 0; i < 100; i++) {
        types.add(selectQuizType());
      }

      expect(types.size).toBeGreaterThanOrEqual(3);
    });

    it('should respect weight distribution (statistical test)', () => {
      const counts: Record<QuizType, number> = {
        'find-star': 0,
        'constellation': 0,
        'brightness': 0,
        'color': 0,
        'distance': 0,
      };

      // 1000回実行してカウント
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        const type = selectQuizType();
        counts[type]++;
      }

      // find-starが最も多く選ばれることを確認
      expect(counts['find-star']).toBeGreaterThan(counts['distance']);

      // constellationがdistanceより多いことを確認
      expect(counts['constellation']).toBeGreaterThan(counts['distance']);
    });
  });

  describe('Consecutive type prevention', () => {
    it('should not return the same type when lastType is provided', () => {
      const results = new Set<QuizType>();

      // 'find-star'が前回の場合、100回実行しても'find-star'以外が返る
      for (let i = 0; i < 100; i++) {
        const type = selectQuizType('find-star');
        results.add(type);
      }

      expect(results.has('find-star')).toBe(false);
      expect(results.size).toBeGreaterThan(0);
    });

    it('should distribute among remaining types when lastType is provided', () => {
      const counts: Record<QuizType, number> = {
        'find-star': 0,
        'constellation': 0,
        'brightness': 0,
        'color': 0,
        'distance': 0,
      };

      // 'find-star'が前回の場合
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        const type = selectQuizType('find-star');
        counts[type]++;
      }

      // find-starは選ばれない
      expect(counts['find-star']).toBe(0);

      // 他の4つは選ばれる
      expect(counts['constellation']).toBeGreaterThan(0);
      expect(counts['brightness']).toBeGreaterThan(0);
      expect(counts['color']).toBeGreaterThan(0);
      expect(counts['distance']).toBeGreaterThan(0);
    });

    it('should handle all quiz types as lastType', () => {
      const allTypes: QuizType[] = ['find-star', 'constellation', 'brightness', 'color', 'distance'];

      for (const lastType of allTypes) {
        const selected = selectQuizType(lastType);
        expect(selected).not.toBe(lastType);
      }
    });
  });

  describe('Edge cases', () => {
    it('should work without lastType parameter', () => {
      const type = selectQuizType();
      expect(type).toBeDefined();
    });

    it('should handle undefined lastType', () => {
      const type = selectQuizType(undefined);
      expect(type).toBeDefined();
    });
  });
});
