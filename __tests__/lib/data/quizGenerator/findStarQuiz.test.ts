import type { Star } from '@/types/star';
import { generateFindStarQuiz } from '@/lib/data/quizGenerator/findStarQuiz';

// モック用の星データ
const mockStars: Star[] = [
  { id: 1, ra: 279.23, dec: 38.78, vmag: 0.03, properName: 'Vega', name: 'Alpha Lyrae', constellation: 'Lyra' },
  { id: 2, ra: 101.28, dec: -16.71, vmag: -1.46, properName: 'Sirius', name: 'Alpha Canis Majoris', constellation: 'Canis Major' },
  { id: 3, ra: 297.70, dec: 8.87, vmag: 0.77, properName: 'Altair', name: 'Alpha Aquilae', constellation: 'Aquila' },
  { id: 4, ra: 88.79, dec: 7.41, vmag: 0.50, properName: 'Betelgeuse', name: 'Alpha Orionis', constellation: 'Orion' },
  { id: 5, ra: 24.43, dec: -57.24, vmag: 0.46, properName: 'Achernar', name: 'Alpha Eridani', constellation: 'Eridanus' },
  { id: 6, ra: 213.92, dec: 19.18, vmag: 1.35, properName: 'Arcturus', name: 'Alpha Bootis', constellation: 'Bootes' }, // 実際は-0.05等級だが、テスト用
  { id: 7, ra: 152.09, dec: 11.97, vmag: 1.40, properName: 'Regulus', name: 'Alpha Leonis', constellation: 'Leo' },
  { id: 8, ra: 310.36, dec: 45.28, vmag: 2.23, properName: 'Deneb', name: 'Alpha Cygni', constellation: 'Cygnus' }, // 実際は1.25等級だが、テスト用
  { id: 9, ra: 83.63, dec: -0.30, vmag: 3.00, properName: 'Mintaka', name: 'Delta Orionis', constellation: 'Orion' },
  { id: 10, ra: 85.19, dec: -1.20, vmag: 4.50, properName: 'Eta Orionis', name: 'Eta Orionis', constellation: 'Orion' },
];

describe('generateFindStarQuiz', () => {
  describe('Difficulty filtering', () => {
    it('should filter stars by easy difficulty (vmag <= 1.5)', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar?.vmag).toBeLessThanOrEqual(1.5);
      // Easy: Vega(0.03), Sirius(-1.46), Altair(0.77), Betelgeuse(0.50), Achernar(0.46), Arcturus(1.35), Regulus(1.40)
      expect(['Vega', 'Sirius', 'Altair', 'Betelgeuse', 'Achernar', 'Arcturus', 'Regulus']).toContain(quiz.targetStar?.properName);
    });

    it('should filter stars by medium difficulty (vmag <= 2.5)', () => {
      const quiz = generateFindStarQuiz('medium', 'all', mockStars);

      expect(quiz.targetStar?.vmag).toBeLessThanOrEqual(2.5);
      // Medium: すべて1.5以下の星 + Deneb(2.23)
      expect(quiz.targetStar?.vmag).toBeLessThanOrEqual(2.5);
    });

    it('should filter stars by hard difficulty (vmag <= 4.0)', () => {
      const quiz = generateFindStarQuiz('hard', 'all', mockStars);

      expect(quiz.targetStar?.vmag).toBeLessThanOrEqual(4.0);
      // Hard: すべて2.5以下の星 + Mintaka(3.00)
    });
  });

  describe('Category filtering', () => {
    it('should filter north hemisphere stars (dec >= 0)', () => {
      const quiz = generateFindStarQuiz('easy', 'north', mockStars);

      expect(quiz.targetStar?.dec).toBeGreaterThanOrEqual(0);
    });

    it('should filter south hemisphere stars (dec < 0)', () => {
      const quiz = generateFindStarQuiz('easy', 'south', mockStars);

      expect(quiz.targetStar?.dec).toBeLessThan(0);
    });

    it('should include all stars when category is all', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
    });
  });

  describe('Quiz structure', () => {
    it('should have correct quiz type and questionType', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.type).toBe('find-star');
      expect(quiz.questionType).toBe('interactive');
    });

    it('should have empty choices array for interactive quiz', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.choices).toEqual([]);
    });

    it('should have viewCenter matching target star coordinates', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.viewCenter).toEqual({
        ra: quiz.targetStar?.ra,
        dec: quiz.targetStar?.dec,
      });
    });

    it('should have zoomLevel set to 3.0', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.zoomLevel).toBe(3.0);
    });

    it('should have question mentioning constellation and star name', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.question).toContain(quiz.targetStar?.constellation || '');
      expect(quiz.question).toContain(quiz.targetStar?.properName || '');
      expect(quiz.question).toContain('を探してタップしてください');
    });

    it('should have correctAnswer as star properName', () => {
      const quiz = generateFindStarQuiz('easy', 'all', mockStars);

      expect(quiz.correctAnswer).toBe(quiz.targetStar?.properName);
    });
  });

  describe('Error handling', () => {
    it('should throw error when no stars available', () => {
      expect(() => {
        generateFindStarQuiz('easy', 'all', []);
      }).toThrow('No stars available for find-star quiz');
    });

    it('should throw error when no stars match difficulty filter', () => {
      const dimStars: Star[] = [
        { id: 100, ra: 100, dec: 10, vmag: 5.0, properName: 'Dim Star', name: 'Dim', constellation: 'Test' },
      ];

      expect(() => {
        generateFindStarQuiz('easy', 'all', dimStars);
      }).toThrow('No stars available for find-star quiz');
    });
  });
});
