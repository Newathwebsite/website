import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { slugify } from '../../lib/storage';

const EMPTY = {
  title: '', slug: '', subtitle: '', placeholderNote: '', portalUrl: '', sections: [],
  metaTitle: '', metaDescription: '', formId: '',
};

const FIELDS = [
  { name: 'title', label: 'Page Title', required: true, placeholder: 'About Asset Tree Homes' },
  { name: 'slug', label: 'URL Slug', hint: 'Used in the page URL, e.g. /about. Leave blank to auto-generate from the title.', seo: 'slug' },
  { name: 'subtitle', label: 'Subtitle', placeholder: 'Homes built on trust' },
  { name: 'placeholderNote', label: 'Placeholder Note (optional)', type: 'textarea', hint: 'Shown as an editorial callout at the top of the page — use it to flag content that still needs real facts before publishing. Leave blank once the page is ready to go live.' },
  { name: 'portalUrl', label: 'Partner Portal URL (Channel Partner page only)', placeholder: 'https://iris.assettreehomes.com/users/sign_in' },
  { name: 'sections', label: 'Content Sections', type: 'sectionlist' },
];

const SEO_FIELDS = [
  {
    name: 'metaTitle', label: 'Meta Title (optional override)', seo: 'title',
    hint: 'Falls back to "<Page Title> | Asset Tree Homes" when blank.',
    ai: { kind: 'seo-title', label: '✨ Suggest title with AI', context: (v) => `Write an SEO meta title for this page. Page title: ${v.title}. Subtitle: ${v.subtitle}` },
  },
  {
    name: 'metaDescription', label: 'Meta Description (optional override)', type: 'textarea', seo: 'description',
    hint: 'Falls back to the subtitle when blank.',
    ai: { kind: 'seo-description', label: '✨ Suggest description with AI', context: (v) => `Write an SEO meta description for this page. Page title: ${v.title}. Subtitle: ${v.subtitle}` },
  },
];

export default function PageEditor() {
  const { slug } = useParams();
  const isNew = slug === 'new';
  const { pages, addPage, updatePage, forms } = useData();
  const existing = !isNew ? pages.find((p) => p.slug === slug) : null;
  const [values, setValues] = useState(existing || EMPTY);
  const navigate = useNavigate();

  if (!isNew && !existing) {
    return <div className="a-empty">Page not found. <Link to="/admin/pages">← Back to pages</Link></div>;
  }

  const onSubmit = (data) => {
    const payload = { ...data, slug: data.slug ? slugify(data.slug) : slugify(data.title) };
    if (isNew) addPage(payload);
    else updatePage(slug, payload);
    navigate('/admin/pages');
  };

  return (
    <>
      <div className="a-topbar"><h1>{isNew ? 'Add Page' : `Edit: ${existing.title}`}</h1></div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Content</h3>
        <AdminForm fields={FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Page' : 'Save Changes'} onCancel={() => navigate('/admin/pages')} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>SEO</h3>
        <AdminForm fields={SEO_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Page' : 'Save Changes'} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Contact Form</h3>
        <div className="a-fld">
          <label>Which form should this page's enquiry links point to?</label>
          <select value={values.formId || ''} onChange={(e) => setValues((v) => ({ ...v, formId: e.target.value }))}>
            <option value="">Default contact form</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="hint">This page links out to the main Contact page rather than embedding its own form — set the Contact page's form under Settings → Contact Form. Manage forms under <Link to="/admin/forms">Enquiry Forms</Link>.</div>
        </div>
        <button type="button" className="a-btn a-btn-primary" onClick={() => onSubmit(values)}>{isNew ? 'Create Page' : 'Save Changes'}</button>
      </div>
    </>
  );
}
