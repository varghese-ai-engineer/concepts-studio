'use client';

// The ONLY place in the codebase that touches gtag/dataLayer.
// Loads GA4 (gtag.js) with Consent Mode v2 defaults set to 'denied'; the
// client flips consent to 'granted' via setConsent() when allowed.

type GtagFn = (...args: unknown[]) => void;

interface Ga4Runtime {
  loaded: boolean;
  measurementId: string;
}

const runtime: Ga4Runtime = { loaded: false, measurementId: '' };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export function isGa4Loaded() {
  return runtime.loaded;
}

export function loadGa4(measurementId: string, customParameters: { name: string; value: string }[] = [], debugMode = false) {
  if (runtime.loaded || typeof window === 'undefined' || !measurementId) return;
  const w = window as NonNullable<Window>;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtagStub(this: void, ...args: unknown[]) {
    w.dataLayer!.push(args);
  };
  // Consent Mode v2 — denied until explicitly granted by the client.
  w.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  w.gtag('js', new Date());

  const configParams: Record<string, unknown> = {};
  for (const p of customParameters) configParams[p.name] = p.value;
  if (debugMode) configParams.debug_mode = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  runtime.loaded = true;
  runtime.measurementId = measurementId;
  w.gtag('config', measurementId, {
    send_page_view: false, // page views are sent explicitly by the client
    ...configParams,
  });
}

export function setGa4Consent(granted: boolean) {
  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

export function ga4TrackPageView(path: string, title?: string) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
    page_location: typeof window !== 'undefined' ? window.location.origin + path : undefined,
  });
}

export function ga4TrackEvent(name: string, params: Record<string, unknown> = {}) {
  gtag('event', name, params);
}
