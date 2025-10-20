import type { Quiz } from '@/types/quiz';

describe('Quiz Type', () => {
  describe('QuizType variants', () => {
    it('should accept find-star type', () => {
      const quiz: Quiz = {
        id: 'test-1',
        type: 'find-star',
        questionType: 'interactive',
        question: 'Find Vega',
        correctAnswer: 'Vega',
        choices: [],
        difficulty: 'easy',
        targetStar: { id: 1, ra: 279.23, dec: 38.78, vmag: 0.03 } as any,
        viewCenter: { ra: 279.23, dec: 38.78 },
        zoomLevel: 3.0,
      };

      expect(quiz.type).toBe('find-star');
      expect(quiz.questionType).toBe('interactive');
    });

    it('should accept brightness type', () => {
      const quiz: Quiz = {
        id: 'test-2',
        type: 'brightness',
        questionType: 'description',
        question: 'Which is brighter?',
        correctAnswer: 'Sirius',
        choices: ['Sirius', 'Vega'],
        difficulty: 'medium',
        targetStar: { id: 1, ra: 101.28, dec: -16.71, vmag: -1.46 } as any,
        compareStar: { id: 2, ra: 279.23, dec: 38.78, vmag: 0.03 } as any,
        viewCenter: { ra: 190, dec: 11 },
        zoomLevel: 1.5,
        explanation: 'Sirius is -1.46 mag, Vega is 0.03 mag',
      };

      expect(quiz.type).toBe('brightness');
      expect(quiz.compareStar).toBeDefined();
      expect(quiz.explanation).toBeDefined();
    });

    it('should accept constellation type', () => {
      const quiz: Quiz = {
        id: 'test-3',
        type: 'constellation',
        questionType: 'visual',
        question: 'What constellation is this?',
        correctAnswer: 'Orion',
        choices: ['Orion', 'Scorpius', 'Ursa Major', 'Leo'],
        difficulty: 'easy',
        targetConstellation: 'Ori',
        viewCenter: { ra: 88, dec: -5 },
        zoomLevel: 1.2,
      };

      expect(quiz.type).toBe('constellation');
      expect(quiz.targetConstellation).toBe('Ori');
    });

    it('should accept color type', () => {
      const quiz: Quiz = {
        id: 'test-4',
        type: 'color',
        questionType: 'description',
        question: 'What color is Betelgeuse?',
        correctAnswer: '赤い',
        choices: ['青白い', '白い', '黄色い', 'オレンジ', '赤い'],
        difficulty: 'medium',
        targetStar: { id: 3, ra: 88.79, dec: 7.41, vmag: 0.5, spectralType: 'M1-2' } as any,
        viewCenter: { ra: 88.79, dec: 7.41 },
        zoomLevel: 4.0,
        explanation: 'BetelgeuseはスペクトルM1-2の星で、赤い色に輝いています。',
      };

      expect(quiz.type).toBe('color');
    });

    it('should accept distance type', () => {
      const quiz: Quiz = {
        id: 'test-5',
        type: 'distance',
        questionType: 'description',
        question: 'How far is Sirius?',
        correctAnswer: '約8光年',
        choices: ['約8光年', '約25光年', '約100光年', '約500光年'],
        difficulty: 'easy',
        targetStar: { id: 1, ra: 101.28, dec: -16.71, vmag: -1.46, distance: 8.6 } as any,
        viewCenter: { ra: 101.28, dec: -16.71 },
        zoomLevel: 3.5,
        explanation: 'Siriusは地球から約8.6光年離れています。',
      };

      expect(quiz.type).toBe('distance');
    });
  });

  describe('Quiz fields validation', () => {
    it('should have viewCenter and zoomLevel for star navigation', () => {
      const quiz: Quiz = {
        id: 'test-6',
        type: 'find-star',
        questionType: 'interactive',
        question: 'Find star',
        correctAnswer: 'Test',
        choices: [],
        difficulty: 'easy',
        viewCenter: { ra: 100, dec: 20 },
        zoomLevel: 2.5,
      };

      expect(quiz.viewCenter).toEqual({ ra: 100, dec: 20 });
      expect(quiz.zoomLevel).toBe(2.5);
    });

    it('should have optional explanation field', () => {
      const quizWithExplanation: Quiz = {
        id: 'test-7',
        type: 'brightness',
        questionType: 'description',
        question: 'Test',
        correctAnswer: 'A',
        choices: ['A', 'B'],
        difficulty: 'easy',
        explanation: 'This is the explanation',
      };

      expect(quizWithExplanation.explanation).toBe('This is the explanation');

      const quizWithoutExplanation: Quiz = {
        id: 'test-8',
        type: 'constellation',
        questionType: 'visual',
        question: 'Test',
        correctAnswer: 'C',
        choices: ['C', 'D'],
        difficulty: 'easy',
      };

      expect(quizWithoutExplanation.explanation).toBeUndefined();
    });
  });
});
