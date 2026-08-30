import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { applySeo, resetSeo } from '../../../lib/seo';
import ThemeInjector from './ThemeInjector';
import ScriptInjector from './ScriptInjector';
import SectionCards from './SectionCards';
import ContactForm2 from './ContactForm2';
import DynamicForm from './DynamicForm';
import WhatsAppButton from './WhatsAppButton';
import '../../../styles/ath2.css';

function LandingPageInner({ page }) {
  const ref = useRef(null);
  const { settings } = useData();
  useReveal(ref);

  useEffect(() => {
    applySeo({
      title: page.metaTitle || `${page.name} | Asset Tree Homes`,
      description: page.metaDescription || page.heroSubheading,
    });
    return resetSeo;
  }, [page]);

  return (
    <div className="ath2" ref={ref}>
      <ThemeInjector />
      <ScriptInjector />
      <nav className="site-nav" style={{ justifyContent: 'space-between' }}>
        <a className="brand" href="/">
          <img src={settings.logo} alt={settings.siteName} />
        </a>
        <a className="btn btn-primary" href="tel:+918939856789">CALL +91 89398 56789</a>
      </nav>

      <main>
        <header className="hero">
          <div className="wrap">
            {page.heroImage && (
              <img
                src={page.heroImage}
                alt={page.heroImageAlt || page.heroHeading || ''}
                style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 'var(--r-lg)', marginBottom: 30 }}
              />
            )}
            {page.heroHeading && <h1><span>{page.heroHeading}</span></h1>}
            {page.heroSubheading && <p className="lede">{page.heroSubheading}</p>}
            <a className="btn btn-primary" href="#lp-form" style={{ marginTop: 10 }}>ENQUIRE NOW</a>
          </div>
        </header>

        {page.sections?.length > 0 && (
          <section className="sec">
            <div className="wrap"><SectionCards sections={page.sections} columns={3} /></div>
          </section>
        )}

        <section className="sec" id="lp-form" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 560 }}>
            <div className="sec-head center rv"><h2>Get in touch</h2><p>Share your details and our team will call you back.</p></div>
            <div className="form-card rv">
              {page.formId ? <DynamicForm formId={page.formId} source={`Landing Page: ${page.name}`} /> : <ContactForm2 source={`Landing Page: ${page.name}`} />}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-bottom" style={{ paddingTop: 0, paddingBottom: 24 }}>
            <span>© {new Date().getFullYear()} {settings.siteName} Pvt Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}

// A focused, single-page campaign design — hero + sections + one enquiry
// form, no site-wide nav/footer/mascot. Reachable at /lp/:slug, and also
// matched directly by hostname in App.jsx when a landing page has a
// `subdomain` set (see App.jsx's comment for what that does and doesn't do).
export function LandingPageBody({ page }) {
  return <LandingPageInner page={page} />;
}

export default function LandingPage2() {
  const { slug } = useParams();
  const { landingPages } = useData();
  const page = landingPages.find((p) => p.slug === slug && p.published);

  if (!page) {
    return (
      <div className="ath2">
        <div className="wrap" style={{ padding: '120px 24px', textAlign: 'center' }}>
          <h1>Page Not Found</h1>
          <p>This landing page may have been unpublished or the link is out of date.</p>
        </div>
      </div>
    );
  }

  return <LandingPageBody page={page} />;
}
