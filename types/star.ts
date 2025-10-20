// 星の型定義
export interface Star {
  id: number;                    // 星のID（Hipparcos ID）
  ra: number;                    // 赤経（度）
  dec: number;                   // 赤緯（度）
  vmag: number | null;           // 視等級
  bv: number | null;             // B-V色指数
  spectralType: string | null;   // スペクトル型
  name: string | null;           // カタログ名（例: "9Alp CMa"）
  properName?: string;           // 固有名（カタカナ、例: "シリウス"）
  constellation?: string;        // 星座名（例: "Orion"）
  hd: number | null;             // Henry Draper番号
  hr: number | null;             // Harvard Revised番号
  parallax: number | null;       // 視差（mas）
  pmRA: number | null;           // 赤経方向固有運動（mas/yr）
  pmDE: number | null;           // 赤緯方向固有運動（mas/yr）
}
