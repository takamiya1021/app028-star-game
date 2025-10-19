# Stellarium Quiz

星空を俯瞰できるインタラクティブな Web アプリケーションです。Hipparcos 星表をもとに最大約 12 万個の星を描画し、星座クイズや星座線・詳細情報の閲覧を楽しめます。Next.js 14 App Router を採用し、描画パイプラインは Canvas ベースで自前実装しています。

## 主な機能
- **星空描画**：正射図法／ステレオ投影に対応。ズーム・パン・ピンチ操作で自由に移動できます。
- **星座線描画**：Stellarium の星座線データ（constellationship.fab）をインポートし、星座線を重ね描き。
- **データモード切替**：肉眼（7 等級 ≒ 14,000 件）と天の川（9 等級 ≒ 102,000 件）をトグル切替。
- **クイズ機能（開発中）**：星・星座データを利用したクイズモードを順次実装予定。

## 技術スタック
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Rendering**: カスタム Canvas レンダラー (lib/canvas)
- **データ**: Hipparcos 星表、IAU 固有名リスト、Stellarium 星座線
- **テスト**: Jest + Testing Library
- **デプロイ**: Vercel

## セットアップ
```bash
pnpm install
pnpm dev
```
ブラウザで http://localhost:3000 を開けば開発サーバーが動作します。

## テスト
Canvas まわりの主要テストはモックと動的 import を組み合わせて実行します。
```bash
pnpm test -- --runTestsByPath \
  __tests__/lib/data/starsLoader.test.ts \
  __tests__/lib/data/constellationsLoader.test.ts \
  __tests__/lib/data/constellationLinesLoader.test.ts \
  __tests__/lib/canvas/coordinateUtils.test.ts \
  __tests__/lib/canvas/starRenderer.test.ts \
  __tests__/components/StarField/StarField.test.tsx \
  __tests__/lib/canvas/constellationRenderer.test.ts
```
各種テストの詳細やメンテ手順は `doc/maintenance/` を参照してください。

## データ再生成
Hipparcos データを更新したい場合は以下を実行します。
```bash
pnpm tsx scripts/rebuild_stars_from_csv.py
```
詳しい手順は `doc/maintenance/star_data.md` を参照。

## デプロイ
Vercel CLI を利用してデプロイしています。
```bash
pnpm run build
npx vercel --prod --yes
```
最新のデプロイ履歴や URL は Vercel プロジェクト画面で確認できます。

## ライセンス
データソースのライセンスに従って利用してください。アプリケーションコードは MIT ライセンスを予定しています。
