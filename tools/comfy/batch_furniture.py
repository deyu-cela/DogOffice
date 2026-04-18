"""家具批次：9 張 sprite。"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


BATCH = [
    (
        "bean_bag",
        "beige beanbag chair pixel art, soft round cushion seat, "
        "cream color fabric, simple shape, japanese minimalist, icon",
        1001,
    ),
    (
        "coffee_machine",
        "retro espresso coffee machine pixel art, chrome silver body, "
        "steam nozzle, single cup spout, front view, small appliance, clean icon",
        1002,
    ),
    (
        "bookshelf",
        "tall wooden bookshelf pixel art, three shelves with colorful books, "
        "brown oak wood, japanese minimalist, front view, game asset",
        1003,
    ),
    (
        "picture_frame",
        "japanese sumi-e ink painting in dark wooden frame pixel art, "
        "black ink bamboo or mountain artwork on white paper, rectangular frame, hanging wall art",
        1004,
    ),
    (
        "snack_jar",
        "ceramic cookie jar pixel art, round glass jar with wooden lid, "
        "full of round brown cookies inside, cute kitchen icon, front view",
        1005,
    ),
    (
        "toy_ball",
        "yellow tennis ball pixel art, round fuzzy ball with white stripe, "
        "dog toy, single object, front view, sprite icon",
        1006,
    ),
    (
        "clipboard",
        "brown wooden clipboard with white paper pixel art, silver metal clip at top, "
        "a few lines of text, front view, office supply icon",
        1007,
    ),
    (
        "crt_monitor",
        "retro CRT computer monitor pixel art, beige plastic case, "
        "blue screen with code lines, square 90s style, front view",
        1008,
    ),
    (
        "dumbbell",
        "black iron dumbbell pixel art, two round weights on metal bar, "
        "gym equipment, side view, simple object",
        1009,
    ),
]


def main():
    for name, subject, seed in BATCH:
        print(f"=== {name} ===")
        generate(name, subject, seed=seed)
        print()


if __name__ == "__main__":
    main()
