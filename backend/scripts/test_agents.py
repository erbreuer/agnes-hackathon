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

from agents import analyze_space  # noqa: E402

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load_room_b64() -> str:
    with open(os.path.join(_HERE, "sample_room.jpg"), "rb") as f:
        return base64.b64encode(f.read()).decode()


async def run_analyze():
    brief = await analyze_space(_load_room_b64())
    print(json.dumps(brief, indent=2))


MODES = {"analyze": run_analyze}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "analyze"
    fn = MODES.get(mode)
    if not fn:
        print(f"unknown mode '{mode}'. choose from: {', '.join(MODES)}")
        sys.exit(1)
    asyncio.run(fn())


if __name__ == "__main__":
    main()
