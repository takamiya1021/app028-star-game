// クイズの型定義
export interface Quiz {
  id: string;                    // クイズID
  type: 'constellation' | 'star'; // クイズタイプ
  questionType: 'visual' | 'description'; // 問題形式
  question: string;              // 問題文
  correctAnswer: string;         // 正解
  choices: string[];             // 選択肢
  constellationId?: string;      // 星座ID（星座クイズの場合）
  starId?: number;               // 星ID（星クイズの場合）
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
}

// 設定の型定義
export interface Settings {
  category: 'north' | 'south' | 'all'; // カテゴリー
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
  questionCount: 10 | 20 | 30 | 999; // 出題数（999は無制限）
  soundEnabled: boolean;         // 音声ON/OFF
}

// スコアの型定義
export interface Score {
  correct: number;               // 正解数
  total: number;                 // 出題数
  percentage: number;            // 正解率（%）
}
