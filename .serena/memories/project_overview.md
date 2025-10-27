# プロジェクト概要

## プロジェクト名
Stellarium Quiz (app028-star-game)

## 目的
星空を俯瞰できるインタラクティブなWebアプリケーション。

### 主な機能
- **星空描画**: Hipparcos星表をもとに最大約12万個の星を描画
- **正射図法／ステレオ投影に対応**: ズーム・パン・ピンチ操作で自由に移動可能
- **星座線描画**: Stellarium の星座線データをインポート
- **データモード切替**: 肉眼（7等級 ≒ 14,000件）と天の川（9等級 ≒ 102,000件）をトグル切替
- **クイズ機能**: 星・星座データを利用したクイズモード

## 技術スタック
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode有効)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Rendering**: カスタムCanvas レンダラー (lib/canvas)
- **データ**: Hipparcos星表、IAU固有名リスト、Stellarium星座線
- **テスト**: 
  - Jest + Testing Library (単体テスト)
  - Playwright (E2Eテスト)
- **デプロイ**: Vercel

## プロジェクト構造
```
app028-star-game/
├── app/              # Next.js App Router（ページ、レイアウト）
│   ├── encyclopedia/ # 百科事典ページ
│   └── settings/     # 設定ページ
├── components/       # UIコンポーネント
│   ├── StarField/    # 星空描画コンポーネント
│   ├── Quiz/         # クイズ機能
│   ├── DetailModal/  # 詳細モーダル
│   ├── Score/        # スコア表示
│   ├── Settings/     # 設定UI
│   ├── Layout/       # レイアウト
│   ├── ErrorBoundary/# エラーハンドリング
│   └── Animate/      # アニメーション
├── lib/              # ビジネスロジック・ユーティリティ
│   ├── canvas/       # Canvas描画ロジック（星、星座線、グリッド等）
│   ├── data/         # データローダー（星、星座、星座線、クイズ）
│   ├── utils/        # ユーティリティ関数
│   └── ui/           # UI関連ヘルパー
├── doc/              # 設計書・ドキュメント
│   ├── 01_requirements.md      # 要件定義
│   ├── 02_technical-design.md  # 技術設計
│   ├── 03_implementation-plan.md # 実装計画
│   ├── maintenance/  # メンテナンスドキュメント
│   ├── testing/      # テストドキュメント
│   └── performance/  # パフォーマンス関連
├── public/           # 静的ファイル
├── tests/            # テストファイル
└── scripts/          # スクリプト（データ再生成等）
```

## 開発環境
- Node.js + npm
- Linux (WSL2 Ubuntu)
- VSCode / Cursor
