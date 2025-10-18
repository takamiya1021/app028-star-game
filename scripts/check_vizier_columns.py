#!/usr/bin/env python3
"""
VizieRカタログのカラム名を確認するスクリプト
"""

from astroquery.vizier import Vizier

# Hipparcos-2カタログのカラム確認
print("=" * 60)
print("Hipparcos-2 (I/311/hip2) カラム一覧")
print("=" * 60)
viz = Vizier()
viz.ROW_LIMIT = 1
result = viz.query_constraints(catalog="I/311/hip2")
if result:
    print("カラム名:")
    for col in result[0].colnames:
        print(f"  - {col}")
    print(f"\nサンプルデータ:")
    print(result[0])

print("\n")

# Bright Star Catalogueカラム確認
print("=" * 60)
print("Bright Star Catalogue (V/50) カラム一覧")
print("=" * 60)
viz = Vizier()
viz.ROW_LIMIT = 1
result = viz.query_constraints(catalog="V/50")
if result:
    print("カラム名:")
    for col in result[0].colnames:
        print(f"  - {col}")
    print(f"\nサンプルデータ:")
    print(result[0])

print("\n")

# Henry Draper Catalogueカラム確認
print("=" * 60)
print("Henry Draper Catalogue (B/hd) カラム一覧")
print("=" * 60)
viz = Vizier()
viz.ROW_LIMIT = 1
result = viz.query_constraints(catalog="B/hd")
if result:
    print("カラム名:")
    for col in result[0].colnames:
        print(f"  - {col}")
    print(f"\nサンプルデータ:")
    print(result[0])
