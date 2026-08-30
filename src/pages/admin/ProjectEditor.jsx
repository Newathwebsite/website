import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { slugify } from '../../lib/storage';

const EMPTY = {
  name: '', slug: '', category: 'villa', status: 'ongoing', location: '', configs: '',
  priceFrom: 0, priceLabel: '', tagline: '', badge: '', description: '',
  heroImages: [], coverImage: '', coverImageAlt: '', logo: '', logoAlt: '', amenities: [], gallery: [], faqs: [],
  stats: [], nearby: [], media: {}, bannerLink: '', published: true,
  metaTitle: '', metaDescription: '',
  formId: '',
};

const CORE_FIELDS = [
  { name: 'name', label: 'Project Name', required: true, placeholder: 'ATH Feathers' },
  { name: 'slug', label: 'URL Slug', hint: 'Used in the project URL, e.g. /projects/ath-feathers. Leave blank to auto-generate from the name.', seo: 'slug' },
  { name: 'category', label: 'Category', type: 'select', options: [{ value: 'villa', label: 'Villa' }, { value: 'apartment', label: 'Apartment' }] },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ongoing', label: 'Ongoing' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'completed', label: 'Completed' }] },
  { name: 'location', label: 'Location', placeholder: 'Kundrathur, Chennai' },
  { name: 'configs', label: 'Configurations', placeholder: '3 & 4 BHK Independent Villas' },
  { name: 'priceFrom', label: 'Starting Price (₹, numeric)', type: 'number', placeholder: '14000000' },
  { name: 'priceLabel', label: 'Price Label (shown on site)', placeholder: '₹1.40 Cr onwards' },
  { name: 'tagline', label: 'Tagline', placeholder: 'The Address Few Can Own' },
  { name: 'badge', label: 'Highlight Badge (optional)', placeholder: 'Only gated villa community in Kundrathur' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'coverImage', label: 'Cover Image', type: 'image', altField: 'coverImageAlt' },
  { name: 'logo', label: 'Project Logo (optional — shown in the hero next to the project name)', type: 'image', altField: 'logoAlt' },
  { name: 'heroImages', label: 'Hero Slideshow Images', type: 'stringlist', hint: 'Comma-separated image URLs.' },
  { name: 'gallery', label: 'Gallery Images', type: 'stringlist', hint: 'Comma-separated image URLs.' },
  { name: 'amenities', label: 'Amenities', type: 'stringlist', hint: 'Comma-separated, e.g. Clubhouse, Gym, Swimming pool' },
  { name: 'faqs', label: 'FAQs', type: 'faqlist' },
  { name: 'bannerLink', label: 'Homepage Banner Link (optional override)', placeholder: '/contact', hint: "By default the homepage banner for this project links to its own page. Set a different internal path here to redirect it elsewhere instead." },
  { name: 'published', label: 'Published (visible on the public site)', type: 'boolean' },
];

const DETAIL_FIELDS = [
  { name: 'stats', label: 'Stats Row (shown on the project page)', type: 'statlist', addLabel: 'Stat', hint: 'e.g. 15 / Villas, 3 & 4 / BHK, 1407–1852 / Sq. Ft., G+1 / Floors, ₹1.20 Cr / Starting Price*' },
  { name: 'nearby', label: 'Nearby Connectivity', type: 'nearbylist', addLabel: 'Place' },
  { name: 'media.walkthrough', label: 'Walkthrough Video URL', type: 'video' },
  { name: 'media.aerial', label: 'Aerial / Drone View Video URL', type: 'video' },
  { name: 'media.hometour', label: 'Home Tour URL (360°/Matterport, etc.)', type: 'video' },
  { name: 'media.routemap', label: 'Route Map Video URL', type: 'video' },
  { name: 'media.gmap', label: 'Google Maps Link' },
  { name: 'media.floorplans', label: 'Floor Plan Images', type: 'imagelist', hint: 'Upload directly, pick from the media library, or paste a URL for each floor plan. The first image also doubles as the floor-plan preview.' },
];

const SEO_FIELDS = [
  {
    name: 'metaTitle', label: 'Meta Title (optional override)', seo: 'title',
    hint: 'Falls back to "<Project Name> | Asset Tree Homes" when blank.',
    ai: { kind: 'seo-title', label: '✨ Suggest title with AI', placeholder: 'Add any angle to emphasize (optional)', context: (v) => `Write an SEO meta title for a real-estate project page. Project: ${v.name}. Location: ${v.location}. Configuration: ${v.configs}. Price: ${v.priceLabel}. Description: ${v.description}` },
  },
  {
    name: 'metaDescription', label: 'Meta Description (optional override)', type: 'textarea', seo: 'description',
    hint: 'Falls back to the project description when blank.',
    ai: { kind: 'seo-description', label: '✨ Suggest description with AI', placeholder: 'Add any angle to emphasize (optional)', context: (v) => `Write an SEO meta description for a real-estate project page. Project: ${v.name}. Location: ${v.location}. Configuration: ${v.configs}. Price: ${v.priceLabel}. Description: ${v.description}` },
  },
];


// media.* fields are dotted paths into the nested `media` object — flatten
// for the form, then fold back into `media: {...}` on submit.
function flattenMedia(values) {
  const media = values.media || {};
  return { ...values, 'media.walkthrough': media.walkthrough, 'media.aerial': media.aerial, 'media.hometour': media.hometour, 'media.routemap': media.routemap, 'media.gmap': media.gmap, 'media.floorplans': media.floorplans || [] };
}
function unflattenMedia(values) {
  const { 'media.walkthrough': walkthrough, 'media.aerial': aerial, 'media.hometour': hometour, 'media.routemap': routemap, 'media.gmap': gmap, 'media.floorplans': floorplans, ...rest } = values;
  return { ...rest, media: { walkthrough, aerial, hometour, routemap, gmap, floorplans } };
}

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { projects, addProject, updateProject, forms } = useData();
  const existing = !isNew ? projects.find((p) => p.id === id) : null;
  const [values, setValues] = useState(flattenMedia(existing || EMPTY));
  const navigate = useNavigate();

  if (!isNew && !existing) {
    return (
      <div className="a-empty">
        Project not found. <Link to="/admin/projects">← Back to projects</Link>
      </div>
    );
  }

  const onSubmit = (data) => {
    const clean = unflattenMedia(data);
    const payload = { ...clean, slug: clean.slug ? slugify(clean.slug) : slugify(clean.name) };
    if (isNew) addProject(payload);
    else updateProject(id, payload);
    navigate('/admin/projects');
  };

  return (
    <>
      <div className="a-topbar"><h1>{isNew ? 'Add Project' : `Edit: ${existing.name}`}</h1></div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Core Details</h3>
        <AdminForm fields={CORE_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Project' : 'Save Changes'} onCancel={() => navigate('/admin/projects')} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Project Page Sections (stats, nearby, media)</h3>
        <AdminForm fields={DETAIL_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Project' : 'Save Changes'} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>SEO</h3>
        <AdminForm fields={SEO_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Project' : 'Save Changes'} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Contact Form</h3>
        <div className="a-fld">
          <label>Which form should this project's enquiry section show?</label>
          <select value={values.formId || ''} onChange={(e) => setValues((v) => ({ ...v, formId: e.target.value }))}>
            <option value="">Default contact form</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="hint">Each form has its own questions and its own CRM endpoint/SRD key — manage them under <Link to="/admin/forms">Enquiry Forms</Link>.</div>
        </div>
        <button type="button" className="a-btn a-btn-primary" onClick={() => onSubmit(values)}>{isNew ? 'Create Project' : 'Save Changes'}</button>
      </div>
    </>
  );
}
