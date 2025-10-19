# テスト実装メンテナンスガイド

## 目的
座標変換・星描画などキャンバス関連テストの実行方法をまとめ、リグレッション検知を容易にする。

## 対象テスト
- `__tests__/lib/canvas/coordinateUtils.test.ts`
- `__tests__/lib/canvas/starRenderer.test.ts`
- `__tests__/components/StarField/StarField.test.tsx`
- `__tests__/lib/canvas/constellationRenderer.test.ts`

## 実行手順
1. プロジェクトルートで実行：
   ```bash
   npm test -- --runTestsByPath \
     __tests__/lib/canvas/coordinateUtils.test.ts \
     __tests__/lib/canvas/starRenderer.test.ts \
     __tests__/components/StarField/StarField.test.tsx \
     __tests__/lib/canvas/constellationRenderer.test.ts
   ```
2. すべて `PASS` になることを確認。

## Jest 設定
- `jest.setup.js` に Canvas API モックを定義済み。  
  新たな Canvas API を利用するテストを追加する場合はここにモックを拡張する。

## 注意事項
- 座標変換テストでは Orthographic / Stereographic / 地平座標の基本ケースをカバーしている。極付近などのエッジケースを扱う場合はテストを追加する。
- 星描画テストは `drawStar`/`drawStars` の呼び出しと半径の大小関係を確認している。アニメーションや色温度ロジックを変更する場合は合わせてテストを更新する。
- StarField テストでは `drawStars` をモックしてアニメーションループとズーム/パン操作を確認している。タッチ操作や投影モード切替を追加する際はケースを拡張する。
- 星座線テストでは利用可能な星と欠損ケースの両方を検証している。スタイル変更を行う場合はテストを更新する。
- 性能テストは `drawStars` に 12万件を入力し処理時間を 2.5 秒以内であることを確認している。閾値や描画ロジックを変更する場合は合わせて更新する。

## 更新履歴
- 2025-10-19: 初版作成（coordinateUtils / starRenderer テストを文書化）。
