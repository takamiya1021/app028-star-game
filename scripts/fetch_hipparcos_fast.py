#!/usr/bin/env python3
"""
======================================================
Hipparcos-2 + Bright Star + Henry Draper 結合版
(SIMBADなし／数分で完了)
======================================================
"""

from astroquery.vizier import Vizier
import pandas as pd

Vizier.ROW_LIMIT = -1

# --- Hipparcos-2 ---
print("🔭 Hipparcos-2 取得中...")
# 正しいカラム名: RArad(deg), DErad(deg), Hpmag, B-V
hip2_viz = Vizier(columns=[
    "HIP", "RArad", "DErad", "Plx", "pmRA", "pmDE", "Hpmag", "B-V"
])
hip2_viz.ROW_LIMIT = -1
hip2 = hip2_viz.query_constraints(catalog="I/311/hip2")[0].to_pandas()

# --- Bright Star Catalogue ---
print("🌟 Bright Star Catalogue 取得中...")
# 正しいカラム名: HR, HD, Name, RAJ2000, DEJ2000, Vmag, B-V, SpType
bsc_viz = Vizier(columns=[
    "HR", "HD", "Name", "RAJ2000", "DEJ2000", "SpType", "Vmag", "B-V"
])
bsc_viz.ROW_LIMIT = -1
bsc = bsc_viz.query_constraints(catalog="V/50")[0].to_pandas()

# --- Hipparcos-2 の元データから HD番号を取得 ---
print("📘 Hipparcos Main Catalogue (HD番号取得用) 取得中...")
hip_main_viz = Vizier(columns=["HIP", "HD"])
hip_main_viz.ROW_LIMIT = -1
hip_main = hip_main_viz.query_constraints(catalog="I/239/hip_main")[0].to_pandas()

# --- 結合処理 ---
print("🔧 結合中...")

# Step 1: Hipparcos-2 に HD番号を追加
hip2 = hip2.merge(hip_main, on="HIP", how="left")

# Step 2: Bright Star Catalogue と結合
merged = hip2.merge(bsc, on="HD", how="left", suffixes=("_hip2", "_bsc"))

# --- 等級フィルタ（9等星まで） ---
# Hpmagを使用（Hipparcos-2の等級）
merged = merged[merged["Hpmag"] < 9]

# カラムのクリーンアップ
merged = merged.rename(columns={
    "RArad": "RA",
    "DErad": "DEC",
    "Hpmag": "Vmag"
})

# --- 出力 ---
output_file = "hipparcos_vmag9_named.csv"
merged.to_csv(output_file, index=False)
print(f"✅ 完了！ {len(merged)} 件の星データを {output_file} に保存しました。")

# --- サンプル表示 ---
sample_cols = ["HIP", "Name", "HD", "HR", "SpType", "Vmag"]
print(merged.head(10)[sample_cols])
