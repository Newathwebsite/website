import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { slugify } from '../../lib/storage';

const EMPTY = {
  title: '', slug: '', excerpt: '', content: '', author: '', date: new Date().toISOString().slice(0, 10),
  tags: [], coverImage: '', coverImageAlt: '', published: true,
  metaTitle: '', metaDescription: '', formId: '',
};

const FIELDS = [
  { name: 'title', label: 'Title', required: true, placeholder: 'Why villa living is trending in Chennai' },
  { name: 'slug', label: 'URL Slug', hint: 'Used as /blog/<slug>. Leave blank to auto-generate from the title.', seo: 'slug' },
  { name: 'author', label: 'Author' },
  { name: 'date', label: 'Publish Date', placeholder: 'YYYY-MM-DD' },
  { name: 'tags', label: 'Tags', type: 'stringlist', hint: 'Comma-separated, e.g. villas, chennai, investing' },
  {
    name: 'excerpt', label: 'Excerpt', type: 'textarea', hint: 'Short summary shown on the blog listing page.',
    ai: { kind: 'seo-description', label: '✨ Write excerpt with AI', placeholder: 'One line about what this post covers', context: (v) => `Write a short blog excerpt/summary (1-2 sentences). Post title: ${v.title}` },
  },
  {
    name: 'content', label: 'Content', type: 'textarea', hint: 'Plain text / paragraphs. Rendered as-is on the post page.',
    ai: { kind: 'blog', label: '✨ Write draft with AI', placeholder: 'What should this post cover? Give topic, key points, tone…', context: (v) => `Write a blog post. Title: ${v.title}` },
  },
  { name: 'coverImage', label: 'Cover Image', type: 'image', altField: 'coverImageAlt' },
  { name: 'published', label: 'Published (visible on the public site)', type: 'boolean' },
];

const SEO_FIELDS = [
  {
    name: 'metaTitle', label: 'Meta Title', seo: 'title',
    hint: 'Falls back to the post title when left blank.',
    ai: { kind: 'seo-title', label: '✨ Suggest title with AI', context: (v) => `Write an SEO meta title for this blog post. Title: ${v.title}. Excerpt: ${v.excerpt}` },
  },
  {
    name: 'metaDescription', label: 'Meta Description', type: 'textarea', seo: 'description',
    hint: 'Falls back to the excerpt when left blank.',
    ai: { kind: 'seo-description', label: '✨ Suggest description with AI', context: (v) => `Write an SEO meta description for this blog post. Title: ${v.title}. Excerpt: ${v.excerpt}` },
  },
];

export default function BlogEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { blogPosts, addBlogPost, updateBlogPost, forms } = useData();
  const existing = !isNew ? blogPosts.find((p) => p.id === id) : null;
  const [values, setValues] = useState(existing || EMPTY);
  const navigate = useNavigate();

  if (!isNew && !existing) {
    return <div className="a-empty">Post not found. <Link to="/admin/blog">← Back to blog</Link></div>;
  }

  const onSubmit = (data) => {
    const payload = { ...data, slug: data.slug ? slugify(data.slug) : slugify(data.title) };
    if (isNew) addBlogPost(payload);
    else updateBlogPost(id, payload);
    navigate('/admin/blog');
  };

  return (
    <>
      <div className="a-topbar"><h1>{isNew ? 'Add Blog Post' : `Edit: ${existing.title}`}</h1></div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Content</h3>
        <AdminForm fields={FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Post' : 'Save Changes'} onCancel={() => navigate('/admin/blog')} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>SEO</h3>
        <AdminForm fields={SEO_FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={isNew ? 'Create Post' : 'Save Changes'} />
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Contact Form</h3>
        <div className="a-fld">
          <label>Show an enquiry form at the end of this post?</label>
          <select value={values.formId || ''} onChange={(e) => setValues((v) => ({ ...v, formId: e.target.value }))}>
            <option value="">None</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="hint">Manage forms under <Link to="/admin/forms">Enquiry Forms</Link>.</div>
        </div>
        <button type="button" className="a-btn a-btn-primary" onClick={() => onSubmit(values)}>{isNew ? 'Create Post' : 'Save Changes'}</button>
      </div>
    </>
  );
}
