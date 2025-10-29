import type { Star } from './star';

// クイズタイプ
export type QuizType =
  | 'find-star'        // この星を探せ！
  | 'brightness'       // 明るさ比べ
  | 'constellation'    // 星座の形当て
  | 'color'           // 色あて
  | 'distance';       // 距離

// クイズの型定義
export interface Quiz {
  id: string;                    // クイズID
  type: QuizType;                // クイズタイプ
  questionType: 'visual' | 'description' | 'interactive'; // 問題形式
  question: string;              // 問題文
  correctAnswer: string;         // 正解
  choices: string[];             // 選択肢
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度

  // 星空連動情報
  targetStar?: Star;             // 対象の星（単一星クイズ）
  targetConstellation?: string;  // 対象の星座ID（星座クイズ）
  viewCenter?: { ra: number; dec: number }; // 自動移動先の座標
  zoomLevel?: number;            // 自動ズームレベル

  // クイズタイプ別の追加情報
  compareStar?: Star;            // 比較対象の星（明るさ比べクイズ）
  explanation?: string;          // 正解後の解説文

  // 後方互換性のため残す
  constellationId?: string;      // 星座ID（旧形式）
  starId?: number;               // 星ID（旧形式）
}

// 設定の型定義
export interface Settings {
  category: 'north' | 'south' | 'all'; // カテゴリー
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
  questionCount: 10 | 20 | 30 | 999; // 出題数（999は無制限）
  soundEnabled: boolean;         // 音声ON/OFF
  showBayerDesignations: boolean; // バイエル符号を表示
  showProperNames: boolean;       // 固有名を表示
  showConstellationLines: boolean; // 星座線を表示
}

// スコアの型定義
export interface Score {
  correct: number;               // 正解数
  total: number;                 // 出題数
  percentage: number;            // 正解率（%）
}
