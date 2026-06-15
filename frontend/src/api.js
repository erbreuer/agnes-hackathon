// API client for the FastAPI backend. CORS allows this origin (localhost:5173).
const BASE = "http://localhost:8000";

export async function getHealth() {
  const resp = await fetch(`${BASE}/health`);
  if (!resp.ok) throw new Error(`health request failed: ${resp.status}`);
  return resp.json();
}
