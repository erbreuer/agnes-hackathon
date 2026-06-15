"""Agnes AI client. OpenAI-compatible. chat() (F00), image() + video() (F01)."""
import asyncio
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

BASE = "https://apihub.agnes-ai.com/v1"
AGNES_API_KEY = os.getenv("AGNES_API_KEY")


def _headers() -> dict:
    """Bearer auth header reused by every Agnes call. Never log the value."""
    return {"Authorization": f"Bearer {AGNES_API_KEY}"}


async def chat(messages: list, model: str = "agnes-2.0-flash") -> str:
    """POST messages to Agnes chat/completions and return the assistant text."""
    payload = {"model": model, "messages": messages}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE}/chat/completions", headers=_headers(), json=payload
        )
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"]


async def image(
    prompt: str,
    image_urls: list = [],
    size: str = "1024x768",
    model: str = "agnes-image-2.0-flash",
) -> list:
    """Generate/compose renders. image_urls + response_format go in extra_body.

    image_urls may mix base64 data URIs and plain https URLs — pass through as-is.
    Returns a list of render URLs (data URI if only b64_json is returned). [] on error.
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "extra_body": {"image": image_urls, "response_format": "url"},
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{BASE}/images/generations", headers=_headers(), json=payload
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        print(f"[agnes.image] error: {e}")
        return []
    print(f"[agnes.image] raw response: {data}")
    urls = []
    for item in data.get("data", []) or []:
        if item.get("url"):
            urls.append(item["url"])
        elif item.get("b64_json"):
            urls.append(f"data:image/png;base64,{item['b64_json']}")
    return urls


async def video(
    prompt: str,
    image_url: str = None,
    model: str = "agnes-video-v2.0",
) -> str:
    """Create a video task, poll until done (~5 min max), return video_url or None.

    Logs the raw JSON on the first create + first poll so field names can be
    confirmed (id vs task_id, status values, video_url). Never crashes the caller.
    """
    create = {"model": model, "prompt": prompt, "num_frames": 121, "frame_rate": 24}
    if image_url:
        create["image"] = image_url
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{BASE}/videos", headers=_headers(), json=create)
            resp.raise_for_status()
            created = resp.json()
            print(f"[agnes.video] create raw: {created}")
            task_id = (
                created.get("id")
                or created.get("task_id")
                or (created.get("data") or {}).get("id")
            )
            if not task_id:
                print("[agnes.video] no task id found in create response")
                return None
            for i in range(60):  # 60 tries x 5s = ~5 min
                await asyncio.sleep(5)
                poll = await client.get(
                    f"{BASE}/videos/{task_id}", headers=_headers()
                )
                poll.raise_for_status()
                pdata = poll.json()
                if i == 0:
                    print(f"[agnes.video] first poll raw: {pdata}")
                status = str(pdata.get("status", "")).lower()
                if status in ("completed", "succeeded", "success", "done"):
                    return pdata.get("video_url") or (
                        pdata.get("data") or {}
                    ).get("video_url")
                if status in ("failed", "error", "cancelled"):
                    print(f"[agnes.video] task ended in status={status}: {pdata}")
                    return None
            print("[agnes.video] timed out after ~5 min")
            return None
    except Exception as e:
        print(f"[agnes.video] error: {e}")
        return None
