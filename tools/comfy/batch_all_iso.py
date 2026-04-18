"""Regenerate all sprites in isometric angle."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate import generate  # noqa: E402


# 家具 + 植物 + 裝飾（iso 視角）
BATCH = [
    # priority
    ("lantern_red_iso", "red japanese paper lantern, traditional chochin, cylindrical with red paper and wooden caps, hanging", 4101),
    ("bonsai_iso", "small bonsai tree, green leafy canopy, short trunk, blue rectangular ceramic pot with soil", 4102),
    ("bamboo_pot_iso", "three stalks of tall green bamboo in round black pot, lucky bamboo plant", 4103),
    ("sakura_branch_iso", "cherry blossom branch with pink flowers on dark brown branch, decorative ornament", 4104),
    ("sakura_petal_iso", "single small sakura cherry blossom petal, five petal shape, pink flat shape", 4105),
    # furniture
    ("bean_bag_iso", "beige round beanbag chair, cream fabric, soft cushion, japanese minimalist", 4201),
    ("coffee_machine_iso", "retro espresso coffee machine, chrome silver body, steam nozzle, cup spout, small appliance", 4202),
    ("bookshelf_iso", "tall wooden bookshelf, three shelves with colorful books, oak wood, japanese minimalist", 4203),
    ("picture_frame_iso", "japanese sumi-e ink painting in dark wooden frame, black brushstroke bamboo, wall art", 4204),
    ("snack_jar_iso", "ceramic cookie jar, round glass with wooden lid, full of round cookies inside", 4205),
    ("toy_ball_iso", "yellow tennis ball, round fuzzy ball with white stripe, dog toy", 4206),
    ("clipboard_iso", "brown wooden clipboard with white paper, silver metal clip, lines of text", 4207),
    ("crt_monitor_iso", "retro CRT computer monitor, beige plastic case, blue screen, 90s style", 4208),
    ("dumbbell_iso", "black iron dumbbell, two round weights on metal bar, gym equipment", 4209),
    # window/door
    ("shoji_window_iso", "traditional japanese shoji window, dark wooden grid frame, white paper panels", 4301),
    ("shoji_door_iso", "traditional japanese shoji sliding door, two panels, wooden frame grid, white paper, closed", 4302),
    # extra
    ("wooden_desk_iso", "simple wooden office desk, oak brown rectangular top, four legs, one drawer", 4401),
    ("daruma_iso", "traditional japanese daruma doll, round red body, white face with thick black eyebrows, one eye painted", 4402),
    # character (Pony profile)
    ("maneki_neko_iso", None, 4501),  # special: use pony profile
]


def main():
    for entry in BATCH:
        name, subject, seed = entry
        print(f"=== {name} ===")
        if name == "maneki_neko_iso":
            generate(
                name,
                "(1cat:1.3), solo, (white fur:1.3), pink inner ears, "
                "(small red collar with single gold bell:1.2), "
                "(one paw raised high waving:1.3), sitting, "
                "(isometric view:1.2), 3/4 angled oblique angle, "
                "looking at viewer, smiling, simple, cute, neko atsume style",
                seed=seed,
                profile="pony",
            )
        else:
            generate(name, subject, seed=seed, profile="sdxl")
        print()


if __name__ == "__main__":
    main()
