"""Test runner for agents. Usage: python scripts/test_agents.py <mode>"""
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def run_scout():
    from agents import scout_products

    items = [
        {"search_query": "modern linen accent chair", "budget_cap": 400, "category": "chair"},
        {"search_query": "minimalist floor lamp", "budget_cap": 100, "category": "lamp"},
        {"search_query": "Scandinavian coffee table", "budget_cap": 250, "category": "table"},
    ]

    results = asyncio.run(scout_products(items))
    print(f"\nscout_products → {len(results)} products:\n")
    for p in results:
        print(json.dumps(p, indent=2))

    assert len(results) == len(items), "Expected one product per item"
    for p in results:
        assert p.get("name"), "Missing name"
        assert p.get("image"), "Missing image"
        assert p.get("link"), "Missing link"
    print("\nAll assertions passed.")


MODES = {"scout": run_scout}

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode not in MODES:
        print(f"Usage: python scripts/test_agents.py [{' | '.join(MODES)}]")
        sys.exit(1)
    MODES[mode]()
