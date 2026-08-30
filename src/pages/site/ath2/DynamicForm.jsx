import { useEffect, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { submitLeadToCrm } from '../../../lib/crm';
import ContactForm2 from './ContactForm2';

const COUNTRIES = [
  ['IN', '91', 'India'], ['AE', '971', 'United Arab Emirates'], ['US', '1', 'United States'], ['GB', '44', 'United Kingdom'],
  ['SG', '65', 'Singapore'], ['AU', '61', 'Australia'], ['CA', '1', 'Canada'], ['SA', '966', 'Saudi Arabia'],
  ['QA', '974', 'Qatar'], ['KW', '965', 'Kuwait'], ['OM', '968', 'Oman'], ['BH', '973', 'Bahrain'],
  ['MY', '60', 'Malaysia'], ['DE', '49', 'Germany'], ['FR', '33', 'France'], ['NZ', '64', 'New Zealand'],
];
const byCode = Object.fromEntries(COUNTRIES.map((c) => [c[0], c]));

function emptyValuesFor(fields) {
  return Object.fromEntries(fields.map((f) => [f.id, f.type === 'select' ? (f.options?.[0] || '') : '']));
}

// Renders one of the admin-built forms from the `forms` collection (see
// FormEditor.jsx) — Name and Phone are always collected here, on top of
// whatever extra questions the admin defined. Falls back to the plain
// ContactForm2 if the given formId doesn't resolve to a real form.
export default function DynamicForm({ formId, source = 'Website' }) {
  const { settings, forms } = useData();
  const form = forms.find((f) => f.id === formId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cc, setCc] = useState('IN');
  const [company, setCompany] = useState(''); // honeypot
  const [extra, setExtra] = useState(() => (form ? emptyValuesFor(form.fields) : {}));
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { if (form) setExtra(emptyValuesFor(form.fields)); }, [formId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    fetch('https://ipapi.co/json/', { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => { clearTimeout(t); if (data?.country_code && byCode[data.country_code]) setCc(data.country_code); })
      .catch(() => clearTimeout(t));
    return () => { clearTimeout(t); ctrl.abort(); };
  }, []);

  if (!form) return <ContactForm2 source={source} />;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (company) return; // honeypot

    const digits = phone.replace(/\D/g, '');
    const dial = (byCode[cc] || byCode.IN)[1];
    const fullPhone = `+${dial}${digits}`;

    if (name.trim().length < 2) return setStatus({ type: 'error', text: 'Please enter your name.' });
    if (digits.length < 10) return setStatus({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });

    for (const f of form.fields) {
      if (f.required && !String(extra[f.id] || '').trim()) return setStatus({ type: 'error', text: `Please fill in "${f.label}".` });
    }

    setSending(true);
    setStatus(null);
    try {
      const result = await submitLeadToCrm(
        { formName: form.name, name: name.trim(), phone: fullPhone, source, ...extra },
        settings,
        { crmApiUrl: form.crmApiUrl, crmSrdKey: form.crmSrdKey, utmCaptureEnabled: form.utmCaptureEnabled }
      );
      setSending(false);
      if (result.ok) {
        setStatus({ type: 'ok', text: `Thank you, ${name.trim().split(' ')[0]} — our team will call you on ${fullPhone} shortly.` });
        setName(''); setPhone(''); setExtra(emptyValuesFor(form.fields));
      } else {
        setStatus({ type: 'error', text: 'This form has no CRM endpoint configured yet. Set one in /admin/settings or on this form.' });
      }
    } catch (err) {
      setSending(false);
      setStatus({ type: 'error', text: err.message || 'Something went wrong sending your enquiry.' });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="text" className="hp" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      {status && <div className={`fstatus ${status.type}`}>{status.text}</div>}

      <div className="fld">
        <label>Full name</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="fld">
        <label>Phone number</label>
        <div className="phone-row">
          <select className="cc-select" value={cc} onChange={(e) => setCc(e.target.value)} aria-label="Country code">
            {COUNTRIES.map((c) => <option key={c[0]} value={c[0]}>{c[2]} (+{c[1]})</option>)}
          </select>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" />
        </div>
      </div>

      {form.fields.map((f) => (
        <div className="fld" key={f.id}>
          <label>{f.label}{f.required ? ' *' : ''}</label>
          {f.type === 'textarea' ? (
            <textarea required={f.required} value={extra[f.id] || ''} onChange={(e) => setExtra((v) => ({ ...v, [f.id]: e.target.value }))} />
          ) : f.type === 'select' ? (
            <select value={extra[f.id] || ''} onChange={(e) => setExtra((v) => ({ ...v, [f.id]: e.target.value }))}>
              {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input type={f.type} required={f.required} value={extra[f.id] || ''} onChange={(e) => setExtra((v) => ({ ...v, [f.id]: e.target.value }))} />
          )}
        </div>
      ))}

      <button type="submit" className="btn btn-primary form-submit" disabled={sending}>{sending ? 'Sending…' : (form.submitLabel || 'Submit')}</button>
      <p className="form-note">CREDAI Member · Asset Tree Homes</p>
    </form>
  );
}
