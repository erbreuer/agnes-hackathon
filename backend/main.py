"""FastAPI orchestrator. F00: /health. F06: POST /design runs the full pipeline."""
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
    """Run analyze -> plan -> scout -> render, store a session, return the payload."""
    try:
        space_brief = await analyze_space(req.room_image)
        plan = await plan_design(space_brief, req.prompt, req.budget)
        products = await scout_products(plan["items"])
        # render_room returns one URL (or None); the contract's renders is a list.
        render = await render_room(req.room_image, products, plan["design_summary"])
        renders = [render] if render else []
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    session_id = uuid4().hex
    SESSIONS[session_id] = {
        "room_b64": req.room_image,
        "space_brief": space_brief,
        "prompt": req.prompt,
        "budget": req.budget,
        "products": products,
    }
    return {
        "session_id": session_id,
        "space_brief": space_brief,
        "renders": renders,
        "products": products,
    }
