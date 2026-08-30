// Sends contact/enquiry form submissions straight to the CRM's API endpoint.
// No backend of our own is involved — this is a direct client -> CRM API call.
// Configure the endpoint in .env (VITE_CRM_API_URL / VITE_CRM_API_KEY) or,
// at runtime, via /admin/settings (useful when the same build is reused across
// environments without a rebuild). Any page/project/blog post/job listing can
// override the endpoint (and add its own SRD/campaign key) via its own
// crmApiUrl/crmSrdKey/utmCaptureEnabled fields — pass those as `override`.

import { getUtmParams } from './utm';

export async function submitLeadToCrm(payload, settings, override = {}) {
  const url = override.crmApiUrl || settings?.crmApiUrl || import.meta.env.VITE_CRM_API_URL;
  const apiKey = settings?.crmApiKey || import.meta.env.VITE_CRM_API_KEY;
  const srdKey = override.crmSrdKey;
  const captureUtm = override.utmCaptureEnabled !== false;

  if (!url) {
    console.warn('[CRM] No CRM API URL configured (set it in /admin/settings, or on this page, or VITE_CRM_API_URL). Lead was NOT sent:', payload);
    return { ok: false, reason: 'not-configured' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      ...payload,
      ...(srdKey ? { srdKey } : {}),
      ...(captureUtm ? { utm: getUtmParams() } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CRM request failed (${res.status}): ${text}`);
  }

  return { ok: true };
}
