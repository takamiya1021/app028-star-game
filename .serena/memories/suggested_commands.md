# 推奨コマンド一覧

## 開発コマンド

### 開発サーバー起動
```bash
npm run dev
```
- ブラウザで http://localhost:3000 を開く
- ホットリロード対応

### ビルド
```bash
npm run build
```
- プロダクション向けビルドを生成
- `.next/` ディレクトリに出力

### プロダクションサーバー起動
```bash
npm start
```
- `npm run build` 後に実行
- 本番環境と同じ動作確認

## 品質チェック

### Lint
```bash
npm run lint
```
- ESLint実行（Next.js標準設定）
- コードスタイルと潜在的なバグをチェック

### 単体テスト
```bash
# すべてのテスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# 特定のテストファイルのみ実行
npm test -- --runTestsByPath <テストファイルパス>

# 全テスト（シリアル実行）
npm test -- --runInBand
```

### E2Eテスト
```bash
npm run test:e2e
```
- Playwrightでブラウザテスト実行

## データ再生成

### 星データ再生成
```bash
pnpm tsx scripts/rebuild_stars_from_csv.py
```
- Hipparcosデータを更新する場合
- 詳細は `doc/maintenance/star_data.md` 参照

## デプロイ

### Vercelへデプロイ
```bash
npm run build
npx vercel --prod --yes
```
- ビルド設定は `vercel.json` に定義
- Vercelプロジェクト画面でデプロイ履歴確認可能

## セットアップ

### 初回セットアップ
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Git操作（Linux標準コマンド）
```bash
git status
git add .
git commit -m "コミットメッセージ"
git push
git pull
```

## その他のシステムコマンド（Linux）
- `ls -la`: ファイル一覧表示
- `cd <ディレクトリ>`: ディレクトリ移動
- `grep <パターン> <ファイル>`: ファイル内検索
- `find <パス> -name <パターン>`: ファイル検索
