#!/usr/bin/env python3
"""
============================================
Hipparcos星表（9等星まで）＋SIMBAD固有名付き
============================================
"""

from astroquery.vizier import Vizier
from astroquery.simbad import Simbad
import pandas as pd
from tqdm import tqdm

# --- Hipparcos設定 ---
CATALOG_ID = "I/239/hip_main"
COLUMNS = [
    "HIP", "RA_ICRS", "DE_ICRS", "Plx", "pmRA", "pmDE",
    "Vmag", "B-V", "SpType", "BTmag", "VTmag", "Hpmag",
    "HD", "HR", "BayerFlam", "VarFlag"
]
FILTERS = {"Vmag": "<9"}

# --- VizieRからHipparcosデータ取得 ---
viz = Vizier(columns=COLUMNS, column_filters=FILTERS)
viz.ROW_LIMIT = -1
print("🔭 VizieRからHipparcos星表を取得中...")
result = viz.query_constraints(catalog=CATALOG_ID)
hip = result[0].to_pandas()
print(f"✅ {len(hip)}個の星データを取得。")

# --- SIMBADで固有名（Sirius, Vegaなど）を取得 ---
print("✨ SIMBADから固有名を照合中...")
customSimbad = Simbad()
customSimbad.TIMEOUT = 30
customSimbad.add_votable_fields('ids', 'otype', 'flux(V)', 'sp', 'ra', 'dec')

names = []
for hip_id in tqdm(hip["HIP"], desc="照合進行中", unit="star"):
    try:
        result_table = customSimbad.query_object(f"HIP {hip_id}")
        if result_table:
            ids = result_table["IDS"][0].decode("utf-8") if hasattr(result_table["IDS"][0], "decode") else result_table["IDS"][0]
            # 一番代表的な名前を選ぶ
            if " " in ids:
                name = ids.split("|")[0].strip()
            else:
                name = ids.strip()
            names.append(name)
        else:
            names.append("")
    except Exception:
        names.append("")

hip["Name_SIMBAD"] = names

# --- CSV出力 ---
OUTPUT = "hipparcos_vmag9_simbad_full.csv"
hip.to_csv(OUTPUT, index=False)
print(f"💾 完了！ {OUTPUT} に {len(hip)}件の星データを保存しました。")
