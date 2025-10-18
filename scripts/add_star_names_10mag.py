"""
10等星データに固有名を追加するスクリプト
"""

import json
import os

# Tycho-2データにはHIP番号がないため、RA/Decで照合
# 主要な明るい星の座標（RA, Dec）と固有名のマッピング
BRIGHT_STARS = [
    # (RA範囲min, RA範囲max, Dec範囲min, Dec範囲max, 固有名)
    (0.0, 0.15, 38.8, 38.9, "アルフェラッツ"),
    (37.9, 38.0, 89.2, 89.3, "ポラリス"),
    (86.9, 87.1, 28.0, 28.1, "アルデバラン"),
    (78.6, 78.7, -8.3, -8.1, "リゲル"),
    (88.7, 88.9, 7.3, 7.5, "ベテルギウス"),
    (101.2, 101.4, -16.8, -16.6, "シリウス"),
    (95.9, 96.1, 52.0, 52.3, "カペラ"),
    (114.8, 115.0, 5.2, 5.3, "プロキオン"),
    (152.1, 152.3, 11.9, 12.0, "レグルス"),
    (201.2, 201.4, -11.3, -11.1, "スピカ"),
    (213.9, 214.1, 19.1, 19.3, "アルクトゥルス"),
    (279.2, 279.4, 38.7, 38.8, "ベガ"),
    (297.6, 297.8, 8.8, 8.9, "アルタイル"),
    (310.3, 310.5, 45.2, 45.3, "デネブ"),
    (247.3, 247.6, -26.5, -26.3, "アンタレス"),
]

def find_star_name(ra, dec):
    """RA/Decから固有名を検索"""
    for ra_min, ra_max, dec_min, dec_max, name in BRIGHT_STARS:
        if ra_min <= ra <= ra_max and dec_min <= dec <= dec_max:
            return name
    return None

def main():
    """固有名を追加"""
    input_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'stars-10mag.json')

    print(f"読み込み中: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        stars = json.load(f)

    print(f"読み込んだ星数: {len(stars)}")

    # 固有名を追加
    named_count = 0
    for star in stars:
        ra = star.get('ra')
        dec = star.get('dec')
        if ra is not None and dec is not None:
            name = find_star_name(ra, dec)
            if name:
                star['properName'] = name
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
            print(f"  {star['properName']} - RA:{star['ra']:.2f} Dec:{star['dec']:.2f} - {star['magnitude']:.2f}等")

if __name__ == "__main__":
    main()
