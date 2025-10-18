"""
Hipparcosカタログの利用可能なカラムを確認
"""

from astroquery.vizier import Vizier

# Hipparcos Main Catalogue
catalog_id = "I/239/hip_main"

viz = Vizier(row_limit=5)
result = viz.query_constraints(catalog=catalog_id, Vmag="<8.0")

if result:
    df = result[0].to_pandas()
    print("利用可能なカラム:")
    for col in df.columns:
        print(f"  - {col}")
    print(f"\nデータサンプル:")
    print(df.head())
