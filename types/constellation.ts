// 星座の型定義
export interface Constellation {
  id: string;                    // IAU略号（例: "UMa"）
  name: string;                  // 正式名称
  nameJa: string;                // 日本語名
  mythology?: string;            // 神話・由来
  season?: string;               // 見える季節
  hemisphere: 'north' | 'south' | 'both'; // 半球
  mainStars: number[];           // 主要な星のID
  illustrationPath?: string;     // イラスト画像パス
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
}

// 星座線の型定義
export interface ConstellationLine {
  constellationId: string;       // 星座ID
  lines: number[][];             // 星のIDペアの配列
}
