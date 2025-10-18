"""
Tycho-2データを既存フォーマットに変換するスクリプト
"""

import json
import os

def magnitude_to_color(magnitude, bt_magnitude):
    """
    等級から星の色を推定
    BT-VT（色指数）から色を決定
    """
    if bt_magnitude is None or magnitude is None:
        return "#ffffff"  # デフォルト白

    color_index = bt_magnitude - magnitude

    # 色指数から色を決定（簡易版）
    if color_index < 0:
        return "#9bb0ff"  # 青白い星（O,B型）
    elif color_index < 0.3:
        return "#cad7ff"  # 白い星（A型）
    elif color_index < 0.6:
        return "#fff4ea"  # 黄白い星（F型）
    elif color_index < 0.8:
        return "#fffaf0"  # 黄色い星（G型）
    elif color_index < 1.4:
        return "#ffd2a1"  # オレンジ色の星（K型）
    else:
        return "#ff7f00"  # 赤い星（M型）

def convert_tycho_to_app_format():
    """
    Tycho-2データをアプリ用フォーマットに変換
    """
    # 入力ファイル読み込み
    input_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'stars.json')
    with open(input_path, 'r', encoding='utf-8') as f:
        tycho_data = json.load(f)

    print(f"読み込んだ星データ: {len(tycho_data)}個")

    # 変換
    converted_data = []
    for i, star in enumerate(tycho_data, 1):
        converted_star = {
            "id": i,
            "ra": star["ra"],
            "dec": star["dec"],
            "magnitude": star["magnitude"],
            "color": magnitude_to_color(star["magnitude"], star["bt_magnitude"]),
            # 以下はTycho-2には含まれていないのでデフォルト値
            "properName": None,
            "constellation": None,
            "spectralType": None,
            "distance": None
        }
        converted_data.append(converted_star)

    # 出力ファイルに保存
    output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'stars.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, indent=2, ensure_ascii=False)

    print(f"\n変換完了: {output_path}")
    print(f"総星数: {len(converted_data)}")

    # サンプル表示
    print("\nサンプルデータ（最初の3件）:")
    for star in converted_data[:3]:
        print(f"  ID: {star['id']}, RA: {star['ra']:.2f}, Dec: {star['dec']:.2f}, "
              f"Mag: {star['magnitude']:.2f}, Color: {star['color']}")

if __name__ == "__main__":
    convert_tycho_to_app_format()
