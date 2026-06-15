"""Defensive JSON parsing for flash-model replies (shared by F02/F03/...).

Flash models often wrap JSON in ```json fences or include surrounding prose.
strip_fences + parse_json handle both cases without crashing the caller.
"""
import json


def strip_fences(text: str) -> str:
    """Remove ``` / ```json fences and surrounding whitespace."""
    t = text.strip()
    if t.startswith("```"):
        t = t[3:]
        if t[:4].lower() == "json":
            t = t[4:]
        if t.endswith("```"):
            t = t[:-3]
    return t.strip()


def parse_json(text: str):
    """Best-effort parse: strip fences, else slice the outermost {...}. None on fail."""
    cleaned = strip_fences(text)
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
