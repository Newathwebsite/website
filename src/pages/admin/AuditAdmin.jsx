import { Fragment, useState } from 'react';
import { useData } from '../../context/DataContext';
import { scoreProject, scorePage, scoreBlogPost, scoreLabel } from '../../lib/seoScore';

function runAudit({ projects, pages, blogPosts, testimonials }) {
  const findings = [];

  const flag = (severity, area, item, message) => findings.push({ severity, area, item, message });

  projects.forEach((p) => {
    if (!p.metaTitle) flag('warn', 'Projects', p.name, 'Missing meta title — falls back to project name.');
    if (!p.metaDescription) flag('warn', 'Projects', p.name, 'Missing meta description.');
    if (!p.coverImage) flag('error', 'Projects', p.name, 'No cover image set.');
    else if (!p.coverImageAlt) flag('warn', 'Projects', p.name, 'Cover image has no alt text.');
    if (!p.description) flag('warn', 'Projects', p.name, 'No description — used in SEO and hero copy.');
    if (!p.slug) flag('error', 'Projects', p.name, 'No URL slug.');
  });

  pages.forEach((p) => {
    if (!p.metaTitle) flag('info', 'Pages', p.title, 'No custom meta title set (using page title as fallback).');
    if (!p.metaDescription) flag('info', 'Pages', p.title, 'No custom meta description set.');
    if (p.placeholderNote) flag('warn', 'Pages', p.title, 'Still has a placeholder note — content is flagged as not final.');
    if (!p.sections?.length) flag('warn', 'Pages', p.title, 'Has no content sections.');
  });

  blogPosts.forEach((b) => {
    if (!b.metaTitle) flag('info', 'Blog', b.title, 'No custom meta title (using post title as fallback).');
    if (!b.metaDescription) flag('info', 'Blog', b.title, 'No custom meta description (using excerpt as fallback).');
    if (!b.coverImage) flag('warn', 'Blog', b.title, 'No cover image.');
    else if (!b.coverImageAlt) flag('warn', 'Blog', b.title, 'Cover image has no alt text.');
    if (!b.excerpt) flag('warn', 'Blog', b.title, 'No excerpt.');
  });

  testimonials.forEach((t) => {
    if (!t.videoId) flag('error', 'Testimonials', t.name || t.id, 'No YouTube video ID set.');
  });

  return findings;
}

const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 };
const SEVERITY_LABEL = { error: 'Error', warn: 'Warning', info: 'Suggestion' };

function SeoScoreTable({ title, items, scorer, nameKey }) {
  const [openId, setOpenId] = useState(null);
  if (!items.length) return null;
  return (
    <div className="a-card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <table className="a-table">
        <thead><tr><th>Item</th><th>Score</th><th></th></tr></thead>
        <tbody>
          {items.map((item, i) => {
            const { score, checks } = scorer(item);
            const { label, color } = scoreLabel(score);
            const id = `${title}-${i}`;
            const open = openId === id;
            return (
              <Fragment key={id}>
                <tr>
                  <td>{item[nameKey]}</td>
                  <td>
                    <span style={{ fontWeight: 700, color }}>{score}</span>
                    <span style={{ color, marginLeft: 8, fontSize: '.78rem' }}>{label}</span>
                  </td>
                  <td><button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setOpenId(open ? null : id)}>{open ? 'Hide' : 'Details'}</button></td>
                </tr>
                {open && (
                  <tr>
                    <td colSpan={3} style={{ background: 'var(--a-bg)' }}>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {checks.map((c) => (
                          <li key={c.key} style={{ fontSize: '.84rem', marginBottom: 4, color: c.ok ? 'var(--a-ok)' : 'var(--a-err)' }}>
                            {c.ok ? '✓' : '✕'} {c.label} — <span style={{ color: 'var(--a-muted)' }}>{c.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditAdmin() {
  const { projects, pages, blogPosts, testimonials } = useData();
  const [tab, setTab] = useState('content');
  const findings = runAudit({ projects, pages, blogPosts, testimonials }).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const counts = { error: 0, warn: 0, info: 0 };
  findings.forEach((f) => counts[f.severity]++);

  const allScores = [
    ...projects.map((p) => scoreProject(p).score),
    ...pages.map((p) => scorePage(p).score),
    ...blogPosts.map((b) => scoreBlogPost(b).score),
  ];
  const avgScore = allScores.length ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length) : 0;

  return (
    <>
      <div className="a-topbar"><h1>Site Audit</h1></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button type="button" className={`a-btn ${tab === 'content' ? 'a-btn-primary' : 'a-btn-ghost'}`} onClick={() => setTab('content')}>Content Audit</button>
        <button type="button" className={`a-btn ${tab === 'seo' ? 'a-btn-primary' : 'a-btn-ghost'}`} onClick={() => setTab('seo')}>SEO Scores</button>
      </div>

      {tab === 'content' ? (
        <>
          <div className="a-stats">
            <div className="a-stat"><div className="n" style={{ color: 'var(--a-err)' }}>{counts.error}</div><div className="l">Errors</div></div>
            <div className="a-stat"><div className="n" style={{ color: '#a9744c' }}>{counts.warn}</div><div className="l">Warnings</div></div>
            <div className="a-stat"><div className="n">{counts.info}</div><div className="l">Suggestions</div></div>
            <div className="a-stat"><div className="n" style={{ color: 'var(--a-ok)' }}>{findings.length === 0 ? '✓' : projects.length + pages.length + blogPosts.length}</div><div className="l">Items Scanned</div></div>
          </div>

          {findings.length === 0 ? (
            <div className="a-card"><p>No issues found — projects, pages and blog posts all have SEO fields, alt text and required content filled in.</p></div>
          ) : (
            <table className="a-table">
              <thead><tr><th>Severity</th><th>Area</th><th>Item</th><th>Issue</th></tr></thead>
              <tbody>
                {findings.map((f, i) => (
                  <tr key={i}>
                    <td><span className={`a-badge ${f.severity === 'error' ? 'off' : 'ok'}`}>{SEVERITY_LABEL[f.severity]}</span></td>
                    <td>{f.area}</td>
                    <td>{f.item}</td>
                    <td>{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <>
          <div className="a-stats">
            <div className="a-stat"><div className="n" style={{ color: scoreLabel(avgScore).color }}>{avgScore}</div><div className="l">Average SEO Score</div></div>
          </div>
          <p style={{ fontSize: '.84rem', color: 'var(--a-muted)', marginBottom: 20 }}>
            Each score weighs title/heading presence, meta title &amp; description length (search engines truncate outside ~30-60 and ~120-160 characters), real body content, a cover image with alt text, and a clean URL slug. Click "Details" to see exactly what's costing points.
          </p>
          <SeoScoreTable title="Projects" items={projects} scorer={scoreProject} nameKey="name" />
          <SeoScoreTable title="Pages" items={pages} scorer={scorePage} nameKey="title" />
          <SeoScoreTable title="Blog Posts" items={blogPosts} scorer={scoreBlogPost} nameKey="title" />
        </>
      )}
    </>
  );
}
