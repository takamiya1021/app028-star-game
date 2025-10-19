# 実装計画書：Stellarium Quiz（TDD準拠版）

## 📋 概要
技術設計書（02_technical-design.md v2.0）に基づき、**TDD（Test-Driven Development）**のRed-Green-Refactorサイクルで段階的に実装を進める計画書。

## 🔁 TDDサイクルの原則
各機能実装は必ず以下の順序で進める：
1. **Red（失敗）**: テストを先に書く（失敗することを確認）
2. **Green（成功）**: テストを通す最小限の実装
3. **Refactor（改善）**: テストが通った状態でコードを改善

---

## 🎯 実装フェーズ

### Phase 0: テスト環境構築（予定工数: 2時間）
**【✅】Jestセットアップ（Red）**
- ✅ package.json にテスト関連依存追加
  - `jest`, `@testing-library/react`, `@testing-library/jest-dom`
  - `@testing-library/user-event`, `jest-environment-jsdom`

**【✅】Jest設定ファイル作成（Green）**
- ✅ `jest.config.js` 作成
- ✅ `jest.setup.js` 作成
- ✅ TypeScript対応設定

**【✅】テストスクリプト追加（Green）**
- ✅ `"test": "jest"`
- ✅ `"test:watch": "jest --watch"`
- ✅ `"test:coverage": "jest --coverage"`

**【✅】サンプルテスト実行確認（Refactor）**
- ✅ 簡単なテストケース作成して動作確認（5件全てパス）
- CI/CD連携準備

---

### Phase 1: 環境構築とデータ準備（予定工数: 5時間）
**【✅】Next.jsプロジェクト初期化**
- ✅ create-next-appでプロジェクト作成
- ✅ TypeScript、Tailwind CSS設定
- ✅ ESLint、Prettier設定

**【✅】Hipparcos星表データ取得（9等星まで・約12万個）**
- ✅ データソース調査・取得
- ✅ JSON形式への変換
- ✅ public/data/stars.json作成（肉眼観測モード：7等まで、約14,000個）
- ✅ public/data/stars-10mag.json作成（天の川モード：9等まで、120,282個）

**【✅】88星座データ準備**
- ✅ IAU認定88星座リスト作成
- ✅ 日本語名・神話・季節情報追加
- ✅ public/data/constellations.json作成（88星座完全版）

**【✅】星座線データ取得**
- ✅ Stellarium constellationship.fab取得
- ✅ JSON形式への変換
- ✅ public/data/constellation-lines.json作成

**【✅】IAU固有名星データ準備**
- ✅ IAU固有名リスト取得
- ✅ Hipparcos IDとマッピング
- ✅ public/data/named-stars.json作成

---

### Phase 2: データローダー実装（予定工数: 4時間）
**【✅】型定義作成**
- ✅ types/star.ts（Star型）
- ✅ types/constellation.ts（Constellation型）
- ✅ types/quiz.ts（Quiz型）
- ✅ types/observationMode.ts（観測モード型）

**【✅】データローダーテスト作成（Red）**
- ✅ `__tests__/lib/data/starsLoader.test.ts` 作成
  - ✅ 星データ正常読み込みのテスト
  - ✅ 等級フィルタリングのテスト
  - ✅ データ整合性検証のテスト
- ✅ `__tests__/lib/data/constellationsLoader.test.ts` 作成
  - ✅ 星座データ正常読み込みのテスト
- ✅ `__tests__/lib/data/constellationLinesLoader.test.ts` 作成
  - ✅ 星座線データ正常読み込みのテスト

**【✅】データローダー実装（Green）**
- ✅ lib/data/starsLoader.ts（現状：直接import → テスト可能な形に変更）
- ✅ lib/data/constellationsLoader.ts
- ✅ lib/data/constellationLinesLoader.ts
- ✅ テストが通る最小限の実装

**【】データローダーリファクタリング（Refactor）**
- エラーハンドリング追加
- 型安全性の向上
- パフォーマンス最適化
- すべてのテストがパスすることを確認

---

### Phase 3: 星空描画エンジン実装（予定工数: 12時間）

#### 3-1: 座標変換ユーティリティ（TDDサイクル）
**【✅】座標変換テスト作成（Red）**
- ✅ `__tests__/lib/canvas/coordinateUtils.test.ts` 作成
  - ✅ 天球座標→スクリーン座標変換のテスト
  - ✅ Orthographic投影のテスト
  - ✅ Stereographic投影のテスト
  - ✅ 視野カリング関数のテスト
  - ✅ 地平座標系変換のテスト
  - ✅ エッジケース（極座標、境界値）のテスト

**【✅】座標変換実装（Green）**
- ✅ lib/canvas/coordinateUtils.ts
- ✅ テストが通る最小限の実装
- ✅ 2つの投影法実装

**【】座標変換リファクタリング（Refactor）**
- パフォーマンス最適化
- コードの可読性向上
- すべてのテストがパスすることを確認

#### 3-2: 星描画ロジック（TDDサイクル）
**【✅】星描画テスト作成（Red）**
- ✅ `__tests__/lib/canvas/starRenderer.test.ts` 作成
  - ✅ 星の描画関数のテスト
  - ✅ 等級に応じたサイズ・明るさ計算のテスト
  - ✅ 色温度計算のテスト
  - ✅ 瞬きアニメーション関数のテスト
  - ✅ パフォーマンステスト（12万個の星を60fps）

**【✅】星描画実装（Green）**
- ✅ lib/canvas/starRenderer.ts
- ✅ テストが通る最小限の実装

**【】星描画リファクタリング（Refactor）**
- 描画アルゴリズムの最適化
- メモリ使用量の削減
- すべてのテストがパスすることを確認

#### 3-3: StarFieldコンポーネント（TDDサイクル）
**【】StarFieldテスト作成（Red）**
- `__tests__/components/StarField/StarField.test.tsx` 作成
  - ✅ コンポーネントのレンダリングテスト
  - ✅ ズーム機能のテスト
  - ✅ パン機能のテスト
  - ✅ タッチ操作のテスト
  - ✅ 投影モード切り替えのテスト

**【✅】StarField実装（Green）**
- ✅ components/StarField/StarField.tsx
- ✅ テストが通る最小限の実装

**【】StarFieldリファクタリング（Refactor）**
- インタラクション処理の最適化
- カスタムフック抽出（useStarField等）
- すべてのテストがパスすることを確認

#### 3-4: 星座線・グリッド描画
**【✅】星座線描画テスト作成（Red）**
- ✅ `__tests__/lib/canvas/constellationRenderer.test.ts`

**【✅】星座線描画実装（Green）**
- ✅ lib/canvas/constellationRenderer.ts

**【✅】グリッド描画**
- ✅ lib/canvas/gridRenderer.ts（座標グリッド描画）

---

### Phase 4: クイズ機能実装（予定工数: 9時間）

#### 4-1: クイズ生成ロジック（TDDサイクル）
**【】クイズ生成テスト作成（Red）**
- `__tests__/lib/data/quizGenerator.test.ts` 作成
  - generateQuiz関数のテスト
  - 難易度別クイズ生成のテスト
  - カテゴリー別クイズ生成のテスト
  - 選択肢生成アルゴリズムのテスト
  - ダミー選択肢の類似性テスト
  - 重複問題が生成されないことのテスト

**【】クイズ生成実装（Green）**
- lib/data/quizGenerator.ts
- テストが通る最小限の実装

**【】クイズ生成リファクタリング（Refactor）**
- アルゴリズムの最適化
- コードの可読性向上
- すべてのテストがパスすることを確認

#### 4-2: QuizContext（TDDサイクル）
**【】QuizContextテスト作成（Red）**
- `__tests__/context/QuizContext.test.tsx` 作成
  - クイズ状態管理のテスト
  - スコア更新のテスト
  - クイズ切り替えロジックのテスト
  - 回答処理のテスト

**【】QuizContext実装（Green）**
- context/QuizContext.tsx
- テストが通る最小限の実装

**【】QuizContextリファクタリング（Refactor）**
- 状態管理の最適化
- すべてのテストがパスすることを確認

#### 4-3: SettingsContext（TDDサイクル）
**【】SettingsContextテスト作成（Red）**
- `__tests__/context/SettingsContext.test.tsx` 作成
  - 設定状態管理のテスト
  - カテゴリー・難易度・出題数・音声設定のテスト

**【】SettingsContext実装（Green）**
- context/SettingsContext.tsx

**【】SettingsContextリファクタリング（Refactor）**

#### 4-4: クイズUIコンポーネント（TDDサイクル）
**【】QuizContainerテスト作成（Red）**
- `__tests__/components/Quiz/QuizContainer.test.tsx`
  - クイズフロー制御のテスト
  - スコア管理のテスト

**【】QuizQuestionテスト作成（Red）**
- `__tests__/components/Quiz/QuizQuestion.test.tsx`
  - 問題文表示のテスト
  - 星空・イラスト表示のテスト

**【】QuizChoicesテスト作成（Red）**
- `__tests__/components/Quiz/QuizChoices.test.tsx`
  - 選択肢ボタン表示のテスト
  - 回答処理のテスト
  - 正解・不正解フィードバックのテスト

**【】QuizResultテスト作成（Red）**
- `__tests__/components/Quiz/QuizResult.test.tsx`
  - 結果表示のテスト
  - 「詳しく見る」ボタンのテスト

**【】クイズUIコンポーネント実装（Green）**
- components/Quiz/QuizContainer.tsx
- components/Quiz/QuizQuestion.tsx
- components/Quiz/QuizChoices.tsx
- components/Quiz/QuizResult.tsx

**【】クイズUIリファクタリング（Refactor）**
- コンポーネント分割の最適化
- すべてのテストがパスすることを確認

---

### Phase 5: UI/UXコンポーネント実装（予定工数: 7時間）

#### 5-1: ScoreDisplayコンポーネント（TDDサイクル）
**【】ScoreDisplayテスト作成（Red）**
- `__tests__/components/Score/ScoreDisplay.test.tsx` 作成
  - スコア表示のテスト
  - 正解率パーセント表示のテスト
  - ビジュアル更新のテスト

**【】ScoreDisplay実装（Green）**
- components/Score/ScoreDisplay.tsx

**【】ScoreDisplayリファクタリング（Refactor）**

#### 5-2: ConstellationDetailコンポーネント（TDDサイクル）
**【】ConstellationDetailテスト作成（Red）**
- `__tests__/components/DetailModal/ConstellationDetail.test.tsx`
  - 星座情報表示のテスト
  - 神話・由来表示のテスト
  - 主要な星リスト表示のテスト

**【】ConstellationDetail実装（Green）**
- components/DetailModal/ConstellationDetail.tsx

**【】ConstellationDetailリファクタリング（Refactor）**

#### 5-3: StarDetailコンポーネント（TDDサイクル）
**【】StarDetailテスト作成（Red）**
- `__tests__/components/DetailModal/StarDetail.test.tsx`
  - 固有名情報表示のテスト
  - スペクトル型・等級・距離表示のテスト
  - 所属星座情報表示のテスト

**【】StarDetail実装（Green）**
- components/DetailModal/StarDetail.tsx

**【】StarDetailリファクタリング（Refactor）**

#### 5-4: SettingsPanelコンポーネント（TDDサイクル）
**【】SettingsPanelテスト作成（Red）**
- `__tests__/components/Settings/SettingsPanel.test.tsx`
  - カテゴリー選択UIのテスト
  - 難易度選択UIのテスト
  - 出題数設定UIのテスト
  - 音声ON/OFF切り替えのテスト

**【】SettingsPanel実装（Green）**
- components/Settings/SettingsPanel.tsx

**【】SettingsPanelリファクタリング（Refactor）**

---

### Phase 6: ページ・レイアウト実装（予定工数: 5時間）

#### 6-1: グローバルスタイル・レイアウト
**【✅】グローバルスタイル設定**
- ✅ app/globals.css
- ✅ 暗い背景色（夜空のような深い青〜黒）
- ✅ 白〜淡い色のテキスト
- ✅ カスタムフォント（Next.jsデフォルトフォント）

**【✅】ルートレイアウト**
- ✅ app/layout.tsx
- ✅ メタタグ設定
- ✅ フォント読み込み

#### 6-2: トップページ（TDDサイクル）
**【】トップページテスト作成（Red）**
- `__tests__/app/page.test.tsx` 作成
  - ページレンダリングのテスト
  - StarField配置のテスト
  - 投影モード切り替えのテスト
  - 観測モード切り替えのテスト
  - QuizContainer統合のテスト

**【✅】トップページ実装（Green）**
- ✅ app/page.tsx
- ✅ StarField配置
- ✅ 投影モード切り替えボタン
- ✅ 観測モード切り替えボタン
- ✅ 表示星数カウンター
- QuizContainer統合
- ScoreDisplay配置

**【】トップページリファクタリング（Refactor）**

#### 6-3: 設定画面（TDDサイクル）
**【】設定画面テスト作成（Red）**
- `__tests__/app/settings/page.test.tsx`
  - ページレンダリングのテスト
  - SettingsPanel配置のテスト

**【】設定画面実装（Green）**
- app/settings/page.tsx

**【】設定画面リファクタリング（Refactor）**

#### 6-4: 図鑑モード（TDDサイクル）
**【】図鑑モードテスト作成（Red）**
- `__tests__/app/encyclopedia/page.test.tsx`
  - ページレンダリングのテスト
  - 星座・星リスト表示のテスト
  - 詳細モーダル表示のテスト

**【】図鑑モード実装（Green）**
- app/encyclopedia/page.tsx

**【】図鑑モードリファクタリング（Refactor）**

---

### Phase 7: レスポンシブデザイン実装（予定工数: 4時間）

#### 7-1: レスポンシブデザインテスト（TDDサイクル）
**【】レスポンシブテスト作成（Red）**
- `__tests__/responsive/layout.test.tsx` 作成
  - スマホ縦持ちレイアウトのテスト
  - スマホ横持ちレイアウトのテスト
  - タブレットレイアウトのテスト
  - PCレイアウトのテスト
  - ブレークポイント切り替えのテスト

**【✅】レスポンシブ実装（Green）**（実装済み）
- ✅ Tailwind CSS設定でブレークポイント定義
- ✅ スマホ縦持ちレイアウト
- ✅ スマホ横持ちレイアウト
- ✅ タブレットレイアウト
- ✅ PCレイアウト

**【】レスポンシブリファクタリング（Refactor）**
- レイアウトコンポーネント抽出
- すべてのテストがパスすることを確認

---

### Phase 8: アニメーション実装（予定工数: 4時間）

#### 8-1: アニメーションテスト（TDDサイクル）
**【】アニメーションテスト作成（Red）**
- `__tests__/animations/transitions.test.tsx` 作成
  - フェードイン/アウトのテスト
  - スライドインのテスト
  - スケールアニメーションのテスト
  - ホバーエフェクトのテスト

**【】Framer Motionセットアップ（Green）**
- パッケージインストール
- 基本設定

**【✅】星の瞬きアニメーション**
- ✅ 星空描画エンジンに統合（時間ベースの輝度変動）

**【】画面遷移アニメーション実装（Green）**
- フェードイン/アウト（問題切り替え）
- スライドイン（モーダル表示）
- スケール（スコア更新）

**【✅】ホバー・クリックエフェクト**
- ✅ ボタンのインタラクション（Tailwind CSS transition使用）
- 星のハイライト

**【】アニメーションリファクタリング（Refactor）**

---

### Phase 9: パフォーマンス最適化（予定工数: 4時間）

#### 9-1: パフォーマンステスト（TDDサイクル）
**【】パフォーマンステスト作成（Red）**
- `__tests__/performance/rendering.test.ts` 作成
  - 描画パフォーマンステスト（60fps維持）
  - メモリリークテスト
  - React再レンダリング検証テスト

**【✅】描画最適化実装（Green）**
- ✅ 視野カリング実装
- ✅ 等級フィルタリング
- LOD（Level of Detail）実装
- デバウンス・スロットリング

**【🔶】React最適化実装（Green）**
- 🔶 React.memo、useMemo、useCallback適用
- 🔶 不要な再レンダリング削減

**【】画像遅延読み込み実装（Green）**
- lib/utils/imageLoader.ts
- 星座イラストの遅延ロード
- 次の問題のプリロード

**【】パフォーマンスリファクタリング（Refactor）**
- Lighthouse監査実施
- パフォーマンススコア確認
- 改善点の特定と対応

---

### Phase 10: E2Eテスト実装（予定工数: 3時間）

#### 10-1: E2Eテストセットアップ
**【】Playwright/Cypressセットアップ**
- パッケージインストール
- 設定ファイル作成

#### 10-2: E2Eテストシナリオ（TDDサイクル）
**【】E2Eテスト作成（Red）**
- `e2e/quiz-flow.spec.ts` 作成
  - トップページ→クイズ回答→スコア確認フロー
  - レスポンシブ動作確認
  - 設定変更フロー
  - 図鑑モード閲覧フロー

**【】E2E対応実装（Green）**
- テストが通る最小限の実装

**【】E2Eリファクタリング（Refactor）**
- すべてのE2Eテストがパスすることを確認

---

### Phase 11: 最終調整・デプロイ準備（予定工数: 3時間）

#### 11-1: エラーハンドリング（TDDサイクル）
**【】エラーハンドリングテスト作成（Red）**
- `__tests__/error-handling/data-loading.test.ts` 作成
  - データロード失敗時の処理テスト
  - Canvas非対応ブラウザ対応テスト
  - ネットワークエラーハンドリングテスト

**【】エラーハンドリング実装（Green）**
- データロード失敗時の処理
- Canvas非対応ブラウザ対応
- エラーバウンダリ実装

**【】エラーハンドリングリファクタリング（Refactor）**

#### 11-2: ドキュメント・ビルド
**【✅】README作成**
- ✅ プロジェクト説明（基本情報記載済み）
- セットアップ手順
- 使用技術一覧
- テスト実行方法
- デプロイ手順

**【】ビルド確認**
- `npm run build` 成功確認
- ビルドサイズ確認
- 全テストパス確認

**【】デプロイ準備**
- Vercel設定ファイル作成
- 環境変数設定

---

## 📊 総工数見積もり（TDD準拠版）
| フェーズ | 旧工数 | 新工数 | 変更理由 |
|---------|-------|-------|---------|
| Phase 0: テスト環境構築 | - | **2時間** | **新規追加（Jest等セットアップ）** |
| Phase 1: 環境構築とデータ準備 | 4時間 | **5時間** | データ準備+1時間 |
| Phase 2: データローダー実装 | 3時間 | **4時間** | テスト作成+1時間 |
| Phase 3: 星空描画エンジン実装 | 8時間 | **12時間** | テスト作成+4時間 |
| Phase 4: クイズ機能実装 | 6時間 | **9時間** | テスト作成+3時間 |
| Phase 5: UI/UXコンポーネント実装 | 5時間 | **7時間** | テスト作成+2時間 |
| Phase 6: ページ・レイアウト実装 | 4時間 | **5時間** | テスト作成+1時間 |
| Phase 7: レスポンシブデザイン実装 | 3時間 | **4時間** | テスト作成+1時間 |
| Phase 8: アニメーション実装 | 3時間 | **4時間** | テスト作成+1時間 |
| Phase 9: パフォーマンス最適化 | 3時間 | **4時間** | パフォーマンステスト+1時間 |
| Phase 10: E2Eテスト実装 | 4時間 | **3時間** | E2E専門化で-1時間 |
| Phase 11: 最終調整・デプロイ準備 | 2時間 | **3時間** | エラーハンドリングテスト+1時間 |
| **合計** | **45時間** | **62時間** | **TDD対応で+17時間** |

### 工数増加の内訳
- **Phase 0新規追加**: +2時間（テスト環境構築）
- **各Phaseテスト追加**: +15時間（Phase 1-9でテスト作成）
- **Phase 10専門化**: -1時間（E2E専門化により効率化）
- **Phase 11エラーテスト**: +1時間

---

## 🎯 マイルストーン（TDD準拠版）
- **M0（Phase 0完了）**: テスト環境構築完了、Jestセットアップ完了
- **M1（Phase 1-2完了）**: データ準備完了、ローダー実装完了（全テストパス）
- **M2（Phase 3完了）**: 星空描画エンジン完成（全テストパス）
- **M3（Phase 4-5完了）**: クイズ機能・UI完成（全テストパス）
- **M4（Phase 6-8完了）**: 全ページ・アニメーション完成（全テストパス）
- **M5（Phase 9-11完了）**: 最適化・E2Eテスト完了、デプロイ可能（**全テストパス必須**）

---

## ✅ 承認
この実装計画書は技術設計書（02_technical-design.md v2.0）に基づき、**TDD（Test-Driven Development）**のRed-Green-Refactorサイクルを厳守して実装を行います。要件定義書（01_requirements.md v2.0）のすべての要件を満たし、テスト駆動で品質を保証します。

- **作成日**: 2025-10-18
- **バージョン**: 3.0（TDD準拠版）
- **開発手法**: TDD（Test-Driven Development）
- **準拠技術設計**: 02_technical-design.md v2.0
- **準拠要件定義**: 01_requirements.md v2.0
- **更新日**: 2025-10-18（TDD準拠に全面改訂）

---

## 📝 TDD実装ルール

### 必須ルール
1. **Red → Green → Refactor の順序を厳守**
   - テストを先に書く（Red）
   - 最小限の実装でテストを通す（Green）
   - リファクタリングはテストが通った後のみ（Refactor）

2. **各Phaseの完了条件**
   - 全てのテストがパスしていること
   - コードカバレッジ80%以上を目標
   - テストが失敗している状態でPhaseを完了しない

3. **コミット規律**
   - テストが通った状態でのみコミット
   - 構造変更と動作変更を同一コミットに含めない
   - コミットメッセージにテスト結果を明記

4. **品質保証**
   - すべての機能にテストを書く
   - エッジケース・境界値テストを含める
   - パフォーマンステストも実装する
