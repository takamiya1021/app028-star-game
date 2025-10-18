"""
より多くの星データを取得（10等星まで）
Tycho-2カタログから取得
"""

from astroquery.vizier import Vizier
import pandas as pd
import json
import os

def bv_to_color(bv_index):
    """B-V色指数から星の色を推定"""
    if pd.isna(bv_index):
        return "#ffffff"

    if bv_index < -0.3:
        return "#9bb0ff"  # 青白
    elif bv_index < 0:
        return "#cad7ff"  # 白
    elif bv_index < 0.3:
        return "#fff4ea"  # 黄白
    elif bv_index < 0.6:
        return "#fffaf0"  # 黄
    elif bv_index < 1.4:
        return "#ffd2a1"  # オレンジ
    else:
        return "#ff7f00"  # 赤

def spectral_type_to_color(spectral_type):
    """スペクトル型から星の色を推定"""
    if pd.isna(spectral_type):
        return "#ffffff"

    sp = str(spectral_type).strip().upper()
    if not sp:
        return "#ffffff"

    first_char = sp[0]
    color_map = {
        'O': '#9bb0ff', 'B': '#cad7ff', 'A': '#fff4ea',
        'F': '#fffaf0', 'G': '#ffd2a1', 'K': '#ffb56c', 'M': '#ff7f00',
    }
    return color_map.get(first_char, '#ffffff')

def determine_constellation(ra, dec):
    """赤経・赤緯から星座を推定（簡易版）"""
    if dec > 80:
        return "UMi"
    elif dec > 50:
        return "UMa" if 0 <= ra < 120 else "Cep"
    elif dec > 0:
        if 60 <= ra < 120:
            return "Leo"
        elif 200 <= ra < 260:
            return "Vir"
        else:
            return "And"
    else:
        if 60 <= ra < 120:
            return "Ori"
        elif 200 <= ra < 260:
            return "Sco"
        else:
            return "Aqr"

def main():
    print("Tycho-2カタログから10等星までのデータを取得中...")

    catalog_id = "I/259/tyc2"

    viz = Vizier(row_limit=-1)
    result = viz.query_constraints(catalog=catalog_id, VTmag="<10.0")

    if not result:
        print("データ取得失敗")
        return

    df = result[0].to_pandas()
    print(f"取得した星数: {len(df)}")
    print("カラム名:", df.columns.tolist())

    star_data = []
    for _, row in df.iterrows():
        ra = row.get('_RA.icrs') or row.get('RA(ICRS)')
        dec = row.get('_DE.icrs') or row.get('DE(ICRS)')

        if pd.isna(ra) or pd.isna(dec):
            continue

        vmag = row.get('VTmag')
        if pd.isna(vmag):
            continue

        # 色の決定
        bt_mag = row.get('BTmag')
        if pd.notna(bt_mag) and pd.notna(vmag):
            bv = bt_mag - vmag
            color = bv_to_color(bv)
        else:
            color = "#ffffff"

        constellation = determine_constellation(float(ra), float(dec))

        star = {
            "id": len(star_data) + 1,
            "ra": float(ra),
            "dec": float(dec),
            "magnitude": float(vmag),
            "color": color,
            "properName": None,
            "constellation": constellation,
            "spectralType": None,
            "distance": None
        }
        star_data.append(star)

    # 保存
    output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'stars-10mag.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(star_data, f, indent=2, ensure_ascii=False)

    print(f"\n星データを保存: {output_path}")
    print(f"総星数: {len(star_data)}")

    # 等級別の統計
    mag_dist = {}
    for star in star_data:
        mag = int(star['magnitude'])
        mag_dist[mag] = mag_dist.get(mag, 0) + 1

    print("\n等級別分布:")
    for mag in sorted(mag_dist.keys()):
        print(f"  {mag}等星: {mag_dist[mag]}個")

if __name__ == "__main__":
    main()
