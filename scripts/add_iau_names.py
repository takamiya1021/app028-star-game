#!/usr/bin/env python3
"""
IAU公式固有名リストを使ってHipparcosデータに固有名を追加（カタカナ表記）
"""

import json

# 有名な星のリスト（HIP番号と固有名の対応表）- カタカナ表記
FAMOUS_STARS = {
    32349: "シリウス",      # おおいぬ座α星
    30438: "カノープス",     # りゅうこつ座α星
    91262: "ベガ",          # こと座α星
    97649: "アルタイル",     # わし座α星
    11767: "リゲル",        # オリオン座β星
    24436: "ベテルギウス",   # オリオン座α星
    27989: "プロキオン",     # こいぬ座α星
    69673: "アークトゥルス", # うしかい座α星
    65474: "スピカ",        # おとめ座α星
    21421: "アルデバラン",   # おうし座α星
    113368: "アンタレス",    # さそり座α星
    87833: "デネブ",        # はくちょう座α星
    80763: "デネボラ",      # しし座β星
    25336: "カペラ",        # ぎょしゃ座α星
    49669: "レグルス",      # しし座α星
    68702: "ポルックス",    # ふたご座β星
    62956: "アクルックス",   # みなみじゅうじ座α星
    71683: "ミモザ",        # みなみじゅうじ座β星
    24608: "ベラトリックス", # オリオン座γ星
    25930: "アルニラム",    # オリオン座ε星
    26311: "アルニタク",    # オリオン座ζ星
    26727: "サイフ",        # オリオン座κ星
    17702: "アルゴル",      # ペルセウス座β星
    677: "アルフェラッツ",   # アンドロメダ座α星
    3179: "ミラク",         # アンドロメダ座β星
    113881: "シャウラ",     # さそり座λ星
    85927: "ラス・アルハゲ", # へびつかい座α星
    46390: "カストル",      # ふたご座α星
    102098: "デネブ・カイトス", # くじら座β星
    68933: "アルカイド",    # おおぐま座η星
    59774: "ミザール",      # おおぐま座ζ星
    54061: "アリオト",      # おおぐま座ε星
    58001: "アルコル",      # おおぐま座80番星
    53910: "メラク",        # おおぐま座β星
    50801: "フェクダ",      # おおぐま座γ星
    48319: "メグレズ",      # おおぐま座δ星
    44471: "ドゥベ",        # おおぐま座α星
}

# 既存のstars.json読み込み
print("📂 既存の星データ読み込み中...")
with open("../public/data/stars.json", "r", encoding="utf-8") as f:
    stars = json.load(f)

print(f"✅ {len(stars)}件の星データを読み込みました")

# 固有名を追加
print("🔗 固有名をマッピング中...")
mapped_count = 0
for star in stars:
    if star["id"] in FAMOUS_STARS:
        star["properName"] = FAMOUS_STARS[star["id"]]
        mapped_count += 1

print(f"✅ {mapped_count}件の星に固有名を追加しました")

# 保存
output_file = "../public/data/stars.json"
print(f"💾 保存中: {output_file}")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(stars, f, ensure_ascii=False, indent=2)

print("✅ 完了！")

# サンプル表示
print("\n📋 固有名が付いた星:")
named_stars = sorted(
    [s for s in stars if s.get("properName")],
    key=lambda x: x["vmag"] if x["vmag"] is not None else 99
)
for star in named_stars:
    print(f"  HIP {star['id']:6d}: {star['properName']:15s} (vmag={star['vmag']:.2f})")
