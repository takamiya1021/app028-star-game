# Rendering Performance Test Plan

## 目的
StarField とクイズUIの描画負荷を定量化し、60fps を維持するためのボトルネックを特定する。

## スコープ
- キャンバス描画（星・グリッド・モーダル）
- React レンダリング（QuizContainer、SettingsPanel 等）
- データローダーのキャッシュ挙動

## 指標
| 指標 | 目標値 | 計測方法 |
| --- | --- | --- |
| フレーム時間 | 平均 ≤ 16.7ms | `performance.now()` を利用したバッチ描画計測 |
| StarField 描画時間 | 最大 10ms 以下 | Instrumentation wrapper で drawStars の所要時間をロギング |
| React 再レンダリング数 | 交互に 1 回以内 | React Profiler API / why-did-you-render |
| メモリ使用量 | 200MB 以下 (ブラウザ) | Chrome DevTools Performance/Memory dump |

## ケース
1. **標準モード (7等級)**
   - ズーム 2.0 / 投影: Orthographic
   - 星数 ≒ 14,000
2. **天の川モード (9等級)**
   - ズーム 1.2 / 投影: Stereographic
   - 星数 ≒ 120,000
3. **クイズ操作負荷**
   - QuizContainer 連続回答 10 回
   - モバイルドック開閉

## 計測アプローチ
- `__tests__/performance/rendering.test.ts` で canvas 描画の所要時間を計測（JSDOM ではなく Node `canvas` モック）。
- Storybook/Playwright の `page.metrics()` で実機に近い計測。
- 計測結果を `doc/performance/results-YYYYMMDD.md` に記録。

## TODO
- drawStars にインストゥルメンテーションフック追加（計測中のみ有効）
- Playwright シナリオ作成（星空ロード＋クイズ回答）
- GPU/CPU プロファイル取得手順の明文化
