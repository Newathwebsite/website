import { useEffect, useState } from 'react';
import { getSubscriberCount, sendPushToAll } from '../../lib/push';

export default function PushAdmin() {
  const [values, setValues] = useState({ title: '', body: '', url: '/' });
  const [count, setCount] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getSubscriberCount().then(setCount).catch(() => setCount(null));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await sendPushToAll(values);
      setResult({ type: 'ok', text: `Sent to ${res.sent} of ${res.total} subscribed device(s).` });
      setValues({ title: '', body: '', url: '/' });
    } catch (err) {
      setResult({ type: 'err', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="a-topbar"><h1>Push Notifications</h1></div>
      <div className="a-card">
        <p className="hint" style={{ marginBottom: 16 }}>
          Sends a real notification to every browser/phone that has enabled notifications on the site (the bell icon in the header) — including when they aren't currently on the site, once installed as an app.
          {count !== null && <> Currently <b>{count}</b> device{count === 1 ? '' : 's'} subscribed.</>}
        </p>
        {result && <div className={`a-msg ${result.type === 'ok' ? 'ok' : 'err'}`}>{result.text}</div>}
        <form onSubmit={onSubmit}>
          <div className="a-fld">
            <label>Title</label>
            <input value={values.title} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} placeholder="New launch: ATH Meadows Phase 2" required />
          </div>
          <div className="a-fld">
            <label>Message</label>
            <textarea value={values.body} onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))} placeholder="2 & 3 BHK apartments now open for booking — limited units." required />
          </div>
          <div className="a-fld">
            <label>Link (opened when the notification is tapped)</label>
            <input value={values.url} onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))} placeholder="/projects/ath-meadows" />
          </div>
          <button type="submit" className="a-btn a-btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send Notification'}</button>
        </form>
      </div>
    </>
  );
}
