import { useEffect, useRef, useState } from 'react';

const DISMISS_KEY = 'athInstallDismissedAt';
const IOS_DISMISS_KEY = 'athIosA2hsDismissedAt';
const COOLDOWN_DAYS = 14;

function recentlyDismissed(key) {
  const t = localStorage.getItem(key);
  if (!t) return false;
  return Date.now() - parseInt(t, 10) < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

function alreadyInstalled() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function InstallPrompt() {
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      if (alreadyInstalled() || recentlyDismissed(DISMISS_KEY)) return;
      setTimeout(() => setShowAndroid(true), 2500);
    };
    const onInstalled = () => {
      deferredPrompt.current = null;
      setShowAndroid(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    if (isIOS() && !alreadyInstalled() && !recentlyDismissed(IOS_DISMISS_KEY)) {
      const t = setTimeout(() => setShowIos(true), 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = () => {
    setShowAndroid(false);
    const dp = deferredPrompt.current;
    if (!dp) return;
    dp.prompt();
    dp.userChoice.finally(() => { deferredPrompt.current = null; });
  };

  const dismissAndroid = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowAndroid(false);
  };

  const dismissIos = () => {
    localStorage.setItem(IOS_DISMISS_KEY, String(Date.now()));
    setShowIos(false);
  };

  return (
    <>
      {showAndroid && (
        <div className="ath-install-popup open" role="dialog" aria-label="Install the Asset Tree Homes app">
          <img src="/assets/ath-logo.png" alt="" />
          <div className="aip-copy"><b>Install Asset Tree Homes</b><span>Add the app to your home screen for quick access.</span></div>
          <div className="aip-actions">
            <button type="button" className="aip-install" onClick={install}>Install</button>
            <button type="button" className="aip-dismiss" onClick={dismissAndroid}>Not now</button>
          </div>
        </div>
      )}
      {showIos && (
        <div className="ath-install-popup ath-ios-a2hs open" role="dialog" aria-label="Add Asset Tree Homes to your home screen">
          <img src="/assets/ath-logo.png" alt="" />
          <div className="aip-copy">
            <b>Add to Home Screen</b>
            <span>
              Tap <svg className="aip-share" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg> Share, then "Add to Home Screen".
            </span>
          </div>
          <div className="aip-actions">
            <button type="button" className="aip-dismiss" onClick={dismissIos}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
