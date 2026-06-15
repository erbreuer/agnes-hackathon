const BASE = "http://localhost:8000";

export async function getHealth() {
  const resp = await fetch(`${BASE}/health`);
  if (!resp.ok) throw new Error(`health request failed: ${resp.status}`);
  return resp.json();
}

/**
 * Read an NDJSON stream from a fetch Response, calling onProgress for each
 * status event. Resolves with the final result payload.
 *
 * Event shapes:
 *   { event: "status", stage: "analyze"|"plan"|"scout"|"render", label: string }
 *   { event: "result", data: <payload> }
 *   { event: "error",  message: string }
 */
async function consumeNdjson(resp, onProgress) {
  if (!resp.ok || !resp.body) throw new Error(`request failed: ${resp.status}`);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Each complete line is one JSON event.
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let evt;
      try { evt = JSON.parse(line); } catch { continue; }
      if (evt.event === "status") onProgress?.(evt);
      else if (evt.event === "result") result = evt.data;
      else if (evt.event === "error") throw new Error(evt.message || "pipeline error");
    }
  }
  if (!result) throw new Error("stream ended without a result event");
  return result;
}

/**
 * @param {{
 *   roomImage: string,
 *   prompt: string,
 *   budget: string|number,
 *   refImages?: string[],
 *   onProgress?: (evt: {stage: string, label: string}) => void,
 * }} args
 */
export async function postDesign({ roomImage, prompt, budget, refImages = [], onProgress }) {
  const resp = await fetch(`${BASE}/design`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_image: roomImage,
      prompt,
      budget: Number(budget),
      ref_images: refImages,
    }),
  });
  return consumeNdjson(resp, onProgress);
}

export async function postRefine({ sessionId, feedback, onProgress }) {
  const resp = await fetch(`${BASE}/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, feedback }),
  });
  return consumeNdjson(resp, onProgress);
}
