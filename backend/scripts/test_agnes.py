"""Manual smoke test for the Agnes client.

Usage (from the backend/ directory):
    python scripts/test_agnes.py chat
    python scripts/test_agnes.py image
    python scripts/test_agnes.py video
"""
import asyncio
import os
import sys

# Make backend/ importable when run as `python scripts/test_agnes.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agnes import chat, image, video  # noqa: E402


async def run_chat():
    reply = await chat([{"role": "user", "content": "reply with the word OK"}])
    print("chat reply:", reply)


async def run_image():
    urls = await image("a cozy minimalist reading nook with warm lighting", [])
    print("image urls:", urls)


async def run_video():
    url = await video("slow pan across a cozy minimalist reading nook with warm lighting")
    print("video url:", url)


MODES = {"chat": run_chat, "image": run_image, "video": run_video}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "chat"
    fn = MODES.get(mode)
    if not fn:
        print(f"unknown mode '{mode}'. choose from: {', '.join(MODES)}")
        sys.exit(1)
    asyncio.run(fn())


if __name__ == "__main__":
    main()
