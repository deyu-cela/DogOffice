"""
DogOffice 日系 pixel art 資產產生器
- ComfyUI API (127.0.0.1:8188)
- Pony Diffusion V6 XL + Pixel Art XL LoRA
- 產 1024x1024，交由前端或 CSS 縮放
"""

import argparse
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import uuid

import numpy as np
from PIL import Image
from skimage.segmentation import flood


def remove_bg(path: str, tolerance: int = 30, feather: int = 2) -> str:
    """Flood fill from four corners to remove connected background,
    preserving any white areas inside the foreground object.
    """
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    gray = arr[..., :3].mean(axis=-1).astype(np.uint8)

    mask = np.zeros((h, w), dtype=bool)
    for y, x in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        # only flood if corner is actually bright (near-white bg)
        if gray[y, x] >= 200:
            mask |= flood(gray, (y, x), tolerance=tolerance)

    # soft edge: feather mask by shrinking it slightly
    if feather > 0:
        from scipy.ndimage import binary_dilation
        # invert, dilate foreground, invert back = shrink background mask
        fg = ~mask
        fg_dilated = binary_dilation(fg, iterations=feather)
        mask = ~fg_dilated

    arr[mask, 3] = 0
    out_img = Image.fromarray(arr)
    base, _ = os.path.splitext(path)
    out = base + "_alpha.png"
    out_img.save(out, "PNG")
    return out

SERVER = "127.0.0.1:8188"
LORA = "pixel-art-xl.safetensors"
ISO_LORA = "isometric_view.safetensors"
DEFAULT_SAVE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "jp-office")
)

PROFILES = {
    "pony": {
        "ckpt": "ponyDiffusionV6XL.safetensors",
        "quality_prefix": "score_9, score_8_up, score_7_up, source_cartoon, rating_safe, ",
        "style_suffix": (
            ", chibi, cute, centered, minimalist, japanese aesthetic, "
            "((solid pure white background:1.4)), (single object:1.3), "
            "(sprite icon:1.2), no pattern, no frame, no scenery, no humans"
        ),
        "negative": (
            "score_6, score_5, score_4, realistic, 3d render, photo, blurry, "
            "worst quality, low quality, watermark, text, signature, deformed, ugly, "
            "nsfw, dark, gloomy, humanoid, anthropomorphic, furry, "
            "complex background, pattern background, gradient background, "
            "(clothing:1.5), (kimono:1.5), (robe:1.5), (dress:1.5), (bow:1.4)"
        ),
        "sampler": "euler_ancestral",
        "scheduler": "normal",
        "cfg": 7.0,
        "steps": 28,
    },
    "sdxl": {
        "ckpt": "sd_xl_base_1.0.safetensors",
        "quality_prefix": "masterpiece, best quality, highly detailed, ",
        "style_suffix": (
            ", pixel art style, 16bit game sprite, retro game asset, "
            "((isometric view:1.3)), ((2:1 isometric projection:1.2)), "
            "3/4 angled top-down oblique view, "
            "centered, minimalist, japanese aesthetic, "
            "((solid pure white background:1.4)), (single isolated object:1.3), "
            "(item icon:1.2), no humans, no characters, no background"
        ),
        "negative": (
            "realistic photo, 3d render, blurry, "
            "worst quality, low quality, watermark, text, signature, deformed, "
            "nsfw, dark, gloomy, person, human, character, humanoid, animal, "
            "complex background, pattern background, gradient background, scenery, "
            "multiple objects, busy scene, hands, face, eyes"
        ),
        "sampler": "dpmpp_2m",
        "scheduler": "karras",
        "cfg": 7.0,
        "steps": 30,
        "pixel_lora_strength": 1.0,
        "iso_lora_strength": 0.0,
    },
    "sdxl_iso": {
        "ckpt": "sd_xl_base_1.0.safetensors",
        "quality_prefix": "masterpiece, best quality, highly detailed, ",
        "style_suffix": (
            ", ((isometric view:1.5)), 3/4 angled top-down view, isometric game asset, "
            "visible left wall and right wall, sloped tiled roof, "
            "kawaii pastel color palette, soft mint green cream ivory pale pink, "
            "cute japanese architecture, chibi style, pixel art 16bit, "
            "centered, single isolated object, clean outline, crisp pixels, "
            "((solid pure white background:1.4)), no background, no humans"
        ),
        "negative": (
            "front view, flat facade, orthographic, 2D only, sprite sheet, tileset, "
            "multiple buildings, interior view, humans, characters, person, humanoid, "
            "realistic photo, 3d render, blurry, worst quality, low quality, "
            "text, watermark, signature, deformed, complex scenery, "
            "dark colors, saturated red, heavy shadows, gloomy, vignette"
        ),
        "sampler": "dpmpp_2m",
        "scheduler": "karras",
        "cfg": 7.5,
        "steps": 32,
        "pixel_lora_strength": 0.55,
        "iso_lora_strength": 1.8,
    },
    "sdxl_iso_solo": {
        "ckpt": "sd_xl_base_1.0.safetensors",
        "quality_prefix": "masterpiece, best quality, highly detailed, ",
        "style_suffix": (
            ", ((isometric view:1.2)), 3/4 angled oblique view, game asset sprite, "
            "kawaii pastel color palette, soft mint green cream ivory pale pink, "
            "cute japanese style, pixel art 16bit, clean outline, crisp pixels, "
            "((standalone single object:1.5)), ((cutout sticker style:1.3)), "
            "((no surrounding room:1.4)), no walls, no floor plane, no ceiling, "
            "centered, ((solid pure white background:1.4))"
        ),
        "negative": (
            "sprite sheet, tileset, multiple objects, duplicated copies, "
            "((enclosed room:1.4)), ((four walls:1.3)), ((doll house cross section:1.3)), "
            "((floor under object:1.2)), interior scene, room layout, house cutaway, "
            "front view, flat facade, orthographic, 2D only, "
            "humans, characters, person, humanoid, realistic photo, 3d render, "
            "blurry, worst quality, low quality, text, watermark, signature, deformed, "
            "dark colors, heavy shadows, gloomy"
        ),
        "sampler": "dpmpp_2m",
        "scheduler": "karras",
        "cfg": 7.5,
        "steps": 32,
        "pixel_lora_strength": 0.55,
        "iso_lora_strength": 1.0,
    },
}


def build_workflow(positive: str, negative: str, name: str, seed: int,
                   ckpt: str, sampler: str, scheduler: str,
                   cfg: float, steps: int,
                   w: int = 1024, h: int = 1024,
                   pixel_lora_strength: float = 1.0,
                   iso_lora_strength: float = 0.0):
    wf: dict = {
        "3": {"class_type": "CheckpointLoaderSimple",
              "inputs": {"ckpt_name": ckpt}},
        "4": {"class_type": "LoraLoader",
              "inputs": {
                  "lora_name": LORA,
                  "strength_model": pixel_lora_strength,
                  "strength_clip": pixel_lora_strength,
                  "model": ["3", 0], "clip": ["3", 1]}},
    }
    if iso_lora_strength > 0:
        wf["11"] = {
            "class_type": "LoraLoader",
            "inputs": {
                "lora_name": ISO_LORA,
                "strength_model": iso_lora_strength,
                "strength_clip": iso_lora_strength,
                "model": ["4", 0], "clip": ["4", 1],
            },
        }
        model_ref, clip_ref = ["11", 0], ["11", 1]
    else:
        model_ref, clip_ref = ["4", 0], ["4", 1]
    wf["5"] = {"class_type": "CLIPTextEncode",
               "inputs": {"text": positive, "clip": clip_ref}}
    wf["6"] = {"class_type": "CLIPTextEncode",
               "inputs": {"text": negative, "clip": clip_ref}}
    wf["7"] = {"class_type": "EmptyLatentImage",
               "inputs": {"width": w, "height": h, "batch_size": 1}}
    wf["8"] = {"class_type": "KSampler",
               "inputs": {
                   "seed": seed, "steps": steps, "cfg": cfg,
                   "sampler_name": sampler, "scheduler": scheduler,
                   "denoise": 1.0,
                   "model": model_ref,
                   "positive": ["5", 0],
                   "negative": ["6", 0],
                   "latent_image": ["7", 0]}}
    wf["9"] = {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["3", 2]}}
    wf["10"] = {"class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": f"dogoffice/{name}",
                    "images": ["9", 0]}}
    return wf


def queue(workflow) -> str:
    body = json.dumps({"prompt": workflow, "client_id": uuid.uuid4().hex}).encode()
    req = urllib.request.Request(
        f"http://{SERVER}/prompt",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    if "prompt_id" not in data:
        raise RuntimeError(f"Queue failed: {data}")
    return data["prompt_id"]


def wait(pid: str, timeout: float = 300.0):
    start = time.time()
    while True:
        with urllib.request.urlopen(f"http://{SERVER}/history/{pid}") as r:
            data = json.loads(r.read())
        if pid in data and data[pid].get("status", {}).get("completed"):
            return data[pid]
        if time.time() - start > timeout:
            raise TimeoutError(f"Prompt {pid} timed out")
        time.sleep(0.8)


def download(image_info, save_dir: str) -> str:
    fn = image_info["filename"]
    sub = image_info.get("subfolder", "")
    typ = image_info.get("type", "output")
    params = urllib.parse.urlencode({"filename": fn, "subfolder": sub, "type": typ})
    url = f"http://{SERVER}/view?{params}"
    os.makedirs(save_dir, exist_ok=True)
    local = os.path.join(save_dir, fn)
    with urllib.request.urlopen(url) as r, open(local, "wb") as f:
        f.write(r.read())
    return local


def generate(name: str, subject: str, seed: int = 42,
             save_dir: str = DEFAULT_SAVE_DIR,
             lora_strength: float | None = None,
             transparent: bool = True,
             profile: str = "sdxl_iso") -> list:
    p = PROFILES[profile]
    positive = (
        p["quality_prefix"]
        + "pixel art, 16bit sprite, crisp pixels, clean outline, "
        + subject
        + p["style_suffix"]
    )
    pix_s = lora_strength if lora_strength is not None else p.get("pixel_lora_strength", 1.0)
    iso_s = p.get("iso_lora_strength", 0.0)
    workflow = build_workflow(
        positive, p["negative"], name, seed,
        ckpt=p["ckpt"], sampler=p["sampler"], scheduler=p["scheduler"],
        cfg=p["cfg"], steps=p["steps"],
        pixel_lora_strength=pix_s, iso_lora_strength=iso_s,
    )
    pid = queue(workflow)
    print(f"[queue] [{profile}] {name} -> {pid}")
    result = wait(pid)
    imgs = result["outputs"].get("10", {}).get("images", [])
    paths = []
    for img in imgs:
        raw = download(img, save_dir)
        paths.append(raw)
        print(f"[raw]   {raw}")
        if transparent:
            alpha = remove_bg(raw)
            paths.append(alpha)
            print(f"[alpha] {alpha}")
    return paths


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name", help="output filename prefix, e.g. maneki_neko")
    ap.add_argument("subject", help="main subject description")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--save", default=DEFAULT_SAVE_DIR)
    ap.add_argument("--lora", type=float, default=1.0, help="pixel-art LoRA strength")
    ap.add_argument("--profile", choices=list(PROFILES.keys()), default="sdxl",
                    help="sdxl for objects, pony for characters")
    args = ap.parse_args()

    generate(args.name, args.subject, args.seed, args.save, args.lora, profile=args.profile)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
