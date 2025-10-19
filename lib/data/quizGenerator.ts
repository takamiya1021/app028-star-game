import type { Constellation } from '@/types/constellation';
import type { Quiz } from '@/types/quiz';
import type { Star } from '@/types/star';
import { loadConstellations } from './constellationsLoader';
import { loadStars } from './starsLoader';

export interface QuizData {
  constellations: Constellation[];
  stars: Star[];
}

export interface GenerateQuizParams {
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'north' | 'south' | 'all';
  quizType?: 'constellation' | 'star';
  questionType?: 'visual' | 'description';
}

const DEFAULT_QUESTION_TYPE: Quiz['questionType'] = 'description';

function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty array');
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function getStarDisplayName(star: Star): string | null {
  const name = star.properName ?? star.name;
  if (!name) return null;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function generateId() {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // ignore
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getChoiceCount(difficulty: GenerateQuizParams['difficulty']) {
  switch (difficulty) {
    case 'easy':
      return 4;
    case 'medium':
      return 6;
    default:
      return 8;
  }
}

function constellationMatchesCategory(cons: Constellation, category: GenerateQuizParams['category']) {
  if (category === 'all') return true;
  if (category === 'north') {
    return cons.hemisphere === 'north' || cons.hemisphere === 'both';
  }
  return cons.hemisphere === 'south' || cons.hemisphere === 'both';
}

function filterConstellations(
  constellations: Constellation[],
  difficulty: GenerateQuizParams['difficulty'],
  category: GenerateQuizParams['category']
) {
  const matches = constellations.filter(
    (c) => constellationMatchesCategory(c, category) && c.difficulty === difficulty
  );
  if (matches.length > 0) return matches;
  const fallback = constellations.filter((c) => constellationMatchesCategory(c, category));
  return fallback.length > 0 ? fallback : constellations;
}

function filterStars(
  stars: Star[],
  difficulty: GenerateQuizParams['difficulty'],
  category: GenerateQuizParams['category']
) {
  const displayable = stars.filter((star) => Boolean(getStarDisplayName(star)));

  const categoryFn = (star: Star) => {
    if (category === 'all') return true;
    if (star.dec == null) return false;
    if (category === 'north') return star.dec >= 0;
    return star.dec < 0;
  };

  const difficultyFn = (star: Star) => {
    if (star.vmag == null) return false;
    if (difficulty === 'easy') return star.vmag <= 3;
    if (difficulty === 'medium') return star.vmag <= 5;
    return star.vmag > 5;
  };

  const matches = displayable.filter((star) => categoryFn(star) && difficultyFn(star));
  if (matches.length > 0) return matches;

  const categoryMatches = displayable.filter(categoryFn);
  return categoryMatches.length > 0 ? categoryMatches : displayable;
}

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatConstellationQuestion(cons: Constellation): { question: string; correctAnswer: string } {
  const correctAnswer = cons.name;
  const question = `「${cons.nameJa}」の英語名を選んでください。`;
  return { question, correctAnswer };
}

function formatStarQuestion(star: Star): { question: string; correctAnswer: string } {
  const displayName = star.properName ?? star.name ?? 'この星';
  const question = `${displayName} に該当する星の名前を選んでください。`;
  return { question, correctAnswer: displayName };
}

function buildChoices(from: string[], correctAnswer: string, count: number) {
  const unique = new Set<string>();
  unique.add(correctAnswer);
  for (const candidate of from) {
    if (unique.size >= count) break;
    if (candidate && candidate !== correctAnswer) {
      unique.add(candidate);
    }
  }
  return shuffle(Array.from(unique).slice(0, count));
}

async function loadDefaultData(): Promise<QuizData> {
  const [constellations, stars] = await Promise.all([
    loadConstellations(),
    loadStars(),
  ]);
  return { constellations, stars };
}

export async function generateQuiz(
  params: GenerateQuizParams,
  data?: QuizData
): Promise<Quiz> {
  const dataset = data ?? (await loadDefaultData());
  const quizType = params.quizType ?? (Math.random() > 0.5 ? 'star' : 'constellation');
  const questionType = params.questionType ?? DEFAULT_QUESTION_TYPE;
  const choiceCount = getChoiceCount(params.difficulty);

  if (quizType === 'constellation') {
    const candidates = filterConstellations(dataset.constellations, params.difficulty, params.category);
    if (candidates.length === 0) {
      throw new Error('No constellations available for quiz');
    }
    const target = pickRandom(candidates);
    const distractors = dataset.constellations
      .filter((c) => c.id !== target.id)
      .map((c) => c.name);
    const { question, correctAnswer } = formatConstellationQuestion(target);
    const choices = buildChoices(distractors, correctAnswer, choiceCount);

    return {
      id: generateId(),
      type: 'constellation',
      questionType,
      question,
      correctAnswer,
      choices,
      constellationId: target.id,
      difficulty: params.difficulty,
    };
  }

  const starCandidates = filterStars(dataset.stars, params.difficulty, params.category);
  if (starCandidates.length === 0) {
    throw new Error('No stars available for quiz');
  }
  const target = pickRandom(starCandidates);
  const targetName = getStarDisplayName(target);
  if (!targetName) {
    throw new Error('Target star lacks display name');
  }

  const distractorNames = dataset.stars
    .filter((star) => star.id !== target.id)
    .map(getStarDisplayName)
    .filter((name): name is string => Boolean(name));

  const { question, correctAnswer } = formatStarQuestion(target);
  const choices = buildChoices(distractorNames, correctAnswer, choiceCount);

  return {
    id: generateId(),
    type: 'star',
    questionType,
    question,
    correctAnswer,
    choices,
    starId: target.id,
    difficulty: params.difficulty,
  };
}
