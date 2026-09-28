'use client';

import { useEffect, useState } from 'react';
import { init, getConsent, setConsent, getConfig } from '@/lib/analytics/client';

// Minimal consent banner in the site theme. Rendered only when the analytics
// config requires consent and the visitor hasn't chosen yet. GA4 stays
// uninitialized (consent-denied) until "Accept" — or never, on "Decline".
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    init().then(() => {
      if (cancelled) return;
      const cfg = getConfig();
      if (cfg && cfg.enabled && cfg.requireConsent && getConsent() === null) {
        setVisible(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  function choose(granted: boolean) {
    setConsent(granted);
    setVisible(false);
  }

  return (
    <div className="consent-banner" role="dialog" aria-label="Analytics consent">
      <p>
        We use Google Analytics to understand how the site is used. No personal
        data is collected. Accept analytics cookies?
      </p>
      <div className="consent-banner-actions">
        <button type="button" className="btn-primary" onClick={() => choose(true)}>
          Accept
        </button>
        <button type="button" className="btn-secondary" onClick={() => choose(false)}>
          Decline
        </button>
      </div>
    </div>
  );
}
