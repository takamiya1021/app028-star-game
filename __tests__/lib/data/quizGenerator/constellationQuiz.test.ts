import type { Star } from '@/types/star';
import { generateConstellationQuiz } from '@/lib/data/quizGenerator/constellationQuiz';

// モック用の星データ
const mockStars: Star[] = [
  // Orion constellation (北半球)
  { id: 1, ra: 88.79, dec: 7.41, vmag: 0.50, properName: 'Betelgeuse', name: 'Alpha Orionis', constellation: 'Orion' },
  { id: 2, ra: 83.63, dec: -0.30, vmag: 2.23, properName: 'Mintaka', name: 'Delta Orionis', constellation: 'Orion' },
  { id: 3, ra: 85.19, dec: -1.20, vmag: 1.64, properName: 'Alnilam', name: 'Epsilon Orionis', constellation: 'Orion' },
  { id: 4, ra: 86.94, dec: -1.95, vmag: 1.69, properName: 'Alnitak', name: 'Zeta Orionis', constellation: 'Orion' },
  { id: 5, ra: 78.63, dec: -8.20, vmag: 2.06, properName: 'Saiph', name: 'Kappa Orionis', constellation: 'Orion' },

  // Scorpius constellation (南半球)
  { id: 6, ra: 247.35, dec: -26.43, vmag: 0.96, properName: 'Antares', name: 'Alpha Scorpii', constellation: 'Scorpius' },
  { id: 7, ra: 240.08, dec: -22.62, vmag: 2.29, properName: 'Graffias', name: 'Beta Scorpii', constellation: 'Scorpius' },
  { id: 8, ra: 241.36, dec: -19.46, vmag: 2.32, properName: 'Dschubba', name: 'Delta Scorpii', constellation: 'Scorpius' },
  { id: 9, ra: 262.69, dec: -37.10, vmag: 1.87, properName: 'Shaula', name: 'Lambda Scorpii', constellation: 'Scorpius' },
  { id: 10, ra: 265.62, dec: -39.03, vmag: 2.70, properName: 'Lesath', name: 'Upsilon Scorpii', constellation: 'Scorpius' },

  // Leo constellation (北半球)
  { id: 11, ra: 152.09, dec: 11.97, vmag: 1.40, properName: 'Regulus', name: 'Alpha Leonis', constellation: 'Leo' },
  { id: 12, ra: 177.26, dec: 14.57, vmag: 2.14, properName: 'Denebola', name: 'Beta Leonis', constellation: 'Leo' },
  { id: 13, ra: 154.99, dec: 23.77, vmag: 2.56, properName: 'Algieba', name: 'Gamma Leonis', constellation: 'Leo' },
  { id: 14, ra: 168.56, dec: 20.52, vmag: 2.98, properName: 'Zosma', name: 'Delta Leonis', constellation: 'Leo' },

  // Ursa Major constellation (北半球)
  { id: 15, ra: 165.93, dec: 61.75, vmag: 1.79, properName: 'Alioth', name: 'Epsilon Ursae Majoris', constellation: 'Ursa Major' },
  { id: 16, ra: 193.51, dec: 53.69, vmag: 1.86, properName: 'Alkaid', name: 'Eta Ursae Majoris', constellation: 'Ursa Major' },
  { id: 17, ra: 200.98, dec: 54.93, vmag: 2.37, properName: 'Mizar', name: 'Zeta Ursae Majoris', constellation: 'Ursa Major' },
  { id: 18, ra: 154.27, dec: 49.31, vmag: 2.44, properName: 'Megrez', name: 'Delta Ursae Majoris', constellation: 'Ursa Major' },

  // Crux constellation (南半球)
  { id: 19, ra: 186.65, dec: -63.10, vmag: 0.77, properName: 'Acrux', name: 'Alpha Crucis', constellation: 'Crux' },
  { id: 20, ra: 191.93, dec: -59.69, vmag: 1.25, properName: 'Mimosa', name: 'Beta Crucis', constellation: 'Crux' },
  { id: 21, ra: 187.79, dec: -57.11, vmag: 1.63, properName: 'Gacrux', name: 'Gamma Crucis', constellation: 'Crux' },
  { id: 22, ra: 183.79, dec: -58.75, vmag: 2.80, properName: 'Imai', name: 'Delta Crucis', constellation: 'Crux' },
];

describe('generateConstellationQuiz', () => {
  describe('Difficulty filtering', () => {
    it('should filter constellations by easy difficulty (5+ bright stars)', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      // Easy: Orion (5 stars), Scorpius (5 stars)
      expect(['Orion', 'Scorpius']).toContain(quiz.targetConstellation);
    });

    it('should filter constellations by medium difficulty (4+ bright stars)', () => {
      const quiz = generateConstellationQuiz('medium', 'all', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      // Medium: すべてのeasy + Leo (4 stars), Ursa Major (4 stars), Crux (4 stars)
    });

    it('should filter constellations by hard difficulty (3+ bright stars)', () => {
      const quiz = generateConstellationQuiz('hard', 'all', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      // Hard: すべてのmedium星座を含む
    });
  });

  describe('Category filtering', () => {
    it('should filter north hemisphere constellations (average dec >= 0)', () => {
      const quiz = generateConstellationQuiz('medium', 'north', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      // North (medium): Leo (平均dec > 0), Ursa Major (平均dec > 0)
      expect(['Leo', 'Ursa Major']).toContain(quiz.targetConstellation);
    });

    it('should filter south hemisphere constellations (average dec < 0)', () => {
      const quiz = generateConstellationQuiz('easy', 'south', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      // South: Orion (平均dec < 0), Scorpius (平均dec < 0)
      expect(['Orion', 'Scorpius']).toContain(quiz.targetConstellation);
    });

    it('should include all constellations when category is all', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.targetConstellation).toBeDefined();
      expect(['Orion', 'Scorpius']).toContain(quiz.targetConstellation);
    });
  });

  describe('Quiz structure', () => {
    it('should have correct quiz type and questionType', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.type).toBe('constellation');
      expect(quiz.questionType).toBe('visual');
    });

    it('should have 4 choices with constellation names', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.choices).toHaveLength(4);
      expect(quiz.choices).toContain(quiz.targetConstellation);

      // すべて異なる選択肢
      const uniqueChoices = new Set(quiz.choices);
      expect(uniqueChoices.size).toBe(4);
    });

    it('should have viewCenter at constellation center', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.viewCenter).toBeDefined();
      expect(quiz.viewCenter?.ra).toBeGreaterThanOrEqual(0);
      expect(quiz.viewCenter?.ra).toBeLessThan(360);
      expect(quiz.viewCenter?.dec).toBeGreaterThanOrEqual(-90);
      expect(quiz.viewCenter?.dec).toBeLessThanOrEqual(90);
    });

    it('should have appropriate zoomLevel for constellation size', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.zoomLevel).toBeDefined();
      expect(quiz.zoomLevel).toBeGreaterThan(0);
      expect(quiz.zoomLevel).toBeLessThanOrEqual(2.5);
    });

    it('should have question about constellation shape', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.question).toContain('星座');
      expect(quiz.question).toContain('でしょうか');
    });

    it('should have correctAnswer as constellation name', () => {
      const quiz = generateConstellationQuiz('easy', 'all', mockStars);

      expect(quiz.correctAnswer).toBe(quiz.targetConstellation);
    });
  });

  describe('Error handling', () => {
    it('should throw error when no stars available', () => {
      expect(() => {
        generateConstellationQuiz('easy', 'all', []);
      }).toThrow('No constellations available for constellation quiz');
    });

    it('should throw error when no constellations match difficulty filter', () => {
      const fewStars: Star[] = [
        { id: 1, ra: 100, dec: 10, vmag: 1.0, properName: 'Star A', name: 'A', constellation: 'TestA' },
        { id: 2, ra: 110, dec: 15, vmag: 1.5, properName: 'Star B', name: 'B', constellation: 'TestA' },
      ];

      expect(() => {
        generateConstellationQuiz('easy', 'all', fewStars);
      }).toThrow('No constellations available for constellation quiz');
    });

    it('should throw error when not enough constellations for choices', () => {
      const oneConstellation: Star[] = mockStars.filter(s => s.constellation === 'Orion');

      expect(() => {
        generateConstellationQuiz('easy', 'all', oneConstellation);
      }).toThrow('Not enough constellations for choices');
    });
  });
});
