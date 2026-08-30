import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';

export default function BlogList2() {
  const ref = useRef(null);
  const { blogPosts } = useData();
  // Manual array order controls display instead of always auto-sorting by
  // date, so admins can pin/feature posts.
  const posts = blogPosts.filter((p) => p.published);
  useReveal(ref);

  return (
    <div ref={ref}>
      <header className="hero" style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <span className="eyebrow">Blog</span>
          <h1>Stories from <span className="accent-text">Asset Tree Homes</span></h1>
          <p className="lede">Updates, guides and news from across our projects.</p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No posts published yet — check back soon.</p>
          ) : (
            <div className="grid-3 rv">
              {posts.map((p) => (
                <Link
                  className="card"
                  to={`/blog/${p.slug}`}
                  key={p.id}
                  style={{ display: 'block', position: 'relative' }}
                >
                  {p.coverImage && (
                    <img
                      src={p.coverImage}
                      alt={p.coverImageAlt || p.title}
                      style={{ borderRadius: 12, marginBottom: 14, height: 180, width: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div className="kicker">{p.date}{p.author ? ` · ${p.author}` : ''}</div>
                  {p.title && <h3 style={{ marginTop: 8 }}><span>{p.title}</span></h3>}
                  {p.excerpt && <p>{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
