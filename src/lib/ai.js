// Client for the ath-ai-server backend proxy (../ath-ai-server) — the only
// place in this app that talks to Claude. The Anthropic API key never
// reaches the browser; this just calls our own small server.
const API_BASE = import.meta.env.VITE_AI_API_URL || '';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_PROXY_TOKEN || '';

export async function generateWithAi(kind, prompt) {
  const res = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { 'x-ath-admin-token': ADMIN_TOKEN } : {}),
    },
    body: JSON.stringify({ kind, prompt }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
  return data.text;
}
