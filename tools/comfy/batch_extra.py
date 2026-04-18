"""補缺批次：辦公桌、掛軸、橫樑、達摩。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "wooden_desk",
        "simple wooden office desk pixel art, rectangular top view angled, "
        "oak brown wood, four legs, one drawer, front view, game asset icon",
        3001,
    ),
    (
        "kakemono_scroll",
        "japanese hanging scroll kakemono pixel art, vertical white paper scroll, "
        "black ink brushstroke painting of bamboo or mountain, dark wooden rollers top and bottom, "
        "hanging on wall, front view, simple",
        3002,
    ),
    (
        "ceiling_beam",
        "horizontal dark wooden ceiling beam pixel art, japanese traditional wood plank, "
        "long rectangular shape, oak brown grain, top down view, tileable",
        3003,
    ),
    (
        "daruma",
        "traditional japanese daruma doll pixel art, round red body with no limbs, "
        "white face with black beard and thick black eyebrows, one eye white one eye painted black, "
        "good luck charm, front view, cute icon",
        3004,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed)
        print()


if __name__ == "__main__":
    main()
