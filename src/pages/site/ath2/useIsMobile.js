import { useEffect, useState } from 'react';

const QUERY = '(max-width: 900px)';

// Shared with Nav2's mobile-drawer detection — used wherever a choice
// (which card style, which image) needs to differ between mobile and
// desktop at render time rather than via CSS alone.
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
