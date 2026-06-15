"""Manual smoke test for the pipeline agents.

Usage (from the backend/ directory):
    python scripts/test_agents.py analyze
"""
import asyncio
import base64
import json
import os
import sys

# Make backend/ importable when run as `python scripts/test_agents.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents import analyze_space, render_room  # noqa: E402

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load_room_b64() -> str:
    with open(os.path.join(_HERE, "sample_room.jpg"), "rb") as f:
        return base64.b64encode(f.read()).decode()


async def run_analyze():
    brief = await analyze_space(_load_room_b64())
    print(json.dumps(brief, indent=2))


_STUB_PRODUCTS = [
    {
        "name": "Mid-Century Modern Sofa",
        "price": 699.0,
        "link": "https://www.wayfair.com/furniture/pdp/sofa-example",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
    {
        "name": "Walnut Coffee Table",
        "price": 299.0,
        "link": "https://www.wayfair.com/furniture/pdp/coffee-table-example",
        "image": "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400",
    },
    {
        "name": "Linen Floor Lamp",
        "price": 149.0,
        "link": "https://www.wayfair.com/furniture/pdp/floor-lamp-example",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    },
]

_STUB_DESIGN_SUMMARY = (
    "Scandinavian minimalist living room with warm oak tones, soft linen textiles, "
    "and abundant natural light. Clean lines, functional layout."
)


async def run_render():
    renders = await render_room(_load_room_b64(), _STUB_PRODUCTS, _STUB_DESIGN_SUMMARY)
    print(json.dumps(renders, indent=2))
    print(f"\n{len(renders)}/3 renders returned.")


MODES = {"analyze": run_analyze, "render": run_render}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "analyze"
    fn = MODES.get(mode)
    if not fn:
        print(f"unknown mode '{mode}'. choose from: {', '.join(MODES)}")
        sys.exit(1)
    asyncio.run(fn())


if __name__ == "__main__":
    main()
