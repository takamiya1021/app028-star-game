# 実装計画書：Stellarium Quiz（TDD準拠版）

## 📋 概要
技術設計書（02_technical-design.md v2.2）に基づき、**TDD（Test-Driven Development）**のRed-Green-Refactorサイクルで段階的に実装を進める計画書。

## 🔁 TDDサイクルの原則
各機能実装は必ず以下の順序で進める：
1. **Red（失敗）**: テストを先に書く（失敗することを確認）
2. **Green（成功）**: テストを通す最小限の実装
3. **Refactor（改善）**: テストが通った状態でコードを改善

---

## 🧪 テスト運用ルール
Red / Green / Refactor の各フェーズで実施するテスト手順を明文化しておく。チェックリスト内の「テスト作成」「実装」「リファクタリング」は、ここで定義した手順を踏んだことを意味する。

- **Red（失敗する状態を作る）**
  - 対象機能のテストケースを追加／更新し、まだ実装していないために失敗することを明示的に確認する。
  - 原則として `npm test -- --runTestsByPath <対象ファイル>` または該当スイートを個別実行し、真っ赤な状態をスクリーンショットまたはログで記録する。
  - 既存テストが想定外に落ちた場合は一度原因を切り分け、Red フェーズで直すのは新規・変更テストのみとする。

- **Green（最小実装・成功確認）**
  - 実装後に Red で使ったのと同じテストコマンドを実行し、該当テストが緑になることを必ず確認する。
  - 影響範囲が広い場合は関連コンポーネントのテストスイート、または `npm run test -- --runInBand`・`npm run lint` を併用して回帰がないことをその都度チェックする。
  - チェックリストの「Green」項目が `[x]` になっているのは、当該テスト群が緑で通ったログを残したことを示す。

- **Refactor（改善後の回帰確認）**
  - 目的のリファクタリングが完了するたびに、少なくとも該当モジュールのテスト＋静的解析（lint）を再実行して回帰がないことを保証する。
  - 大きめのリファクタリングでは `npm run test` で全体を流し、必要に応じて Playwright などのE2Eもスポット実行する。
  - リファクタリング項目が `[x]` のものは、元の Red/Green テストを再実行して全てパスしたことを意味する。

> **補足**  
> - 各フェーズのチェックボックスは「テストを実際に走らせた」ことまで含めて完了扱いにしている。  
> - テストログは `doc/testing/` 配下に都度保存し、いつでも Red→Green→Refactor の履歴を追えるようにする。

---

## 🎯 実装フェーズ

### Phase 0: テスト環境構築（予定工数: 2時間）
**【✅】Jestセットアップ（Red）**
- [x] package.json にテスト関連依存追加
  - `jest`, `@testing-library/react`, `@testing-library/jest-dom`
  - `@testing-library/user-event`, `jest-environment-jsdom`

**【✅】Jest設定ファイル作成（Green）**
- [x] `jest.config.js` 作成
- [x] `jest.setup.js` 作成
- [x] TypeScript対応設定

**【✅】テストスクリプト追加（Green）**
- [x] `"test": "jest"`
- [x] `"test:watch": "jest --watch"`
- [x] `"test:coverage": "jest --coverage"`

**【✅】サンプルテスト実行確認（Refactor）**
- [x] 簡単なテストケース作成して動作確認（5件全てパス）
- CI/CD連携準備

---

### Phase 1: 環境構築とデータ準備（予定工数: 5時間）
**【✅】Next.jsプロジェクト初期化**
- [x] create-next-appでプロジェクト作成
- [x] TypeScript、Tailwind CSS設定
- [x] ESLint、Prettier設定

**【✅】Hipparcos星表データ取得（9等星まで・約12万個）**
- [x] データソース調査・取得
- [x] JSON形式への変換
- [x] public/data/stars.json作成（肉眼観測モード：7等まで、約14,000個）
- [x] public/data/stars-10mag.json作成（天の川モード：9等まで、120,282個）

**【✅】88星座データ準備**
- [x] IAU認定88星座リスト作成
- [x] 日本語名・神話・季節情報追加
- [x] public/data/constellations.json作成（88星座完全版）

**【✅】星座線データ取得**
- [x] Stellarium constellationship.fab取得
- [x] JSON形式への変換
- [x] public/data/constellation-lines.json作成

**【✅】IAU固有名星データ準備**
- [x] IAU固有名リスト取得
- [x] Hipparcos IDとマッピング
- [x] public/data/named-stars.json作成

---

### Phase 2: データローダー実装（予定工数: 4時間）
**【✅】型定義作成**
- [x] types/star.ts（Star型）
- [x] types/constellation.ts（Constellation型）
- [x] types/quiz.ts（Quiz型）
- [x] types/observationMode.ts（観測モード型）

**【✅】データローダーテスト作成（Red）**
- [x] `__tests__/lib/data/starsLoader.test.ts` 作成
  - [x] 星データ正常読み込みのテスト
  - [x] 等級フィルタリングのテスト
  - [x] データ整合性検証のテスト
- [x] `__tests__/lib/data/constellationsLoader.test.ts` 作成
  - [x] 星座データ正常読み込みのテスト
- [x] `__tests__/lib/data/constellationLinesLoader.test.ts` 作成
  - [x] 星座線データ正常読み込みのテスト

**【✅】データローダー実装（Green）**
- [x] lib/data/starsLoader.ts（現状：直接import → テスト可能な形に変更）
- [x] lib/data/constellationsLoader.ts
- [x] lib/data/constellationLinesLoader.ts
- [x] テストが通る最小限の実装

**【✅】データローダーリファクタリング（Refactor）**
- [x] 共通キャッシュユーティリティ（createCachedJsonLoader）導入
- [x] fetcher経由時のHTTPエラーを明示化
- [x] 星・星座・星座線ローダーでキャッシュクリアAPIを統一
- [x] 既存テストパスを確認

---

### Phase 3: 星空描画エンジン実装（予定工数: 12時間）

#### 3-1: 座標変換ユーティリティ（TDDサイクル）
**【✅】座標変換テスト作成（Red）**
- [x] `__tests__/lib/canvas/coordinateUtils.test.ts` 作成
  - [x] 天球座標→スクリーン座標変換のテスト
  - [x] Orthographic投影のテスト
  - [x] Stereographic投影のテスト
  - [x] 視野カリング関数のテスト
  - [x] 地平座標系変換のテスト
  - [x] エッジケース（極座標、境界値）のテスト

**【✅】座標変換実装（Green）**
- [x] lib/canvas/coordinateUtils.ts
- [x] テストが通る最小限の実装
- [x] 2つの投影法実装

**【✅】座標変換リファクタリング（Refactor）**
- [x] 角度変換・正規化ヘルパーを導入し重複計算を削減
- [x] 三角関数結果の再利用で演算量を抑制
- [x] `coordinateUtils.test.ts` を再実行し回帰なしを確認

#### 3-2: 星描画ロジック（TDDサイクル）
**【✅】星描画テスト作成（Red）**
- [x] `__tests__/lib/canvas/starRenderer.test.ts` 作成
  - [x] 星の描画関数のテスト
  - [x] 等級に応じたサイズ・明るさ計算のテスト
  - [x] 色温度計算のテスト
  - [x] 瞬きアニメーション関数のテスト
  - [x] パフォーマンステスト（12万個の星を60fps）

**【✅】星描画実装（Green）**
- [x] lib/canvas/starRenderer.ts
- [x] テストが通る最小限の実装

**【✅】星描画リファクタリング（Refactor）**
- [x] 描画アルゴリズムの最適化（描画順の一括ソート、オーバーレイ制御）
- [x] メモリ使用量の削減（filterの多重実行を解消）
- [x] すべてのテストがパスすることを確認

#### 3-3: StarFieldコンポーネント（TDDサイクル）
**【✅】StarFieldテスト作成（Red）**
- [x] `__tests__/components/StarField/StarField.test.tsx` 作成
  - [x] コンポーネントのレンダリングテスト
  - [x] ズーム機能のテスト
  - [x] パン機能のテスト
  - [x] タッチ操作のテスト
  - [x] 投影モード切り替えのテスト

**【✅】StarField実装（Green）**
- [x] components/StarField/StarField.tsx
- [x] テストが通る最小限の実装

**【✅】StarFieldリファクタリング（Refactor）**
- [x] インタラクション処理の最適化（イベントハンドラの安定化、ResizeObserver導入）
- [x] カスタムフック抽出検討（不要と判断、代わりに各種 useRef 管理を導入）
- [x] すべてのテストがパスすることを確認

#### 3-4: 星座線・グリッド描画
**【✅】星座線描画テスト作成（Red）**
- [x] `__tests__/lib/canvas/constellationRenderer.test.ts`

**【✅】星座線描画実装（Green）**
- [x] lib/canvas/constellationRenderer.ts

**【✅】グリッド描画**
- [x] lib/canvas/gridRenderer.ts（座標グリッド描画）

---

### Phase 4: クイズ機能実装（予定工数: 9時間）

#### 4-1: クイズ生成ロジック（TDDサイクル）
**【✅】クイズ生成テスト作成（Red）**
- [x] `__tests__/lib/data/quizGenerator.test.ts` 作成
  - [x] generateQuiz関数のテスト
  - [x] 難易度別クイズ生成のテスト
  - [x] カテゴリー別クイズ生成のテスト
  - [x] 選択肢生成アルゴリズムのテスト
  - [x] ダミー選択肢の類似性テスト
  - [x] 重複問題が生成されないことのテスト

**【✅】クイズ生成実装（Green）**
- [x] lib/data/quizGenerator.ts
- [x] テストが通る最小限の実装

**【✅】クイズ生成リファクタリング（Refactor）**
- [x] ランダム抽出ヘルパー・星名取得ヘルパーを導入して重複ロジックを除去
- [x] 余分な配列生成を削減しつつ挙動を維持
- [x] `quizGenerator.test.ts` で回帰なしを確認

#### 4-2: QuizContext（TDDサイクル）
**【✅】QuizContextテスト作成（Red）**
- [x] `__tests__/context/QuizContext.test.tsx` 作成
  - [x] クイズ状態管理のテスト
  - [x] スコア更新のテスト
  - [x] クイズ切り替えロジックのテスト
  - [x] 回答処理のテスト

**【✅】QuizContext実装（Green）**
- [x] context/QuizContext.tsx
- [x] テストが通る最小限の実装

**【✅】QuizContextリファクタリング（Refactor）**
- [x] アクションディスパッチの安定化（useCallbackでラップ）
- [x] 二重ロード防止と未マウント状態の更新防止をQuizContainer側で実装
- [x] テストの追加で再入防止とエッジケースを検証

#### 4-3: SettingsContext（TDDサイクル）
**【✅】SettingsContextテスト作成（Red）**
- [x] `__tests__/context/SettingsContext.test.tsx` 作成
  - [x] 設定状態管理のテスト
  - [x] カテゴリー・難易度・出題数・音声設定のテスト

**【✅】SettingsContext実装（Green）**
- [x] context/SettingsContext.tsx

**【✅】SettingsContextリファクタリング（Refactor）**
- [x] 設定更新時のバリデーション追加（不正値の除外）
- [x] 既存テスト拡張で制約チェックを自動化

#### 4-4: クイズUIコンポーネント（TDDサイクル）
**【✅】QuizContainerテスト作成（Red）**
- [x] `__tests__/components/Quiz/QuizContainer.test.tsx`
  - [x] クイズフロー制御のテスト
  - [x] スコア管理とエラーハンドリングのテスト

**【✅】QuizQuestionテスト作成（Red）**
- [x] `__tests__/components/Quiz/QuizQuestion.test.tsx`
  - [x] 問題文表示のテスト
  - [x] ビジュアルヒント案内のテスト

**【✅】QuizChoicesテスト作成（Red）**
- [x] `__tests__/components/Quiz/QuizChoices.test.tsx`
  - [x] 選択肢ボタン表示のテスト
  - [x] 回答処理のテスト
  - [x] 選択状態フィードバックのテスト

**【✅】QuizResultテスト作成（Red）**
- [x] `__tests__/components/Quiz/QuizResult.test.tsx`
  - [x] 結果表示のテスト
  - [x] 次のクイズへボタンのテスト

**【✅】クイズUIコンポーネント実装（Green）**
- [x] components/Quiz/QuizContainer.tsx
- [x] components/Quiz/QuizQuestion.tsx
- [x] components/Quiz/QuizChoices.tsx
- [x] components/Quiz/QuizResult.tsx

**【✅】クイズUIリファクタリング（Refactor）**
- [x] QuizContainerのロード多重起動防止・未マウントガード追加
- [x] 次へボタン多重クリック時のテスト追加
- [x] 状態遷移のテストカバレッジ拡充

---

### Phase 5: UI/UXコンポーネント実装（予定工数: 7時間）

#### 5-1: ScoreDisplayコンポーネント（TDDサイクル）
**【✅】ScoreDisplayテスト作成（Red）**
- [x] `__tests__/components/Score/ScoreDisplay.test.tsx` 作成
  - [x] スコア表示のテスト
  - [x] 正解率パーセント表示のテスト
  - [x] ストリーク表示のテスト

**【✅】ScoreDisplay実装（Green）**
- [x] components/Score/ScoreDisplay.tsx
- [x] パーセント／プログレスバー描画

**【✅】ScoreDisplayリファクタリング（Refactor）**
- [x] ラベル／クラス名カスタマイズ対応
- [x] パーセント計算の安全化・ヘルパー抽出

#### 5-2: ConstellationDetailコンポーネント（TDDサイクル）
**【✅】ConstellationDetailテスト作成（Red）**
- [x] `__tests__/components/DetailModal/ConstellationDetail.test.tsx`
  - [x] 星座情報表示のテスト
  - [x] 神話・由来表示のテスト
  - [x] 主要な星リスト表示のテスト

**【✅】ConstellationDetail実装（Green）**
- [x] components/DetailModal/ConstellationDetail.tsx
- [x] 半球ラベル・難易度表示・恒星リスト整備

**【✅】ConstellationDetailリファクタリング（Refactor）**
- [x] DetailSectionコンポーネント導入でUI構造を共通化
- [x] 恒星リスト生成・ラベル算出をuseMemo化

#### 5-3: StarDetailコンポーネント（TDDサイクル）
**【✅】StarDetailテスト作成（Red）**
- [x] `__tests__/components/DetailModal/StarDetail.test.tsx`
  - [x] 固有名情報表示のテスト
  - [x] スペクトル型・等級・距離表示のテスト
  - [x] 所属星座情報表示のテスト

**【✅】StarDetail実装（Green）**
- [x] components/DetailModal/StarDetail.tsx
- [x] 距離換算ロジック・識別番号表示を実装

**【✅】StarDetailリファクタリング（Refactor）**
- [x] DetailSection再利用でレイアウト統一
- [x] 識別番号／スペクトル情報のフォーマットをuseMemoに集約

#### 5-4: SettingsPanelコンポーネント（TDDサイクル）
**【✅】SettingsPanelテスト作成（Red）**
- [x] `__tests__/components/Settings/SettingsPanel.test.tsx`
  - [x] カテゴリー選択UIのテスト
  - [x] 難易度選択UIのテスト
  - [x] 出題数設定UIのテスト
  - [x] 音声ON/OFF切り替えのテスト

**【✅】SettingsPanel実装（Green）**
- [x] components/Settings/SettingsPanel.tsx
- [x] 設定リセットボタンとコンテキスト連携を実装

**【✅】SettingsPanelリファクタリング（Refactor）**
- [x] セレクト項目を定数化して再利用性向上
- [x] UI構造は現状維持でコンテキスト連携の簡潔化を確認

#### 5-5: モバイルUI最適化（追加タスク）
**【✅】スマホ向けUI再設計（Red）**
- [x] StarField操作系をボトムドックへ再配置（ワンハンド操作対応）
- [x] ボタン／トグルを44px以上のタップ領域に拡大
- [x] クイズアクセス導線をモバイルモーダル化

**【✅】スマホ向けUI実装（Green）**
- [x] ボトムコントロールドック実装（投影・観測切替／星数表示）
- [x] モバイル専用クイズモーダルとスコア表示を追加
- [x] レスポンシブレイアウトの調整（Tailwindブレークポイント適用）

**【✅】スマホ向けUIリファクタリング（Refactor）**
- [x] 操作用UIを共通スタイル化＆アクセシビリティ属性付与
- [x] スコア・クイズ表示をdesktop/mobileで共通ロジック化
- [x] 全テスト通過を確認

---

### Phase 6: ページ・レイアウト実装（予定工数: 5時間）

#### 6-1: グローバルスタイル・レイアウト
**【✅】グローバルスタイル設定**
- [x] app/globals.css
- [x] 暗い背景色（夜空のような深い青〜黒）
- [x] 白〜淡い色のテキスト
- [x] カスタムフォント（Next.jsデフォルトフォント）

**【✅】ルートレイアウト**
- [x] app/layout.tsx
- [x] メタタグ設定
- [x] フォント読み込み

#### 6-2: トップページ（TDDサイクル）
**【✅】トップページテスト作成（Red）**
- [x] `__tests__/app/page.test.tsx` 作成
  - [x] ページレンダリングのテスト
  - [x] StarField配置のテスト
  - [x] 投影モード・観測モード切り替えテスト
  - [x] QuizContainer統合のテスト

**【✅】トップページ実装（Green）**
- [x] app/page.tsx
- [x] StarField配置
- [x] 投影モード切り替えボタン
- [x] 観測モード切り替えボタン
- [x] 表示星数カウンター
- QuizContainer統合
- ScoreDisplay配置

**【✅】トップページリファクタリング（Refactor）**
- [x] モバイルドック／デスクトップサイドパネルの二軸構成へ再整理
- [x] ScoreDisplay・QuizContainerのUI統合を実施
- [x] useBreakpoint導入でモーダル挙動をブレークポイント連動化

#### 6-3: 設定画面（TDDサイクル）
**【✅】設定画面テスト作成（Red）**
- [x] `__tests__/app/settings/page.test.tsx`
  - [x] ページレンダリングのテスト
  - [x] SettingsPanel配置のテスト

**【✅】設定画面実装（Green）**
- [x] app/settings/page.tsx
- [x] SettingsPanelの埋め込みとメタ情報の定義

**【✅】設定画面リファクタリング（Refactor）**
- [x] PageHeaderコンポーネント導入でレイアウト共通化
- [x] UI構造を簡潔化しアクセシビリティを確認

#### 6-4: 図鑑モード（TDDサイクル）
**【✅】図鑑モードテスト作成（Red）**
- [x] `__tests__/app/encyclopedia/page.test.tsx`
  - [x] ページレンダリングのテスト
  - [x] 星座・星リスト表示のテスト
  - [x] 詳細モーダル表示のテスト

**【✅】図鑑モード実装（Green）**
- [x] app/encyclopedia/page.tsx
- [x] app/encyclopedia/EncyclopediaClient.tsx（ConstellationDetail/StarDetail再利用）

**【✅】図鑑モードリファクタリング（Refactor）**
- [x] PageHeader再利用とConstellationModal抽出で責務分離
- [x] 星座カード／モーダルのアクセシビリティ属性を整理

---

### Phase 7: レスポンシブデザイン実装（予定工数: 4時間）

#### 7-1: レスポンシブデザインテスト（TDDサイクル）
**【✅】レスポンシブテスト作成（Red）**
- [x] `__tests__/responsive/layout.test.tsx` 作成
  - [x] 主要ページのレスポンシブclass確認テスト
  - [x] クイズ操作ドックのブレークポイント検証
  - [x] 図鑑モーダル表示時のレイアウト確認

**【✅】レスポンシブ実装（Green）**（実装済み）
- [x] Tailwind CSS設定でブレークポイント定義
- [x] スマホ縦持ちレイアウト
- [x] スマホ横持ちレイアウト
- [x] タブレットレイアウト
- [x] PCレイアウト

**【✅】レスポンシブリファクタリング（Refactor）**
- [x] PageHeader・ConstellationModalでレイアウト共通化
- [x] ボトムドックの挙動を `useBreakpoint` で自動調整（モバイル→デスクトップ切替時にモーダル自動クローズ）
- [x] 新規レスポンシブテストと既存スイートがすべてパスすることを確認

---

### Phase 8: アニメーション実装（予定工数: 4時間）

#### 8-1: アニメーションテスト（TDDサイクル）
**【✅】アニメーションテスト作成（Red）**
- [x] `__tests__/components/Animate/FadeIn.test.tsx` 作成
  - [x] フェードインの初期状態・要素切替を検証

**【✅】Framer Motionセットアップ（Green）**
- [x] FadeIn / PageTransition コンポーネントを実装
- [x] 既存ページへ導入

**【✅】星の瞬きアニメーション**
- [x] 星空描画エンジンに統合（時間ベースの輝度変動）

**【✅】画面遷移アニメーション実装（Green）**
- [x] PageTransition で各ページコンテンツのフェードインを実装
- [x] FadeIn でクイズモーダル／検索バーなどのトランジションを追加
- [x] QuizContainer や SettingsPanel をアニメーション表示

**【✅】ホバー・クリックエフェクト**
- [x] ボタンのインタラクション（Tailwind CSS transition使用）
- 星のハイライト

**【✅】アニメーションリファクタリング（Refactor）**
- [x] 共通モーション設定 `lib/ui/motion.ts` を導入し、FadeIn/PageTransition で再利用
- [x] テストスイートで回帰確認

---

### Phase 9: パフォーマンス最適化（予定工数: 4時間）

#### 9-1: パフォーマンステスト（TDDサイクル）
**【✅】パフォーマンステスト作成（Red）**
- [x] `__tests__/performance/rendering.test.ts` で計測項目を test.todo として定義
- [x] `doc/performance/rendering-plan.md` に計測指標とケースを整理

**【✅】パフォーマンス測定実装（Green）**
- [x] drawStarsObserver を導入し、描画時間を計測可能に
- [x] Jest ベースで標準負荷時の実測値を記録（doc/performance/results-20251019.md）

**【✅】描画最適化実装（Green）**
- [x] 視野カリング実装
- [x] 等級フィルタリング
- [x] LOD（背景星サンプリング）実装
- [x] パン操作を16ms間隔にスロットリング

**【🔶】React最適化実装（Green）**
- [ ] React.memo、useMemo、useCallback適用
- [ ] 不要な再レンダリング削減

**【✅】画像遅延読み込み実装（Green）**
- [x] ConstellationDetail で Next Image を使用し `loading=\"lazy\"` を適用
- [x] Jest モックを追加しテストで検証

**【】パフォーマンスリファクタリング（Refactor）**
- Lighthouse監査実施
- パフォーマンススコア確認
- 改善点の特定と対応

---

### Phase 10: E2Eテスト実装（予定工数: 3時間）

#### 10-1: E2Eテストセットアップ
**【✅】Playwright/Cypressセットアップ**
- [x] `@playwright/test` 導入・基本設定 (`playwright.config.ts`)
- [x] `tests/e2e/home.spec.ts` でホーム画面スモークテスト追加
- [ ] ブラウザ取得は `~/.cache/ms-playwright` の所有権修正後に `npx playwright install chromium`
- パッケージインストール
- 設定ファイル作成

#### 10-2: E2Eテストシナリオ（TDDサイクル）
**【✅】E2Eテスト作成（Red）**
- [x] `tests/e2e/home.spec.ts` と `tests/e2e/quiz-flow.spec.ts` を追加
  - ホーム表示確認
  - クイズ回答→スコア加算
  - モバイルパネル起動

**【✅】E2E対応実装（Green）**
- [x] `QuizContainer` に E2E 用キューを用意して deterministic テストを実現

**【✅】E2Eリファクタリング（Refactor）**
- [x] Playwright 専用ブラウザパスを設定し CI/ローカル両対応を確認

---

### Phase 11: 最終調整・デプロイ準備（予定工数: 3時間）

#### 11-1: エラーハンドリング（TDDサイクル）
**【✅】エラーハンドリングテスト作成（Red）**
- [x] `__tests__/error-handling/data-loading.test.ts` 作成
  - [x] データロード失敗時の処理テスト
  - [x] Canvas非対応ブラウザ対応テスト
  - [x] ネットワークエラーハンドリングテスト

**【✅】エラーハンドリング実装（Green）**
- [x] データロード失敗時の処理
- [x] Canvas非対応ブラウザ対応
- [x] エラーバウンダリ実装

**【✅】エラーハンドリングリファクタリング（Refactor）**

#### 11-2: ドキュメント・ビルド
**【✅】README作成**
- [x] プロジェクト説明（基本情報記載済み）
- [x] セットアップ手順
- [x] 使用技術一覧
- [x] テスト実行方法
- [x] デプロイ手順

**【✅】ビルド確認**
- [x] `npm run build` 成功確認
- [x] ビルドサイズ確認
- [x] 全テストパス確認

**【✅】デプロイ準備**
- [x] Vercel設定ファイル作成
- [x] 環境変数設定

---

### Phase 12: PWA対応（予定工数: 3時間）

#### 12-1: manifest.json作成（TDDサイクル）
**【　】manifest.jsonバリデーションテスト作成（Red）**
- `__tests__/pwa/manifest.test.ts` 作成
  - manifest.jsonが正しく読み込めるかテスト
  - 必須フィールド（name, short_name, icons等）の存在確認
  - アイコンパスの有効性テスト

**【　】manifest.json作成（Green）**
- `public/manifest.json` 作成
  - アプリ名: "Stellarium Quiz"
  - 短縮名: "星座クイズ"
  - background_color: "#0a0e27"（深い青）
  - theme_color: "#1a1f3a"（プラネタリウム風）
  - display: "standalone"
  - icons配列（192x192, 512x512）

**【　】manifest.jsonリファクタリング（Refactor）**
- メタデータの最適化
- テストパス確認

#### 12-2: アイコン準備
**【　】アイコン画像作成**
- `public/icons/icon-192x192.png` 作成
  - デザイン: 星空・星座モチーフ
  - サイズ: 192x192px
- `public/icons/icon-512x512.png` 作成
  - デザイン: 同上（高解像度版）
  - サイズ: 512x512px

**【　】アイコンファイル検証**
- ファイルサイズ確認
- 画質確認

#### 12-3: Service Worker実装（TDDサイクル）
**【　】Service Workerテスト作成（Red）**
- `__tests__/pwa/service-worker.test.ts` 作成
  - Service Worker登録テスト
  - キャッシュ戦略テスト（Cache First）
  - fetch eventハンドリングテスト

**【　】Service Worker実装（Green）**
- `public/sw.js` 作成
  - install eventでキャッシュ作成
  - activate eventで古いキャッシュ削除
  - fetch eventでCache Firstキャッシュ戦略実装
  - キャッシュ対象:
    - `/`（トップページ）
    - `/globals.css`
    - `/data/stars.json`
    - `/data/constellations.json`
    - `/data/constellation-lines.json`

**【　】Service Workerリファクタリング（Refactor）**
- キャッシュ名のバージョン管理
- エラーハンドリング強化
- テストパス確認

#### 12-4: Service Worker登録（TDDサイクル）
**【　】Service Worker登録テスト作成（Red）**
- `__tests__/app/layout.test.tsx` にSW登録テスト追加
  - navigator.serviceWorkerの存在確認
  - 登録成功ケーステスト
  - 登録失敗ケーステスト

**【　】app/layout.tsx修正（Green）**
- useEffectでService Worker登録
- 成功時のログ出力
- 失敗時のエラーハンドリング

**【　】登録処理リファクタリング（Refactor）**
- エラーハンドリング改善
- テストパス確認

#### 12-5: PWA動作確認
**【　】ローカルテスト**
- Lighthouse PWA監査実行
- Chrome DevToolsでmanifest.json確認
- Service Workerの動作確認
- キャッシュ動作確認

**【　】インストールテスト**
- ブラウザの「インストール」プロンプト表示確認
- ホーム画面への追加動作確認
- standalone表示確認

**【　】オフライン動作テスト**
- キャッシュされたページのオフライン表示確認
- ネットワークなし時の挙動確認

---

### Phase 13: 新クイズ機能実装（予定工数: 15時間）

#### 13-1: Quiz型定義の拡張（TDDサイクル）
**【　】Quiz型拡張テスト作成（Red）**
- `__tests__/types/quiz.test.ts` 作成
  - 新しいQuizType（find-star, brightness, constellation, color, distance）のバリデーションテスト
  - viewCenter, zoomLevel, targetStar等の新フィールドテスト

**【　】Quiz型定義拡張（Green）**
- `types/quiz.ts` 修正
  - QuizType型を拡張（5種類のクイズタイプ）
  - Quiz interfaceに星空連動情報フィールド追加（viewCenter, zoomLevel, targetStar, targetConstellation, compareStar, explanation）
  - questionType に 'interactive' を追加

**【　】Quiz型リファクタリング（Refactor）**
- 型安全性の向上
- テストパス確認

#### 13-2: クイズ生成ロジック実装（TDDサイクル）

**Phase 1クイズ（体験型）**

**【　】「この星を探せ！」クイズテスト作成（Red）**
- `__tests__/lib/data/quizGenerator/findStarQuiz.test.ts` 作成
  - 難易度別の星フィルタリングテスト
  - viewCenter, zoomLevelの正しい設定テスト

**【　】「この星を探せ！」クイズ実装（Green）**
- `lib/data/quizGenerator/findStarQuiz.ts` 作成
  - generateFindStarQuiz関数実装
  - 難易度別等級フィルタ（Easy: 1.5等以下、Medium: 2.5等以下、Hard: 4.0等以下）

**【　】「この星を探せ！」クイズリファクタリング（Refactor）**

**【　】明るさ比べクイズテスト作成（Red）**
- `__tests__/lib/data/quizGenerator/brightnessQuiz.test.ts` 作成
  - 2つの星の選択テスト
  - 等級差による難易度調整テスト
  - calculateMidpoint, calculateZoomForTwoStarsのテスト

**【　】明るさ比べクイズ実装（Green）**
- `lib/data/quizGenerator/brightnessQuiz.ts` 作成
  - generateBrightnessQuiz関数実装
  - calculateMidpoint, calculateZoomForTwoStars実装

**【　】明るさ比べクイズリファクタリング（Refactor）**

**Phase 2クイズ（ビジュアル＆知識系）**

**【　】星座の形当てクイズテスト作成（Red）**
- `__tests__/lib/data/quizGenerator/constellationQuiz.test.ts` 作成（既存修正）
  - 星座中心・ズーム計算テスト
  - calculateConstellationCenter, calculateZoomForConstellationのテスト

**【　】星座の形当てクイズ実装（Green）**
- `lib/data/quizGenerator/constellationQuiz.ts` 作成（既存修正）
  - generateConstellationQuiz関数を拡張
  - calculateConstellationCenter, calculateZoomForConstellation実装

**【　】星座の形当てクイズリファクタリング（Refactor）**

**【　】色あてクイズテスト作成（Red）**
- `__tests__/lib/data/quizGenerator/colorQuiz.test.ts` 作成
  - スペクトル型からの色判定テスト
  - getColorFromSpectralType関数のテスト

**【　】色あてクイズ実装（Green）**
- `lib/data/quizGenerator/colorQuiz.ts` 作成
  - generateColorQuiz関数実装
  - getColorFromSpectralType実装（O,B→青白い、A,F→白い、G→黄色い、K→オレンジ、M→赤い）

**【　】色あてクイズリファクタリング（Refactor）**

**【　】距離クイズテスト作成（Red）**
- `__tests__/lib/data/quizGenerator/distanceQuiz.test.ts` 作成
  - 距離データのある星のフィルタリングテスト
  - 難易度別選択肢範囲テスト

**【　】距離クイズ実装（Green）**
- `lib/data/quizGenerator/distanceQuiz.ts` 作成
  - generateDistanceQuiz関数実装

**【　】距離クイズリファクタリング（Refactor）**

#### 13-3: 重み付きランダム選択実装（TDDサイクル）
**【　】クイズタイプ選択テスト作成（Red）**
- `__tests__/lib/data/quizGenerator/selectQuizType.test.ts` 作成
  - 重み付きランダム選択のテスト
  - 連続防止ロジックのテスト

**【　】クイズタイプ選択実装（Green）**
- `lib/data/quizGenerator/selectQuizType.ts` 作成
  - QUIZ_WEIGHTS定義（find-star: 30, constellation: 25, brightness: 20, color: 15, distance: 10）
  - selectQuizType関数実装

**【　】クイズタイプ選択リファクタリング（Refactor）**

#### 13-4: メインgenerateQuiz関数の統合（TDDサイクル）
**【　】統合テスト作成（Red）**
- `__tests__/lib/data/quizGenerator.test.ts` 修正
  - 5種類すべてのクイズタイプが生成できることをテスト
  - 各クイズタイプが適切なフィールドを持つことをテスト

**【　】generateQuiz関数統合（Green）**
- `lib/data/quizGenerator.ts` 大幅修正
  - 5種類のクイズ生成関数をswitch文で振り分け
  - previousType引数追加（連続防止用）

**【　】generateQuiz統合リファクタリング（Refactor）**

#### 13-5: 星空自動移動機能実装（TDDサイクル）
**【　】StarField自動移動テスト作成（Red）**
- `__tests__/components/StarField/navigation.test.tsx` 作成
  - viewCenter, zoomの自動変更テスト
  - アニメーション動作テスト

**【　】StarField自動移動実装（Green）**
- `components/StarField/StarField.tsx` 修正
  - quizTarget propを追加
  - quizTargetが変更された時に自動的にviewCenterとzoomを変更
  - スムーズなアニメーション（react-spring使用）

**【　】StarField自動移動リファクタリング（Refactor）**

#### 13-6: 「この星を探せ！」UI実装（TDDサイクル）
**【　】星タップ検出テスト作成（Red）**
- `__tests__/components/StarField/starClick.test.tsx` 作成
  - クリック座標から最も近い星を特定するテスト
  - 正解・不正解判定テスト

**【　】星タップ検出実装（Green）**
- `components/StarField/StarField.tsx` 修正
  - onStarClickイベントハンドラ追加
  - クリック座標から最も近い星を特定する関数実装

**【　】星タップ検出リファクタリング（Refactor）**

#### 13-7: QuizContainerとの統合（TDDサイクル）
**【　】QuizContainer統合テスト作成（Red）**
- `__tests__/components/Quiz/QuizContainer.test.tsx` 修正
  - 新しいクイズタイプの表示テスト
  - 星空自動移動のトリガーテスト

**【　】QuizContainer統合実装（Green）**
- `components/Quiz/QuizContainer.tsx` 修正
  - quizTargetをStarFieldに渡す
  - クイズタイプ別のUI表示分岐

**【　】QuizContainer統合リファクタリング（Refactor）**

#### 13-8: 解説表示機能実装（TDDサイクル）
**【　】解説表示テスト作成（Red）**
- `__tests__/components/Quiz/QuizExplanation.test.tsx` 作成
  - explanation フィールドがある場合の表示テスト

**【　】解説表示実装（Green）**
- `components/Quiz/QuizExplanation.tsx` 作成
  - 正解後にexplanationを表示するコンポーネント

**【　】解説表示リファクタリング（Refactor）**

#### 13-9: E2Eテスト（全クイズタイプ）
**【　】E2Eテスト作成**
- `__tests__/e2e/quiz-types.spec.ts` 作成
  - 5種類すべてのクイズタイプが正しく動作することをテスト
  - 星空自動移動が正しく動作することをテスト

**【　】E2Eテスト実行・修正**

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
| **Phase 12: PWA対応** | - | **3時間** | **新規追加（manifest.json + Service Worker + テスト）** |
| **Phase 13: 新クイズ機能実装** | - | **15時間** | **新規追加（5種類のクイズタイプ + 星空連動 + テスト）** |
| **合計** | **45時間** | **80時間** | **TDD対応で+17時間、PWA対応で+3時間、新クイズ機能で+15時間** |

### 工数増加の内訳
- **Phase 0新規追加**: +2時間（テスト環境構築）
- **各Phaseテスト追加**: +15時間（Phase 1-9でテスト作成）
- **Phase 12新規追加**: +3時間（PWA対応）
- **Phase 13新規追加**: +15時間（新クイズ機能実装）
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
- **更新日**: 2025-10-19（TDD準拠に全面改訂）

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

---

## ✅ 承認

この実装計画書は技術設計書（02_technical-design.md v2.2）のすべての要件を満たす計画となっています。

- **作成日**: 2025-10-18
- **バージョン**: 2.2
- **準拠技術設計**: 02_technical-design.md v2.2
- **更新日**: 2025-10-20
- **変更履歴**:
  - v2.0 (2025-10-18): TDD準拠版として全面改訂
  - v2.1 (2025-10-20): Phase 12 PWA対応を追加（manifest.json + Service Worker + テスト）
  - v2.2 (2025-10-20): Phase 13 新クイズ機能実装を追加（5種類のクイズタイプ + 星空連動 + テスト）
