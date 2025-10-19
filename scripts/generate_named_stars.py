#!/usr/bin/env python3
"""
IAU Catalog of Star Names (IAU-CSN) から固有名星データを抽出してJSON化するスクリプト

入力:
  data/raw/iau/IAU-CSN.txt
出力:
  public/data/named-stars.json
"""

from __future__ import annotations

import json
import pathlib
import re
from dataclasses import dataclass
from typing import Iterable, Optional

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "raw" / "iau" / "IAU-CSN.txt"
TARGET = ROOT / "public" / "data" / "named-stars.json"


@dataclass
class NamedStar:
    hip: int
    iau_name: str
    diacritics: Optional[str]
    designation: Optional[str]
    bayer: Optional[str]
    bayer_symbol: Optional[str]
    constellation: Optional[str]
    component: Optional[str]
    wds: Optional[str]
    magnitude: Optional[float]
    band: Optional[str]
    hd: Optional[int]
    ra: Optional[float]
    dec: Optional[float]
    adoption_date: Optional[str]
    notes: Optional[str]

    def to_dict(self) -> dict:
        data = {
            "hip": self.hip,
            "iauName": self.iau_name,
            "diacritics": self.diacritics,
            "designation": self.designation,
            "bayer": self.bayer,
            "bayerSymbol": self.bayer_symbol,
            "constellation": self.constellation,
            "component": self.component,
            "wds": self.wds,
            "magnitude": self.magnitude,
            "band": self.band,
            "hd": self.hd,
            "ra": self.ra,
            "dec": self.dec,
            "adoptionDate": self.adoption_date,
            "notes": self.notes,
        }
        # None値はJSON化時に削除してデータサイズを抑える
        return {key: value for key, value in data.items() if value is not None}


def parse_int(value: str) -> Optional[int]:
    value = value.strip()
    if not value or value == "_":
        return None
    return int(value)


def parse_float(value: str) -> Optional[float]:
    value = value.strip()
    if not value or value == "_":
        return None
    return float(value)


def parse_line(line: str) -> Optional[NamedStar]:
    if not line.strip():
        return None
    if line[0] in "#$":
        return None

    ascii_name = line[:18].strip()
    diacritics = line[18:36].strip() or None

    rest = line[36:].strip()
    if not rest:
        return None

    tokens = rest.split()
    if not tokens:
        return None

    # 末尾から採用日(YYYY-MM-DD)を検出
    adoption_date = None
    notes_tokens = []
    for idx in range(len(tokens) - 1, -1, -1):
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", tokens[idx]):
            adoption_date = tokens[idx]
            notes_tokens = tokens[idx + 1 :]
            tokens = tokens[:idx]
            break
    else:
        # 採用日が無い場合は全体を対象にする
        notes_tokens = []

    if not tokens:
        return None

    tokens_work = tokens[:]  # popで破壊するためコピー

    def pop_or_none(items: list[str]) -> Optional[str]:
        return items.pop() if items else None

    dec_raw = pop_or_none(tokens_work)
    ra_raw = pop_or_none(tokens_work)
    hd_raw = pop_or_none(tokens_work)
    hip_raw = pop_or_none(tokens_work)
    band_raw = pop_or_none(tokens_work)
    mag_raw = pop_or_none(tokens_work)
    wds_raw = pop_or_none(tokens_work)
    component_raw = pop_or_none(tokens_work)
    constellation_raw = pop_or_none(tokens_work)
    bayer_symbol = pop_or_none(tokens_work)
    bayer = pop_or_none(tokens_work)
    designation_tokens = tokens_work
    designation = " ".join(designation_tokens).strip() or None

    hip = parse_int(hip_raw or "") if hip_raw is not None else None
    if hip is None:
        # HIPが無い場合はHipparcosデータと突合できないためスキップ
        return None

    hd = parse_int(hd_raw or "") if hd_raw is not None else None
    magnitude = parse_float(mag_raw or "") if mag_raw is not None else None
    ra = parse_float(ra_raw or "") if ra_raw is not None else None
    dec = parse_float(dec_raw or "") if dec_raw is not None else None

    constellation = constellation_raw if constellation_raw not in (None, "_") else None
    component = component_raw if component_raw not in (None, "_") else None
    wds = wds_raw if wds_raw not in (None, "_") else None
    band = band_raw if band_raw not in (None, "_") else None

    notes = " ".join(notes_tokens).strip() if notes_tokens else None
    if notes == "":
        notes = None

    return NamedStar(
        hip=hip,
        iau_name=ascii_name,
        diacritics=diacritics,
        designation=designation if designation and designation != "_" else None,
        bayer=bayer if bayer and bayer != "_" else None,
        bayer_symbol=bayer_symbol if bayer_symbol and bayer_symbol != "_" else None,
        constellation=constellation,
        component=component,
        wds=wds,
        magnitude=magnitude,
        band=band,
        hd=hd,
        ra=ra,
        dec=dec,
        adoption_date=adoption_date if adoption_date and adoption_date != "_" else None,
        notes=notes,
    )


def load_named_stars() -> Iterable[NamedStar]:
    if not SOURCE.exists():
        raise FileNotFoundError(f"入力ファイルが存在しません: {SOURCE}")

    seen = {}
    with SOURCE.open("r", encoding="utf-8") as f:
        for raw_line in f:
            star = parse_line(raw_line)
            if star is None:
                continue
            # HIPごとに最新のレコードを保持（重複登録がある場合は後勝ち）
            seen[star.hip] = star

    return sorted(seen.values(), key=lambda s: s.hip)


def main() -> None:
    stars = load_named_stars()
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", encoding="utf-8") as f:
        json.dump([star.to_dict() for star in stars], f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"生成完了: {TARGET} (固有名付き星数: {len(stars)})")


if __name__ == "__main__":
    main()
