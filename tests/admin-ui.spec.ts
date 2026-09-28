// Playwright tests for the Google SSO admin flow + analytics admin UI.
// The real Google round-trip can't be automated; the session cookie is
// crafted with the test SESSION_SECRET to exercise the authenticated paths
// (server-side verification is identical for crafted vs OAuth-issued cookies).
//
// Run: npx playwright test tests/admin-ui.spec.ts

import { test, expect } from '@playwright/test';

const SESSION_SECRET = 'test-session-secret';
const ADMIN_EMAIL = 'admin-e2e@example.com';

function makeSessionCookie(email: string): { name: string; value: string } {
  // Mirrors api/auth.js createSessionToken (HMAC-SHA256, base64url).
  const crypto = require('node:crypto');
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 3600_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return { name: 'admin_session', value: `${payload}.${sig}` };
}

test.describe('Admin SSO + analytics UI', () => {
  test('/admin unauthenticated shows Google login, no config fields', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in with Google' })).toHaveAttribute(
      'href', '/api/admin/auth/google',
    );
    // No analytics controls leak before authentication
    await expect(page.getByLabel('Measurement ID')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Save configuration' })).toHaveCount(0);
  });

  test('/api/admin/* without session → 401; public config stays public', async ({ page }) => {
    const put = await page.request.put('/api/admin/analytics-config', { data: {} });
    expect(put.status()).toBe(401);
    const diag = await page.request.post('/api/admin/analytics-diagnose');
    expect(diag.status()).toBe(401);
    const sess = await page.request.get('/api/admin/auth/session');
    expect(sess.status()).toBe(401);
    const pub = await page.request.get('/api/analytics-config');
    expect(pub.status()).toBe(200);
  });

  test('tampered/invalid session cookie is rejected', async ({ request }) => {
    const res = await request.get('/api/admin/auth/session', {
      headers: { cookie: `admin_session=${'x'.repeat(40)}.forgedsignature` },
    });
    expect(res.status()).toBe(401);
  });

  test('/admin?denied=1 shows Access Denied', async ({ page }) => {
    await page.goto('/admin?denied=1');
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
    await expect(page.getByLabel('Measurement ID')).toHaveCount(0);
  });

  test('authenticated session: full admin flow works, logout returns to login', async ({ page }) => {
    await page.context().addCookies([
      { ...makeSessionCookie(ADMIN_EMAIL), url: 'http://localhost:3000' },
    ]);
    await page.goto('/admin');
    await expect(page.getByText(`Signed in as ${ADMIN_EMAIL}`)).toBeVisible();

    // Save with an invalid ID → error; fix → saved.
    await page.getByLabel('Measurement ID').fill('BAD');
    await page.getByRole('button', { name: 'Save configuration' }).click();
    await expect(page.locator('.admin-error')).toBeVisible();
    await page.getByLabel('Measurement ID').fill('G-E2ETEST123');
    await page.getByRole('button', { name: 'Save configuration' }).click();
    await expect(page.locator('.admin-ok')).toContainText('Configuration saved');

    const cfg = await (await page.request.get('/api/analytics-config')).json();
    expect(cfg.measurementId).toBe('G-E2ETEST123');

    // Diagnostics render real results
    await page.getByRole('button', { name: 'Run diagnostics' }).click();
    await expect(page.locator('.diag-list li').first()).toBeVisible();

    // Logout invalidates the session server-side
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    const sess = await page.request.get('/api/admin/auth/session');
    expect(sess.status()).toBe(401);
  });

  test('OAuth start sets state cookie and redirects to Google; callback rejects bad state', async ({ request }) => {
    // Protocol-level checks go straight to the API (the Next dev rewrite
    // proxy interferes with raw 302 inspection).
    const API = 'http://localhost:3010';
    const res = await request.get(`${API}/api/admin/auth/google`, { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('accounts.google.com');
    const setCookie = res.headers()['set-cookie'] || '';
    expect(setCookie).toContain('admin_oauth_state=');
    expect(setCookie).toContain('HttpOnly');

    const cb = await request.get(`${API}/api/admin/auth/google/callback?code=x&state=wrong`, { maxRedirects: 0 });
    expect(cb.status()).toBe(302);
    expect(cb.headers()['location']).toContain('/admin?denied=1');
  });
});
