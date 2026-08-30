import { useEffect, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { submitLeadToCrm } from '../../../lib/crm';

const COUNTRIES = [
  ['IN', '91', 'India'], ['AE', '971', 'United Arab Emirates'], ['US', '1', 'United States'], ['GB', '44', 'United Kingdom'],
  ['SG', '65', 'Singapore'], ['AU', '61', 'Australia'], ['CA', '1', 'Canada'], ['SA', '966', 'Saudi Arabia'],
  ['QA', '974', 'Qatar'], ['KW', '965', 'Kuwait'], ['OM', '968', 'Oman'], ['BH', '973', 'Bahrain'],
  ['MY', '60', 'Malaysia'], ['DE', '49', 'Germany'], ['FR', '33', 'France'], ['NZ', '64', 'New Zealand'],
];
const byCode = Object.fromEntries(COUNTRIES.map((c) => [c[0], c]));

const INTERESTS = ['Villas', 'Apartments', 'NRI Enquiry', 'Channel Partnership', 'General Enquiry'];

export default function ContactForm2({ interestOptions = INTERESTS, source = 'Website', crmOverride }) {
  const { settings } = useData();
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: interestOptions[0], message: '', cc: 'IN', company: '' });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    fetch('https://ipapi.co/json/', { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(t);
        const code = data?.country_code;
        if (code && byCode[code]) setForm((f) => ({ ...f, cc: code }));
      })
      .catch(() => clearTimeout(t));
    return () => { clearTimeout(t); ctrl.abort(); };
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

    setSending(true);
    setStatus(null);
    try {
      const result = await submitLeadToCrm({ name, phone: fullPhone, email, interest: form.interest, message: form.message, source }, settings, crmOverride);
      setSending(false);
      if (result.ok) {
        setStatus({ type: 'ok', text: `Thank you, ${name.split(' ')[0]} — our team will call you on ${fullPhone} shortly.` });
        setForm((f) => ({ ...f, name: '', phone: '', email: '', message: '' }));
      } else {
        setStatus({ type: 'error', text: 'This site has no CRM endpoint configured yet. Set one in /admin/settings.' });
      }
    } catch (err) {
      setSending(false);
      setStatus({ type: 'error', text: err.message || 'Something went wrong sending your enquiry.' });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" className="hp" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set('company', e.target.value)} />
      {status && <div className={`fstatus ${status.type}`}>{status.text}</div>}
      <div className="fld">
        <label>Full name</label>
        <input type="text" placeholder="Your name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="fld">
        <label>Phone number</label>
        <div className="phone-row">
          <select className="cc-select" aria-label="Country code" value={form.cc} onChange={(e) => set('cc', e.target.value)}>
            {COUNTRIES.map((c) => <option key={c[0]} value={c[0]}>{c[2]} (+{c[1]})</option>)}
          </select>
          <input type="tel" placeholder="10-digit mobile number" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="fld">
        <label>Email (optional)</label>
        <input type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
      </div>
      <div className="fld">
        <label>I'm interested in</label>
        <select value={form.interest} onChange={(e) => set('interest', e.target.value)}>
          {interestOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="fld">
        <label>Message (optional)</label>
        <textarea placeholder="Tell us a little about what you're looking for" value={form.message} onChange={(e) => set('message', e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary form-submit" disabled={sending}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="15" r="5" /><path d="M11.5 11.5 21 2M18 5l2 2M15 8l2 2" /></svg>
        {sending ? 'Sending…' : 'Request a call back'}
      </button>
      <p className="form-note">CREDAI Member · Asset Tree Homes</p>
    </form>
  );
}
