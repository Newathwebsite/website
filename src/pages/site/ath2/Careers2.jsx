import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import DynamicForm from './DynamicForm';
import { heroBackgroundStyle } from './HeroBackground';

export default function Careers2() {
  const ref = useRef(null);
  const { pages, jobOpenings } = useData();
  const page = pages.find((p) => p.slug === 'careers');
  const [applyingId, setApplyingId] = useState(null);
  useReveal(ref);
  usePageSeo(page, 'Careers');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Careers</span>
          <h1>Build homes, <span className="accent-text">build a career</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {jobOpenings.length === 0 ? (
            <PlaceholderNote page={page} />
          ) : (
            <div className="rv" style={{ marginBottom: 40 }}>
              {jobOpenings.map((j) => (
                <div className="card" key={j.id} style={{ marginBottom: 16 }}>
                  <h3>{j.title}</h3>
                  <p>{j.department} · {j.location} · {j.type}</p>
                  {j.description && <p style={{ marginTop: 8 }}>{j.description}</p>}
                  <div style={{ marginTop: 16 }}>
                    {j.formId ? (
                      <button type="button" className="btn btn-outline" onClick={() => setApplyingId(applyingId === j.id ? null : j.id)}>
                        {applyingId === j.id ? 'Close' : 'Apply'}
                      </button>
                    ) : (
                      <Link className="btn btn-outline" to="/contact">Apply</Link>
                    )}
                  </div>
                  {applyingId === j.id && j.formId && (
                    <div className="form-card" style={{ marginTop: 20, maxWidth: 480 }}>
                      <DynamicForm formId={j.formId} source={`Job: ${j.title}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="sec-head center rv">
            <div className="kicker">Why Work Here</div>
            <h2>A track record you can build on</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Interested in joining the team?</h2>
            <p>Send us your details and we'll reach out when a relevant role opens.</p>
            <Link className="btn btn-light" to="/contact">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
