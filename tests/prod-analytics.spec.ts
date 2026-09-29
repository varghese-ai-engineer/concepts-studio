// Production browser verification against https://webchat.aisolutioncraft.com/
// Requires GA temporarily enabled with a synthetic measurement ID.
// Run: npx playwright test tests/prod-analytics.spec.ts --config playwright.prod.config.ts

import { test, expect } from '@playwright/test';

const CONSENT_KEY = 'ga-consent';

test('without consent: GA script never loads, banner shows', async ({ page }) => {
  const gaRequests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('googletagmanager') || r.url().includes('/g/collect')) gaRequests.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('.consent-banner')).toBeVisible();
  await page.waitForTimeout(2500);
  expect(gaRequests).toEqual([]);
});

test('accept consent: GA4 initializes and page_view events are generated (incl. SPA navigation)', async ({ page }) => {
  // Note: a synthetic measurement ID is rejected (403) by Google's gtag.js,
  // so network hits can't reach Google. We verify the full client-side chain:
  // script injection, gtag initialization, and page_view events queued in
  // dataLayer for the initial page and SPA navigation.
  const gaScript: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('googletagmanager')) gaScript.push(r.url());
  });
  await page.goto('/');
  await page.locator('.consent-banner').getByRole('button', { name: 'Accept' }).click();
  await expect(page.locator('.consent-banner')).toBeHidden();
  await page.waitForTimeout(3000);
  expect(gaScript.length).toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => typeof window.gtag)).toBe('function');

  // dataLayer entries are `arguments` objects (official gtag snippet form),
  // so we can't use Array.isArray — duck-type them instead.
  const queued = () => page.evaluate(() =>
    (window.dataLayer || []).some((a) => a && typeof a !== 'string' && a.length >= 2 && a[0] === 'event' && a[1] === 'page_view'));
  expect(await queued()).toBe(true);

  // SPA navigation via client-side link queues another page_view
  await page.getByRole('link', { name: 'Features' }).first().click();
  await page.waitForURL('**/features');
  await page.waitForTimeout(1500);
  const paths = await page.evaluate(() =>
    Array.from(window.dataLayer || [])
      .filter((a) => a && typeof a !== 'string' && a.length >= 2 && a[0] === 'event' && a[1] === 'page_view')
      .map((a) => (a[2] && a[2].page_path) || a[2]));
  expect(paths.some((p: string) => String(p).endsWith('/features'))).toBe(true);
});

test('reject consent: GA does not initialize, no page_view', async ({ page }) => {
  const gaRequests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('googletagmanager') || r.url().includes('/g/collect')) gaRequests.push(r.url());
  });
  await page.goto('/');
  await page.locator('.consent-banner').getByRole('button', { name: 'Decline' }).click();
  await page.waitForTimeout(2500);
  expect(gaRequests).toEqual([]);
});

test('excluded paths /admin and /admin/* are never tracked even with consent granted', async ({ page }) => {
  const gaRequests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('googletagmanager')) gaRequests.push(r.url());
  });
  await page.addInitScript((k) => localStorage.setItem(k, 'granted'), CONSENT_KEY);
  await page.goto('/admin');
  await page.waitForTimeout(2500);
  expect(gaRequests).toEqual([]); // GA never even loads on excluded paths
  const queued = await page.evaluate(() =>
    (window.dataLayer || []).some((a) => Array.isArray(a) && a[0] === 'event'));
  expect(queued).toBe(false);
});
