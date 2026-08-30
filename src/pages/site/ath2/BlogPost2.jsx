import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { applySeo, resetSeo } from '../../../lib/seo';
import DynamicForm from './DynamicForm';
import SectionCards from './SectionCards';

export default function BlogPost2() {
  const { slug } = useParams();
  const ref = useRef(null);
  const { blogPosts } = useData();
  const post = blogPosts.find((p) => p.slug === slug && p.published);
  useReveal(ref);

  useEffect(() => {
    if (!post) return;
    applySeo({ title: `${post.metaTitle || post.title} | Asset Tree Homes`, description: post.metaDescription || post.excerpt });
    return resetSeo;
  }, [post]);

  if (!post) {
    return (
      <section className="sec">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2>Post not found</h2>
          <p style={{ marginTop: 10 }}><Link to="/blog">← Back to blog</Link></p>
        </div>
      </section>
    );
  }

  return (
    <div ref={ref}>
      <header className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="eyebrow">{post.date}{post.author ? ` · ${post.author}` : ''}</span>
          {post.title && <h1><span>{post.title}</span></h1>}
        </div>
      </header>
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              style={{ width: '100%', borderRadius: 16, marginBottom: 30 }}
            />
          )}
          {post.content.split('\n').filter(Boolean).map((para, i) => <p key={i} style={{ marginBottom: 18, fontSize: '1.02rem', color: 'var(--ink)' }}>{para}</p>)}
          {post.tags?.length > 0 && (
            <div style={{ marginTop: 30, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
            </div>
          )}
        </div>
      </section>

      {post.sections?.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap"><SectionCards sections={post.sections} columns={3} /></div>
        </section>
      )}

      {post.formId && (
        <section className="sec sec-soft" style={{ paddingTop: 40 }}>
          <div className="wrap" style={{ maxWidth: 520 }}>
            <div className="sec-head center"><h2 style={{ fontSize: '1.6rem' }}>Interested? Get in touch</h2></div>
            <div className="form-card"><DynamicForm formId={post.formId} source={`Blog: ${post.title}`} /></div>
          </div>
        </section>
      )}
    </div>
  );
}
