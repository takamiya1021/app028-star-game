# 星データ再生成ガイド

## 目的
`scripts/hipparcos_vmag9_named.csv` から `public/data/stars.json` を再生成し、Vmag 欄の欠損やばらつきが発生した際に修正する手順をまとめる。

## 前提
- 元データ: `scripts/hipparcos_vmag9_named.csv`
- 出力先: `public/data/stars.json`
- スクリプト: `scripts/rebuild_stars_from_csv.py`

## 手順
1. 追加の依存関係は不要（標準 Python 3.x で動作）。
2. プロジェクトルートで次を実行：
   ```bash
   python3 scripts/rebuild_stars_from_csv.py
   ```
3. 実行後、以下のようなログが出ることを確認：
   ```
   書き出し完了: /path/to/public/data/stars.json (総数 102372 件, Vmagあり 102372 件)
   ```
4. 件数チェック例：
   ```python
   import json
   with open('public/data/stars.json') as f:
       data = json.load(f)
   mag7 = sum(1 for s in data if s['vmag'] is not None and s['vmag'] <= 7)
   print('<=7mag', mag7)
   ```
   - 目安: 7等星以下 ≒ 14,000、9等星以下 ≒ 102,000。
5. `git diff public/data/stars.json` で差分確認後、必要に応じてコミット。

## 注意事項
- CSV の Vmag 列は index 6（オリジナル）と 14（バックアップ）の重複がある。スクリプトは 6 → 14 の順にフォールバックする。フォーマット変更時はスクリプトと本ドキュメントを更新すること。
- 再生成後は `npm run build`, `npm test` などを実行し、アプリ動作が問題ないか確認する。

## 更新履歴
- 2025-10-19: 初版作成。
