"""
詳細な星データ取得スクリプト
Hipparcosカタログから星データを取得（固有名、色、星座情報付き）
"""

from astroquery.vizier import Vizier
import pandas as pd
import json
import os

def bv_to_color(bv_index):
    """
    B-V色指数から星の色を推定
    """
    if pd.isna(bv_index):
        return "#ffffff"

    # B-V色指数から色を決定
    if bv_index < -0.3:
        return "#9bb0ff"  # 青白い星（O,B型）
    elif bv_index < 0:
        return "#cad7ff"  # 白い星（A型）
    elif bv_index < 0.3:
        return "#fff4ea"  # 黄白い星（F型）
    elif bv_index < 0.6:
        return "#fffaf0"  # 黄色い星（G型）
    elif bv_index < 1.4:
        return "#ffd2a1"  # オレンジ色の星（K型）
    else:
        return "#ff7f00"  # 赤い星（M型）

def spectral_type_to_color(spectral_type):
    """
    スペクトル型から星の色を推定
    """
    if pd.isna(spectral_type):
        return "#ffffff"

    sp = str(spectral_type).strip().upper()
    if not sp:
        return "#ffffff"

    first_char = sp[0]

    color_map = {
        'O': '#9bb0ff',  # 青白
        'B': '#cad7ff',  # 青白
        'A': '#fff4ea',  # 白
        'F': '#fffaf0',  # 黄白
        'G': '#ffd2a1',  # 黄
        'K': '#ffb56c',  # オレンジ
        'M': '#ff7f00',  # 赤
    }

    return color_map.get(first_char, '#ffffff')

def fetch_hipparcos_data():
    """
    Hipparcosカタログから詳細な星データを取得
    """
    print("Hipparcosカタログからデータ取得中...")

    # Hipparcos Main Catalogue
    catalog_id = "I/239/hip_main"

    # 8等星までを取得（度数表記のRAとDecを取得）
    viz = Vizier(
        columns=["HIP", "_RA.icrs", "_DE.icrs", "Vmag", "SpType", "Plx", "B-V"],
        row_limit=-1
    )

    result = viz.query_constraints(catalog=catalog_id, Vmag="<8.0")

    if not result:
        print("Hipparcosデータ取得失敗")
        return None

    df = result[0].to_pandas()
    print(f"Hipparcos取得数: {len(df)}")

    return df

def fetch_constellation_data():
    """
    星座情報を取得（HIP番号と星座の対応）
    """
    print("\n星座情報を取得中...")

    # IAU constellation boundaries
    catalog_id = "VI/49/constbnd"

    viz = Vizier(row_limit=-1)
    result = viz.query_constraints(catalog=catalog_id)

    if result:
        print(f"星座境界データ取得: {len(result[0])} 件")
        return result[0].to_pandas()
    return None

def fetch_star_names():
    """
    固有名データを取得
    """
    print("\n固有名データを取得中...")

    # IAU Star Names
    catalog_id = "B/pastel/catalog"

    viz = Vizier(row_limit=-1)
    try:
        result = viz.query_constraints(catalog=catalog_id)
        if result:
            print(f"固有名データ取得成功")
            return result[0].to_pandas()
    except:
        print("固有名データ取得失敗（カタログが見つからない可能性）")

    return None

def determine_constellation(ra, dec):
    """
    赤経・赤緯から星座を推定（簡易版）
    実際にはもっと複雑な計算が必要ですが、ここでは主要な星座のみ
    """
    # 簡易的な星座判定（赤経・赤緯の範囲で大まかに分類）
    # 実際のプロジェクトでは、より正確な星座境界データを使用すべき

    if dec > 80:
        return "UMi"  # こぐま座
    elif dec > 50:
        if 0 <= ra < 120:
            return "UMa"  # おおぐま座
        else:
            return "Cep"  # ケフェウス座
    elif dec > 0:
        if 60 <= ra < 120:
            return "Leo"  # しし座
        elif 200 <= ra < 260:
            return "Vir"  # おとめ座
        else:
            return "And"  # アンドロメダ座
    else:
        if 60 <= ra < 120:
            return "Ori"  # オリオン座
        elif 200 <= ra < 260:
            return "Sco"  # さそり座
        else:
            return "Aqr"  # みずがめ座

def main():
    """メイン処理"""

    # Hipparcosデータ取得
    df = fetch_hipparcos_data()
    if df is None:
        return

    print("\nカラム名:", df.columns.tolist())
    print(df.head())

    # データ変換
    star_data = []

    for _, row in df.iterrows():
        # RA/Dec を取得
        ra = row.get('_RA.icrs')
        dec = row.get('_DE.icrs')

        if pd.isna(ra) or pd.isna(dec):
            continue

        # 等級
        vmag = row.get('Vmag')
        if pd.isna(vmag):
            continue

        # スペクトル型
        spectral_type = row.get('SpType')

        # 色の決定
        bv_index = row.get('B-V')

        if pd.notna(bv_index):
            color = bv_to_color(bv_index)
        elif pd.notna(spectral_type):
            color = spectral_type_to_color(spectral_type)
        else:
            color = "#ffffff"

        # 視差から距離を計算（パーセク）
        distance = None
        plx = row.get('Plx')
        if pd.notna(plx) and plx > 0:
            distance = round(1000.0 / plx, 1)  # ミリ秒角からパーセクに変換

        # 星座を推定
        constellation = determine_constellation(ra, dec)

        star = {
            "id": int(row['HIP']) if pd.notna(row.get('HIP')) else len(star_data) + 1,
            "ra": ra,
            "dec": dec,
            "magnitude": float(vmag),
            "color": color,
            "properName": None,  # 固有名は別途マッピングが必要
            "constellation": constellation,
            "spectralType": str(spectral_type) if pd.notna(spectral_type) else None,
            "distance": distance
        }

        star_data.append(star)

    # JSONファイルに保存
    output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'stars.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(star_data, f, indent=2, ensure_ascii=False)

    print(f"\n星データを保存しました: {output_path}")
    print(f"総星数: {len(star_data)}")

    # サンプル表示
    print("\nサンプルデータ（最初の5件）:")
    for star in star_data[:5]:
        print(f"  ID: {star['id']}, RA: {star['ra']:.2f}, Dec: {star['dec']:.2f}, "
              f"Mag: {star['magnitude']:.2f}, Color: {star['color']}, "
              f"Constellation: {star['constellation']}")

if __name__ == "__main__":
    main()
