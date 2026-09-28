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

test('accept consent: GA4 loads and page_view is sent; SPA navigation sends another', async ({ page }) => {
  const pageViews: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (url.includes('/g/collect') && url.includes('en=page_view')) {
      pageViews.push(decodeURIComponent(url.match(/dl=([^&]*)/)?.[1] || ''));
    }
  });
  await page.goto('/');
  await page.locator('.consent-banner').getByRole('button', { name: 'Accept' }).click();
  await expect(page.locator('.consent-banner')).toBeHidden();
  await page.waitForTimeout(3000);
  expect(pageViews.length).toBeGreaterThanOrEqual(1);

  // SPA navigation via client-side link
  await page.getByRole('link', { name: 'Features' }).first().click();
  await page.waitForURL('**/features');
  await page.waitForTimeout(2000);
  expect(pageViews.some((dl) => dl.endsWith('/features'))).toBe(true);
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
  const pageViews: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (url.includes('/g/collect') && url.includes('en=page_view')) pageViews.push(url);
  });
  await page.addInitScript((k) => localStorage.setItem(k, 'granted'), CONSENT_KEY);
  await page.goto('/admin');
  await page.waitForTimeout(2500);
  expect(pageViews).toEqual([]);
});
