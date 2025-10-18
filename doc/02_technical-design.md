# 技術設計書：Stellarium Quiz

## 📋 概要
要件定義書（01_requirements.md v2.0）に基づき、プラネタリウム体験型の星座・星学習クイズアプリを開発する技術設計書。

---

## 🏗️ 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14.x (App Router)
- **言語**: TypeScript 5.x
- **UIライブラリ**: React 18.x
- **スタイリング**: Tailwind CSS v3
- **アニメーション**: Framer Motion
- **星空描画**: HTML5 Canvas API

### データ管理
- **状態管理**: React hooks（useState、useEffect、useRef）、Context API
- **データ形式**: JSON（静的ファイル）
- **データソース**:
  - Hipparcos星表（9等星まで、約12万個）
    - `stars.json`: 肉眼観測モード（7等まで、41,057個）
    - `stars-10mag.json`: 天の川モード（9等まで、120,282個）
  - IAU 88星座データ
  - Stellarium星座線データ（constellationship.fab）
  - Stellarium星座イラスト（WebP形式）

### 開発ツール
- **リンター**: ESLint 8.x
- **フォーマッター**: Prettier
- **テスト**: Jest + React Testing Library
- **バージョン管理**: Git

---

## 📐 アーキテクチャ設計

### 全体構成
```
app028-star-game/
├── public/
│   ├── data/
│   │   ├── stars.json              # 肉眼観測モード（7等まで、41,057個）
│   │   ├── stars-10mag.json        # 天の川モード（9等まで、120,282個）
│   │   ├── stars-sample.json       # サンプルデータ
│   │   ├── constellations-sample.json # 星座サンプルデータ
│   │   ├── constellations.json     # 88星座データ
│   │   ├── constellation-lines.json # 星座線データ
│   │   └── named-stars.json        # IAU固有名を持つ星
│   ├── images/
│   │   ├── constellations/         # 星座イラスト（WebP）
│   │   └── backgrounds/            # 星空背景画像
│   └── icons/                      # アプリアイコン
├── data/                           # データ処理用（開発時のみ使用）
│   ├── raw/                        # 元データ保存
│   └── stars.json                  # 加工後データ
├── app/
│   ├── layout.tsx                  # ルートレイアウト
│   ├── page.tsx                    # トップページ（クイズ画面）
│   ├── settings/
│   │   └── page.tsx                # 設定画面
│   ├── encyclopedia/
│   │   └── page.tsx                # 図鑑モード
│   └── globals.css                 # グローバルスタイル
├── components/
│   ├── StarField/
│   │   └── StarField.tsx           # 星空描画コンポーネント
│   ├── Quiz/
│   │   ├── QuizContainer.tsx       # クイズコンテナ
│   │   ├── QuizQuestion.tsx        # 問題表示
│   │   ├── QuizChoices.tsx         # 選択肢表示
│   │   └── QuizResult.tsx          # 結果表示
│   ├── Score/
│   │   └── ScoreDisplay.tsx        # スコア表示
│   ├── DetailModal/
│   │   ├── ConstellationDetail.tsx # 星座詳細モーダル
│   │   └── StarDetail.tsx          # 星詳細モーダル
│   └── Settings/
│       └── SettingsPanel.tsx       # 設定パネル
├── lib/
│   ├── data/
│   │   ├── starsLoader.ts          # 星データローダー
│   │   ├── constellationsLoader.ts # 星座データローダー
│   │   └── quizGenerator.ts        # クイズ生成ロジック
│   ├── canvas/
│   │   ├── starRenderer.ts         # 星の描画ロジック
│   │   ├── gridRenderer.ts         # 座標グリッド描画
│   │   ├── constellationRenderer.ts # 星座線・イラスト描画
│   │   └── coordinateUtils.ts      # 座標変換ユーティリティ
│   └── utils/
│       ├── starCalculations.ts     # 天文計算ユーティリティ
│       └── imageLoader.ts          # 画像遅延読み込み
├── context/
│   ├── QuizContext.tsx             # クイズ状態管理
│   └── SettingsContext.tsx         # 設定状態管理
├── types/
│   ├── star.ts                     # 星の型定義
│   ├── constellation.ts            # 星座の型定義
│   ├── quiz.ts                     # クイズの型定義
│   └── observationMode.ts          # 観測モードの型定義
├── scripts/                        # データ処理スクリプト（開発用）
│   └── （各種データ変換スクリプト）
└── doc/
    ├── 01_requirements.md          # 要件定義書
    ├── 02_technical-design.md      # 技術設計書（本ファイル）
    └── 03_implementation-plan.md   # 実装計画書
```

---

## 🗄️ データ構造設計

### 1. 星データ（stars.json）
```typescript
interface Star {
  id: number;                    // Hipparcos ID
  ra: number;                    // 赤経（度）
  dec: number;                   // 赤緯（度）
  magnitude: number;             // 視等級
  color: string;                 // 色（RGB hex）
  properName?: string;           // 固有名（IAU認定）
  constellation?: string;        // 所属星座
  spectralType?: string;         // スペクトル型
  distance?: number;             // 距離（光年）
}
```

### 2. 星座データ（constellations.json）
```typescript
interface Constellation {
  id: string;                    // IAU略号（例: "UMa"）
  name: string;                  // 正式名称
  nameJa: string;                // 日本語名
  mythology?: string;            // 神話・由来
  season?: string;               // 見える季節
  hemisphere: 'north' | 'south' | 'both'; // 半球
  mainStars: number[];           // 主要な星のID
  illustrationPath: string;      // イラスト画像パス
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
}
```

### 3. 星座線データ（constellation-lines.json）
```typescript
interface ConstellationLine {
  constellationId: string;       // 星座ID
  lines: number[][];             // 星のIDペアの配列
}
```

### 4. クイズデータ（動的生成）
```typescript
interface Quiz {
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
```

---

## 🎨 コンポーネント設計

### 1. StarField（星空描画）
**責務**: Canvas上に最大12万個の星を描画し、2つの投影モード（宇宙シミュレーター/プラネタリウム）を提供

**主要機能**:
- Hipparcos星表データから視野内の星を全て描画（視野カリング適用）
- 星の明るさに応じたサイズ・輝度調整（一等星は特に目立たせる）
- 色温度に基づく星の色表現（B-V値から色計算）
- 星の瞬きアニメーション（時間ベースの輝度変動）
- スムーズなズーム・パン操作（マウス・タッチ対応）
- 2つの投影モード切り替え
  - Orthographic（正射投影）: 宇宙シミュレーター視点（外から天球を眺める）
  - Stereographic（ステレオ投影）: プラネタリウム視点（内から天球を見上げる）
- 観測モード切り替え（肉眼/天の川）
- 星座線の描画（黄色の線で星を繋ぐ）
- 星座イラストの半透明重ね描画
- 星クリック時の詳細表示

**Props**:
```typescript
interface StarFieldProps {
  stars: Star[];                   // 星データ配列
  viewCenter?: { ra: number; dec: number }; // 視野中心（赤経・赤緯）
  zoom?: number;                   // ズーム倍率（0.5〜10.0）
  className?: string;              // CSSクラス名
  onVisibleCountChange?: (count: number) => void; // 表示星数変更時のコールバック
  projectionMode?: ProjectionMode; // 投影モード（'orthographic' | 'stereographic'）
}
```

### 2. QuizContainer（クイズコンテナ）
**責務**: クイズの状態管理とフロー制御

**主要機能**:
- クイズの生成・出題
- ユーザーの回答処理
- スコア管理
- 正解・不正解判定と結果表示

**State**:
```typescript
interface QuizState {
  currentQuiz: Quiz | null;      // 現在の問題
  score: number;                 // 正解数
  totalQuestions: number;        // 出題数
  answered: boolean;             // 回答済みフラグ
  isCorrect: boolean | null;     // 正解判定
}
```

### 3. DetailModal（詳細モーダル）
**責務**: 星座・星の詳細情報を美しく表示

**主要機能**:
- 星座/星の詳細情報表示
- 美しい画像・イラストの表示
- スクロール可能な長文説明
- モーダルの開閉アニメーション

### 4. Settings（設定パネル）
**責務**: ユーザー設定の管理

**設定項目**:
- カテゴリー選択（北半球/南半球/全天）
- 難易度選択（小/中/上）
- 出題数設定（10問/20問/30問/無制限）
- 音声ON/OFF

---

## 🎯 星空描画エンジン設計

### Canvas描画戦略
**目標**: 最大12万個の星を60fpsで描画

**最適化手法**:
1. **視野カリング**: 画面外の星は描画しない（投影モード別に実装）
2. **等級フィルタリング**: ズームレベルに応じて表示する星の等級を制限
3. **requestAnimationFrame**: 効率的なアニメーションループ
4. **2つの投影法**: Orthographic（正射投影）とStereographic（ステレオ投影）
5. **LOD（Level of Detail）**: ズームレベルに応じて描画詳細度を調整
6. **バッチ描画**: 同じ明るさの星をまとめて描画
7. **オフスクリーンキャンバス**: バックグラウンドでの描画準備
8. **デバウンス・スロットリング**: ウィンドウリサイズ時の最適化

### 座標変換
**2つの投影法**

#### 1. Orthographic（正射投影）：宇宙シミュレーター視点
```typescript
export function orthographicProjection(
  ra: number,      // 赤経（度）
  dec: number,     // 赤緯（度）
  viewCenter: { ra: number; dec: number }, // 視野中心
  zoom: number,    // ズーム倍率
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } | null
```
- 地球の外側から星空を見る視点
- 鏡像（左右反転、星図に合わせた表現）
- 全天を一度に表示可能

#### 2. Stereographic（ステレオ投影）：プラネタリウム視点
```typescript
export function stereographicProjection(
  ra: number,      // 赤経（度）
  dec: number,     // 赤緯（度）
  viewCenter: { ra: number; dec: number }, // 視野中心
  zoom: number,    // ズーム倍率
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } | null
```
- プラネタリウムのドームの内側から天球を見上げる視点
- 天球座標（赤経・赤緯）をそのまま使用
- 視野角で制限された範囲を表示

### 星の描画スタイル
```typescript
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  magnitude: number,
  color: string
) {
  // 等級から半径を計算（1等星は大きく、暗い星は小さく）
  const radius = Math.max(1, 5 - magnitude * 0.5);

  // グラデーションで光の広がりを表現
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, `${color}80`); // 半透明
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fill();
}
```

---

## 🎲 クイズ生成ロジック

### 出題アルゴリズム
```typescript
function generateQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  quizType?: 'constellation' | 'star' // 未指定ならランダム
): Quiz {
  // 1. クイズタイプ決定（constellation or star）
  const type = quizType || (Math.random() > 0.7 ? 'star' : 'constellation');

  // 2. 難易度とカテゴリーに基づいて候補を絞り込み
  const candidates = filterCandidates(type, difficulty, category);

  // 3. ランダムに1つ選択
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  // 4. 選択肢生成
  const choices = generateChoices(type, target, difficulty);

  // 5. Quizオブジェクト生成
  return { ... };
}
```

### 選択肢生成
```typescript
function generateChoices(
  type: 'constellation' | 'star',
  correctAnswer: Constellation | Star,
  difficulty: 'easy' | 'medium' | 'hard'
): string[] {
  const numChoices = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  // 正解と似た特徴を持つダミー選択肢を生成
  // （例: 同じ季節の星座、同じ明るさの星）
  const dummies = selectSimilarItems(correctAnswer, numChoices - 1);

  // シャッフルして返す
  return shuffle([correctAnswer.name, ...dummies.map(d => d.name)]);
}
```

---

## 🌐 レスポンシブデザイン設計

### ブレークポイント
```css
/* スマートフォン（縦） */
@media (max-width: 640px) { ... }

/* スマートフォン（横）・小型タブレット */
@media (min-width: 641px) and (max-width: 768px) { ... }

/* タブレット */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* PC */
@media (min-width: 1025px) { ... }
```

### レイアウト戦略
- **スマホ縦**: 星空を上半分、クイズUIを下半分に配置
- **スマホ横**: 星空を全画面表示、クイズUIをオーバーレイ
- **タブレット**: 星空を左側、クイズUIを右側に配置
- **PC**: 星空を大きく表示、クイズUIをサイドバー配置

---

## ⚡ パフォーマンス最適化

### 1. データロード最適化
- **初回ロード**: 必要最小限のデータ（現在の問題に関連する星座のみ）
- **遅延ロード**: 星座イラストは必要になった時点で読み込み
- **プリロード**: 次の問題で使用する画像を事前読み込み

### 2. 描画最適化
- **デバウンス**: ウィンドウリサイズ時の再描画を抑制
- **スロットリング**: スクロール・パン操作時の描画頻度制限
- **メモ化**: React.memo、useMemo、useCallbackで不要な再レンダリング防止

### 3. 画像最適化
- **WebP形式**: モダンブラウザ向け軽量画像フォーマット
- **レスポンシブ画像**: デバイスに応じた適切なサイズの画像を配信
- **CDN**: 静的アセットはCDN経由で配信（デプロイ時）

---

## 🎭 アニメーション設計

### 星の瞬きアニメーション
```typescript
function animateTwinkle(star: Star, time: number): number {
  // ランダムな周期で明るさを変動させる
  const phase = star.id * 0.1 + time * 0.001;
  const twinkle = Math.sin(phase) * 0.2 + 1; // 0.8 ~ 1.2倍
  return star.magnitude + (1 - twinkle) * 0.5;
}
```

### 画面遷移アニメーション
- **フェードイン/アウト**: 問題切り替え時
- **スライドイン**: モーダル表示時
- **スケール**: スコア更新時の数字拡大

### 実装ライブラリ
- **Framer Motion**: React向けアニメーションライブラリ
- **CSS Transitions**: シンプルなホバー効果等

---

## 🧪 テスト戦略

### 単体テスト
- **データロード**: 星・星座データの正しい読み込み
- **座標変換**: 天球座標→スクリーン座標の変換精度
- **クイズ生成**: 正しい選択肢生成と重複チェック

### 統合テスト
- **クイズフロー**: 出題→回答→結果表示→次の問題
- **設定反映**: 設定変更がクイズ生成に正しく反映される

### E2Eテスト
- **基本フロー**: トップページ→クイズ回答→スコア確認
- **レスポンシブ**: 各デバイスサイズでの動作確認

---

## 🔒 セキュリティ・品質管理

### データ整合性
- **型安全性**: TypeScriptによる厳密な型チェック
- **バリデーション**: JSONデータの読み込み時にスキーマ検証

### エラーハンドリング
- **データロード失敗**: ユーザーフレンドリーなエラーメッセージ
- **Canvas非対応**: フォールバックメッセージ表示
- **ネットワークエラー**: リトライ機能

---

## 📝 今後の拡張性

### Phase 2 候補機能
- **AR表示**: スマホカメラで実際の星空にオーバーレイ
- **天体イベント通知**: 流星群・日食等のイベント情報
- **ユーザー投稿**: 星空写真のギャラリー機能
- **多言語対応**: 英語・中国語等への翻訳

### 技術的拡張ポイント
- **WebGL化**: より高速な3D星空描画
- **PWA対応**: オフラインでも動作するアプリ化
- **バックエンド追加**: ユーザーデータの永続化

---

## ✅ 設計承認

この技術設計書は要件定義書（01_requirements.md v2.0）のすべての要件を満たす設計となっています。

- **作成日**: 2025-10-18
- **バージョン**: 2.0
- **準拠要件定義**: 01_requirements.md v2.0
- **更新日**: 2025-10-18
