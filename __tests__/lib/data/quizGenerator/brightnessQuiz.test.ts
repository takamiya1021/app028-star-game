import type { Star } from '@/types/star';
import { generateBrightnessQuiz } from '@/lib/data/quizGenerator/brightnessQuiz';

// モック用の星データ
const mockStars: Star[] = [
  { id: 1, ra: 279.23, dec: 38.78, vmag: 0.03, properName: 'Vega', name: 'Alpha Lyrae', constellation: 'Lyra' },
  { id: 2, ra: 101.28, dec: -16.71, vmag: -1.46, properName: 'Sirius', name: 'Alpha Canis Majoris', constellation: 'Canis Major' },
  { id: 3, ra: 297.70, dec: 8.87, vmag: 0.77, properName: 'Altair', name: 'Alpha Aquilae', constellation: 'Aquila' },
  { id: 4, ra: 88.79, dec: 7.41, vmag: 0.50, properName: 'Betelgeuse', name: 'Alpha Orionis', constellation: 'Orion' },
  { id: 5, ra: 24.43, dec: -57.24, vmag: 0.46, properName: 'Achernar', name: 'Alpha Eridani', constellation: 'Eridanus' },
  { id: 6, ra: 213.92, dec: 19.18, vmag: -0.05, properName: 'Arcturus', name: 'Alpha Bootis', constellation: 'Bootes' },
  { id: 7, ra: 152.09, dec: 11.97, vmag: 1.40, properName: 'Regulus', name: 'Alpha Leonis', constellation: 'Leo' },
  { id: 8, ra: 310.36, dec: 45.28, vmag: 1.25, properName: 'Deneb', name: 'Alpha Cygni', constellation: 'Cygnus' },
  { id: 9, ra: 83.63, dec: -0.30, vmag: 2.23, properName: 'Mintaka', name: 'Delta Orionis', constellation: 'Orion' },
  { id: 10, ra: 85.19, dec: -1.20, vmag: 3.50, properName: 'Saiph', name: 'Kappa Orionis', constellation: 'Orion' },
  { id: 11, ra: 200.00, dec: 30.00, vmag: 2.50, properName: 'Polaris', name: 'Alpha Ursae Minoris', constellation: 'Ursa Minor' }, // 北半球テスト用
];

describe('generateBrightnessQuiz', () => {
  describe('Difficulty filtering', () => {
    it('should filter star pairs by easy difficulty (magnitude difference >= 1.5)', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.compareStar).toBeDefined();

      const magDiff = Math.abs((quiz.targetStar?.vmag ?? 0) - (quiz.compareStar?.vmag ?? 0));
      expect(magDiff).toBeGreaterThanOrEqual(1.5);
    });

    it('should filter star pairs by medium difficulty (magnitude difference >= 0.8)', () => {
      const quiz = generateBrightnessQuiz('medium', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.compareStar).toBeDefined();

      const magDiff = Math.abs((quiz.targetStar?.vmag ?? 0) - (quiz.compareStar?.vmag ?? 0));
      expect(magDiff).toBeGreaterThanOrEqual(0.8);
    });

    it('should filter star pairs by hard difficulty (magnitude difference >= 0.3)', () => {
      const quiz = generateBrightnessQuiz('hard', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.compareStar).toBeDefined();

      const magDiff = Math.abs((quiz.targetStar?.vmag ?? 0) - (quiz.compareStar?.vmag ?? 0));
      expect(magDiff).toBeGreaterThanOrEqual(0.3);
    });
  });

  describe('Category filtering', () => {
    it('should filter north hemisphere stars (dec >= 0)', () => {
      const quiz = generateBrightnessQuiz('easy', 'north', mockStars);

      expect(quiz.targetStar?.dec).toBeGreaterThanOrEqual(0);
      expect(quiz.compareStar?.dec).toBeGreaterThanOrEqual(0);
    });

    it('should filter south hemisphere stars (dec < 0)', () => {
      const quiz = generateBrightnessQuiz('easy', 'south', mockStars);

      expect(quiz.targetStar?.dec).toBeLessThan(0);
      expect(quiz.compareStar?.dec).toBeLessThan(0);
    });

    it('should include all stars when category is all', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.compareStar).toBeDefined();
    });
  });

  describe('Quiz structure', () => {
    it('should have correct quiz type and questionType', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.type).toBe('brightness');
      expect(quiz.questionType).toBe('description');
    });

    it('should have two choices with both star names', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.choices).toHaveLength(2);
      expect(quiz.choices).toContain(quiz.targetStar?.properName);
      expect(quiz.choices).toContain(quiz.compareStar?.properName);
    });

    it('should have viewCenter at midpoint between two stars', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      if (!quiz.targetStar || !quiz.compareStar || !quiz.viewCenter) {
        throw new Error('Missing required quiz data');
      }

      const expectedRA = (quiz.targetStar.ra + quiz.compareStar.ra) / 2;
      const expectedDec = (quiz.targetStar.dec + quiz.compareStar.dec) / 2;

      expect(quiz.viewCenter.ra).toBeCloseTo(expectedRA, 1);
      expect(quiz.viewCenter.dec).toBeCloseTo(expectedDec, 1);
    });

    it('should have appropriate zoomLevel to show both stars', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.zoomLevel).toBeDefined();
      expect(quiz.zoomLevel).toBeGreaterThan(0);
      expect(quiz.zoomLevel).toBeLessThanOrEqual(3.0);
    });

    it('should have question mentioning both star names', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.question).toContain(quiz.targetStar?.properName || '');
      expect(quiz.question).toContain(quiz.compareStar?.properName || '');
      expect(quiz.question).toContain('どちらが明るい');
    });

    it('should have correctAnswer as the brighter star (lower vmag)', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      if (!quiz.targetStar || !quiz.compareStar) {
        throw new Error('Missing required quiz data');
      }

      const brighterStar = quiz.targetStar.vmag! < quiz.compareStar.vmag!
        ? quiz.targetStar
        : quiz.compareStar;

      expect(quiz.correctAnswer).toBe(brighterStar.properName);
    });

    it('should have explanation with magnitude values', () => {
      const quiz = generateBrightnessQuiz('easy', 'all', mockStars);

      expect(quiz.explanation).toBeDefined();
      expect(quiz.explanation).toContain('等級');
      expect(quiz.explanation).toContain(quiz.targetStar?.properName || '');
      expect(quiz.explanation).toContain(quiz.compareStar?.properName || '');
    });
  });

  describe('Error handling', () => {
    it('should throw error when no stars available', () => {
      expect(() => {
        generateBrightnessQuiz('easy', 'all', []);
      }).toThrow('No star pairs available for brightness quiz');
    });

    it('should throw error when no star pairs match difficulty filter', () => {
      const similarStars: Star[] = [
        { id: 1, ra: 100, dec: 10, vmag: 1.0, properName: 'Star A', name: 'A', constellation: 'Test' },
        { id: 2, ra: 110, dec: 15, vmag: 1.1, properName: 'Star B', name: 'B', constellation: 'Test' },
      ];

      expect(() => {
        generateBrightnessQuiz('easy', 'all', similarStars);
      }).toThrow('No star pairs available for brightness quiz');
    });

    it('should throw error when only one star matches category filter', () => {
      const oneNorthStar: Star[] = [
        { id: 1, ra: 100, dec: 10, vmag: 0.0, properName: 'North Star', name: 'N', constellation: 'Test' },
      ];

      expect(() => {
        generateBrightnessQuiz('easy', 'north', oneNorthStar);
      }).toThrow('No star pairs available for brightness quiz');
    });
  });
});
