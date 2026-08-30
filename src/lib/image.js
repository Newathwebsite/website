import { apiFetch, API_URL } from './api';

// Uploads a file to the real backend (see ath-ai-server/src/routes/upload.js)
// and returns a URL to store on whatever record references it — replaces
// the old base64-data-URL-in-localStorage approach now that there's a real
// server to hold files on.
//
// The backend returns a path relative to itself (e.g. "/uploads/img_x.png"),
// not to whichever origin the frontend happens to be served from (the public
// site and admin panel can be — and in production will be — deployed to
// entirely different hosts/subdomains than the API). Resolving it to an
// absolute URL here, once, means every existing `<img src={value}>` /
// `background-image: url(value)` call site across the app keeps working
// unchanged, since they already just render whatever string is stored.
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { url, width, height } = await apiFetch('/api/media/upload', { method: 'POST', body: formData });
  return { url: `${API_URL}${url}`, width, height };
}
