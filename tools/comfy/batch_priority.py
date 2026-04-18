"""優先批 5 張：驗證風格後再跑其他。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "lantern_red",
        "traditional japanese red paper lantern chochin, round cylindrical shape, "
        "white kanji character on red paper, wooden top and bottom caps, "
        "hanging rope at top, front view, isolated",
        101,
    ),
    (
        "potted_plant_bonsai",
        "small bonsai tree in brown clay pot, green leaves, twisted trunk, "
        "japanese zen garden style, front view, isolated",
        202,
    ),
    (
        "bamboo_pot",
        "three stalks of tall green bamboo in round black pot, "
        "lucky bamboo plant, green leaves, front view, isolated",
        303,
    ),
    (
        "sakura_branch",
        "sakura cherry blossom branch with soft pink flowers on dark brown branch, "
        "decorative ornament, a few petals, gentle spring vibe, isolated",
        404,
    ),
    (
        "sakura_petal",
        "single sakura cherry blossom petal, five petal shape, "
        "light pink with slightly darker edges, top down view, simple flat shape, isolated",
        505,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed)
        print()


if __name__ == "__main__":
    main()
