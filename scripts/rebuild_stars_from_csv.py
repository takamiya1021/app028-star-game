#!/usr/bin/env python3
"""
hipparcos_vmag9_named.csv から public/data/stars.json を再生成するユーティリティ。

重複する Vmag 列が存在するため DictReader では値を取りこぼす。
本スクリプトでは 0-based index 6 の Vmag（元の値）を優先し、
欠損時は index 14 の列をフォールバックとして参照する。
"""

import csv
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "scripts" / "hipparcos_vmag9_named.csv"
OUTPUT_PATH = ROOT / "public" / "data" / "stars.json"


def parse_float(value: str) -> float | None:
  value = value.strip()
  if not value:
    return None
  try:
    number = float(value)
    if math.isnan(number):
      return None
    return number
  except ValueError:
    return None


def parse_int(value: str) -> int | None:
  value = value.strip()
  if not value:
    return None
  try:
    return int(value)
  except ValueError:
    return None


def build_star(row: list[str]) -> dict:
  vmag_primary = parse_float(row[6])
  vmag_secondary = parse_float(row[14]) if len(row) > 14 else None
  vmag = vmag_primary if vmag_primary is not None else vmag_secondary

  bv_primary = parse_float(row[7])
  bv_secondary = parse_float(row[15]) if len(row) > 15 else None
  bv = bv_primary if bv_primary is not None else bv_secondary

  return {
    "id": parse_int(row[0]),
    "ra": parse_float(row[1]),
    "dec": parse_float(row[2]),
    "vmag": vmag,
    "bv": bv,
    "spectralType": row[13].strip() or None,
    "name": row[10].strip() or None,
    "hd": parse_int(row[8]),
    "hr": parse_int(row[9]),
    "parallax": parse_float(row[3]),
    "pmRA": parse_float(row[4]),
    "pmDE": parse_float(row[5]),
  }


def main() -> None:
  stars: list[dict] = []

  with CSV_PATH.open(newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    headers = next(reader)
    if headers.count("Vmag") < 2:
      raise RuntimeError("CSV format unexpected: duplicate Vmag columns not found.")

    for row in reader:
      if not row or not row[0].strip():
        continue
      stars.append(build_star(row))

  OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
  with OUTPUT_PATH.open("w", encoding="utf-8") as f:
    json.dump(stars, f, ensure_ascii=False, indent=2)
    f.write("\n")

  print(f"書き出し完了: {OUTPUT_PATH} (総数 {len(stars)} 件, Vmagあり {sum(1 for s in stars if s['vmag'] is not None)} 件)")


if __name__ == "__main__":
  main()
