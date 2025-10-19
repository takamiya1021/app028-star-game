# E2E Testing (Playwright)

## セットアップ
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

> ⚠️ 一部の環境（コンテナ等）では `~/.cache/ms-playwright` が root 所有になっており、
> `EACCES` が発生する場合があります。その場合はフォルダの所有権を修正してから再実行してください。
> 例: `sudo chown -R $(whoami):$(whoami) ~/.cache/ms-playwright`

## 実行方法
```bash
npm run test:e2e
```

- `playwright.config.ts` で Next.js dev サーバをポート 3001 で自動起動します。
- テストは `tests/e2e/*.spec.ts` に配置します。
- 失敗したテストでは trace / screenshot / video を `playwright-report/` に保存します。
