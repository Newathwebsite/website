import { useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { applySeo } from '../../../lib/seo';

// Applies the admin-editable theme (colors/fonts) as CSS custom properties on
// the .ath2 root — overriding ath2.css's defaults — and sets the sitewide
// default SEO tags. This is what makes "Theme" in Settings actually affect
// every page, including project detail pages (pd2.css reads --primary too).
export default function ThemeInjector() {
  const { settings } = useData();
  const theme = settings.theme || {};

  useEffect(() => {
    const root = document.querySelector('.ath2');
    if (!root) return;
    if (theme.primary) root.style.setProperty('--primary', theme.primary);
    if (theme.accent) root.style.setProperty('--accent', theme.accent);
    if (theme.fontDisplay) root.style.setProperty('--font-display', `"${theme.fontDisplay}", var(--font-sans)`);
    if (theme.fontBody) root.style.setProperty('--font-sans', `"${theme.fontBody}", system-ui, sans-serif`);
  }, [theme.primary, theme.accent, theme.fontDisplay, theme.fontBody]);

  useEffect(() => {
    const seoDefault = { title: settings.defaultMetaTitle, description: settings.defaultMetaDescription };
    window.__athSeoDefault = seoDefault;
    applySeo(seoDefault);
  }, [settings.defaultMetaTitle, settings.defaultMetaDescription]);

  return null;
}
