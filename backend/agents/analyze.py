"""F02 space analyst: turn a room photo into a structured 7-key space brief.

Uses the Agnes vision model via agnes.chat(); parses the JSON reply defensively.
"""
import json

from agnes import chat

_STR_KEYS = ["style", "lighting", "approx_size"]
_LIST_KEYS = ["palette", "fixed_elements", "keep", "replace"]

_INSTRUCTION = (
    "You are an interior design analyst. Look at this room photo and return a JSON "
    "object describing it, using exactly these keys: style, palette, lighting, "
    "fixed_elements, approx_size, keep, replace. The palette, fixed_elements, keep, "
    "and replace values are arrays of short strings; style, lighting, and approx_size "
    "are short strings. Respond with raw JSON only — no markdown, no code fences, "
    "no explanation."
)


def _strip_fences(text: str) -> str:
    """Remove ``` / ```json fences and surrounding whitespace."""
    t = text.strip()
    if t.startswith("```"):
        t = t[3:]
        if t[:4].lower() == "json":
            t = t[4:]
        if t.endswith("```"):
            t = t[:-3]
    return t.strip()


def _parse(text: str):
    """Best-effort parse: strip fences, else slice the outermost {...}. None on fail."""
    cleaned = _strip_fences(text)
    try:
        return json.loads(cleaned)
    except Exception:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except Exception:
                return None
        return None


def _normalize(data: dict) -> dict:
    """Coerce to exactly the 7-key schema with correct types ("unknown"/[] fallbacks)."""
    if not isinstance(data, dict):
        data = {}
    out = {}
    for k in _STR_KEYS:
        v = data.get(k)
        out[k] = v if isinstance(v, str) and v.strip() else "unknown"
    for k in _LIST_KEYS:
        v = data.get(k)
        out[k] = [str(x) for x in v] if isinstance(v, list) else []
    return out


async def analyze_space(room_b64: str) -> dict:
    """Return a 7-key space brief for the given base64 room photo. Never crashes."""
    data_uri = "data:image/jpeg;base64," + room_b64
    messages = [{
        "role": "user",
        "content": [
            {"type": "text", "text": _INSTRUCTION},
            {"type": "image_url", "image_url": {"url": data_uri}},
        ],
    }]
    for attempt in range(2):  # one retry on failure
        try:
            reply = await chat(messages)
            parsed = _parse(reply)
            if parsed is not None:
                return _normalize(parsed)
            print(f"[analyze_space] JSON parse failed (attempt {attempt + 1})")
        except Exception as e:
            print(f"[analyze_space] error (attempt {attempt + 1}): {e}")
        # tighten the instruction before retrying
        messages[0]["content"][0]["text"] = (
            _INSTRUCTION + " Return ONLY the JSON object, nothing before or after it."
        )
    print("[analyze_space] falling back to minimal valid dict")
    return _normalize({})
