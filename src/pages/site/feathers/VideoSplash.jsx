import { useEffect, useRef, useState } from 'react';
import EnquireForm from './EnquireForm';

const SEEN_KEY = 'athSplashSeen';

export default function VideoSplash() {
  const [visible, setVisible] = useState(() => sessionStorage.getItem(SEEN_KEY) !== '1');
  const [ended, setEnded] = useState(false);
  const [closing, setClosing] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SEEN_KEY, '1');
    document.body.style.overflow = 'hidden';

    const vid = videoRef.current;
    if (!vid) return;

    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    vid.src = isMobile ? '/assets/splash-intro.mp4' : '/assets/splash-desktop.mp4';

    const onEnded = () => setEnded(true);
    const onError = () => skip();
    vid.addEventListener('ended', onEnded);
    vid.addEventListener('error', onError);

    const safety = setTimeout(() => {
      if (vid.readyState < 2) skip();
    }, 6000);
    const onPlaying = () => clearTimeout(safety);
    vid.addEventListener('playing', onPlaying);

    return () => {
      vid.removeEventListener('ended', onEnded);
      vid.removeEventListener('error', onError);
      vid.removeEventListener('playing', onPlaying);
      clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const skip = () => {
    const vid = videoRef.current;
    if (vid) { try { vid.pause(); } catch (e) { /* noop */ } }
    setClosing(true);
    document.body.style.overflow = '';
    setTimeout(() => setVisible(false), 550);
  };

  if (!visible) return null;

  return (
    <div className={`vsplash ${ended ? 'ended' : ''} ${closing ? 'closing' : ''}`}>
      <div className="vsplash-stage">
        <video ref={videoRef} muted autoPlay playsInline preload="auto" />
        <div className="vsplash-form">
          <div className="form-card">
            <div className="f-eyebrow">Almost there</div>
            <h2>Get the key to unlock your <em>dream home</em></h2>
            <p className="fsub">Give your details — our team will call you back within 1 business day.</p>
            <EnquireForm interestOptions={['Site Visit', '3 BHK Villa', '4 BHK Villa', 'Brochure / Price List']} onSuccess={skip} />
          </div>
        </div>
      </div>
    </div>
  );
}
