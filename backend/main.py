"""FastAPI orchestrator. F00: /health. F06: POST /design. F07: POST /refine."""
import json
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agnes import chat
from agents import analyze_space, plan_design, scout_products, render_room

app = FastAPI(title="AI Interior Designer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (no database). F07 /refine reads from this.
SESSIONS: dict = {}


class DesignRequest(BaseModel):
    room_image: str             # raw base64 of the room photo (no "data:" prefix)
    ref_images: list[str] = []  # optional style reference URLs
    prompt: str
    budget: float


class RefineRequest(BaseModel):
    session_id: str
    feedback: str


async def _run_pipeline(
    room_b64: str,
    space_brief: dict,
    prompt: str,
    budget: float,
    feedback: str | None = None,
) -> tuple[list[dict], list[str]]:
    """Non-streaming pipeline kept for ad-hoc tests / scripts.
    The HTTP endpoints use the per-stage streaming generators below.
    """
    plan = await plan_design(space_brief, prompt, budget, feedback=feedback)
    products = await scout_products(plan["items"])
    render = await render_room(room_b64, products, plan["design_summary"])
    renders = [render] if render else []
    return products, renders


def _event(event: str, **fields) -> bytes:
    """Encode a single NDJSON line for the streaming response."""
    return (json.dumps({"event": event, **fields}) + "\n").encode()


async def _design_stream(req: "DesignRequest"):
    """Yield NDJSON status events as each agent finishes, then the final result."""
    warnings: list[str] = []
    try:
        yield _event("status", stage="analyze", label="Analyzing your space")
        space_brief = await analyze_space(req.room_image)

        yield _event("status", stage="plan", label="Planning the design")
        plan = await plan_design(space_brief, req.prompt, req.budget)
        if not plan.get("items"):
            warnings.append("Could not produce a shopping list for this room.")
            yield _event("warning", stage="plan", message=warnings[-1])

        yield _event("status", stage="scout", label="Searching for real products")
        products = await scout_products(plan["items"])
        if not products:
            warnings.append("No products matched within your budget — try raising it or simplifying the prompt.")
            yield _event("warning", stage="scout", message=warnings[-1])

        yield _event("status", stage="render", label="Rendering your room")
        render = await render_room(req.room_image, products, plan["design_summary"])
        renders = [render] if render else []
        if not render:
            warnings.append("Agnes image render is unavailable right now — showing products without a composite render.")
            yield _event("warning", stage="render", message=warnings[-1])
    except Exception as e:
        yield _event("error", message=f"{type(e).__name__}: {e}")
        return

    session_id = uuid4().hex
    SESSIONS[session_id] = {
        "room_b64": req.room_image,
        "space_brief": space_brief,
        "prompt": req.prompt,
        "budget": req.budget,
        "products": products,
    }
    yield _event(
        "result",
        data={
            "session_id": session_id,
            "space_brief": space_brief,
            "renders": renders,
            "products": products,
            "design_summary": plan.get("design_summary", ""),
            "warnings": warnings,
        },
    )


async def _refine_stream(req: "RefineRequest"):
    """Yield NDJSON status events for /refine — reuses stored space_brief."""
    session = SESSIONS.get(req.session_id)
    if session is None:
        yield _event("error", message="unknown session_id")
        return

    warnings: list[str] = []
    try:
        yield _event("status", stage="plan", label="Re-planning with your feedback")
        plan = await plan_design(
            session["space_brief"], session["prompt"], session["budget"],
            feedback=req.feedback,
        )
        if not plan.get("items"):
            warnings.append("Could not produce a shopping list for this feedback.")
            yield _event("warning", stage="plan", message=warnings[-1])

        yield _event("status", stage="scout", label="Searching for real products")
        products = await scout_products(plan["items"])
        if not products:
            warnings.append("No products matched within your budget — try raising it or simplifying the feedback.")
            yield _event("warning", stage="scout", message=warnings[-1])

        yield _event("status", stage="render", label="Rendering your room")
        render = await render_room(session["room_b64"], products, plan["design_summary"])
        renders = [render] if render else []
        if not render:
            warnings.append("Agnes image render is unavailable right now — showing updated products without a composite render.")
            yield _event("warning", stage="render", message=warnings[-1])
    except Exception as e:
        yield _event("error", message=f"{type(e).__name__}: {e}")
        return

    session["products"] = products
    yield _event(
        "result",
        data={
            "session_id": req.session_id,
            "space_brief": session["space_brief"],
            "renders": renders,
            "products": products,
            "design_summary": plan.get("design_summary", ""),
            "warnings": warnings,
        },
    )


@app.get("/health")
async def health():
    """Make one real agnes-2.0-flash call to confirm connectivity."""
    try:
        reply = await chat([{"role": "user", "content": "reply with the word OK"}])
        return {"ok": True, "model_reply": reply}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.post("/design")
async def design(req: DesignRequest):
    """Stream agent-progress events as NDJSON; final line carries the full payload."""
    return StreamingResponse(_design_stream(req), media_type="application/x-ndjson")


@app.post("/refine")
async def refine(req: RefineRequest):
    """Stream agent-progress events as NDJSON; final line carries the full payload."""
    return StreamingResponse(_refine_stream(req), media_type="application/x-ndjson")
