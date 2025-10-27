# コードスタイルと規約

## TypeScript設定

### 厳格な型チェック
- **strict mode**: 有効
- すべてのコードで厳密な型チェックが適用される
- `any`型の使用は最小限に

### パスエイリアス
```typescript
// @/* はプロジェクトルートを指す
import { StarField } from '@/components/StarField/StarField'
import { starsLoader } from '@/lib/data/starsLoader'
```

### TypeScript設定詳細
- **lib**: dom, dom.iterable, esnext
- **module**: esnext
- **moduleResolution**: bundler
- **jsx**: preserve
- **esModuleInterop**: true
- **isolatedModules**: true

## ESLint

### 設定
- **next/core-web-vitals**: Next.jsのCore Web Vitals最適化ルール
- **next/typescript**: TypeScript推奨ルール

### Lintチェック
```bash
npm run lint
```

## コーディングスタイル

### React コンポーネント
- **関数コンポーネント**: アロー関数またはfunction宣言
- **Props定義**: TypeScriptインターフェースで型定義
- **命名規則**: PascalCase（例: `StarField`, `DetailModal`）

```typescript
// コンポーネント例
interface StarFieldProps {
  observationMode: ObservationMode;
  projectionMode: ProjectionMode;
  onStarClick: (star: Star) => void;
}

export function StarField({ observationMode, projectionMode, onStarClick }: StarFieldProps) {
  // 実装
}
```

### 定数
- **大文字スネークケース**: グローバル定数（例: `TOKYO_OBSERVER`, `PAN_INTERVAL_MS`）
- **const**: すべての定数はconstで宣言

### 型定義
- **interface**: Reactコンポーネントのprops、オブジェクト型
- **type**: Union型、交差型、複雑な型エイリアス

### ファイル構成
```typescript
// 1. インポート（React、外部ライブラリ、内部モジュールの順）
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarRenderer } from '@/lib/canvas/starRenderer';

// 2. 型定義・インターフェース
interface ComponentProps { /* ... */ }

// 3. 定数
const CONSTANT_VALUE = 100;

// 4. コンポーネント本体またはロジック
export function Component(props: ComponentProps) {
  // 実装
}
```

## テスト

### テストファイル配置
- `__tests__/`: テストファイル専用ディレクトリ
- 対象ファイルと同じディレクトリ構造を維持

### テスト命名
- ファイル: `<対象ファイル名>.test.ts(x)`
- 例: `starRenderer.ts` → `__tests__/lib/canvas/starRenderer.test.ts`

### テストスタイル
- Jest + Testing Library
- Canvas周りはモックと動的importを併用

## コメント
- **日本語**: コメントは日本語で記述
- **JSDoc**: 公開APIには型情報とともに説明を記載

## スタイリング
- **Tailwind CSS**: ユーティリティクラスを使用
- **カスタムスタイル**: `app/globals.css` に記載

## ディレクトリ構造の原則
- **app/**: ページとレイアウト（Next.js App Router）
- **components/**: 再利用可能なUIコンポーネント
- **lib/**: ビジネスロジック、ユーティリティ、描画ロジック
- **types/**: 共通型定義（必要に応じて）
- **public/**: 静的ファイル（画像、データファイル等）
