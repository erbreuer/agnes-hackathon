const BASE = "http://localhost:8000";

export async function getHealth() {
  const resp = await fetch(`${BASE}/health`);
  if (!resp.ok) throw new Error(`health request failed: ${resp.status}`);
  return resp.json();
}

/** @param {{ roomImage: string, prompt: string, budget: string|number, refImages?: string[] }} args */
export async function postDesign({ roomImage, prompt, budget, refImages = /** @type {string[]} */ ([]) }) {
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
  if (!resp.ok) throw new Error(`design request failed: ${resp.status}`);
  return resp.json();
}

export async function postRefine({ sessionId, feedback }) {
  const resp = await fetch(`${BASE}/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, feedback }),
  });
  if (!resp.ok) throw new Error(`refine request failed: ${resp.status}`);
  return resp.json();
}
