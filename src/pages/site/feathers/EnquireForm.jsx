import { useEffect, useState } from 'react';
import { ATH_COUNTRIES, POPULAR_COUNTRY_CODES, buildSourceLabel, detectCountryCode, pushLeadToSellDo, reportGoogleAdsConversion } from '../../../lib/selldo';

const byCode = Object.fromEntries(ATH_COUNTRIES.map((c) => [c[0], c]));
const sortedCountries = [...ATH_COUNTRIES].sort((a, b) => a[2].localeCompare(b[2]));

const EMPTY = { name: '', phone: '', email: '', interest: '3 BHK Villa', cc: 'IN', company: '' };

export default function EnquireForm({ interestOptions = ['3 BHK Villa', '4 BHK Villa', 'Site Visit', 'Brochure / Price List'], onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null); // { type: 'error'|'ok', text }
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    detectCountryCode().then((code) => {
      if (code) setForm((f) => ({ ...f, cc: code }));
    });
  }, []);

  const set = (name, val) => setForm((f) => ({ ...f, [name]: val }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.company) return; // honeypot

    const name = form.name.trim();
    const digits = form.phone.replace(/\D/g, '');
    const email = form.email.trim();
    const dial = (byCode[form.cc] || byCode.IN)[1];
    const fullPhone = `+${dial}${digits}`;

    if (name.length < 2) return setStatus({ type: 'error', text: 'Please enter your name.' });
    if (digits.length < 10) return setStatus({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus({ type: 'error', text: "That email doesn't look right." });

    const lead = {
      name,
      phone: fullPhone,
      email,
      interest: form.interest,
      project: 'ATH Feathers',
      source: buildSourceLabel(),
      submitted_at: new Date().toISOString(),
    };

    setSending(true);
    setStatus(null);
    try {
      await pushLeadToSellDo(lead);
    } catch (err) {
      console.error('CRM push failed, lead was still captured locally:', err, lead);
    }
    reportGoogleAdsConversion();
    setSending(false);
    setSent(true);
    setStatus({ type: 'ok', text: `Thank you, ${name.split(' ')[0]} — our team will call you on ${fullPhone} shortly.` });
    setTimeout(() => {
      setForm(EMPTY);
      setSent(false);
      setStatus(null);
      onSuccess?.();
    }, 1600);
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="company" className="hp" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set('company', e.target.value)} />
      {status && <div className={`fstatus ${status.type === 'error' ? 'error' : 'ok'}`}>{status.text}</div>}
      <div className="f-fld">
        <label>Full name</label>
        <input type="text" placeholder="Your name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="f-fld">
        <label>Phone number</label>
        <div className="phone-row">
          <select className="cc-select" aria-label="Country code" value={form.cc} onChange={(e) => set('cc', e.target.value)}>
            <optgroup label="Popular">
              {POPULAR_COUNTRY_CODES.map((code) => byCode[code] && <option key={code} value={code}>{byCode[code][2]} (+{byCode[code][1]})</option>)}
            </optgroup>
            <optgroup label="All countries">
              {sortedCountries.map((c) => <option key={c[0]} value={c[0]}>{c[2]} (+{c[1]})</option>)}
            </optgroup>
          </select>
          <input type="tel" placeholder="10-digit mobile number" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="f-fld">
        <label>Email (optional)</label>
        <input type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
      </div>
      <div className="f-fld">
        <label>Interested in</label>
        <select value={form.interest} onChange={(e) => set('interest', e.target.value)}>
          {interestOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <button type="submit" className="lh-submit" disabled={sending}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="15" r="5" /><path d="M11.5 11.5 21 2M18 5l2 2M15 8l2 2" /></svg>
        {sending ? 'Sending…' : sent ? '✓ Received' : 'Request a call back'}
      </button>
      <p className="fnote">CREDAI Member &middot; <b>Asset Tree Homes</b></p>
    </form>
  );
}
