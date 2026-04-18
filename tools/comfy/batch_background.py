"""背景批次：障子窗、拉門、榻榻米/木地板 seamless。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "shoji_window",
        "traditional japanese shoji window pixel art, dark wooden frame with grid lattice, "
        "white paper panels showing soft light through, rectangular shape, front view, "
        "no scenery outside, clean asset",
        2001,
    ),
    (
        "shoji_door",
        "traditional japanese shoji sliding door pixel art, two panels side by side, "
        "dark wooden frame with grid pattern, white paper, closed, front view, "
        "small round handle on each panel",
        2002,
    ),
    (
        "tatami_texture",
        "seamless tileable tatami mat texture pixel art, yellow beige woven straw pattern, "
        "horizontal weave lines, top down view, japanese flooring tile, repeating pattern",
        2003,
    ),
    (
        "wood_floor_texture",
        "seamless tileable wooden plank floor texture pixel art, warm oak brown planks, "
        "horizontal wood grain, top down view, japanese flooring tile, repeating pattern",
        2004,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed)
        print()


if __name__ == "__main__":
    main()
