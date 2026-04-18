"""3 張互動建築 sprite（iso 風格）。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "shop_building",
        "cute japanese shop building, small storefront with wooden sliding door, "
        "red awning roof with white noren curtain hanging at entrance, "
        "wooden signboard, stone lantern beside entrance, one story, front view",
        5001,
    ),
    (
        "dorm_building",
        "cute japanese dormitory house, small wooden cottage with tiled sloped roof, "
        "paper sliding door entrance, small window on side, traditional ryokan style, "
        "cozy one story building, front view",
        5002,
    ),
    (
        "hr_office",
        "cute japanese office building, small wooden office with glass entrance door, "
        "sign above reading office, potted plant beside door, tiled roof, "
        "traditional japanese architecture, one story, front view",
        5003,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed)
        print()


if __name__ == "__main__":
    main()
