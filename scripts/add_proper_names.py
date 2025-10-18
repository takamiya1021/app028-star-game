#!/usr/bin/env python3
"""
IAU固有名リストを取得してHipparcosデータにマッピング
"""

from astroquery.vizier import Vizier
import pandas as pd
import json

# IAU Star Names カタログ取得
print("🌟 IAU固有名リスト取得中...")
viz = Vizier(columns=["*"], row_limit=-1)
iau_names = viz.query_constraints(catalog="B/pastel/catalog")[0].to_pandas()

print(f"✅ IAU固有名: {len(iau_names)}件取得")

# 既存のstars.json読み込み
print("📂 既存の星データ読み込み中...")
with open("../public/data/stars.json", "r", encoding="utf-8") as f:
    stars = json.load(f)

print(f"✅ {len(stars)}件の星データを読み込みました")

# HD番号でマッピング（IAUカタログにHD番号がある場合）
if "HD" in iau_names.columns:
    print("🔗 HD番号でマッピング中...")
    hd_to_name = dict(zip(iau_names["HD"], iau_names["Name"]))

    mapped_count = 0
    for star in stars:
        if star["hd"] and star["hd"] in hd_to_name:
            star["properName"] = hd_to_name[star["hd"]]
            mapped_count += 1

    print(f"✅ {mapped_count}件の星に固有名を追加しました")

# 保存
output_file = "../public/data/stars.json"
print(f"💾 保存中: {output_file}")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(stars, f, ensure_ascii=False, indent=2)

print("✅ 完了！")

# サンプル表示
print("\n📋 固有名が付いた星のサンプル:")
named_stars = [s for s in stars if s.get("properName")][:10]
for star in named_stars:
    print(f"  HIP {star['id']}: {star.get('properName')} (vmag={star['vmag']})")
