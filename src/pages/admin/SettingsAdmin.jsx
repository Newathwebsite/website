import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import AdminForm from '../../components/admin/AdminForm';

const GENERAL_FIELDS = [
  { name: 'siteName', label: 'Site Name' },
  { name: 'contactEmail', label: 'Contact Email' },
  { name: 'contactPhone', label: 'Contact Phone' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'defaultMetaTitle', label: 'Default Meta Title', hint: 'Used on any page that has no meta title of its own.' },
  { name: 'defaultMetaDescription', label: 'Default Meta Description', type: 'textarea' },
  { name: 'crmApiUrl', label: 'Default CRM API Endpoint', placeholder: 'https://your-crm.example.com/api/leads', hint: 'Used by any form that has no CRM endpoint of its own. Leave blank to fall back to VITE_CRM_API_URL from .env.' },
  { name: 'crmApiKey', label: 'Default CRM API Key (optional)', hint: 'Sent as "Authorization: Bearer <key>".' },
];

const CARD_STYLES = [
  { key: 'classic', label: 'Classic Flip', desc: 'The original card: image, price/size chips, click to flip and see stats + a Learn More button.' },
  { key: 'flip', label: 'Rich Flip Cards', desc: 'Status badge (Pre-Launch / Ongoing / Completed), logo, a fuller back face with a walkthrough video and quick links.' },
  { key: 'premium', label: 'Premium Wide', desc: 'A wide hero-style card — large photo beside project details, spec icons and action buttons (Walk Through, Home Tour, Route Map).' },
];

const CARD_ANIMATIONS = [
  { key: 'none', label: 'None' },
  { key: 'fade-up', label: 'Fade Up' },
  { key: 'zoom-in', label: 'Zoom In' },
  { key: 'flip-in', label: 'Flip In' },
];

const WHATSAPP_FIELDS = [
  { name: 'whatsappNumber', label: 'WhatsApp Number', placeholder: '918939856789', hint: 'Include country code, digits only (e.g. 91 for India). The floating WhatsApp button is hidden sitewide until this is set.' },
  { name: 'whatsappMessage', label: 'Pre-filled Message', type: 'textarea', placeholder: "Hi! I'm interested in Asset Tree Homes projects." },
];

const MASCOT_FIELDS = [
  { name: 'enabled', label: 'Show the chat mascot to visitors', type: 'boolean' },
  { name: 'name', label: 'Mascot Name', placeholder: 'Maya' },
  { name: 'avatar', label: 'Mascot Avatar', type: 'image' },
  { name: 'welcomeMessage', label: 'Welcome Heading (shown full-screen a few seconds after page load, with voice)', type: 'textarea' },
  { name: 'greeting', label: 'Opening Chat Message (first thing said when the chat is opened)', type: 'textarea' },
  { name: 'welcomeCooldownHours', label: 'Re-show Welcome Bubble After (hours)', type: 'number', hint: "Once a visitor dismisses or opens the welcome bubble, it won't reappear for this many hours." },
];

const BANNER_FIELDS = [
  { name: 'width', label: 'Banner Card Width (px)', type: 'number', hint: 'The "All Projects" homepage carousel — each card\'s width.' },
  { name: 'height', label: 'Banner Card Height (px)', type: 'number' },
  { name: 'autoScrollSeconds', label: 'Auto-Advance Every (seconds)', type: 'number' },
];

const INTEGRATIONS_FIELDS = [
  { name: 'ga4Id', label: 'Google Analytics 4 Measurement ID', placeholder: 'G-XXXXXXXXXX', hint: 'Just paste the ID — the GA4 snippet is injected automatically sitewide.' },
  { name: 'metaPixelId', label: 'Meta (Facebook) Pixel ID', placeholder: '1234567890', hint: 'The Pixel base code is injected automatically sitewide.' },
  { name: 'gtmId', label: 'Google Tag Manager Container ID', placeholder: 'GTM-XXXXXXX' },
  {
    name: 'customHeadScript', label: 'Custom <head> Script (advanced)', type: 'textarea',
    hint: 'Raw HTML/script injected at the end of <head> on every page. Use for anything not covered above.',
    ai: { kind: 'script', label: '✨ Write script with AI', placeholder: 'Describe the tracking/widget script you need', context: 'This will be injected into the <head> of a real-estate website.' },
  },
  {
    name: 'customBodyScript', label: 'Custom <body> Script (advanced)', type: 'textarea',
    hint: 'Raw HTML/script injected at the end of <body> on every page.',
    ai: { kind: 'script', label: '✨ Write script with AI', placeholder: 'Describe the widget/script you need', context: 'This will be injected into the <body> of a real-estate website.' },
  },
];

const POPUP_FIELDS = [
  { name: 'enabled', label: 'Show popup to visitors', type: 'boolean' },
  { name: 'type', label: 'Popup Type', type: 'select', options: [{ value: 'image', label: 'Image' }, { value: 'form', label: 'Enquiry Form' }] },
  { name: 'image', label: 'Popup Image (image type only)', type: 'image', altField: 'imageAlt' },
  { name: 'title', label: 'Title' },
  { name: 'body', label: 'Body Text', type: 'textarea' },
  { name: 'ctaLabel', label: 'Button Label' },
  { name: 'ctaUrl', label: 'Button Link', placeholder: '/contact' },
  { name: 'delaySeconds', label: 'Show After (seconds)', type: 'number' },
  { name: 'frequency', label: 'Show Frequency', type: 'select', options: [{ value: 'once', label: 'Once per browser' }, { value: 'everyLoad', label: 'Every page load' }] },
];

const ANNOUNCEMENT_FIELDS = [
  { name: 'enabled', label: 'Show announcement banner to all visitors', type: 'boolean', hint: "This is a sitewide banner, not a real push notification — true push (reaching people when they're off the site) needs a backend, which this project doesn't have." },
  { name: 'message', label: 'Message', type: 'textarea' },
  { name: 'ctaLabel', label: 'Button Label (optional)' },
  { name: 'ctaUrl', label: 'Button Link (optional)' },
];

const THEME_FIELDS = [
  { name: 'primary', label: 'Primary Color', placeholder: '#27306f', hint: 'Hex color. Drives the navy nav/buttons/footer sitewide, including project pages.' },
  { name: 'accent', label: 'Accent Color', placeholder: '#f6ab1b', hint: 'Hex color. Drives gold highlights, prices and CTAs.' },
  { name: 'fontDisplay', label: 'Display Font (headlines)', placeholder: 'Bebas Neue' },
  { name: 'fontBody', label: 'Body Font', placeholder: 'Poppins' },
];

function NestedSection({ title, children }) {
  return (
    <div className="a-card">
      <h3 style={{ marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  );
}

function MenuEditor({ menu, onChange }) {
  const update = (i, key, val) => onChange(menu.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));
  const remove = (i) => onChange(menu.filter((_, idx) => idx !== i));
  const add = () => onChange([...menu, { label: '', path: '/' }]);

  return (
    <NestedSection title="Header Menu">
      {menu.map((item, i) => (
        <div className="a-repeat-row" key={i}>
          <div className="a-fld"><input placeholder="Label" value={item.label} onChange={(e) => update(i, 'label', e.target.value)} /></div>
          <div className="a-fld"><input placeholder="/path" value={item.path} onChange={(e) => update(i, 'path', e.target.value)} /></div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add Menu Item</button>
    </NestedSection>
  );
}

function FooterEditor({ footer, onChange }) {
  const setTagline = (tagline) => onChange({ ...footer, tagline });
  const updateColumn = (i, patch) => onChange({ ...footer, columns: footer.columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const removeColumn = (i) => onChange({ ...footer, columns: footer.columns.filter((_, idx) => idx !== i) });
  const addColumn = () => onChange({ ...footer, columns: [...footer.columns, { title: 'New Column', links: [] }] });

  const updateLink = (ci, li, key, val) => {
    const col = footer.columns[ci];
    const links = col.links.map((l, idx) => (idx === li ? { ...l, [key]: val } : l));
    updateColumn(ci, { links });
  };
  const removeLink = (ci, li) => updateColumn(ci, { links: footer.columns[ci].links.filter((_, idx) => idx !== li) });
  const addLink = (ci) => updateColumn(ci, { links: [...footer.columns[ci].links, { label: '', path: '/' }] });

  return (
    <NestedSection title="Footer">
      <div className="a-fld">
        <label>Tagline</label>
        <textarea value={footer.tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
      {footer.columns.map((col, ci) => (
        col.title === 'Projects' ? (
          <div className="a-card" key={ci} style={{ padding: 14, marginBottom: 12 }}>
            <div className="a-repeat-row">
              <div className="a-fld"><input value={col.title} disabled /></div>
            </div>
            <p className="hint">
              The Villas and Apartments footer columns are generated automatically from your published projects — manage them from the Projects page. This column's links aren't shown on the live site.
            </p>
          </div>
        ) : (
          <div className="a-card" key={ci} style={{ padding: 14, marginBottom: 12 }}>
            <div className="a-repeat-row">
              <div className="a-fld"><input value={col.title} onChange={(e) => updateColumn(ci, { title: e.target.value })} placeholder="Column title" /></div>
              <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => removeColumn(ci)}>Remove Column</button>
            </div>
            {col.links.map((l, li) => (
              <div className="a-repeat-row" key={li}>
                <div className="a-fld"><input placeholder="Label" value={l.label} onChange={(e) => updateLink(ci, li, 'label', e.target.value)} /></div>
                <div className="a-fld"><input placeholder="/path" value={l.path} onChange={(e) => updateLink(ci, li, 'path', e.target.value)} /></div>
                <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => removeLink(ci, li)}>Remove</button>
              </div>
            ))}
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => addLink(ci)}>+ Add Link</button>
          </div>
        )
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={addColumn}>+ Add Column</button>
    </NestedSection>
  );
}

const TABS = ['General', 'Menu', 'Footer', 'Card Style', 'Banner', 'Contact Form', 'WhatsApp', 'Mascot', 'Integrations', 'Popup', 'Announcement', 'Theme', 'My Login'];

export default function SettingsAdmin() {
  const { settings, updateSettings, forms } = useData();
  const { changeOwnPassword } = useAuth();
  const [tab, setTab] = useState('General');
  const [values, setValues] = useState(settings);
  const [saved, setSaved] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const save = (patch) => {
    const merged = { ...values, ...patch };
    setValues(merged);
    updateSettings(merged);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    const ok = await changeOwnPassword(pw.current, pw.next);
    setPwMsg(ok ? { type: 'ok', text: 'Password updated.' } : { type: 'err', text: 'Current password is incorrect.' });
    if (ok) setPw({ current: '', next: '' });
  };

  return (
    <>
      <div className="a-topbar"><h1>Settings</h1></div>
      <div className="filters" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: 30, border: '1px solid var(--a-border)', background: tab === t ? 'var(--a-primary)' : '#fff', color: tab === t ? '#fff' : 'inherit', cursor: 'pointer', fontSize: '.82rem' }}>
            {t}
          </button>
        ))}
      </div>

      {saved && <div className="a-msg ok">Saved.</div>}

      {tab === 'General' && (
        <div className="a-card"><AdminForm fields={GENERAL_FIELDS} values={values} onChange={setValues} onSubmit={save} submitLabel="Save Settings" /></div>
      )}

      {tab === 'Menu' && <MenuEditor menu={values.menu || []} onChange={(menu) => save({ menu })} />}

      {tab === 'Footer' && <FooterEditor footer={values.footer} onChange={(footer) => save({ footer })} />}

      {tab === 'Card Style' && (
        <div className="a-card">
          <h3 style={{ marginBottom: 6 }}>Project Card Style</h3>
          <p className="hint" style={{ marginBottom: 16 }}>
            Set independently for the Villas and Apartments pages, and separately for desktop vs. mobile — e.g. Classic on desktop, Premium Wide on mobile.
            The Home page's featured-projects card style is set on the Home Page editor instead, since it's part of that section's own settings.
          </p>
          {['villas', 'apartments'].map((page) => (
            <div key={page} style={{ marginBottom: 24 }}>
              <h4 style={{ textTransform: 'capitalize', marginBottom: 10 }}>{page}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {['desktop', 'mobile'].map((device) => (
                  <div key={device} style={{ border: '1px solid var(--a-border)', borderRadius: 10, padding: 12 }}>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, marginBottom: 8, textTransform: 'capitalize' }}>{device}</label>

                    <div className="a-fld" style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--a-muted)' }}>Style</label>
                      <select
                        value={values.cardStyle?.[page]?.[device] || 'classic'}
                        onChange={(e) => save({ cardStyle: { ...values.cardStyle, [page]: { ...values.cardStyle[page], [device]: e.target.value } } })}
                      >
                        {CARD_STYLES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </div>

                    <div className="a-fld" style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--a-muted)' }}>Columns per row</label>
                      <select
                        value={values.cardGrid?.[page]?.[device] ?? 3}
                        onChange={(e) => save({ cardGrid: { ...values.cardGrid, [page]: { ...values.cardGrid?.[page], [device]: Number(e.target.value) } } })}
                        disabled={values.cardStyle?.[page]?.[device] === 'premium'}
                      >
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      {values.cardStyle?.[page]?.[device] === 'premium' && <div className="hint">Premium Wide is always one full-width card per row.</div>}
                    </div>

                    <div className="a-fld">
                      <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--a-muted)' }}>Reveal animation</label>
                      <select
                        value={values.cardAnimation?.[page]?.[device] || 'none'}
                        onChange={(e) => save({ cardAnimation: { ...values.cardAnimation, [page]: { ...values.cardAnimation?.[page], [device]: e.target.value } } })}
                      >
                        {CARD_ANIMATIONS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            {CARD_STYLES.map((s) => (
              <div key={s.key} style={{ fontSize: '.8rem', color: 'var(--a-muted)' }}><b style={{ color: 'inherit' }}>{s.label}:</b> {s.desc}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Banner' && (
        <div className="a-card"><AdminForm fields={BANNER_FIELDS} values={values.banner} onChange={(v) => setValues((s) => ({ ...s, banner: v }))} onSubmit={(v) => save({ banner: v })} submitLabel="Save Banner Settings" /></div>
      )}

      {tab === 'Contact Form' && (
        <div className="a-card">
          <h3 style={{ marginBottom: 14 }}>Main Contact Page Form</h3>
          <div className="a-fld">
            <label>Which form should /contact show?</label>
            <select value={values.contactFormId || ''} onChange={(e) => save({ contactFormId: e.target.value })}>
              <option value="">Default contact form</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div className="hint">Build and edit forms under <a href="/admin/forms">Enquiry Forms</a> in the sidebar.</div>
          </div>
        </div>
      )}

      {tab === 'WhatsApp' && (
        <div className="a-card"><AdminForm fields={WHATSAPP_FIELDS} values={values} onChange={setValues} onSubmit={save} submitLabel="Save WhatsApp Settings" /></div>
      )}

      {tab === 'Mascot' && (
        <div className="a-card"><AdminForm fields={MASCOT_FIELDS} values={values.mascot} onChange={(v) => setValues((s) => ({ ...s, mascot: v }))} onSubmit={(v) => save({ mascot: v })} submitLabel="Save Mascot Settings" /></div>
      )}

      {tab === 'Integrations' && (
        <div className="a-card"><AdminForm fields={INTEGRATIONS_FIELDS} values={values.integrations} onChange={(v) => setValues((s) => ({ ...s, integrations: v }))} onSubmit={(v) => save({ integrations: v })} submitLabel="Save Integrations" /></div>
      )}

      {tab === 'Popup' && (
        <div className="a-card">
          <AdminForm fields={POPUP_FIELDS} values={values.popup} onChange={(v) => setValues((s) => ({ ...s, popup: v }))} onSubmit={(v) => save({ popup: v })} submitLabel="Save Popup" />
          <div className="a-fld" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--a-border)' }}>
            <label>Which form should the popup show? (Enquiry Form type only)</label>
            <select value={values.popup.formId || ''} onChange={(e) => save({ popup: { ...values.popup, formId: e.target.value } })}>
              <option value="">Default contact form</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div className="hint">Each form has its own questions and its own CRM endpoint/SRD key — manage them under Enquiry Forms.</div>
          </div>
        </div>
      )}

      {tab === 'Announcement' && (
        <div className="a-card"><AdminForm fields={ANNOUNCEMENT_FIELDS} values={values.announcement} onChange={(v) => setValues((s) => ({ ...s, announcement: v }))} onSubmit={(v) => save({ announcement: v })} submitLabel="Save Announcement" /></div>
      )}

      {tab === 'Theme' && (
        <div className="a-card"><AdminForm fields={THEME_FIELDS} values={values.theme} onChange={(v) => setValues((s) => ({ ...s, theme: v }))} onSubmit={(v) => save({ theme: v })} submitLabel="Save Theme" /></div>
      )}

      {tab === 'My Login' && (
        <div className="a-card">
          <h3 style={{ marginBottom: 14 }}>Change My Password</h3>
          {pwMsg && <div className={`a-msg ${pwMsg.type}`}>{pwMsg.text}</div>}
          <form onSubmit={onChangePassword}>
            <div className="a-fld">
              <label>Current Password</label>
              <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="a-fld">
              <label>New Password</label>
              <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required />
            </div>
            <button className="a-btn a-btn-primary" type="submit">Update Password</button>
          </form>
          <p className="hint" style={{ marginTop: 10 }}>To add teammates or change usernames/roles, use the <b>Users</b> page.</p>
        </div>
      )}
    </>
  );
}
