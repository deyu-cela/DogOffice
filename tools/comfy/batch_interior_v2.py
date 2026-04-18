"""Interior v2: 家具用 sdxl_iso_solo（弱 iso），牆飾用 sdxl（無 iso）。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


FURNITURE = [
    (
        "shop_vending",
        "cute japanese vending machine, red and white vertical stripes on top canopy, "
        "glass front with colorful drinks visible inside, coin slot and keypad, "
        "small floor-standing single machine",
        8001,
    ),
    (
        "dorm_sofa_set",
        "cozy single two-seat sofa with small round coffee table in front, "
        "cream ivory sofa with pastel mint cushions, wooden legs, "
        "small potted succulent on table, no rug no walls, just sofa and table",
        8002,
    ),
    (
        "hr_interview_desk",
        "single simple wooden desk with two chairs facing each other, "
        "cream oak wood, small stack of papers and pen cup on desk, "
        "no computer, no walls, no floor, only the desk and two chairs",
        8003,
    ),
]

WALL = [
    (
        "wall_clock",
        "round wall clock with wooden frame, cream ivory face, classic clock hands pointing at 10:10, "
        "roman numerals or simple dots, japanese kawaii style",
        8101,
    ),
    (
        "wall_poster",
        "rectangular framed wall poster, pastel mint green frame, "
        "cute cartoon cat or dog mascot illustration, simple big japanese text, kawaii style",
        8102,
    ),
    (
        "wall_scroll",
        "tall vertical hanging japanese scroll kakemono, cream paper with black sumi ink bamboo painting, "
        "dark wooden rods at top and bottom, rope for hanging, elegant simple",
        8103,
    ),
]


def main():
    print("=== 家具（sdxl_iso_solo） ===")
    for name, subject, seed in FURNITURE:
        print(f"-- {name} --")
        generate(name, subject, seed=seed, profile="sdxl_iso_solo")

    print("\n=== 牆飾（sdxl 無 iso） ===")
    for name, subject, seed in WALL:
        print(f"-- {name} --")
        generate(name, subject, seed=seed, profile="sdxl")


if __name__ == "__main__":
    main()
