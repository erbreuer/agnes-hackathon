"""FastAPI orchestrator. F00: /health proves the Agnes key + base URL work."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agnes import chat

app = FastAPI(title="AI Interior Designer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Make one real agnes-2.0-flash call to confirm connectivity."""
    try:
        reply = await chat([{"role": "user", "content": "reply with the word OK"}])
        return {"ok": True, "model_reply": reply}
    except Exception as e:
        return {"ok": False, "error": str(e)}
