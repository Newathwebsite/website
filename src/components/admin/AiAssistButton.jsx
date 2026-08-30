import { useState } from 'react';
import { generateWithAi } from '../../lib/ai';

// Self-contained "AI Assist" widget: a toggle button reveals a one-line
// instruction input + Generate button, then hands the result to onResult.
// Used next to SEO fields, blog content, and custom scripts in the admin.
// Talks to the ath-ai-server backend proxy — never calls Anthropic directly.
export default function AiAssistButton({ kind, label = '✨ Generate with AI', placeholder = 'What should this be about?', context, onResult }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      const text = await generateWithAi(kind, fullPrompt);
      onResult(text.trim());
      setOpen(false);
      setPrompt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setOpen((v) => !v)}>{label}</button>
      {open && (
        <div style={{ marginTop: 8, padding: 10, background: 'var(--a-bg)', border: '1px solid var(--a-border)', borderRadius: 8 }}>
          {error && <div className="a-msg err">{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } }}
              style={{ flex: 1 }}
              autoFocus
            />
            <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={run} disabled={loading}>{loading ? 'Writing…' : 'Generate'}</button>
          </div>
          <div className="hint" style={{ marginTop: 6 }}>Requires the ath-ai-server backend running with a valid Anthropic API key. Review anything generated before publishing — it can be wrong.</div>
        </div>
      )}
    </div>
  );
}
