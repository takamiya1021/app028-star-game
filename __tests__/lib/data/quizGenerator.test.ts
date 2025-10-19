import { generateQuiz } from '@/lib/data/quizGenerator';
import type { Constellation, ConstellationLine } from '@/types/constellation';
import type { Star } from '@/types/star';

describe('quizGenerator', () => {
  const constellations: Constellation[] = [
    {
      id: 'UMa',
      name: 'Ursa Major',
      nameJa: 'おおぐま座',
      mythology: '北天の代表的な星座',
      season: 'spring',
      hemisphere: 'north',
      mainStars: [1, 2, 3],
      difficulty: 'easy',
    },
    {
      id: 'Crux',
      name: 'Crux',
      nameJa: 'みなみじゅうじ座',
      mythology: '南天の象徴',
      season: 'winter',
      hemisphere: 'south',
      mainStars: [4, 5, 6],
      difficulty: 'medium',
    },
    {
      id: 'Ori',
      name: 'Orion',
      nameJa: 'オリオン座',
      mythology: '狩人の姿',
      season: 'winter',
      hemisphere: 'both',
      mainStars: [7, 8, 9],
      difficulty: 'hard',
    },
    {
      id: 'Sco',
      name: 'Scorpius',
      nameJa: 'さそり座',
      hemisphere: 'south',
      season: 'summer',
      mainStars: [10, 11, 12],
      difficulty: 'medium',
    },
    {
      id: 'Cen',
      name: 'Centaurus',
      nameJa: 'ケンタウルス座',
      hemisphere: 'south',
      season: 'spring',
      mainStars: [13, 14, 15],
      difficulty: 'medium',
    },
    {
      id: 'And',
      name: 'Andromeda',
      nameJa: 'アンドロメダ座',
      hemisphere: 'north',
      season: 'autumn',
      mainStars: [16, 17, 18],
      difficulty: 'easy',
    },
    {
      id: 'Peg',
      name: 'Pegasus',
      nameJa: 'ペガスス座',
      hemisphere: 'north',
      season: 'autumn',
      mainStars: [19, 20, 21],
      difficulty: 'medium',
    },
  ];

  const stars: Star[] = [
    {
      id: 1,
      ra: 0,
      dec: 45,
      vmag: 1.5,
      bv: 0.23,
      spectralType: 'A0',
      name: 'Alp UMa',
      properName: 'ドゥベ',
      hd: 1,
      hr: 1,
      parallax: 25,
      pmRA: 10,
      pmDE: -2,
    },
    {
      id: 2,
      ra: 10,
      dec: -30,
      vmag: 2.2,
      bv: 0.1,
      spectralType: 'A1',
      name: 'Alp Ori',
      properName: 'ベテルギウス',
      hd: 2,
      hr: 2,
      parallax: 15,
      pmRA: 1,
      pmDE: 1,
    },
    {
      id: 3,
      ra: 20,
      dec: -40,
      vmag: 6.0,
      bv: 0.4,
      spectralType: 'G2',
      name: 'Star 3',
      properName: undefined,
      hd: 3,
      hr: 3,
      parallax: 5,
      pmRA: 0,
      pmDE: 0,
    },
    {
      id: 4,
      ra: 30,
      dec: 10,
      vmag: 7.5,
      bv: 0.7,
      spectralType: 'K0',
      name: 'Star 4',
      properName: undefined,
      hd: 4,
      hr: 4,
      parallax: 3,
      pmRA: 0,
      pmDE: 0,
    },
    {
      id: 5,
      ra: 60,
      dec: 5,
      vmag: 3.5,
      bv: 0.5,
      spectralType: 'F0',
      name: 'Star 5',
      properName: '星5',
      hd: 5,
      hr: 5,
      parallax: 4,
      pmRA: 0,
      pmDE: 0,
    },
    {
      id: 6,
      ra: 70,
      dec: -25,
      vmag: 5.2,
      bv: 0.3,
      spectralType: 'F5',
      name: 'Star 6',
      properName: '星6',
      hd: 6,
      hr: 6,
      parallax: 4,
      pmRA: 0,
      pmDE: 0,
    },
    {
      id: 7,
      ra: 90,
      dec: -50,
      vmag: 6.8,
      bv: 0.6,
      spectralType: 'G0',
      name: 'Star 7',
      properName: '星7',
      hd: 7,
      hr: 7,
      parallax: 2,
      pmRA: 0,
      pmDE: 0,
    },
    {
      id: 8,
      ra: 110,
      dec: 15,
      vmag: 2.8,
      bv: 0.2,
      spectralType: 'A2',
      name: 'Star 8',
      properName: '星8',
      hd: 8,
      hr: 8,
      parallax: 6,
      pmRA: 0,
      pmDE: 0,
    },
  ];

  const quizData = { constellations, stars };

  it('creates constellation quiz matching difficulty and category', async () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    const quiz = await generateQuiz({
      difficulty: 'medium',
      category: 'south',
      quizType: 'constellation',
    }, quizData);
    Math.random = originalRandom;

    expect(quiz.type).toBe('constellation');
    expect(quiz.difficulty).toBe('medium');
    expect(['Crux', 'Sco', 'Cen']).toContain(quiz.constellationId);
    expect(quiz.choices).toHaveLength(6);
    expect(new Set(quiz.choices).size).toBe(quiz.choices.length);
    expect(quiz.choices).toContain('Crux');
  });

  it('creates star quiz with proper choice count', async () => {
    const quiz = await generateQuiz({
      difficulty: 'hard',
      category: 'all',
      quizType: 'star',
    }, quizData);

    expect(quiz.type).toBe('star');
    expect(quiz.choices.length).toBe(8);
    expect(quiz.choices).toContain(quiz.correctAnswer);
    expect(new Set(quiz.choices).size).toBe(quiz.choices.length);
  });

  it('defaults to random quiz type when not specified', async () => {
    const quiz = await generateQuiz({
      difficulty: 'easy',
      category: 'north',
    }, quizData);

    expect(['constellation', 'star']).toContain(quiz.type);
    expect(quiz.choices.length).toBeGreaterThanOrEqual(4);
  });
});
