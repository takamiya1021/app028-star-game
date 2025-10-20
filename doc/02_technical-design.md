# 技術設計書：Stellarium Quiz

## 📋 概要
要件定義書（01_requirements.md v2.1）に基づき、プラネタリウム体験型の星座・星学習クイズアプリを開発する技術設計書。

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
    - `stars.json`: 肉眼観測モード（7等まで、約14,000個）
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
│   │   ├── stars.json              # 肉眼観測モード（7等まで、約14,000個）
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
- 星の瞬きアニメーション（星ごとに位相・周波数を変えた輝度・色揺らぎ）
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
  zoom?: number;                   // ズーム倍率（0.5〜20.0）
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

### クイズタイプ定義
```typescript
type QuizType =
  | 'find-star'        // この星を探せ！
  | 'brightness'       // 明るさ比べ
  | 'constellation'    // 星座の形当て
  | 'color'           // 色あて
  | 'distance';       // 距離

interface Quiz {
  id: string;
  type: QuizType;
  questionType: 'visual' | 'description' | 'interactive';
  question: string;
  correctAnswer: string;
  choices: string[];
  difficulty: 'easy' | 'medium' | 'hard';

  // 星空連動情報
  targetStar?: Star;           // 対象の星（単一星クイズ）
  targetConstellation?: string; // 対象の星座ID（星座クイズ）
  viewCenter?: { ra: number; dec: number }; // 自動移動先の座標
  zoomLevel?: number;          // 自動ズームレベル

  // クイズタイプ別の追加情報
  compareStar?: Star;          // 比較対象の星（明るさ比べクイズ）
  explanation?: string;        // 正解後の解説文
}
```

### 出題アルゴリズム（改訂版）
```typescript
const QUIZ_WEIGHTS = {
  'find-star': 30,      // この星を探せ
  'constellation': 25,  // 星座の形当て
  'brightness': 20,     // 明るさ比べ
  'color': 15,          // 色あて
  'distance': 10,       // 距離
};

function generateQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all',
  previousType?: QuizType // 連続防止用
): Quiz {
  // 1. クイズタイプを重み付きランダムで決定（連続防止）
  const type = selectQuizType(QUIZ_WEIGHTS, previousType);

  // 2. タイプ別のクイズ生成
  switch (type) {
    case 'find-star':
      return generateFindStarQuiz(difficulty, category);
    case 'brightness':
      return generateBrightnessQuiz(difficulty, category);
    case 'constellation':
      return generateConstellationQuiz(difficulty, category);
    case 'color':
      return generateColorQuiz(difficulty, category);
    case 'distance':
      return generateDistanceQuiz(difficulty, category);
  }
}
```

### 各クイズタイプの生成ロジック

#### 1. 「この星を探せ！」クイズ
```typescript
function generateFindStarQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all'
): Quiz {
  // 難易度別の等級フィルタ
  const magFilter = difficulty === 'easy' ? (s: Star) => s.vmag <= 1.5
    : difficulty === 'medium' ? (s: Star) => s.vmag <= 2.5
    : (s: Star) => s.vmag <= 4.0;

  const candidates = filterStars(stars, category, magFilter);
  const target = pickRandom(candidates);

  return {
    id: generateId(),
    type: 'find-star',
    questionType: 'interactive',
    question: `「${target.constellation}座」の一等星「${target.properName}」を探してタップしてください`,
    correctAnswer: target.properName,
    choices: [], // インタラクティブなので選択肢なし
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 3.0, // 星がよく見えるズームレベル
  };
}
```

#### 2. 明るさ比べクイズ
```typescript
function generateBrightnessQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all'
): Quiz {
  // 難易度別の等級差
  const magDiff = difficulty === 'easy' ? 1.5 : difficulty === 'medium' ? 0.8 : 0.3;

  const brightStars = filterStars(stars, category, (s) => s.vmag <= 3);
  const star1 = pickRandom(brightStars);
  const star2 = pickRandom(brightStars.filter(s =>
    Math.abs(s.vmag - star1.vmag) >= magDiff && s.id !== star1.id
  ));

  const brighter = star1.vmag < star2.vmag ? star1 : star2;

  // 2つの星が両方見える位置を計算
  const viewCenter = calculateMidpoint(star1, star2);
  const zoomLevel = calculateZoomForTwoStars(star1, star2);

  return {
    id: generateId(),
    type: 'brightness',
    questionType: 'description',
    question: `「${star1.properName}」と「${star2.properName}」、どちらが明るい？`,
    correctAnswer: brighter.properName,
    choices: [star1.properName, star2.properName],
    difficulty,
    targetStar: star1,
    compareStar: star2,
    viewCenter,
    zoomLevel,
    explanation: `${brighter.properName}は${brighter.vmag.toFixed(2)}等級、${star1.vmag < star2.vmag ? star2.properName : star1.properName}は${(star1.vmag < star2.vmag ? star2.vmag : star1.vmag).toFixed(2)}等級です。`,
  };
}
```

#### 3. 星座の形当てクイズ
```typescript
function generateConstellationQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all'
): Quiz {
  const candidates = filterConstellations(constellations, difficulty, category);
  const target = pickRandom(candidates);

  // 星座全体が見えるビュー設定を計算
  const viewCenter = calculateConstellationCenter(target);
  const zoomLevel = calculateZoomForConstellation(target);

  const distractors = constellations
    .filter(c => c.id !== target.id)
    .map(c => c.name);
  const choiceCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const choices = buildChoices(distractors, target.name, choiceCount);

  return {
    id: generateId(),
    type: 'constellation',
    questionType: 'visual',
    question: `この星座は何座？`,
    correctAnswer: target.name,
    choices,
    difficulty,
    targetConstellation: target.id,
    viewCenter,
    zoomLevel,
  };
}
```

#### 4. 色あてクイズ
```typescript
function generateColorQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all'
): Quiz {
  const colorableStars = filterStars(stars, category, (s) =>
    s.spectralType && s.vmag <= 3
  );
  const target = pickRandom(colorableStars);
  const color = getColorFromSpectralType(target.spectralType);

  return {
    id: generateId(),
    type: 'color',
    questionType: 'description',
    question: `「${target.properName}」は何色の星？`,
    correctAnswer: color,
    choices: ['青白い', '白い', '黄色い', 'オレンジ', '赤い'],
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 4.0,
    explanation: `${target.properName}はスペクトル型${target.spectralType}の星で、${color}色に輝いています。`,
  };
}
```

#### 5. 距離クイズ
```typescript
function generateDistanceQuiz(
  difficulty: 'easy' | 'medium' | 'hard',
  category: 'north' | 'south' | 'all'
): Quiz {
  const starsWithDistance = filterStars(stars, category, (s) =>
    s.distance && s.vmag <= 3
  );
  const target = pickRandom(starsWithDistance);

  // 難易度別の選択肢範囲
  const ranges = difficulty === 'easy'
    ? [5, 25, 100, 500]
    : difficulty === 'medium'
    ? [10, 50, 100, 250]
    : [target.distance * 0.5, target.distance * 0.8, target.distance * 1.2, target.distance * 1.5];

  const correctRange = ranges.find(r => Math.abs(r - target.distance) < 10);
  const choices = ranges.map(r => `約${Math.round(r)}光年`);

  return {
    id: generateId(),
    type: 'distance',
    questionType: 'description',
    question: `「${target.properName}」は地球から何光年離れている？`,
    correctAnswer: `約${Math.round(correctRange)}光年`,
    choices,
    difficulty,
    targetStar: target,
    viewCenter: { ra: target.ra, dec: target.dec },
    zoomLevel: 3.5,
    explanation: `${target.properName}は地球から約${target.distance.toFixed(1)}光年離れています。`,
  };
}
```

### 星空自動移動ロジック
```typescript
function navigateToQuizTarget(quiz: Quiz) {
  const { viewCenter, zoomLevel } = quiz;

  // スムーズアニメーションで移動（1.5秒）
  animateViewTransition({
    from: currentView,
    to: { center: viewCenter, zoom: zoomLevel },
    duration: 1500,
    easing: 'ease-in-out',
  });
}

// 2つの星の中間点を計算
function calculateMidpoint(star1: Star, star2: Star) {
  return {
    ra: (star1.ra + star2.ra) / 2,
    dec: (star1.dec + star2.dec) / 2,
  };
}

// 2つの星が両方見えるズームレベルを計算
function calculateZoomForTwoStars(star1: Star, star2: Star) {
  const distance = Math.sqrt(
    Math.pow(star1.ra - star2.ra, 2) +
    Math.pow(star1.dec - star2.dec, 2)
  );
  return Math.max(1.0, 90 / (distance * 1.5));
}

// 星座全体が見えるズームレベルを計算
function calculateZoomForConstellation(constellation: Constellation) {
  // 星座を構成する星の範囲からズームレベルを決定
  const stars = getConstellationStars(constellation);
  const bounds = calculateBounds(stars);
  const maxDimension = Math.max(bounds.width, bounds.height);
  return Math.max(0.8, 90 / (maxDimension * 1.3));
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

## 📱 PWA（Progressive Web App）実装

### 目的
- ホーム画面への追加でアプリライクな体験を提供
- Service Workerによるキャッシュ戦略で高速化
- オフライン時の基本動作（完全オフライン対応は将来対応）

### 1. manifest.json設定
```json
{
  "name": "Stellarium Quiz",
  "short_name": "星座クイズ",
  "description": "プラネタリウム体験型 星座・星学習クイズアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#1a1f3a",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker設計

#### 基本構成
- **ファイル配置**: `public/sw.js`
- **登録箇所**: `app/layout.tsx`

#### キャッシュ戦略
```typescript
// キャッシュ対象
const CACHE_NAME = 'stellarium-quiz-v1';
const STATIC_ASSETS = [
  '/',
  '/globals.css',
  '/data/stars.json',
  '/data/constellations.json',
  '/data/constellation-lines.json'
];

// キャッシュ戦略
// - 静的アセット: Cache First
// - APIリクエスト: Network First（将来対応）
// - 画像: Cache First with fallback
```

#### 実装方針
- **初期バージョン**: 基本的なキャッシュ機能のみ
- **更新戦略**: バージョン番号でキャッシュ管理
- **オフライン対応**: 最小限（完全オフラインは Phase 2 以降）

### 3. インストールプロンプト

#### ユーザー体験
- 初回訪問時にインストールバナーを表示（ブラウザのデフォルト動作）
- ユーザーが拒否した場合は、設定画面に「ホーム画面に追加」ボタンを配置

#### 実装
```typescript
// app/layout.tsx での Service Worker 登録
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.error('SW registration failed:', error));
  }
}, []);
```

### 4. アイコン準備
- **192x192px**: Android向けアイコン
- **512x512px**: Android向け高解像度アイコン
- **デザイン**: 星空・星座をモチーフにしたアイコン

---

## 📝 今後の拡張性

### Phase 2 候補機能
- **AR表示**: スマホカメラで実際の星空にオーバーレイ
- **天体イベント通知**: 流星群・日食等のイベント情報
- **ユーザー投稿**: 星空写真のギャラリー機能
- **多言語対応**: 英語・中国語等への翻訳

### 技術的拡張ポイント
- **WebGL化**: より高速な3D星空描画
- **バックエンド追加**: ユーザーデータの永続化

---

## ✅ 設計承認

この技術設計書は要件定義書（01_requirements.md v2.2）のすべての要件を満たす設計となっています。

- **作成日**: 2025-10-18
- **バージョン**: 2.2
- **準拠要件定義**: 01_requirements.md v2.2
- **更新日**: 2025-10-20
- **変更履歴**:
  - v2.0 (2025-10-18): モバイル端末向け UI 再設計（大型ボタン、フローティングメニュー、操作ガイド）
  - v2.1 (2025-10-20): PWA対応（manifest.json + Service Worker）を追加
  - v2.2 (2025-10-20): クイズ生成ロジック全面改訂（5種類のクイズタイプ、星空自動移動機能を追加）
