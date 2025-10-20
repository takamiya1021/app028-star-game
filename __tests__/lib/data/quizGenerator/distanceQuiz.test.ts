import type { Star } from '@/types/star';
import { generateDistanceQuiz } from '@/lib/data/quizGenerator/distanceQuiz';

// モック用の星データ（視差データ付き）
const mockStars: Star[] = [
  // 近い星（< 30光年）
  { id: 1, ra: 101.28, dec: -16.71, vmag: -1.46, properName: 'Sirius', name: 'Alpha Canis Majoris', constellation: 'Canis Major', spectralType: 'A1V', bv: 0.00, parallax: 379.21, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 2, ra: 114.83, dec: 5.22, vmag: 0.38, properName: 'Procyon', name: 'Alpha Canis Minoris', constellation: 'Canis Minor', spectralType: 'F5IV', bv: 0.42, parallax: 285.93, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 3, ra: 219.90, dec: -60.84, vmag: -0.01, properName: 'Alpha Centauri A', name: 'Alpha Centauri A', constellation: 'Centaurus', spectralType: 'G2V', bv: 0.71, parallax: 747.23, hd: null, hr: null, pmRA: null, pmDE: null },

  // 中距離の星（30-100光年）
  { id: 4, ra: 279.23, dec: 38.78, vmag: 0.03, properName: 'Vega', name: 'Alpha Lyrae', constellation: 'Lyra', spectralType: 'A0V', bv: 0.00, parallax: 130.23, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 5, ra: 213.92, dec: 19.18, vmag: -0.05, properName: 'Arcturus', name: 'Alpha Bootis', constellation: 'Bootes', spectralType: 'K0III', bv: 1.23, parallax: 88.83, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 6, ra: 68.98, dec: 16.51, vmag: 0.85, properName: 'Aldebaran', name: 'Alpha Tauri', constellation: 'Taurus', spectralType: 'K5III', bv: 1.54, parallax: 50.09, hd: null, hr: null, pmRA: null, pmDE: null },

  // 遠い星（> 100光年）
  { id: 7, ra: 88.79, dec: 7.41, vmag: 0.50, properName: 'Betelgeuse', name: 'Alpha Orionis', constellation: 'Orion', spectralType: 'M1-2Ia', bv: 1.85, parallax: 5.95, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 8, ra: 88.79, dec: 7.41, vmag: 0.13, properName: 'Rigel', name: 'Beta Orionis', constellation: 'Orion', spectralType: 'B8Ia', bv: -0.03, parallax: 3.78, hd: null, hr: null, pmRA: null, pmDE: null },
  { id: 9, ra: 247.35, dec: -26.43, vmag: 0.96, properName: 'Antares', name: 'Alpha Scorpii', constellation: 'Scorpius', spectralType: 'M1.5Iab', bv: 1.83, parallax: 5.89, hd: null, hr: null, pmRA: null, pmDE: null },
];

describe('generateDistanceQuiz', () => {
  describe('Difficulty filtering', () => {
    it('should filter stars by easy difficulty (clear distance ranges)', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.parallax).toBeTruthy();
    });

    it('should filter stars by medium difficulty', () => {
      const quiz = generateDistanceQuiz('medium', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.parallax).toBeTruthy();
    });

    it('should filter stars by hard difficulty', () => {
      const quiz = generateDistanceQuiz('hard', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.parallax).toBeTruthy();
    });
  });

  describe('Category filtering', () => {
    it('should filter north hemisphere stars (dec >= 0)', () => {
      const quiz = generateDistanceQuiz('easy', 'north', mockStars);

      expect(quiz.targetStar?.dec).toBeGreaterThanOrEqual(0);
    });

    it('should filter south hemisphere stars (dec < 0)', () => {
      const quiz = generateDistanceQuiz('easy', 'south', mockStars);

      expect(quiz.targetStar?.dec).toBeLessThan(0);
    });

    it('should include all stars when category is all', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
    });
  });

  describe('Quiz structure', () => {
    it('should have correct quiz type and questionType', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.type).toBe('distance');
      expect(quiz.questionType).toBe('description');
    });

    it('should have 4 distance choices', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.choices).toHaveLength(4);
      expect(quiz.choices).toContain(quiz.correctAnswer);

      // すべて異なる選択肢
      const uniqueChoices = new Set(quiz.choices);
      expect(uniqueChoices.size).toBe(4);
    });

    it('should have viewCenter at target star coordinates', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.viewCenter).toEqual({
        ra: quiz.targetStar?.ra,
        dec: quiz.targetStar?.dec,
      });
    });

    it('should have zoomLevel set to 3.5', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.zoomLevel).toBe(3.5);
    });

    it('should have question mentioning star name and distance', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.question).toContain(quiz.targetStar?.properName || '');
      expect(quiz.question).toContain('離れて');
    });

    it('should have correctAnswer as distance description', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.correctAnswer).toMatch(/約\d+光年/);
    });

    it('should have explanation with distance calculation', () => {
      const quiz = generateDistanceQuiz('easy', 'all', mockStars);

      expect(quiz.explanation).toBeDefined();
      expect(quiz.explanation).toContain('光年');
      expect(quiz.explanation).toContain(quiz.targetStar?.properName || '');
    });
  });

  describe('Distance calculation', () => {
    it('should calculate distance from parallax correctly', () => {
      // Sirius: parallax = 379.21 mas -> distance = 1000/379.21 ≈ 2.64 pc ≈ 8.6 ly
      const sirius = mockStars.find(s => s.properName === 'Sirius')!;
      const quiz = generateDistanceQuiz('easy', 'all', [sirius]);

      // 約8光年の選択肢が正解になるはず
      expect(quiz.correctAnswer).toMatch(/約\d+光年/);
    });

    it('should categorize near stars (< 30光年)', () => {
      const nearStars = mockStars.filter(s => s.parallax && s.parallax > 100);
      const quiz = generateDistanceQuiz('easy', 'all', nearStars);

      const distance = parseInt(quiz.correctAnswer.match(/約(\d+)光年/)?.[1] || '0');
      expect(distance).toBeLessThan(30);
    });

    it('should categorize far stars (> 100光年)', () => {
      const farStars = mockStars.filter(s => s.parallax && s.parallax < 10);
      const quiz = generateDistanceQuiz('easy', 'all', farStars);

      const distance = parseInt(quiz.correctAnswer.match(/約(\d+)光年/)?.[1] || '0');
      expect(distance).toBeGreaterThan(100);
    });
  });

  describe('Error handling', () => {
    it('should throw error when no stars available', () => {
      expect(() => {
        generateDistanceQuiz('easy', 'all', []);
      }).toThrow('No stars available for distance quiz');
    });

    it('should throw error when no stars have parallax', () => {
      const noParallaxStars: Star[] = [
        { id: 1, ra: 100, dec: 10, vmag: 1.0, properName: 'Star A', name: 'A', constellation: 'Test', spectralType: null, bv: null, parallax: null, hd: null, hr: null, pmRA: null, pmDE: null },
      ];

      expect(() => {
        generateDistanceQuiz('easy', 'all', noParallaxStars);
      }).toThrow('No stars available for distance quiz');
    });
  });
});
