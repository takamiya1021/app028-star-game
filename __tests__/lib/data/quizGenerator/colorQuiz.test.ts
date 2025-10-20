import type { Star } from '@/types/star';
import { generateColorQuiz } from '@/lib/data/quizGenerator/colorQuiz';

// モック用の星データ（スペクトル型とB-V色指数付き）
const mockStars: Star[] = [
  // O型・B型 - 青白い星
  { id: 1, ra: 88.79, dec: 7.41, vmag: 0.13, properName: 'Rigel', name: 'Beta Orionis', constellation: 'Orion', spectralType: 'B8Ia', bv: -0.03 },
  { id: 2, ra: 279.23, dec: 38.78, vmag: 0.03, properName: 'Vega', name: 'Alpha Lyrae', constellation: 'Lyra', spectralType: 'A0V', bv: 0.00 },

  // A型・F型 - 白い星
  { id: 3, ra: 101.28, dec: -16.71, vmag: -1.46, properName: 'Sirius', name: 'Alpha Canis Majoris', constellation: 'Canis Major', spectralType: 'A1V', bv: 0.00 },
  { id: 4, ra: 114.83, dec: 5.22, vmag: 0.38, properName: 'Procyon', name: 'Alpha Canis Minoris', constellation: 'Canis Minor', spectralType: 'F5IV', bv: 0.42 },

  // G型 - 黄色い星
  { id: 5, ra: 219.90, dec: -60.84, vmag: -0.01, properName: 'Alpha Centauri A', name: 'Alpha Centauri A', constellation: 'Centaurus', spectralType: 'G2V', bv: 0.71 },
  { id: 6, ra: 213.92, dec: 19.18, vmag: -0.05, properName: 'Arcturus', name: 'Alpha Bootis', constellation: 'Bootes', spectralType: 'K0III', bv: 1.23 },

  // K型・M型 - オレンジ・赤い星
  { id: 7, ra: 88.79, dec: 7.41, vmag: 0.50, properName: 'Betelgeuse', name: 'Alpha Orionis', constellation: 'Orion', spectralType: 'M1-2Ia', bv: 1.85 },
  { id: 8, ra: 247.35, dec: -26.43, vmag: 0.96, properName: 'Antares', name: 'Alpha Scorpii', constellation: 'Scorpius', spectralType: 'M1.5Iab', bv: 1.83 },
  { id: 9, ra: 68.98, dec: 16.51, vmag: 0.85, properName: 'Aldebaran', name: 'Alpha Tauri', constellation: 'Taurus', spectralType: 'K5III', bv: 1.54 },
];

describe('generateColorQuiz', () => {
  describe('Difficulty filtering', () => {
    it('should generate easy difficulty quiz with distinct colors', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.spectralType).toBeTruthy();
    });

    it('should generate medium difficulty quiz', () => {
      const quiz = generateColorQuiz('medium', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.spectralType).toBeTruthy();
    });

    it('should generate hard difficulty quiz with subtle colors', () => {
      const quiz = generateColorQuiz('hard', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
      expect(quiz.targetStar?.spectralType).toBeTruthy();
    });
  });

  describe('Category filtering', () => {
    it('should filter north hemisphere stars (dec >= 0)', () => {
      const quiz = generateColorQuiz('easy', 'north', mockStars);

      expect(quiz.targetStar?.dec).toBeGreaterThanOrEqual(0);
    });

    it('should filter south hemisphere stars (dec < 0)', () => {
      const quiz = generateColorQuiz('easy', 'south', mockStars);

      expect(quiz.targetStar?.dec).toBeLessThan(0);
    });

    it('should include all stars when category is all', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.targetStar).toBeDefined();
    });
  });

  describe('Quiz structure', () => {
    it('should have correct quiz type and questionType', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.type).toBe('color');
      expect(quiz.questionType).toBe('description');
    });

    it('should have 4-5 color choices', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.choices.length).toBeGreaterThanOrEqual(4);
      expect(quiz.choices.length).toBeLessThanOrEqual(5);
      expect(quiz.choices).toContain(quiz.correctAnswer);

      // すべて異なる選択肢
      const uniqueChoices = new Set(quiz.choices);
      expect(uniqueChoices.size).toBe(quiz.choices.length);
    });

    it('should have viewCenter at target star coordinates', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.viewCenter).toEqual({
        ra: quiz.targetStar?.ra,
        dec: quiz.targetStar?.dec,
      });
    });

    it('should have zoomLevel set to 4.0', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.zoomLevel).toBe(4.0);
    });

    it('should have question mentioning star name and color', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.question).toContain(quiz.targetStar?.properName || '');
      expect(quiz.question).toContain('色');
    });

    it('should have correctAnswer as color description', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      const validColors = ['青白い', '白い', '黄色い', 'オレンジ', '赤い'];
      expect(validColors).toContain(quiz.correctAnswer);
    });

    it('should have explanation with spectral type', () => {
      const quiz = generateColorQuiz('easy', 'all', mockStars);

      expect(quiz.explanation).toBeDefined();
      expect(quiz.explanation).toContain('スペクトル');
      expect(quiz.explanation).toContain(quiz.targetStar?.properName || '');
    });
  });

  describe('Color determination', () => {
    it('should classify O/B type stars as blue-white (青白い)', () => {
      const blueStars = mockStars.filter(s => s.spectralType?.startsWith('B') || s.spectralType?.startsWith('O'));
      const quiz = generateColorQuiz('easy', 'all', blueStars);

      expect(quiz.correctAnswer).toBe('青白い');
    });

    it('should classify A type stars as white (白い)', () => {
      const whiteStars = mockStars.filter(s => s.spectralType?.startsWith('A'));
      const quiz = generateColorQuiz('easy', 'all', whiteStars);

      expect(quiz.correctAnswer).toBe('白い');
    });

    it('should classify K type stars as orange (オレンジ)', () => {
      const orangeStars = mockStars.filter(s => s.spectralType?.startsWith('K'));
      const quiz = generateColorQuiz('easy', 'all', orangeStars);

      expect(quiz.correctAnswer).toBe('オレンジ');
    });

    it('should classify M type stars as red (赤い)', () => {
      const redStars = mockStars.filter(s => s.spectralType?.startsWith('M'));
      const quiz = generateColorQuiz('easy', 'all', redStars);

      expect(quiz.correctAnswer).toBe('赤い');
    });
  });

  describe('Error handling', () => {
    it('should throw error when no stars available', () => {
      expect(() => {
        generateColorQuiz('easy', 'all', []);
      }).toThrow('No stars available for color quiz');
    });

    it('should throw error when no stars have spectralType', () => {
      const noSpecStars: Star[] = [
        { id: 1, ra: 100, dec: 10, vmag: 1.0, properName: 'Star A', name: 'A', constellation: 'Test', spectralType: null, bv: null },
      ];

      expect(() => {
        generateColorQuiz('easy', 'all', noSpecStars);
      }).toThrow('No stars available for color quiz');
    });
  });
});
