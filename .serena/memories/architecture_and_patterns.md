# アーキテクチャとデザインパターン

## 全体アーキテクチャ

### レイヤー構造
```
app/ (Presentation Layer)
  ↓
components/ (UI Components)
  ↓
lib/ (Business Logic & Data)
  ├── canvas/  (描画ロジック)
  ├── data/    (データローダー)
  └── utils/   (ユーティリティ)
```

## Canvas描画パイプライン

### カスタムCanvasレンダラー
このプロジェクトでは、**自前のCanvas描画パイプライン**を実装している。

#### 主要モジュール (lib/canvas/)
- **starRenderer.ts**: 星の描画ロジック
- **constellationRenderer.ts**: 星座線の描画ロジック
- **gridRenderer.ts**: グリッド描画ロジック
- **coordinateUtils.ts**: 座標変換ユーティリティ

### 座標系と投影法
- **正射図法 (Orthographic)**: 球面を平面に投影
- **ステレオ投影 (Stereographic)**: 立体的な投影

### 描画フロー
```
1. データロード (starsLoader, constellationLinesLoader)
2. 座標変換 (coordinateUtils)
3. Canvas描画 (starRenderer, constellationRenderer, gridRenderer)
4. ユーザー操作対応 (ズーム、パン、ピンチ)
```

## データローダー

### 主要ローダー (lib/data/)
- **starsLoader.ts**: Hipparcos星表データの読み込み
- **constellationsLoader.ts**: 星座データの読み込み
- **constellationLinesLoader.ts**: 星座線データの読み込み
- **cachedJsonLoader.ts**: JSONデータのキャッシュロード
- **quizGenerator.ts**: クイズデータの生成

### データ形式
- **星データ**: Hipparcos星表（JSON形式）
- **星座線**: Stellarium形式（constellationship.fab）
- **IAU固有名リスト**: 星の固有名

### 観測モード
- **肉眼モード**: 7等級まで（約14,000個の星）
- **天の川モード**: 9等級まで（約102,000個の星）

## 状態管理

### React Hooks
- `useState`: ローカル状態管理
- `useEffect`: 副作用処理（データロード、Canvas初期化等）
- `useCallback`: コールバック関数のメモ化
- `useMemo`: 計算結果のメモ化

### Providers
- **app/providers.tsx**: グローバル状態・コンテキストのプロバイダー

## コンポーネント設計

### コンポーネント分類
1. **Presentation Component**: UIの見た目のみ
2. **Container Component**: ロジック・状態管理
3. **Layout Component**: レイアウト構造

### 主要コンポーネント
- **StarField**: 星空描画の中核コンポーネント
- **Quiz**: クイズ機能のコンテナ
- **DetailModal**: 星・星座の詳細表示
- **ErrorBoundary**: エラーハンドリング

## パフォーマンス最適化

### 描画パフォーマンス
- Canvas描画の最適化（星の数に応じた描画制御）
- リクエストアニメーションフレームの活用
- 描画頻度の制御

### データロード最適化
- JSONデータのキャッシュ
- 観測モードに応じたデータの切り替え
- 遅延ロード

### 参考ドキュメント
- `doc/performance/`: パフォーマンス測定結果とプラン

## テスト戦略

### モックとテスト
- **Canvas API**: モック化してテスト実行
- **動的import**: Canvas関連モジュールのテスト時に動的import活用

### テストカバレッジ重点箇所
- 座標変換ロジック (coordinateUtils)
- データローダー (starsLoader, constellationsLoader等)
- 描画ロジック (starRenderer, constellationRenderer)
- Reactコンポーネント (StarField等)

## ドキュメント

### 設計書
- **doc/01_requirements.md**: 要件定義
- **doc/02_technical-design.md**: 技術設計
- **doc/03_implementation-plan.md**: 実装計画

### メンテナンスドキュメント
- **doc/maintenance/testing.md**: テストの手順とメンテナンス
- **doc/maintenance/star_data.md**: 星データの再生成手順

## デプロイ

### Vercel設定
- **vercel.json**: ビルド設定
- **自動デプロイ**: Gitプッシュで自動デプロイ（設定による）

## 注意事項

### Canvas描画
- Canvasはブラウザ環境でのみ動作
- テスト時はCanvas APIのモックが必要

### データサイズ
- 天の川モード（9等級）は約102,000個の星を扱うため、メモリ・描画パフォーマンスに注意

### ブラウザ互換性
- モダンブラウザ対応（Canvas API、ES2015+）
- モバイル対応（タッチ操作、ピンチズーム）
