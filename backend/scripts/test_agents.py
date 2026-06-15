"""Manual smoke test for the pipeline agents.

Usage (from the backend/ directory):
    python scripts/test_agents.py analyze
    python scripts/test_agents.py plan
    python scripts/test_agents.py scout
"""
import asyncio
import base64
import json
import os
import sys

# Make backend/ importable when run as `python scripts/test_agents.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents import analyze_space, plan_design, scout_products  # noqa: E402

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


MODES = {"analyze": run_analyze, "plan": run_plan, "scout": run_scout}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "analyze"
    fn = MODES.get(mode)
    if not fn:
        print(f"unknown mode '{mode}'. choose from: {', '.join(MODES)}")
        sys.exit(1)
    asyncio.run(fn())


if __name__ == "__main__":
    main()
