"""室內互動家具 + 牆面裝飾（kawaii iso 統一風格）。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    # 互動錨點（取代建築外觀）
    (
        "shop_vending",
        "cute japanese vending machine, red and white vertical stripes, "
        "small display window with colorful drinks, pastel mint cream accents, "
        "small kawaii style, single object, front-facing",
        7001,
    ),
    (
        "dorm_sofa_set",
        "cozy two-seat sofa with small round coffee table in front, "
        "soft cream ivory sofa with pastel mint cushions, wooden legs, "
        "small potted plant on table, japanese minimalist style",
        7002,
    ),
    (
        "hr_interview_desk",
        "simple wooden interview desk set with two chairs face to face, "
        "cream oak wood, clipboard and small lamp on desk, "
        "japanese minimalist office, single object",
        7003,
    ),
    # 牆面裝飾
    (
        "wall_clock",
        "round wooden wall clock, cream ivory face with wooden frame, "
        "simple clean design, kawaii japanese style, mint accent",
        7101,
    ),
    (
        "wall_poster",
        "cute japanese motivational poster, pastel colors, mint green frame, "
        "simple typography with cute mascot illustration, kawaii style, single poster",
        7102,
    ),
    (
        "wall_scroll",
        "hanging japanese scroll painting kakemono, vertical cream paper with "
        "soft ink sumi-e bamboo painting, wooden rollers top and bottom, single hanging object",
        7103,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed, profile="sdxl_iso")
        print()


if __name__ == "__main__":
    main()
