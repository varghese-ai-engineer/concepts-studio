# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prod-analytics.spec.ts >> accept consent: GA4 loads and page_view is sent; SPA navigation sends another
- Location: tests/prod-analytics.spec.ts:20:5

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [aria-hidden]:
      - generic: AI SOLUTION CRAFT
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - link "AI Solution Craft — home" [ref=e6] [cursor=pointer]:
          - /url: /concepts
          - generic [ref=e8]: AI Solution Craft
        - generic [ref=e9]:
          - link "AI Assistant" [ref=e10] [cursor=pointer]:
            - /url: /ai-assistant
          - link "Features" [ref=e11] [cursor=pointer]:
            - /url: /features
          - link "Use Cases" [ref=e12] [cursor=pointer]:
            - /url: /use-cases
          - link "About" [ref=e13] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e14] [cursor=pointer]:
            - /url: /contact
    - main [ref=e15]:
      - region "Introduction" [ref=e16]:
        - generic [ref=e17]:
          - paragraph [ref=e18]: AI that understands your website
          - heading "Your website, finally understood." [level=1] [ref=e22]:
            - generic [ref=e23]: Your website,
            - generic [ref=e24]: finally
            - generic [ref=e25]: understood.
          - paragraph [ref=e28]: An AI assistant that reads every page of your site, answers your customers in any language, and turns conversations into revenue.
          - generic [ref=e29]:
            - link [ref=e30] [cursor=pointer]:
              - /url: https://test.app.webchat.aisolutioncraft.com/
              - button "Start free" [ref=e31]
            - link [ref=e32] [cursor=pointer]:
              - /url: https://test.app.webchat.aisolutioncraft.com/
              - button "See pricing" [ref=e33]
        - generic [ref=e35]:
          - generic [ref=e36]: SCENE 01
          - generic [ref=e39]: 0%
      - region [ref=e40]:
        - blockquote [ref=e43]:
          - generic [aria-hidden] [ref=e44]: “
          - paragraph [ref=e45]: Every day, visitors arrive with questions. Your site can’t talk back. They leave. The sale leaves with them.
          - generic [ref=e46]: The silent checkout problem
      - region [ref=e47]:
        - generic [ref=e49]:
          - paragraph [ref=e50]: Knowledge engine
          - heading "It reads your site the way a new hire would." [level=2] [ref=e55]
          - paragraph [ref=e56]: Crawl, chunk, embed, retrieve. A pipeline that turns your content into answers — drawn here as it happens.
          - list [ref=e59]:
            - listitem [ref=e60]:
              - generic [ref=e65]:
                - generic [ref=e66]: "01"
                - text: Crawl
            - listitem [ref=e67]:
              - generic [ref=e73]:
                - generic [ref=e74]: "02"
                - text: Chunk
            - listitem [ref=e75]:
              - generic [ref=e80]:
                - generic [ref=e81]: "03"
                - text: Embed
            - listitem [ref=e82]:
              - generic [ref=e86]:
                - generic [ref=e87]: "04"
                - text: Retrieve
            - listitem [ref=e88]:
              - generic [ref=e92]:
                - generic [ref=e93]: "05"
                - text: Answer
      - region [ref=e94]:
        - generic [ref=e96]:
          - paragraph [ref=e97]: Voice & language
          - heading "Speaks your customer’s language. Out loud." [level=2] [ref=e101]
          - generic [ref=e102]:
            - paragraph [ref=e133]: Real-time voice powered by LiveKit. Tap, talk, get an answer.
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e136]: नमस्ते
                - generic [ref=e137]: Hindi
              - paragraph [ref=e138]: One assistant, twelve languages — detected automatically.
      - region [ref=e139]:
        - generic [ref=e141]:
          - paragraph [ref=e142]: Automation & results
          - heading "From conversation to closed deal." [level=2] [ref=e145]
          - generic [ref=e146]:
            - generic [ref=e147]:
              - heading "Lead capture" [level=3] [ref=e154]
              - paragraph [ref=e155]: Every conversation becomes a qualified lead, routed to the right inbox automatically.
            - generic [ref=e156]:
              - heading "Human handoff" [level=3] [ref=e160]
              - paragraph [ref=e161]: When it matters, the assistant hands off to a human with full context — no repeated questions.
            - generic [ref=e162]:
              - heading "Analytics" [level=3] [ref=e166]
              - paragraph [ref=e167]: See what people ask, what is missing, and where you lose them — in real time.
      - region [ref=e168]:
        - generic [ref=e170]:
          - paragraph [ref=e171]: Pricing
          - heading "Simple pricing that scales with you." [level=2] [ref=e175]
          - paragraph [ref=e176]: Start free. Upgrade when you are ready. Every plan includes the full knowledge engine, voice, and multilingual support.
          - generic [ref=e178]:
            - button "Bill Monthly" [ref=e179]
            - button "Bill Yearly (Save 20%)" [ref=e180]
          - list [ref=e181]:
            - listitem [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]: "01"
                - generic [ref=e185]: Free Trial
              - paragraph [ref=e186]: 14-day free trial with basic features.
              - generic [ref=e187]:
                - generic [ref=e188]: ₹
                - generic [ref=e189]: "0"
                - generic [ref=e190]: / mo
              - list [ref=e191]:
                - listitem [ref=e192]:
                  - generic [ref=e195]: 1 Website Chatbot
                - listitem [ref=e196]:
                  - generic [ref=e199]: Up to 10URL Crawl pages
                - listitem [ref=e200]:
                  - generic [ref=e203]: 100 Conversations / mo
                - listitem [ref=e204]:
                  - generic [ref=e207]: Basic AI chat support
              - button "Start free" [ref=e208] [cursor=pointer]
            - listitem [ref=e209]:
              - generic [ref=e210]:
                - generic [ref=e211]: "02"
                - generic [ref=e212]: Starter
                - generic [ref=e213]: Most chosen
              - paragraph [ref=e214]: Starter tier for growing blogs and websites.
              - generic [ref=e215]:
                - generic [ref=e216]: ₹
                - generic [ref=e217]: 1,499
                - generic [ref=e218]: / mo
              - list [ref=e219]:
                - listitem [ref=e220]:
                  - generic [ref=e223]: 1 Website Chatbot
                - listitem [ref=e224]:
                  - generic [ref=e227]: Up to 100URL Crawl pages
                - listitem [ref=e228]:
                  - generic [ref=e231]: 250 Conversations / mo
                - listitem [ref=e232]:
                  - generic [ref=e235]: Manual Knowledge upload
                - listitem [ref=e236]:
                  - generic [ref=e239]: Dashboard analytics
              - button "Choose starter" [ref=e240] [cursor=pointer]
            - listitem [ref=e241]:
              - generic [ref=e242]:
                - generic [ref=e243]: "03"
                - generic [ref=e244]: Business
              - paragraph [ref=e245]: For growing businesses needing scale.
              - generic [ref=e246]:
                - generic [ref=e247]: ₹
                - generic [ref=e248]: 3,999
                - generic [ref=e249]: / mo
              - list [ref=e250]:
                - listitem [ref=e251]:
                  - generic [ref=e254]: 25 Website Chatbots
                - listitem [ref=e255]:
                  - generic [ref=e258]: Up to 1,000URL Crawl pages
                - listitem [ref=e259]:
                  - generic [ref=e262]: 2,000 Conversations / mo
                - listitem [ref=e263]:
                  - generic [ref=e266]: Advanced analytics
                - listitem [ref=e267]:
                  - generic [ref=e270]: Custom templates
              - button "Choose business" [ref=e271] [cursor=pointer]
          - generic [ref=e272]:
            - generic [ref=e273]: Prices in INR. Adjusts to your region.
            - link "See all plans" [ref=e274] [cursor=pointer]:
              - /url: https://test.app.webchat.aisolutioncraft.com/
      - region [ref=e277]:
        - generic [ref=e279]:
          - heading "Give your website a voice." [level=2] [ref=e280]
          - paragraph [ref=e281]: Set up in minutes. No credit card to start.
          - link [ref=e283] [cursor=pointer]:
            - /url: https://test.app.webchat.aisolutioncraft.com/
            - button "Start free" [ref=e284]
    - contentinfo [ref=e285]:
      - generic [ref=e286]:
        - generic [ref=e287]: © 2026 AI Solution Craft. All rights reserved.
        - generic [ref=e288]:
          - link "AI Assistant" [ref=e289] [cursor=pointer]:
            - /url: /ai-assistant
          - link "Features" [ref=e290] [cursor=pointer]:
            - /url: /features
          - link "Use Cases" [ref=e291] [cursor=pointer]:
            - /url: /use-cases
          - link "About" [ref=e292] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e293] [cursor=pointer]:
            - /url: /contact
  - alert [ref=e294]
```

# Test source

```ts
  1  | // Production browser verification against https://webchat.aisolutioncraft.com/
  2  | // Requires GA temporarily enabled with a synthetic measurement ID.
  3  | // Run: npx playwright test tests/prod-analytics.spec.ts --config playwright.prod.config.ts
  4  | 
  5  | import { test, expect } from '@playwright/test';
  6  | 
  7  | const CONSENT_KEY = 'ga-consent';
  8  | 
  9  | test('without consent: GA script never loads, banner shows', async ({ page }) => {
  10 |   const gaRequests: string[] = [];
  11 |   page.on('request', (r) => {
  12 |     if (r.url().includes('googletagmanager') || r.url().includes('/g/collect')) gaRequests.push(r.url());
  13 |   });
  14 |   await page.goto('/');
  15 |   await expect(page.locator('.consent-banner')).toBeVisible();
  16 |   await page.waitForTimeout(2500);
  17 |   expect(gaRequests).toEqual([]);
  18 | });
  19 | 
  20 | test('accept consent: GA4 loads and page_view is sent; SPA navigation sends another', async ({ page }) => {
  21 |   const pageViews: string[] = [];
  22 |   page.on('request', (r) => {
  23 |     const url = r.url();
  24 |     if (url.includes('/g/collect') && url.includes('en=page_view')) {
  25 |       pageViews.push(decodeURIComponent(url.match(/dl=([^&]*)/)?.[1] || ''));
  26 |     }
  27 |   });
  28 |   await page.goto('/');
  29 |   await page.locator('.consent-banner').getByRole('button', { name: 'Accept' }).click();
  30 |   await expect(page.locator('.consent-banner')).toBeHidden();
  31 |   await page.waitForTimeout(3000);
> 32 |   expect(pageViews.length).toBeGreaterThanOrEqual(1);
     |                            ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  33 | 
  34 |   // SPA navigation via client-side link
  35 |   await page.getByRole('link', { name: 'Features' }).first().click();
  36 |   await page.waitForURL('**/features');
  37 |   await page.waitForTimeout(2000);
  38 |   expect(pageViews.some((dl) => dl.endsWith('/features'))).toBe(true);
  39 | });
  40 | 
  41 | test('reject consent: GA does not initialize, no page_view', async ({ page }) => {
  42 |   const gaRequests: string[] = [];
  43 |   page.on('request', (r) => {
  44 |     if (r.url().includes('googletagmanager') || r.url().includes('/g/collect')) gaRequests.push(r.url());
  45 |   });
  46 |   await page.goto('/');
  47 |   await page.locator('.consent-banner').getByRole('button', { name: 'Decline' }).click();
  48 |   await page.waitForTimeout(2500);
  49 |   expect(gaRequests).toEqual([]);
  50 | });
  51 | 
  52 | test('excluded paths /admin and /admin/* are never tracked even with consent granted', async ({ page }) => {
  53 |   const pageViews: string[] = [];
  54 |   page.on('request', (r) => {
  55 |     const url = r.url();
  56 |     if (url.includes('/g/collect') && url.includes('en=page_view')) pageViews.push(url);
  57 |   });
  58 |   await page.addInitScript((k) => localStorage.setItem(k, 'granted'), CONSENT_KEY);
  59 |   await page.goto('/admin');
  60 |   await page.waitForTimeout(2500);
  61 |   expect(pageViews).toEqual([]);
  62 | });
  63 | 
```