import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { uid } from '../../lib/storage';

const EMPTY = { name: '', submitLabel: 'Request a call back', fields: [], crmApiUrl: '', crmSrdKey: '', utmCaptureEnabled: true };
const FIELD_TYPES = ['text', 'tel', 'email', 'textarea', 'select'];

function FieldRow({ field, onChange, onRemove }) {
  const set = (patch) => onChange({ ...field, ...patch });
  return (
    <div className="a-card" style={{ padding: 14, marginBottom: 10 }}>
      <div className="a-fld-row">
        <div className="a-fld">
          <label>Question Label</label>
          <input value={field.label} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Preferred site visit date" />
        </div>
        <div className="a-fld">
          <label>Field Type</label>
          <select value={field.type} onChange={(e) => set({ type: e.target.value })}>
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {field.type === 'select' && (
        <div className="a-fld">
          <label>Options</label>
          <input
            value={(field.options || []).join(', ')}
            onChange={(e) => set({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Comma-separated, e.g. Morning, Afternoon, Evening"
          />
        </div>
      )}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem' }}>
        <input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} style={{ width: 'auto' }} />
        Required
      </label>
      <button type="button" className="a-btn a-btn-danger a-btn-sm" style={{ marginTop: 10 }} onClick={onRemove}>Remove Question</button>
    </div>
  );
}

export default function FormEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { forms, addForm, updateForm } = useData();
  const existing = !isNew ? forms.find((f) => f.id === id) : null;
  const [values, setValues] = useState(existing || EMPTY);
  const navigate = useNavigate();

  if (!isNew && !existing) {
    return <div className="a-empty">Form not found. <Link to="/admin/forms">← Back to forms</Link></div>;
  }

  const updateField = (i, patch) => setValues((v) => ({ ...v, fields: v.fields.map((f, idx) => (idx === i ? patch : f)) }));
  const removeField = (i) => setValues((v) => ({ ...v, fields: v.fields.filter((_, idx) => idx !== i) }));
  const addField = () => setValues((v) => ({ ...v, fields: [...v.fields, { id: uid('f'), label: '', type: 'text', required: false }] }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (isNew) addForm(values);
    else updateForm(id, values);
    navigate('/admin/forms');
  };

  return (
    <>
      <div className="a-topbar"><h1>{isNew ? 'Add Form' : `Edit: ${existing.name}`}</h1></div>
      <form onSubmit={onSubmit}>
        <div className="a-card">
          <h3 style={{ marginBottom: 14 }}>Form Details</h3>
          <div className="a-fld">
            <label>Form Name</label>
            <input value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required placeholder="e.g. Feathers Site Visit Form" />
            <div className="hint">Used to identify this form's leads in your CRM — sent as "formName" with every submission.</div>
          </div>
          <div className="a-fld">
            <label>Submit Button Label</label>
            <input value={values.submitLabel} onChange={(e) => setValues((v) => ({ ...v, submitLabel: e.target.value }))} />
          </div>
        </div>

        <div className="a-card">
          <h3 style={{ marginBottom: 4 }}>Questions</h3>
          <p className="hint" style={{ marginBottom: 14 }}>Full Name and Phone Number are always collected automatically — add any extra questions below.</p>
          {values.fields.map((f, i) => (
            <FieldRow key={f.id} field={f} onChange={(patch) => updateField(i, patch)} onRemove={() => removeField(i)} />
          ))}
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={addField}>+ Add Question</button>
        </div>

        <div className="a-card">
          <h3 style={{ marginBottom: 14 }}>CRM &amp; Tracking</h3>
          <div className="a-fld">
            <label>CRM API Endpoint (optional override)</label>
            <input value={values.crmApiUrl} onChange={(e) => setValues((v) => ({ ...v, crmApiUrl: e.target.value }))} placeholder="Leave blank to use the site-wide CRM endpoint from Settings" />
          </div>
          <div className="a-fld">
            <label>CRM Campaign / SRD Key (optional)</label>
            <input value={values.crmSrdKey} onChange={(e) => setValues((v) => ({ ...v, crmSrdKey: e.target.value }))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.86rem', marginBottom: 8 }}>
            <input type="checkbox" checked={!!values.utmCaptureEnabled} onChange={(e) => setValues((v) => ({ ...v, utmCaptureEnabled: e.target.checked }))} style={{ width: 'auto' }} />
            Capture UTM parameters for leads from this form
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="a-btn a-btn-primary">{isNew ? 'Create Form' : 'Save Changes'}</button>
          <button type="button" className="a-btn a-btn-ghost" onClick={() => navigate('/admin/forms')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
