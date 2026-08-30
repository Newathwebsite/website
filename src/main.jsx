import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import './styles/admin.css'
import App from './App.jsx'
import { registerServiceWorker } from './lib/push'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Required for PWA installability, and to receive Web Push notifications
// even when no tab is open. Failure here just means those two features are
// unavailable (e.g. an unsupported browser) — the rest of the site is fine.
registerServiceWorker().catch((e) => console.warn('[ath] service worker registration failed:', e.message));
