"""Agnes AI client. OpenAI-compatible chat/completions. chat() only for now."""
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

BASE = "https://apihub.agnes-ai.com/v1"
AGNES_API_KEY = os.getenv("AGNES_API_KEY")


async def chat(messages: list, model: str = "agnes-2.0-flash") -> str:
    """POST messages to Agnes chat/completions and return the assistant text."""
    headers = {"Authorization": f"Bearer {AGNES_API_KEY}"}
    payload = {"model": model, "messages": messages}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE}/chat/completions", headers=headers, json=payload
        )
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"]
