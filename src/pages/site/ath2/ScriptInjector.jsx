import { useEffect } from 'react';
import { useData } from '../../../context/DataContext';

// Injects marketing/tag scripts sitewide from just an ID, so a non-technical
// admin can wire up GA4 / Meta Pixel / GTM without touching code. Each script
// is tagged with a data attribute and only (re)injected when the underlying
// ID actually changes, so editing Settings doesn't pile up duplicate tags.
function upsertScript(id, build) {
  const existing = document.querySelector(`script[data-ath-integration="${id}"]`);
  if (existing) existing.remove();
  const el = build();
  if (el) {
    el.setAttribute('data-ath-integration', id);
    document.head.appendChild(el);
  }
}

export default function ScriptInjector() {
  const { settings } = useData();
  const { ga4Id, metaPixelId, gtmId, customHeadScript, customBodyScript } = settings.integrations || {};

  useEffect(() => {
    if (!ga4Id) { upsertScript('ga4', () => null); upsertScript('ga4-inline', () => null); return; }
    upsertScript('ga4', () => {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      return s;
    });
    upsertScript('ga4-inline', () => {
      const s = document.createElement('script');
      s.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`;
      return s;
    });
  }, [ga4Id]);

  useEffect(() => {
    if (!metaPixelId) { upsertScript('meta-pixel', () => null); return; }
    upsertScript('meta-pixel', () => {
      const s = document.createElement('script');
      s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`;
      return s;
    });
  }, [metaPixelId]);

  useEffect(() => {
    if (!gtmId) { upsertScript('gtm', () => null); return; }
    upsertScript('gtm', () => {
      const s = document.createElement('script');
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      return s;
    });
  }, [gtmId]);

  useEffect(() => {
    if (!customHeadScript) { upsertScript('custom-head', () => null); return; }
    upsertScript('custom-head', () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = customHeadScript;
      const s = document.createElement('script');
      s.text = `/* custom head script */`;
      Array.from(wrap.childNodes).forEach((n) => document.head.appendChild(n.cloneNode(true)));
      return s;
    });
  }, [customHeadScript]);

  useEffect(() => {
    const id = 'custom-body';
    const existing = document.querySelector(`[data-ath-integration="${id}"]`);
    if (existing) existing.remove();
    if (!customBodyScript) return;
    const marker = document.createElement('div');
    marker.style.display = 'none';
    marker.setAttribute('data-ath-integration', id);
    marker.innerHTML = customBodyScript;
    document.body.appendChild(marker);
  }, [customBodyScript]);

  return null;
}
