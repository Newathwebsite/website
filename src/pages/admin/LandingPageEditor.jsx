import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { slugify } from '../../lib/storage';

const EMPTY = {
  name: '', slug: '', subdomain: '', published: true,
  heroHeading: '', heroSubheading: '', heroImage: '', heroImageAlt: '',
  sections: [], formId: '',
  metaTitle: '', metaDescription: '',
};

const CORE_FIELDS = [
  { name: 'name', label: 'Internal Name (for your reference in this list)', required: true, placeholder: 'Diwali Villa Offer' },
  { name: 'slug', label: 'URL Slug', hint: 'Reachable at /lp/<slug> on this site. Leave blank to auto-generate from the name.', seo: 'slug' },
  {
    name: 'subdomain', label: 'Subdomain (optional)', placeholder: 'diwali.assettreehomes.com',
    hint: "If set, this page also loads whenever a visitor's browser hostname matches this exactly — but only once you've pointed that subdomain's DNS at this same deployed site. That DNS/hosting step happens outside this admin panel; this field alone can't create the subdomain.",
  },
  { name: 'published', label: 'Published (visible on the public site)', type: 'boolean' },
  { name: 'heroHeading', label: 'Hero Heading', placeholder: 'Own a Villa This Diwali' },
  { name: 'heroSubheading', label: 'Hero Subheading', type: 'textarea' },
  { name: 'heroImage', label: 'Hero Image', type: 'image', altField: 'heroImageAlt' },
  { name: 'sections', label: 'Content Sections', type: 'sectionlist' },
];

const SEO_FIELDS = [
  {
    name: 'metaTitle', label: 'Meta Title (optional override)', seo: 'title',
    hint: 'Falls back to "<Internal Name> | Asset Tree Homes" when blank.',
    ai: { kind: 'seo-title', label: '✨ Suggest title with AI', context: (v) => `Write an SEO meta title for a real-estate campaign landing page. Heading: ${v.heroHeading}. Subheading: ${v.heroSubheading}` },
  },
  {
    name: 'metaDescription', label: 'Meta Description (optional override)', type: 'textarea', seo: 'description',
    hint: 'Falls back to the hero subheading when blank.',
    ai: { kind: 'seo-description', label: '✨ Suggest description with AI', context: (v) => `Write an SEO meta description for a real-estate campaign landing page. Heading: ${v.heroHeading}. Subheading: ${v.heroSubheading}` },
  },
];

export default function LandingPageEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { landingPages, addLandingPage, updateLandingPage, forms } = useData();
  const existing = !isNew ? landingPages.find((p) => p.id === id) : null;
  const [values, setValues] = useState(existing || EMPTY);
  const navigate = useNavigate();

  if (!isNew && !existing) {
    return <div className="a-empty">Landing page not found. <Link to="/admin/landing-pages">← Back to landing pages</Link></div>;
  }

  const onSubmit = (data) => {
    const payload = { ...data, slug: data.slug ? slugify(data.slug) : slugify(data.name) };
    if (isNew) addLandingPage(payload);
    else updateLandingPage(id, payload);
    navigate('/admin/landing-pages');
  };

  return (
    <>
      <div className="a-topbar"><h1>{isNew ? 'Add Landing Page' : `Edit: ${existing.name}`}</h1></div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Content</h3>
        <AdminForm fields={CORE_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Landing Page' : 'Save Changes'} onCancel={() => navigate('/admin/landing-pages')} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>SEO</h3>
        <AdminForm fields={SEO_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Landing Page' : 'Save Changes'} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Enquiry Form</h3>
        <div className="a-fld">
          <label>Which form should this landing page's enquiry section show?</label>
          <select value={values.formId || ''} onChange={(e) => setValues((v) => ({ ...v, formId: e.target.value }))}>
            <option value="">Default contact form</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="hint">Each form has its own questions and its own CRM endpoint/SRD key — manage them under <Link to="/admin/forms">Enquiry Forms</Link>.</div>
        </div>
        <button type="button" className="a-btn a-btn-primary" onClick={() => onSubmit(values)}>{isNew ? 'Create Landing Page' : 'Save Changes'}</button>
      </div>
      {!isNew && existing.published && (
        <div className="a-card">
          <h3 style={{ marginBottom: 10 }}>Live URL</h3>
          <p><Link to={`/lp/${existing.slug}`} target="_blank">{window.location.origin}/lp/{existing.slug}</Link></p>
        </div>
      )}
    </>
  );
}
