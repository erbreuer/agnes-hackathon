# CLAUDE.md — AI Interior Designer (Agnes AI hackathon)

## What we're building
A retrieval-first interior design app. The user uploads a room photo + a prompt +
a budget. We retrieve REAL purchasable products within budget FIRST, then composite
them into the room and return 3 renders + buy links. The user refines until happy.

Why retrieval-first: every item in a render maps to a real SKU + link. Never
generate furniture and then go looking for where to buy it.

## Scoring context (make choices that serve this)
Rubric: Innovation 30% · Business value 30% · Best use of Agnes 40%.
The 40% rewards using MULTIPLE Agnes models, each with a clear job. So the pipeline
deliberately uses agnes-2.0-flash (chat + vision) and agnes-image-2.0-flash, and —
if time — agnes-video-v2.0.

## Tech stack (do NOT add to this)
- Backend: Python 3.11+, FastAPI, uvicorn, httpx, python-dotenv, python-multipart
- Frontend: React + Vite (JavaScript)
- State: a plain in-memory dict keyed by session_id. NO database.
- NO agent framework (no CrewAI / LangChain). "Agents" are plain async functions.

## Architecture (sequential pipeline, one orchestrator)
frontend -> FastAPI orchestrator -> agents in order:
  1. analyze_space  (agnes-2.0-flash, vision)        -> space_brief
  2. plan_design    (agnes-2.0-flash)                -> design summary + shopping
                                                        list with per-item budget caps
  3. scout_products (SerpApi + catalog.json)         -> real products within budget
  4. render_room    (agnes-image-2.0-flash)          -> 3 renders
  (optional) 5. critique (agnes-2.0-flash, vision)   -> retry once if poor
  (optional) 6. make_video (agnes-video-v2.0)        -> before/after reel
Refine = re-run from step 2 with feedback + the stored space_brief.

## Repo layout
    backend/
      main.py        # FastAPI app, /design, /refine, sessions, CORS
      agnes.py       # Agnes client: chat(), image(), video()
      agents.py      # analyze_space, plan_design, scout_products, render_room
      catalog.json   # seed products (demo fallback)
      .env
    frontend/
      src/App.jsx
      src/api.js

## Agnes API — exact reference (do NOT invent endpoints or model names)
Base URL: https://apihub.agnes-ai.com/v1
Auth header: Authorization: Bearer $AGNES_API_KEY   (OpenAI-compatible)

Chat + vision (agnes-2.0-flash) -> POST /chat/completions:
    {
      "model": "agnes-2.0-flash",
      "messages": [{"role": "user", "content": [
        {"type": "text", "text": "..."},
        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,<...>"}}
      ]}]
    }
- Vision accepts a base64 data URI in image_url.url -> use it for the room photo.
- For JSON outputs, tell the model "respond with JSON only" and parse defensively.

Image compose / edit (agnes-image-2.0-flash) -> POST /images/generations:
    {
      "model": "agnes-image-2.0-flash",
      "prompt": "<design instruction>",
      "size": "1024x768",
      "extra_body": {
        "image": ["https://product1.jpg", "https://product2.jpg"],
        "response_format": "url"
      }
    }
- Multi-image composition: input image URLs go in extra_body.image.
- GOTCHA: response_format lives INSIDE extra_body, never at the top level.

Video (agnes-video-v2.0) -> async: POST /videos returns a task id; poll
/videos/{id} until status == "completed", then read video_url. Build only if F00–F08 done.

## SerpApi (product retrieval)
    GET https://serpapi.com/search
      ?engine=google_shopping&q=<query>&max_price=<int>&api_key=$SERPAPI_KEY
Use: shopping_results[].title / .extracted_price / .product_link / .thumbnail
Always wrap in try/except -> fall back to catalog.json filtered by price. Free tier
is small; cache during dev.

## Image-handling rule (the #1 time sink — get it right once)
- Uploaded room photo -> base64 data URI -> pass to agnes-2.0-flash (vision) and as
  a reference into image compose.
- Product images -> SerpApi URLs -> pass directly into extra_body.image. Never re-host.

## API contract (don't change these shapes)
    POST /design  { room_image:<base64>, ref_images?:[url], prompt:str, budget:number }
              ->  { session_id, space_brief, renders:[url x3], products:[{name,price,link,image}] }
    POST /refine  { session_id, feedback:str }  -> same shape

## Conventions
- Each agent is one small single-purpose async function returning a dict/list.
- All keys from environment via python-dotenv. Never hardcode or log key values.
- Use httpx.AsyncClient. Timeouts: chat 30s, image 60s.
- On error, return clear JSON; never crash the request.
- Keep functions under ~40 lines; if longer, split.

## Build process (important)
- Implement ONE feature at a time. For each, read docs/F0X.md, implement ONLY its
  scope, run its Validation step, and confirm it passes before moving on.
- Do not scaffold future features early. Do not add dependencies beyond the list above.
- After each feature, run the validation curl/command and show the output.

## Don'ts
- No database, no auth, no Docker, no extra frameworks.
- Don't invent Agnes endpoints/model names — use the reference above.
- Don't put response_format at the top level of an image request.
