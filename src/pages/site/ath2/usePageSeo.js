import { useEffect } from 'react';
import { applySeo, resetSeo } from '../../../lib/seo';

// Applies a CMS page's own SEO fields (falling back to title/subtitle when
// no explicit meta fields are set), and restores the sitewide default on
// unmount so navigating away doesn't leak a stale title/description.
export function usePageSeo(page, fallbackTitle) {
  useEffect(() => {
    if (!page) return;
    applySeo({
      title: page.metaTitle || `${page.title || fallbackTitle} | Asset Tree Homes`,
      description: page.metaDescription || page.subtitle,
    });
    return resetSeo;
  }, [page, fallbackTitle]);
}
