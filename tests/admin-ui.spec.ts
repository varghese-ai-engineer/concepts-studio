// Playwright tests for the Google Analytics admin configuration UI.
// Prerequisites (started by the test):
//   - the Node API on :3010 with DATA_DIR=temp and ANALYTICS_ADMIN_TOKEN=test-token
//   - `next dev` on :3000 with /api rewritten to :3010 (see playwright.config webServer)
//
// Run: npx playwright test tests/admin-ui.spec.ts

import { test, expect } from '@playwright/test';

const TOKEN = 'test-token';

test.describe('Analytics admin UI', () => {
  test('admin page loads and public config endpoint answers', async ({ page }) => {
    const res = await page.request.get('/api/analytics-config');
    expect(res.status()).toBe(200);
    const cfg = await res.json();
    expect(cfg).toHaveProperty('enabled');
    expect(cfg).toHaveProperty('measurementId');

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Google Analytics' })).toBeVisible();
    await expect(page.getByLabel('Admin token')).toBeVisible();
  });

  test('admin endpoints reject missing/invalid token', async ({ page }) => {
    const no = await page.request.put('/api/admin/analytics-config', { data: {} });
    expect(no.status()).toBe(401);
    const bad = await page.request.put('/api/admin/analytics-config', {
      headers: { Authorization: 'Bearer wrong' },
      data: {},
    });
    expect(bad.status()).toBe(401);
    const diag = await page.request.post('/api/admin/analytics-diagnose');
    expect(diag.status()).toBe(401);
  });

  test('invalid measurement ID is rejected by the server', async ({ page }) => {
    const res = await page.request.put('/api/admin/analytics-config', {
      headers: { Authorization: `Bearer ${TOKEN}` },
      data: { enabled: true, measurementId: 'NOT-A-GA-ID' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.length).toBeGreaterThan(0);
  });

  test('script injection is rejected', async ({ page }) => {
    const res = await page.request.put('/api/admin/analytics-config', {
      headers: { Authorization: `Bearer ${TOKEN}` },
      data: { measurementId: 'G-ABC<script>alert(1)</script>' },
    });
    expect(res.status()).toBe(400);
  });

  test('valid config saves and is served publicly', async ({ page }) => {
    const save = await page.request.put('/api/admin/analytics-config', {
      headers: { Authorization: `Bearer ${TOKEN}` },
      data: { enabled: false, measurementId: 'G-PLAYWRIGHT1', environment: 'production' },
    });
    expect(save.status()).toBe(200);
    const cfg = await (await page.request.get('/api/analytics-config')).json();
    expect(cfg.measurementId).toBe('G-PLAYWRIGHT1');
    expect(cfg.enabled).toBe(false);
  });

  test('admin page unlock + save flow works end to end', async ({ page }) => {
    await page.goto('/admin');
    await page.getByLabel('Admin token').fill(TOKEN);
    await page.getByRole('button', { name: 'Unlock configuration' }).click();
    await expect(page.getByRole('button', { name: 'Save configuration' })).toBeEnabled();

    // Invalid ID is rejected (client-side pre-check or server 400).
    await page.getByLabel('Measurement ID').fill('BAD');
    await page.getByRole('button', { name: 'Save configuration' }).click();
    await expect(page.locator('.admin-error')).toBeVisible();

    // Fix the ID and save for real.
    await page.getByLabel('Measurement ID').fill('G-E2ETEST123');
    await page.getByRole('button', { name: 'Save configuration' }).click();
    await expect(page.locator('.admin-ok')).toContainText('Configuration saved');

    const cfg = await (await page.request.get('/api/analytics-config')).json();
    expect(cfg.measurementId).toBe('G-E2ETEST123');

    // Diagnostics render real results.
    await page.getByRole('button', { name: 'Run diagnostics' }).click();
    await expect(page.locator('.diag-list li').first()).toBeVisible();
  });
});
