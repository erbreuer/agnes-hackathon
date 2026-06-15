# Hygge — AI Interior Designer

A retrieval-first interior design app built for the **Agnes AI hackathon**.
Upload a photo of your room, describe the vibe you're after, set a budget — and get
back **real, purchasable products** within budget plus AI-generated renders showing
them in your space. Refine until it feels right.

> **Retrieval-first.** Every item shown maps to a real SKU + buy link. We never
> generate furniture and then go looking for where to buy it.

---

## Pipeline

```
frontend  →  FastAPI orchestrator  →  agents (in order):

  1. analyze_space   (agnes-2.0-flash, vision)        →  space_brief
  2. plan_design     (agnes-2.0-flash)                →  design summary +
                                                         shopping list with
                                                         per-item budget caps
  3. scout_products  (SerpApi → catalog.json fallback) →  real products in budget
  4. render_room     (agnes-image-2.0-flash)          →  composited renders
```

Refine = re-run from step 2 with feedback + the stored `space_brief`.

State lives in a plain in-memory dict keyed by `session_id` — no database,
no auth, no Docker.

---

## Tech stack

- **Backend:** Python 3.11+, FastAPI, uvicorn, httpx, python-dotenv
- **Frontend:** React + Vite + TypeScript
- **AI:** Agnes (chat + vision + image), SerpApi (Google Shopping)

---

## Repo layout

```
backend/
  main.py        # FastAPI app — /health, /design, /refine
  agnes.py       # Agnes client: chat(), image(), video()
  agents.py      # analyze_space, plan_design, scout_products, render_room
  catalog.json   # seed products (demo fallback when SerpApi is rate-limited)
  .env           # AGNES_API_KEY, SERPAPI_KEY
frontend/
  src/App.tsx    # single-page UI
  src/api.js     # fetch wrappers for /design and /refine
docs/F0X.md      # per-feature spec + validation steps
```

---

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
AGNES_API_KEY=your_agnes_key_here
SERPAPI_KEY=your_serpapi_key_here
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## Run

Open two terminals:

```bash
# terminal 1 — backend
cd backend
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
```

```bash
# terminal 2 — frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

Health check: <http://localhost:8000/health> → `{"ok": true, "model_reply": "OK"}`

---

## API contract

```http
POST /design
{
  "room_image": "<raw base64, no data: prefix>",
  "ref_images": ["https://..."],
  "prompt": "cozy Scandinavian feel, warm tones",
  "budget": 1500
}
→ { session_id, space_brief, renders: [url], products: [{name, price, link, image}] }
```

```http
POST /refine
{ "session_id": "...", "feedback": "cheaper sofa, more plants" }
→ same shape as /design
```

---

## Scoring & design choices

The hackathon rubric is **Innovation 30% · Business value 30% · Best use of Agnes 40%**.
The 40% rewards using **multiple Agnes models with clear jobs** — so the pipeline
deliberately uses:

- `agnes-2.0-flash` for vision (analyze the room) and chat (plan the design)
- `agnes-image-2.0-flash` for compositing real product images into the room
- `agnes-video-v2.0` (stretch goal) for a before/after reel

Every product surfaced has a real buy link — that's the business value angle:
inspiration that's also a checkout cart.

---

## Conventions

- Each agent is a small, single-purpose async function (≲ 40 lines).
- Secrets via `python-dotenv` only — never hardcoded, never logged.
- `httpx.AsyncClient` everywhere. Timeouts: chat 30s, image 60s.
- Errors return JSON, never crash the request.
- No agent framework (no CrewAI / LangChain). "Agents" are plain functions.
