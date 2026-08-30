import { useData } from '../../../context/DataContext';

export default function WhatsAppButton() {
  const { settings } = useData();
  const digits = (settings.whatsappNumber || '').replace(/[^\d]/g, '');
  if (!digits) return null;

  const text = encodeURIComponent(settings.whatsappMessage || "Hi! I'm interested in Asset Tree Homes projects.");
  const href = `https://wa.me/${digits}?text=${text}`;

  return (
    <a className="ath-whatsapp-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16 3.6C9.7 3.6 4.6 8.7 4.6 15c0 2.2.6 4.3 1.7 6.2l-1.8 6.6 6.8-1.8c1.8 1 3.8 1.5 5.9 1.5 6.3 0 11.4-5.1 11.4-11.4S22.3 3.6 16 3.6zm6.7 16.2c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.4-1.5-5.6-4.9-5.8-5.1-.2-.2-1.4-1.8-1.4-3.5s.9-2.4 1.2-2.8c.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .8.6.3.7 1 2.4 1.1 2.6.1.2.2.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.4.1.2.1 1-.2 1.8z" />
      </svg>
    </a>
  );
}
