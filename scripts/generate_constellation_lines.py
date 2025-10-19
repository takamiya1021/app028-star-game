#!/usr/bin/env python3
"""
Stellariumのconstellationship.fabをJSON形式に変換するスクリプト

入力:
  data/raw/stellarium/constellationship.fab
出力:
  public/data/constellation-lines.json
"""

import json
import pathlib
from typing import List

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "raw" / "stellarium" / "constellationship.fab"
TARGET = ROOT / "public" / "data" / "constellation-lines.json"


def parse_constellationship(line: str) -> dict:
    """
    Stellariumの1行を解析して星座線データに変換する
    フォーマット例:
      And 20 677 3092 3092 5447 ...
    先頭トークン: 星座ID (IAU略号)
    2番目: ペア数
    残り: HIP IDの列 (2 * ペア数 個)
    """
    tokens = line.strip().split()
    if len(tokens) < 3:
        raise ValueError(f"行のトークン数が不足しています: {line!r}")

    constellation_id = tokens[0]
    try:
        pair_count = int(tokens[1])
    except ValueError as exc:
        raise ValueError(f"ペア数が整数として解釈できません: {tokens[1]!r}") from exc

    numbers: List[int] = []
    for raw in tokens[2:]:
        try:
            numbers.append(int(raw))
        except ValueError as exc:
            raise ValueError(f"HIP IDが整数として解釈できません: {raw!r}") from exc

    expected_numbers = pair_count * 2
    if len(numbers) != expected_numbers:
        raise ValueError(
            f"HIP IDの数が一致しません: 期待 {expected_numbers} 個, 実際 {len(numbers)} 個, 行: {line!r}"
        )

    segments = [[numbers[i], numbers[i + 1]] for i in range(0, len(numbers), 2)]
    return {
        "constellationId": constellation_id,
        "lines": segments,
    }


def load_lines() -> list:
    if not SOURCE.exists():
        raise FileNotFoundError(f"入力ファイルが存在しません: {SOURCE}")

    records = []
    with SOURCE.open("r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                # Stellariumのファイルにはコメントは無いが安全のため無視
                continue
            record = parse_constellationship(line)
            records.append(record)

    records.sort(key=lambda entry: entry["constellationId"])
    return records


def main() -> None:
    records = load_lines()
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"生成完了: {TARGET} (星座数: {len(records)})")


if __name__ == "__main__":
    main()
