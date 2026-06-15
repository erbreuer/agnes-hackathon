"""Manual smoke test for the pipeline agents.

Usage (from the backend/ directory):
    python scripts/test_agents.py analyze
    python scripts/test_agents.py plan
    python scripts/test_agents.py scout
    python scripts/test_agents.py render
    python scripts/test_agents.py pipeline   # runs the whole flow end-to-end
"""
import asyncio
import base64
import json
import os
import sys

# Make backend/ importable when run as `python scripts/test_agents.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents import analyze_space, plan_design, render_room, scout_products  # noqa: E402

_HERE = os.path.dirname(os.path.abspath(__file__))

_SAMPLE_BRIEF = {
    "style": "mid-century modern",
    "palette": ["warm white", "walnut brown", "sage green", "brass"],
    "lighting": "bright south-facing window, single ceiling pendant",
    "fixed_elements": ["radiator under window", "two doorways", "hardwood floor"],
    "approx_size": "medium ~18 sqm",
    "keep": ["walnut bookshelf"],
    "replace": ["worn beige sofa", "small dated rug"],
}

_SAMPLE_PROMPT = "make this room cozy and Scandinavian"
_SAMPLE_BUDGET = 1500
_SAMPLE_FEEDBACK = "cheaper sofa, add more plants"


def _load_room_b64() -> str:
    with open(os.path.join(_HERE, "sample_room.jpg"), "rb") as f:
        return base64.b64encode(f.read()).decode()


async def run_analyze():
    brief = await analyze_space(_load_room_b64())
    print(json.dumps(brief, indent=2))


def _assert_budget(plan: dict, budget: float, label: str) -> None:
    items = plan.get("items") or []
    total = sum(it["max_price"] for it in items)
    print(f"[{label}] sum(max_price) = {total:.2f} / budget {budget}")
    if total > budget + 1e-6:
        print(f"[{label}] FAIL: sum {total:.2f} exceeds budget {budget}")
        sys.exit(1)
    if not (4 <= len(items) <= 8):
        print(f"[{label}] WARN: expected 4-8 items, got {len(items)}")


async def run_plan():
    print("=== initial plan ===")
    plan = await plan_design(_SAMPLE_BRIEF, _SAMPLE_PROMPT, _SAMPLE_BUDGET)
    print(json.dumps(plan, indent=2))
    _assert_budget(plan, _SAMPLE_BUDGET, "initial")

    print("\n=== refined plan (with feedback) ===")
    refined = await plan_design(
        _SAMPLE_BRIEF, _SAMPLE_PROMPT, _SAMPLE_BUDGET, feedback=_SAMPLE_FEEDBACK
    )
    print(json.dumps(refined, indent=2))
    _assert_budget(refined, _SAMPLE_BUDGET, "refined")


async def run_scout():
    items = [
        {"search_query": "modern linen accent chair", "budget_cap": 400, "category": "chair"},
        {"search_query": "minimalist floor lamp", "budget_cap": 100, "category": "lamp"},
        {"search_query": "Scandinavian coffee table", "budget_cap": 250, "category": "table"},
    ]

    results = await scout_products(items)
    print(f"\nscout_products → {len(results)} products:\n")
    for p in results:
        print(json.dumps(p, indent=2))

    assert len(results) == len(items), "Expected one product per item"
    for p in results:
        assert p.get("name"), "Missing name"
        assert p.get("image"), "Missing image"
        assert p.get("link"), "Missing link"
    print("\nAll assertions passed.")


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
    # Stub list has 3 items — within the MAX_PRODUCTS cap.
    render = await render_room(_load_room_b64(), _STUB_PRODUCTS, _STUB_DESIGN_SUMMARY)
    print(json.dumps(render, indent=2))
    print(f"\nrender returned: {'OK' if render else 'FAIL'}")


def _plan_items_to_scout_items(plan_items: list[dict]) -> list[dict]:
    """Bridge F03 plan items → F04 scout input shape."""
    return [
        {
            "search_query": it["search_query"],
            "budget_cap": it["max_price"],
            "category": it["category"],
        }
        for it in plan_items
    ]


async def run_pipeline():
    """End-to-end: analyze_space → plan_design → scout_products → render_room."""
    room_b64 = _load_room_b64()

    print("=== 1/4 analyze_space ===")
    brief = await analyze_space(room_b64)
    print(json.dumps(brief, indent=2))

    print("\n=== 2/4 plan_design ===")
    plan = await plan_design(brief, _SAMPLE_PROMPT, _SAMPLE_BUDGET)
    print(json.dumps(plan, indent=2))
    _assert_budget(plan, _SAMPLE_BUDGET, "pipeline")
    if not plan["items"]:
        print("[pipeline] FAIL: plan returned no items")
        sys.exit(1)

    print("\n=== 3/4 scout_products ===")
    scout_items = _plan_items_to_scout_items(plan["items"])
    products = await scout_products(scout_items)
    print(f"got {len(products)}/{len(scout_items)} products")
    for p in products:
        print(json.dumps(p, indent=2))
    if not products:
        print("[pipeline] FAIL: scout returned no products")
        sys.exit(1)

    print("\n=== 4/4 render_room ===")
    # Simulate the user picking up to 3 of the scouted products.
    picked = products[:3]
    print(f"user picked {len(picked)}/{len(products)} products:")
    for p in picked:
        print(f"  - {p['name']}")
    render = await render_room(room_b64, picked, plan["design_summary"])
    print(json.dumps(render, indent=2))
    print(f"\nrender returned: {'OK' if render else 'FAIL'}")
    print("\n[pipeline] done.")


MODES = {
    "analyze": run_analyze,
    "plan": run_plan,
    "scout": run_scout,
    "render": run_render,
    "pipeline": run_pipeline,
}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "analyze"
    fn = MODES.get(mode)
    if not fn:
        print(f"unknown mode '{mode}'. choose from: {', '.join(MODES)}")
        sys.exit(1)
    asyncio.run(fn())


if __name__ == "__main__":
    main()
