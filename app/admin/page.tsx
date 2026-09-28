'use client';

import { useEffect, useState } from 'react';
import { SitePage } from '@/components/site/SitePage';
import { trackingStatus } from '@/lib/analytics/client';

interface Config {
  enabled: boolean;
  measurementId: string;
  environment: string;
  debugMode: boolean;
  trackPageViews: boolean;
  excludedPaths: string[];
  requireConsent: boolean;
  respectDnt: boolean;
  customParameters: { name: string; value: string }[];
  updatedAt?: string | null;
}

interface DiagCheck { name: string; pass: boolean; detail: string }

const MEASUREMENT_ID_RE = /^(G|AW|DC)-[A-Z0-9_-]{4,}$/;
type AuthState = 'checking' | 'login' | 'denied' | 'authed';

export default function AdminAnalyticsPage() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [email, setEmail] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [pathsText, setPathsText] = useState('');
  const [paramsText, setParamsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [diag, setDiag] = useState<DiagCheck[] | null>(null);
  const [diagNote, setDiagNote] = useState('');
  const [localStatus, setLocalStatus] = useState<ReturnType<typeof trackingStatus> | null>(null);

  useEffect(() => {
    // Denial is signalled by the OAuth callback via ?denied=1.
    const denied = new URLSearchParams(window.location.search).get('denied') === '1';
    if (denied) {
      setAuthState('denied');
      window.history.replaceState({}, '', '/admin');
    }
    fetch('/api/admin/auth/session')
      .then(async (r) => {
        if (!r.ok) {
          if (!denied) setAuthState('login');
          return null;
        }
        return r.json();
      })
      .then((sess) => {
        if (sess && sess.authenticated) {
          setEmail(sess.email);
          setAuthState('authed');
        }
      })
      .catch(() => { if (!denied) setAuthState('login'); });

    // Public config shapes defaults for the form once authenticated.
    fetch('/api/analytics-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (cfg) {
          setConfig(cfg);
          setPathsText((cfg.excludedPaths || []).join('\n'));
          setParamsText((cfg.customParameters || []).map((p: { name: string; value: string }) => `${p.name}=${p.value}`).join('\n'));
        }
      })
      .catch(() => {});
    setLocalStatus(trackingStatus(window.location.pathname));
  }, []);

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthState('login');
    setEmail('');
    setConfig(null);
  }

  function parseParams(text: string): { name: string; value: string }[] | null {
    const out: { name: string; value: string }[] = [];
    for (const line of text.split('\n')) {
      const l = line.trim();
      if (!l) continue;
      const idx = l.indexOf('=');
      if (idx <= 0) { setErrors(`Custom parameter line "${l}" must look like name=value`); return null; }
      out.push({ name: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() });
    }
    return out;
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true); setErrors(''); setOkMsg('');
    const excludedPaths = pathsText.split('\n').map((l) => l.trim()).filter(Boolean);
    const customParameters = parseParams(paramsText);
    if (customParameters === null) { setSaving(false); return; }
    if (config.enabled && !MEASUREMENT_ID_RE.test(config.measurementId)) {
      setErrors('A valid Measurement ID (G-XXXXXXXXXX) is required to enable tracking.');
      setSaving(false); return;
    }
    try {
      const res = await fetch('/api/admin/analytics-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...config, excludedPaths, customParameters }),
      });
      if (res.status === 401) { setAuthState('login'); setErrors('Session expired — please sign in again.'); setSaving(false); return; }
      const data = await res.json();
      if (!res.ok) {
        setErrors((data.errors || [data.error || 'Save failed']).join('\n'));
      } else {
        setConfig(data.config);
        setOkMsg('Configuration saved.');
      }
    } catch {
      setErrors('API unreachable');
    }
    setSaving(false);
  }

  async function runDiagnostics() {
    setErrors(''); setDiag(null);
    try {
      const res = await fetch('/api/admin/analytics-diagnose', { method: 'POST', credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) { setErrors(data.error || 'Diagnostics failed'); return; }
      setDiag(data.checks);
      setDiagNote(data.note || '');
    } catch {
      setErrors('API unreachable');
    }
  }

  function sendTestEvent() {
    import('@/lib/analytics/client').then((m) => {
      m.trackEvent('button_click', { button_name: 'admin_test_event' });
      setLocalStatus(trackingStatus(window.location.pathname));
      setOkMsg('Test event dispatched (if tracking is active on this page — see diagnostics). Note: /admin is excluded from tracking by default.');
    });
  }

  // ── Auth-gate states ─────────────────────────────────────────────────────
  if (authState === 'checking') {
    return (
      <SitePage>
        <div className="page-wrap"><p className="page-sub">Checking admin session…</p></div>
      </SitePage>
    );
  }

  if (authState === 'login' || authState === 'denied') {
    return (
      <SitePage>
        <div className="page-wrap" style={{ maxWidth: '460px' }}>
          {authState === 'denied' ? (
            <div className="admin-card" style={{ textAlign: 'center' }}>
              <h2>Access Denied</h2>
              <p style={{ color: 'var(--sp-ink-2)', lineHeight: 1.7, fontSize: '.92rem' }}>
                Your Google account is not authorized to administer this site.
                Sign in with an authorized admin account, or return to the{' '}
                <a href="/" style={{ color: 'var(--sp-ember)' }}>website</a>.
              </p>
              <a className="btn-primary" href="/api/admin/auth/google" style={{ display: 'inline-block', marginTop: '.5rem', textDecoration: 'none' }}>
                Try another account
              </a>
            </div>
          ) : (
            <div className="admin-card" style={{ textAlign: 'center' }}>
              <h2>Admin Login</h2>
              <p style={{ color: 'var(--sp-ink-2)', lineHeight: 1.7, fontSize: '.92rem' }}>
                Sign in with an authorized Google account to manage this website.
              </p>
              <a className="btn-primary" href="/api/admin/auth/google" style={{ display: 'inline-block', marginTop: '.5rem', textDecoration: 'none' }}>
                Sign in with Google
              </a>
            </div>
          )}
        </div>
      </SitePage>
    );
  }

  // ── Authenticated: existing Analytics Admin UI ───────────────────────────
  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Admin</p>
          <h1 className="page-title">Google Analytics</h1>
          <p className="page-sub">
            Signed in as <strong>{email}</strong> ·{' '}
            <button
              type="button"
              onClick={logout}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sp-ember)', cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}
            >
              Log out
            </button>
          </p>
        </div>

        {errors ? <div className="admin-error" role="alert">{errors}</div> : null}
        {okMsg ? <div className="admin-ok" role="status">{okMsg}</div> : null}

        {config ? (
          <div className="admin-grid">
            <section className="admin-card">
              <h2>General</h2>
              <div className="admin-check">
                <input id="ga-enabled" type="checkbox" checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
                <label htmlFor="ga-enabled">Enable Google Analytics</label>
              </div>
              <div className="admin-row">
                <label htmlFor="ga-id">Measurement ID</label>
                <input id="ga-id" type="text" value={config.measurementId} placeholder="G-XXXXXXXXXX"
                  onChange={(e) => setConfig({ ...config, measurementId: e.target.value.trim() })} />
                <span className="admin-hint">
                  From GA4: Admin → Data streams → Web → Measurement ID. Format G-, AW- or DC- prefixed.
                </span>
              </div>
              <div className="admin-row">
                <label htmlFor="ga-env">Environment</label>
                <select id="ga-env" value={config.environment}
                  onChange={(e) => setConfig({ ...config, environment: e.target.value })}>
                  <option value="production">Production</option>
                  <option value="test">Test / staging</option>
                  <option value="development">Development</option>
                </select>
                <span className="admin-hint">
                  Traffic only tracks when this environment matches the deployment host —
                  production traffic never reaches a dev/test property and vice versa.
                </span>
              </div>
              <div className="admin-check">
                <input id="ga-debug" type="checkbox" checked={config.debugMode}
                  onChange={(e) => setConfig({ ...config, debugMode: e.target.checked })} />
                <label htmlFor="ga-debug">Debug mode (send debug signals; use GA4 DebugView)</label>
              </div>
            </section>

            <section className="admin-card">
              <h2>Tracking</h2>
              <div className="admin-check">
                <input id="ga-pv" type="checkbox" checked={config.trackPageViews}
                  onChange={(e) => setConfig({ ...config, trackPageViews: e.target.checked })} />
                <label htmlFor="ga-pv">Track page views (including SPA route changes)</label>
              </div>
              <div className="admin-row">
                <label htmlFor="ga-paths">Excluded paths (one per line, * wildcard)</label>
                <textarea id="ga-paths" rows={5} value={pathsText} onChange={(e) => setPathsText(e.target.value)} />
                <span className="admin-hint">
                  Example: /admin, /admin/*, /login, /health. Pages matching these are never tracked.
                </span>
              </div>
            </section>

            <section className="admin-card">
              <h2>Privacy &amp; Consent</h2>
              <div className="admin-check">
                <input id="ga-consent" type="checkbox" checked={config.requireConsent}
                  onChange={(e) => setConfig({ ...config, requireConsent: e.target.checked })} />
                <label htmlFor="ga-consent">Require analytics consent before tracking (GA4 Consent Mode v2)</label>
              </div>
              <div className="admin-check">
                <input id="ga-dnt" type="checkbox" checked={config.respectDnt}
                  onChange={(e) => setConfig({ ...config, respectDnt: e.target.checked })} />
                <label htmlFor="ga-dnt">Respect the browser&apos;s Do Not Track setting</label>
              </div>
              <span className="admin-hint">
                GA4 does not store visitor IP addresses, so a separate IP-anonymization
                option (as in Drupal&apos;s UA-era module) is not needed or provided.
              </span>
            </section>

            <section className="admin-card">
              <h2>Custom GA4 configuration parameters</h2>
              <div className="admin-row">
                <label htmlFor="ga-params">One name=value per line (merged into the GA4 config call)</label>
                <textarea id="ga-params" rows={3} value={paramsText} onChange={(e) => setParamsText(e.target.value)}
                  placeholder={'campaign_source=newsletter'} />
                <span className="admin-hint">
                  Only simple name=value parameters are allowed. Script, HTML and
                  event-handler content is rejected by the server.
                </span>
              </div>
            </section>

            <section className="admin-card">
              <h2>Save</h2>
              <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save configuration'}
              </button>
              {config.updatedAt ? (
                <p className="admin-hint" style={{ marginTop: '.75rem' }}>
                  Last updated: {new Date(config.updatedAt).toLocaleString()}
                </p>
              ) : null}
            </section>

            <section className="admin-card">
              <h2>Diagnostics</h2>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn-primary" onClick={runDiagnostics}>
                  Run diagnostics
                </button>
                <button type="button" className="btn-secondary" onClick={sendTestEvent}>
                  Send test event
                </button>
              </div>
              {localStatus ? (
                <p className="admin-hint" style={{ marginTop: '.9rem' }}>
                  This page: tracking {localStatus.active ? 'active' : `inactive (${localStatus.reason})`} ·
                  consent: {localStatus.consent ?? 'unset'} · host: {localStatus.environmentHost} · path: {localStatus.path}
                </p>
              ) : null}
              {diag ? (
                <>
                  <ul className="diag-list" style={{ marginTop: '1rem' }}>
                    {diag.map((c) => (
                      <li key={c.name}>
                        <span className={c.pass ? 'diag-pass' : 'diag-fail'}>{c.pass ? 'PASS' : 'FAIL'}</span>
                        <span><strong>{c.name}</strong> — {c.detail}</span>
                      </li>
                    ))}
                  </ul>
                  {diagNote ? <p className="admin-hint" style={{ marginTop: '.75rem' }}>{diagNote}</p> : null}
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </SitePage>
  );
}
