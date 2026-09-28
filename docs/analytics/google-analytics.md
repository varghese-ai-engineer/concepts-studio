# Google Analytics 4 — webchat.aisolutioncraft.com

Production GA4 integration with a Drupal-inspired admin experience, built on
the site's existing architecture: static Next.js export + the single Node API
container (`api/server.js`) + JSON persistence in `/data`. No database, no
tenant model, no new backend.

## Architecture

```
Static site (nginx)
  └─ lib/analytics/client.ts        ← the ONLY app-facing API
       ├─ lib/analytics/ga4-provider.ts   (only place gtag/dataLayer exists)
       └─ fetch GET /api/analytics-config
Node API container
  ├─ GET  /api/analytics-config            (public, sanitized runtime config)
  ├─ PUT  /api/admin/analytics-config      (Bearer ANALYTICS_ADMIN_TOKEN)
  ├─ POST /api/admin/analytics-diagnose    (Bearer)
  └─ /data/analytics-config.json           (persisted configuration)
Admin UI: /admin (static page; itself excluded from tracking)
```

Application code never calls `gtag()` directly — only
`analytics.trackPageView()` / `analytics.trackEvent()` / `analytics.setConsent()`
from `lib/analytics/client.ts`. The GA4 provider is the single Google-specific
module, so another provider could be added later without touching app code.

## Configuration storage & API

Config is persisted to `/data/analytics-config.json` on the API container's
volume (same pattern as `submissions.json`).

| Field | Default | Notes |
|---|---|---|
| `enabled` | `false` | Tracking master switch |
| `measurementId` | `""` | Must match `^(G\|AW\|DC)-[A-Z0-9_-]{4,}$` to enable |
| `environment` | `production` | `development` / `test` / `production` |
| `debugMode` | `false` | Adds `debug_mode` to the GA4 config; use GA4 DebugView |
| `trackPageViews` | `true` | Includes SPA route changes |
| `excludedPaths` | `/admin`, `/admin/*`, `/login`, `/health` | `*` wildcards |
| `requireConsent` | `true` | GA4 Consent Mode v2; gtag loads only after "Accept" |
| `respectDnt` | `true` | Browser Do Not Track disables tracking |
| `customParameters` | `[]` | `name=value` pairs merged into `gtag('config')` |

Server-side validation rejects (HTTP 400): invalid measurement IDs, unknown
environments, paths not starting with `/`, parameter names outside
`[a-zA-Z_][a-zA-Z0-9_]{0,39}`, and any field containing `<script`,
`javascript:`, `onerror=`/`onload=`, or HTML tags. **No arbitrary JavaScript
can be injected from the admin UI.**

## Admin UI (`/admin`)

Sections: **General** (enable, measurement ID, environment, debug),
**Tracking** (page views, excluded paths), **Privacy & Consent** (require
consent, respect DNT), **Custom parameters**, **Save**, **Diagnostics**
(status of the current page + "Run diagnostics" + "Send test event").

### Admin authentication (Google SSO)

`/admin` is the admin entry point. Unauthenticated visitors see only an
"Admin Login" screen with a **Sign in with Google** button — no configuration
fields render. The OAuth 2.0 code flow runs entirely server-side:

1. `GET /api/admin/auth/google` — sets a 10-minute HttpOnly `state` cookie and
   redirects to Google (CSRF protection).
2. Google redirects to `GET /api/admin/auth/google/callback` — the server
   verifies the state, exchanges the code (client secret never leaves the
   server), requires a verified email, and checks it against the
   `ADMIN_EMAILS` allowlist.
3. Authorized → signed `admin_session` HttpOnly cookie (24 h, HMAC-SHA256 with
   `SESSION_SECRET`) → existing Analytics Admin page (shows the signed-in
   email + Logout). Unauthorized or any failure → `/admin?denied=1` → Access
   Denied, no session issued.

All `/api/admin/*` endpoints require the session cookie (or, as a
machine/script fallback, `Authorization: Bearer $ANALYTICS_ADMIN_TOKEN` —
not needed for normal admin usage in a browser). `GET /api/analytics-config`
remains public (sanitized runtime config only).

Environment variables (container only, never in Git or the browser):
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` (comma-separated),
`SESSION_SECRET`, `PUBLIC_BASE_URL` (defaults to the production URL).

Google Cloud Console one-time setup: create an OAuth 2.0 Client ID (Web
application) with authorized redirect URI
`https://webchat.aisolutioncraft.com/api/admin/auth/google/callback`.

Diagnostics are honest: they verify configuration existence, measurement ID
format, enablement, and snippet generatability. They never claim Google
received a hit — for real verification enable debug mode and watch GA4
DebugView.

## Tracking behavior

GA4 initializes only when ALL gates pass:

1. `enabled` and valid measurement ID
2. Environment matches deployment host (`production` config tracks only
   `webchat.aisolutioncraft.com`; `development`/`test` configs track only
   non-production hosts) — prevents dev/test traffic reaching the prod property
3. Browser Do Not Track is not set (when `respectDnt`)
4. Consent granted (when `requireConsent`) — gtag.js is **not even loaded**
   before consent; the consent banner appears only when needed
5. Current path is not excluded (wildcards: `/admin/*` matches `/admin` and all
   descendants; `/admin-tools` is NOT matched)

Page views: initial load + every app-router (SPA) navigation via
`usePathname`. Events (non-PII parameters only, allowlisted):
`page_view`, `form_submit` (contact form: name + topic),
`outbound_link_click` (hostname only), `button_click` (explicit
`data-analytics-name` buttons).

## Security

- Measurement IDs are public by design; no secrets reach the frontend. The
  only secret is `ANALYTICS_ADMIN_TOKEN` on the container.
- Event parameters pass a client allowlist and length caps; the server
  sanitizes all config. No emails, tokens, names, or conversation content are
  ever sent to Google. GA4 User-ID is intentionally not used (Google PII
  policy).
- Admin endpoints: constant-time token compare is not implemented (token is a
  high-entropy value; nginx rate limiting applies as with the contact API).

## Testing

```bash
node --test tests/analytics.test.js   # 11 unit tests: validation, sanitization, persistence, diagnostics, matcher
npx playwright test tests/admin-ui.spec.ts  # 6 e2e tests: 401s, injection rejection, save flow, diagnostics UI
```

Playwright spins up its own API instance (temp `DATA_DIR`, test token) and
`next dev`; it never touches production data.

## Deployment checklist

1. `git push` → on VPS: `cd ~/concepts-studio && git pull && npm run build`
2. Rebuild API image: `docker build -t webchat-contact api/`
3. Recreate container with the new env (one-time):
   ```bash
   docker rm -f webchat-contact
   docker run -d --name webchat-contact --restart unless-stopped \
     --network aiassistant_default \
     -v /home/aiadmin/webchat-contact-data:/data \
     -e SMTP_HOST=... -e SMTP_PORT=465 -e SMTP_USER=... -e SMTP_PASS=... -e CONTACT_TO=... \
     -e ANALYTICS_ADMIN_TOKEN='<generate a long random token>' \
     webchat-contact
   ```
4. Publish static site: `sudo rsync -a --delete out/ /var/www/webchat.aisolutioncraft.com/`
5. In GA4: create a Web data stream, copy its `G-…` ID, open
   `https://webchat.aisolutioncraft.com/admin`, unlock with the token, enable
   GA and paste the ID, Save. Verify with Run diagnostics + GA4 DebugView.

## Drupal reference — what was reproduced

From the Drupal Google Analytics module (functionality, not architecture):
enable toggle; measurement ID validation (G-/AW-/DC-, multiple-format support);
page-path exclusions with `*` wildcards and Drupal's default admin exclusions;
debug mode (`analytics_debug`-equivalent via `debug_mode` + DebugView);
custom config parameters merged into the tracking config call; consent-gated
initialization; admin-page exclusion.

## Drupal functionality intentionally NOT reproduced

| Feature | Why omitted |
|---|---|
| IP anonymization option | GA4 never stores visitor IPs (UA-only concept) |
| Site-search & AdSense toggles | UA-only; GA4 handles site search natively |
| User-ID tracking | GA4 standard properties forbid PII user IDs |
| Role-based exclusion | Site has no user system; `/admin/*` path exclusion covers the admin surface. No user accounts exist to exclude. |
| Per-user opt-in/out checkbox | No user profiles exist; consent banner covers visitors |
| Local caching of gtag.js | Incompatible with Consent Mode; anti-pattern |
| "before/after" arbitrary JS snippets | Deliberately rejected — arbitrary JS from an admin form is an XSS/injection vector. Only allowlisted name=value config params are accepted. |
| UA (`UA-`) property support | Universal Analytics is shut down |
| Multi-domain/cross-domain config | Single-domain site today; can be added as allowlisted config params if ever needed |
| Outbound/download/mailto/tel link toggles | GA4 Enhanced Measurement covers these natively in the GA4 property settings |

## Known limitations

- One measurement ID per config (Drupal supports multiple simultaneous
  properties). The validator accepts the common GA4 formats; the UI stores one.
- The admin token is a shared secret (no per-admin accounts) — consistent with
  the site having no authentication system.
- Diagnostics cannot confirm Google-side receipt; use GA4 DebugView.
- Consent choice is stored per browser (localStorage `ga-consent`); visitors
  can clear it via browser settings; no CMP integration.
