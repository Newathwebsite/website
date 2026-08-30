import { useRef } from 'react';
import { useReveal } from './useReveal';
import { useData } from '../../../context/DataContext';
import ContactForm2 from './ContactForm2';
import DynamicForm from './DynamicForm';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function Contact2() {
  const ref = useRef(null);
  const { settings, pages } = useData();
  const contact = settings.contact || {};
  const page = pages.find((p) => p.slug === 'contact');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;
  useReveal(ref);

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Contact Us</span>
          {contact.heading && <h1><span>{contact.heading}</span></h1>}
          {contact.subheading && <p className="lede">{contact.subheading}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid-2 rv" style={{ alignItems: 'flex-start' }}>
            <div className="form-card">
              <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Book a site visit or enquire</h2>
              <p style={{ marginBottom: 22, fontSize: '.9rem' }}>We'll get back to you within 1 business day.</p>
              {settings.contactFormId ? <DynamicForm formId={settings.contactFormId} source="Contact Page" /> : <ContactForm2 source="Contact Page" />}
            </div>

            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></div>
                {contact.officeTitle && <h3><span>{contact.officeTitle}</span></h3>}
                {contact.officeAddress && <p>{contact.officeAddress}</p>}
              </div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                <h3>Call Us</h3>
                <p><a href={`tel:${(contact.phone || '').replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>{contact.phone && <span>{contact.phone}</span>}</a></p>
              </div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></div>
                <h3>Email</h3>
                {contact.email && <p>{contact.email}</p>}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <iframe
                  src="https://www.google.com/maps?q=Feathers+ATH+Private+Limited,+Kundrathur,+Chennai&z=13&output=embed"
                  width="100%" height="300" style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Asset Tree Homes — Kundrathur, Chennai"
                />
              </div>
            </div>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>
    </div>
  );
}
