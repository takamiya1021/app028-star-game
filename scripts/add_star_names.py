"""
有名な星の固有名を追加するスクリプト
"""

import json
import os

# HIP番号と固有名のマッピング（主要な明るい星のみ）
STAR_NAMES = {
    # こぐま座
    11767: "ポラリス",    # Polaris
    82080: "コカブ",      # Kochab

    # おおぐま座
    54061: "ドゥーベ",    # Dubhe
    53910: "メラク",      # Merak
    58001: "フェクダ",    # Phecda
    59774: "メグレズ",    # Megrez
    62956: "アリオト",    # Alioth
    65378: "ミザール",    # Mizar
    67301: "アルカイド",  # Alkaid

    # オリオン座
    24436: "リゲル",      # Rigel
    27989: "ベテルギウス", # Betelgeuse
    26311: "ベラトリックス", # Bellatrix
    25930: "アルニラム",  # Alnilam
    25336: "アルニタク",  # Alnitak
    26727: "ミンタカ",    # Mintaka
    27366: "サイフ",      # Saiph

    # おうし座
    21421: "アルデバラン", # Aldebaran

    # ふたご座
    37826: "カストル",    # Castor
    37279: "ポルックス",  # Pollux

    # しし座
    49669: "レグルス",    # Regulus
    50583: "デネボラ",    # Denebola
    57632: "アルギエバ",  # Algieba

    # おとめ座
    65474: "スピカ",      # Spica

    # こと座
    91262: "ベガ",        # Vega

    # わし座
    97649: "アルタイル",  # Altair

    # はくちょう座
    102098: "デネブ",     # Deneb

    # さそり座
    80763: "アンタレス",  # Antares

    # ケンタウルス座
    71683: "リギルケンタウルス", # Rigil Kentaurus (Alpha Centauri)
    68702: "ハダル",      # Hadar

    # りゅうこつ座
    30438: "カノープス",  # Canopus

    # おおいぬ座
    32349: "シリウス",    # Sirius

    # こいぬ座
    37279: "プロキオン",  # Procyon

    # ペガスス座
    113368: "マルカブ",   # Markab
    112158: "シェアト",   # Scheat
    113963: "アルゲニブ", # Algenib
    677: "アルフェラッツ", # Alpheratz (And/Peg)

    # カシオペア座
    3179: "シェダル",     # Schedar
    746: "カフ",          # Caph
}

def add_star_names():
    """固有名を追加"""

    # JSONファイル読み込み
    input_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'stars.json')

    with open(input_path, 'r', encoding='utf-8') as f:
        stars = json.load(f)

    print(f"読み込んだ星数: {len(stars)}")

    # 固有名を追加
    named_count = 0
    for star in stars:
        hip_id = star.get('id')
        if hip_id in STAR_NAMES:
            star['properName'] = STAR_NAMES[hip_id]
            named_count += 1

    print(f"固有名を設定した星数: {named_count}")

    # 保存
    with open(input_path, 'w', encoding='utf-8') as f:
        json.dump(stars, f, indent=2, ensure_ascii=False)

    print(f"保存完了: {input_path}")

    # 固有名がある星を表示
    print("\n固有名がある星:")
    for star in stars:
        if star.get('properName'):
            print(f"  {star['properName']} (HIP {star['id']}) - {star['constellation']} - {star['magnitude']:.2f}等")

if __name__ == "__main__":
    add_star_names()
