import type { Star } from '@/types/star';
import { createCachedJsonLoader, JsonFetcher } from './cachedJsonLoader';
import BRIGHT_STAR_NAMES from '@/data/brightStarNames';

const STARS_DATA_PATH = '/data/stars.json';

/**
 * 星座略称→日本語名のマッピング
 * constellations.json から生成
 */
const CONSTELLATION_NAMES: Record<string, string> = {
  And: 'アンドロメダ', Ant: 'ポンプ', Aps: 'ふうちょう', Aqr: 'みずがめ', Aql: 'わし',
  Ara: 'さいだん', Ari: 'おひつじ', Aur: 'ぎょしゃ', Boo: 'うしかい', Cae: 'ちょうこくぐ',
  Cam: 'きりん', Cnc: 'かに', CVn: 'りょうけん', CMa: 'おおいぬ', CMi: 'こいぬ',
  Cap: 'やぎ', Car: 'りゅうこつ', Cas: 'カシオペヤ', Cen: 'ケンタウルス', Cep: 'ケフェウス',
  Cet: 'くじら', Cha: 'カメレオン', Cir: 'コンパス', Col: 'はと', Com: 'かみのけ',
  CrA: 'みなみのかんむり', CrB: 'かんむり', Crv: 'からす', Crt: 'コップ', Cru: 'みなみじゅうじ',
  Cyg: 'はくちょう', Del: 'いるか', Dor: 'かじき', Dra: 'りゅう', Equ: 'こうま',
  Eri: 'エリダヌス', For: 'ろ', Gem: 'ふたご', Gru: 'つる', Her: 'ヘルクレス',
  Hor: 'とけい', Hya: 'うみへび', Hyi: 'みずへび', Ind: 'インディアン', Lac: 'とかげ',
  Leo: 'しし', LMi: 'こじし', Lep: 'うさぎ', Lib: 'てんびん', Lup: 'おおかみ',
  Lyn: 'やまねこ', Lyr: 'こと', Men: 'テーブルさん', Mic: 'けんびきょう', Mon: 'いっかくじゅう',
  Mus: 'はえ', Nor: 'じょうぎ', Oct: 'はちぶんぎ', Oph: 'へびつかい', Ori: 'オリオン',
  Pav: 'くじゃく', Peg: 'ペガスス', Per: 'ペルセウス', Phe: 'ほうおう', Pic: 'がか',
  Psc: 'うお', PsA: 'みなみのうお', Pup: 'とも', Pyx: 'らしんばん', Ret: 'レチクル',
  Sge: 'や', Sgr: 'いて', Sco: 'さそり', Scl: 'ちょうこくしつ', Sct: 'たて',
  Ser: 'へび', Sex: 'ろくぶんぎ', Tau: 'おうし', Tel: 'ぼうえんきょう', Tri: 'さんかく',
  TrA: 'みなみのさんかく', Tuc: 'きょしちょう', UMa: 'おおぐま', UMi: 'こぐま', Vel: 'ほ',
  Vir: 'おとめ', Vol: 'とびうお', Vul: 'こぎつね',
};

export interface LoadStarsOptions {
  /** 等級の上限（例: 6.5 で6.5等より明るい星のみ） */
  maxMagnitude?: number;
  /** テストなどで差し替えるfetch実装 */
  fetcher?: JsonFetcher;
}

/**
 * 星の名前から星座の日本語名を抽出
 * 例: "Zet Scl" → "ちょうこくしつ", "M 31  And" → "アンドロメダ"
 */
function extractConstellation(name: string | null): string | null {
  if (!name) return null;

  // 名前の最後の単語（3文字の大文字で始まる）を星座略称として抽出
  const match = name.match(/\b([A-Z][a-z]{2})\b\s*$/);
  if (!match) return null;

  const abbreviation = match[1];
  return CONSTELLATION_NAMES[abbreviation] || null;
}

const starsLoader = createCachedJsonLoader<Star[]>({
  path: STARS_DATA_PATH,
  importData: () => import('@/public/data/stars.json'),
  transform: (data) =>
    (data as Star[]).map((star) => {
      const properName = BRIGHT_STAR_NAMES[star.id];
      const constellation = extractConstellation(star.name);

      const updates: Partial<Star> = {};
      if (properName && star.properName !== properName) {
        updates.properName = properName;
      }
      if (constellation) {
        updates.constellation = constellation;
      }

      if (Object.keys(updates).length > 0) {
        return { ...star, ...updates };
      }
      return star;
    }),
});

async function ensureStars(fetcher?: JsonFetcher): Promise<Star[]> {
  return starsLoader.load(fetcher);
}

export async function loadStars(options: LoadStarsOptions = {}): Promise<Star[]> {
  const { maxMagnitude, fetcher } = options;
  const stars = await ensureStars(fetcher);

  if (typeof maxMagnitude === 'number') {
    return stars.filter((star) => star.vmag !== null && star.vmag <= maxMagnitude);
  }

  return stars;
}

export function clearStarsCache(): void {
  starsLoader.clear();
}
