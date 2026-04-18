"""Kawaii iso 批次：3 棟建築（日系清爽薄荷奶油配色 + iso LoRA）。
驗證方向後再批家具。
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "shop_kawaii",
        "cute small japanese shop building, pastel mint green walls with cream trim, "
        "light pink striped awning roof, wooden signboard with kanji, "
        "sliding paper door entrance, stone lantern beside entrance, "
        "one story, soft rounded corners",
        6001,
    ),
    (
        "dorm_kawaii",
        "cute small japanese dormitory house, cream ivory walls, "
        "pastel sage green tiled sloped roof, wooden sliding door, "
        "small window with window box, cozy one story cottage, "
        "soft rounded shapes",
        6002,
    ),
    (
        "hr_kawaii",
        "cute small japanese office building, pale beige walls, "
        "soft pink tiled roof, glass entrance door with wooden frame, "
        "small hanging sign, potted bonsai plant beside door, one story",
        6003,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed, profile="sdxl_iso")
        print()


if __name__ == "__main__":
    main()
