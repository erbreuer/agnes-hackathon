"""F03 designer + budget allocator: turn a space brief into a shoppable plan.

Calls agnes.chat() with a text-only prompt embedding the space brief, the user
prompt, the budget, and (optionally) refine feedback. Returns a design summary
plus 4-8 shopping items with per-item caps that sum to <= budget. Never crashes.
"""
import json

from agnes import chat

from ._jsonparse import parse_json

_INSTRUCTION = (
    "You are an interior designer working within a fixed budget. Given a space "
    "brief, a user prompt, and a total budget in USD, produce a design plan as "
    "JSON with exactly these keys: design_summary (string, 2-4 sentences), "
    "items (array of {category, search_query, max_price}).\n"
    "Rules:\n"
    "- 4 to 8 items total.\n"
    "- Anchor pieces (sofa, bed, dining table, large rug) take the larger share "
    "of the budget; accents (plants, wall art, small decor) take the smaller "
    "share.\n"
    "- search_query must be a concrete shoppable phrase a person would type into "
    "Google Shopping (include style, material, size where relevant) — not a bare "
    "category word like 'sofa'.\n"
    "- max_price is a positive number in USD.\n"
    "- The sum of max_price across all items MUST be <= the total budget.\n"
    "- Respond with raw JSON only. No markdown, no code fences, no explanation."
)


def _build_messages(
    space_brief: dict, prompt: str, budget: float, feedback: str | None
) -> list:
    """Assemble the single user-message payload for chat()."""
    parts = [
        _INSTRUCTION,
        f"SPACE BRIEF: {json.dumps(space_brief, separators=(',', ':'))}",
        f"USER PROMPT: {prompt}",
        f"BUDGET (USD): {budget}",
    ]
    if feedback:
        parts.append(
            f"Adjust the previous plan based on this feedback: {feedback}"
        )
    return [{"role": "user", "content": "\n\n".join(parts)}]


def _normalize_items(raw) -> list:
    """Drop any entries missing valid category / search_query / positive max_price."""
    if not isinstance(raw, list):
        return []
    out = []
    for it in raw:
        if not isinstance(it, dict):
            continue
        cat = it.get("category")
        q = it.get("search_query")
        try:
            mp = float(it.get("max_price"))
        except (TypeError, ValueError):
            continue
        if not (isinstance(cat, str) and cat.strip()):
            continue
        if not (isinstance(q, str) and q.strip()):
            continue
        if mp <= 0:
            continue
        out.append({"category": cat.strip(), "search_query": q.strip(), "max_price": mp})
    return out


def _enforce_budget(items: list, budget: float) -> list:
    """Scale max_price proportionally so sum == budget when over; round to 2 dp."""
    if not items or budget <= 0:
        return []
    total = sum(it["max_price"] for it in items)
    if total > budget:
        scale = budget / total
        for it in items:
            it["max_price"] = it["max_price"] * scale
    for it in items:
        it["max_price"] = round(it["max_price"], 2)
    return items


async def plan_design(
    space_brief: dict,
    prompt: str,
    budget: float,
    feedback: str | None = None,
) -> dict:
    """Return {design_summary, items[]} respecting the budget cap. Never crashes."""
    messages = _build_messages(space_brief, prompt, budget, feedback)
    for attempt in range(2):  # one retry on parse/error
        try:
            reply = await chat(messages)
            parsed = parse_json(reply)
            if isinstance(parsed, dict):
                summary = parsed.get("design_summary")
                summary = summary if isinstance(summary, str) else ""
                items = _enforce_budget(_normalize_items(parsed.get("items")), budget)
                return {"design_summary": summary, "items": items}
            print(f"[plan_design] JSON parse failed (attempt {attempt + 1})")
        except Exception as e:
            print(f"[plan_design] error (attempt {attempt + 1}): {e}")
        # tighten the instruction before retrying
        messages[0]["content"] = (
            messages[0]["content"]
            + "\n\nReturn ONLY the JSON object, nothing before or after it."
        )
    print("[plan_design] falling back to empty plan")
    return {"design_summary": "", "items": []}
