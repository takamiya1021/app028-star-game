"""
星データ取得スクリプト
Tycho-2カタログから8等星までの星データを取得してJSONに保存
"""

from astroquery.vizier import Vizier
import pandas as pd
import json
import os

def fetch_star_data():
    """Tycho-2カタログから星データを取得"""

    # Tycho-2 のカタログID
    catalog_id = "I/259/tyc2"

    # 8等星までを抽出（Vmag < 8）
    viz = Vizier(
        row_limit=-1  # 全件取得
    )

    print("星データを取得中...")
    result = viz.query_constraints(catalog=catalog_id, VTmag="<8")

    if not result:
        print("データ取得失敗")
        return None

    # データフレーム化
    df = result[0].to_pandas()
    print(f"取得した星の数: {len(df)}")
    print("カラム名:", df.columns.tolist())
    print(df.head())

    # JSON形式に変換
    star_data = []
    for _, row in df.iterrows():
        star = {
            "id": f"TYC{row['TYC1']}-{row['TYC2']}-{row['TYC3']}",
            "magnitude": float(row['VTmag']) if pd.notna(row.get('VTmag')) else None,
            "bt_magnitude": float(row['BTmag']) if pd.notna(row.get('BTmag')) else None
        }

        # RA/Decのカラム名を動的に検出
        for col in df.columns:
            if 'RA' in col.upper() and 'ICRS' in col.upper():
                star['ra'] = float(row[col])
            if 'DE' in col.upper() and 'ICRS' in col.upper():
                star['dec'] = float(row[col])

        star_data.append(star)

    # JSONファイルに保存
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'stars.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(star_data, f, indent=2, ensure_ascii=False)

    print(f"\n星データを保存しました: {output_path}")
    print(f"総星数: {len(star_data)}")

    # サンプルデータ表示
    if star_data:
        print("\nサンプルデータ（最初の5件）:")
        for star in star_data[:5]:
            print(f"  {star}")

    return star_data

if __name__ == "__main__":
    fetch_star_data()
