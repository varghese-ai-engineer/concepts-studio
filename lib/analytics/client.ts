'use client';

// Provider-agnostic analytics client. Application code calls only
// analytics.init/trackPageView/trackEvent/setConsent — never gtag directly.
// All gating (enabled / environment / DNT / consent / excluded paths)
// happens here, so GA4 loads only when every rule allows it.

import { isPathExcluded } from './matcher';
import {
  loadGa4, setGa4Consent, ga4TrackPageView, ga4TrackEvent, isGa4Loaded,
} from './ga4-provider';

export interface AnalyticsConfig {
  enabled: boolean;
  measurementId: string;
  environment: 'development' | 'test' | 'production';
  debugMode: boolean;
  trackPageViews: boolean;
  excludedPaths: string[];
  requireConsent: boolean;
  respectDnt: boolean;
  customParameters: { name: string; value: string }[];
  updatedAt?: string | null;
}

const CONSENT_KEY = 'ga-consent';

let config: AnalyticsConfig | null = null;
let initPromise: Promise<void> | null = null;

export function getConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function setConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  if (granted && config?.enabled) {
    // Consent just granted — initialize GA4 now (it was withheld until here).
    loadGa4(config.measurementId, config.customParameters, config.debugMode);
    setGa4Consent(true);
  } else if (isGa4Loaded()) {
    setGa4Consent(false);
  }
}

function doNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1' || (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack === '1';
}

// Prevents dev/test traffic from reaching the production GA property:
// the deployment host must match the configured environment.
function environmentAllows(env: AnalyticsConfig['environment']): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isProdHost = host === 'webchat.aisolutioncraft.com' || host === 'www.webchat.aisolutioncraft.com';
  if (env === 'production') return isProdHost;
  return !isProdHost; // development/test configs track only off-production hosts
}

function gatesAllow(pathname: string): { allowed: boolean; reason: string } {
  if (!config || !config.enabled) return { allowed: false, reason: 'disabled' };
  if (!environmentAllows(config.environment)) return { allowed: false, reason: 'environment-mismatch' };
  if (config.respectDnt && doNotTrack()) return { allowed: false, reason: 'do-not-track' };
  if (config.requireConsent && getConsent() !== 'granted') return { allowed: false, reason: 'consent-pending' };
  if (isPathExcluded(pathname, config.excludedPaths)) return { allowed: false, reason: 'path-excluded' };
  return { allowed: true, reason: 'ok' };
}

// Diagnostics for the admin debug panel — reports why tracking is/isn't active
// on the current page, without claiming anything about Google's side.
export function trackingStatus(pathname: string) {
  const gate = gatesAllow(pathname);
  return {
    active: gate.allowed && isGa4Loaded(),
    reason: gate.reason,
    gaLoaded: isGa4Loaded(),
    consent: getConsent(),
    environmentHost: typeof window !== 'undefined' ? window.location.hostname : '',
    path: pathname,
  };
}

export async function init(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const res = await fetch('/api/analytics-config');
      if (!res.ok) return;
      config = (await res.json()) as AnalyticsConfig;
    } catch {
      config = null; // API unreachable ⇒ no analytics, site works normally
      return;
    }
    // GA4 initialization is withheld until consent when consent is required.
    const gate = gatesAllow(typeof window !== 'undefined' ? window.location.pathname : '/');
    if (gate.allowed) {
      loadGa4(config.measurementId, config.customParameters, config.debugMode);
      setGa4Consent(true);
    }
  })();
  return initPromise;
}

export function getConfig(): AnalyticsConfig | null {
  return config;
}

export function trackPageView(pathname: string, title?: string) {
  if (!config?.trackPageViews) return;
  if (!gatesAllow(pathname).allowed) return;
  if (!isGa4Loaded()) return; // e.g. consent arrived after init
  ga4TrackPageView(pathname, title);
}

// Non-PII allowlist for event parameters — anything else is dropped.
const PARAM_KEYS = new Set([
  'page_path', 'page_title', 'link_url', 'link_hostname', 'link_class',
  'form_name', 'form_topic', 'button_name', 'source', 'debug_mode',
]);

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!config?.enabled || !gatesAllow(typeof window !== 'undefined' ? window.location.pathname : '/').allowed) return;
  if (!isGa4Loaded()) return;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!PARAM_KEYS.has(k)) continue;
    clean[k] = typeof v === 'string' ? v.slice(0, 100) : typeof v === 'boolean' || typeof v === 'number' ? v : undefined;
  }
  ga4TrackEvent(name, clean);
}

// Global listeners for generic website events (button clicks, outbound links).
export function attachAutoEvents() {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const isOutbound = /^https?:\/\//i.test(href) && !href.includes(window.location.hostname);
      if (isOutbound) {
        let linkHostname = '';
        try { linkHostname = new URL(href, window.location.origin).hostname; } catch { /* ignore */ }
        trackEvent('outbound_link_click', { link_hostname: linkHostname });
      }
      return;
    }
    const button = target.closest('button');
    if (button && button.dataset.analyticsName) {
      trackEvent('button_click', { button_name: button.dataset.analyticsName });
    }
  }, { passive: true });
}
