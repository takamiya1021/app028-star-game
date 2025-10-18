#!/usr/bin/env python3
"""
CSVをJSON形式に変換するスクリプト
"""

import pandas as pd
import json
import numpy as np

# CSVファイル読み込み
print("📂 CSVファイル読み込み中...")
df = pd.read_csv("hipparcos_vmag9_named.csv")

print(f"✅ {len(df)}件のデータを読み込みました。")

# NaN値を処理
df = df.replace({np.nan: None})

# JSON出力用のリストを作成
stars = []
for _, row in df.iterrows():
    # B-V値の取得（B-V_hip2を優先、なければB-V_bsc）
    bv_value = None
    if pd.notna(row.get("B-V_hip2")):
        bv_value = float(row["B-V_hip2"])
    elif pd.notna(row.get("B-V_bsc")):
        bv_value = float(row["B-V_bsc"])

    star = {
        "id": int(row["HIP"]) if pd.notna(row["HIP"]) else None,
        "ra": float(row["RA"]) if pd.notna(row["RA"]) else None,
        "dec": float(row["DEC"]) if pd.notna(row["DEC"]) else None,
        "vmag": float(row["Vmag"]) if pd.notna(row["Vmag"]) else None,
        "bv": bv_value,
        "spectralType": row["SpType"] if pd.notna(row["SpType"]) else None,
        "name": row["Name"] if pd.notna(row["Name"]) else None,
        "hd": int(row["HD"]) if pd.notna(row["HD"]) else None,
        "hr": int(row["HR"]) if pd.notna(row["HR"]) else None,
        "parallax": float(row["Plx"]) if pd.notna(row["Plx"]) else None,
        "pmRA": float(row["pmRA"]) if pd.notna(row["pmRA"]) else None,
        "pmDE": float(row["pmDE"]) if pd.notna(row["pmDE"]) else None
    }
    stars.append(star)

# JSON出力
output_file = "../public/data/stars.json"
print(f"💾 JSON形式で保存中: {output_file}")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(stars, f, ensure_ascii=False, indent=2)

print(f"✅ 完了！ {len(stars)}件の星データを {output_file} に保存しました。")

# サンプル表示
print("\n📋 サンプルデータ（最初の3件）:")
for i, star in enumerate(stars[:3], 1):
    print(f"\n星 {i}:")
    for key, value in star.items():
        if value is not None:
            print(f"  {key}: {value}")
