// Contact form API for webchat.aisolutioncraft.com
// POST /api/contact  { name, email, company?, topic, message }
// Sends email via SMTP if configured; ALWAYS logs the submission to
// /data/submissions.json so nothing is lost even without SMTP.
const http = require('http');
const fs = require('fs');
const path = require('path');
const analyticsConfig = require('./analytics-config');
const auth = require('./auth');

const {
  SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS,
  CONTACT_TO = 'hello@aisolutioncraft.com', PORT: LISTEN = '3000',
  ANALYTICS_ADMIN_TOKEN,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  ADMIN_EMAILS, SESSION_SECRET,
  PUBLIC_BASE_URL = 'https://webchat.aisolutioncraft.com',
} = process.env;

const DATA_DIR = process.env.DATA_DIR || '/data';
const LOG = path.join(DATA_DIR, 'submissions.json');

function appendLog(entry) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const prev = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : [];
    prev.push(entry);
    fs.writeFileSync(LOG, JSON.stringify(prev, null, 2));
  } catch (e) {
    console.error('log write failed:', e.message);
  }
}

// Minimal SMTP client over TLS/STARTTLS using fetch? No — use nodemailer if
// available; otherwise mail is skipped. Install nodemailer in the Dockerfile.
let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } catch (e) {
    console.error('nodemailer not available, email disabled:', e.message);
  }
} else {
  console.log('SMTP not configured — submissions will be logged only.');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

// ── Admin authentication ─────────────────────────────────────────────────
// Normal admin usage: Google SSO session cookie (HttpOnly, signed).
// Machine/script fallback: Bearer ANALYTICS_ADMIN_TOKEN (tests, CI checks).
function getSessionUser(req) {
  if (!SESSION_SECRET) return null;
  const cookies = auth.parseCookies(req.headers.cookie);
  const session = auth.verifySessionToken(cookies[auth.SESSION_COOKIE], SESSION_SECRET);
  return session ? session.email : null;
}

function isAdminAuthorized(req) {
  if (getSessionUser(req)) return true;
  if (!ANALYTICS_ADMIN_TOKEN) return false; // no fallback configured ⇒ closed
  const header = req.headers.authorization || '';
  return header === `Bearer ${ANALYTICS_ADMIN_TOKEN}`;
}

const cookieSecure = PUBLIC_BASE_URL.startsWith('https');

function redirect(res, location, cookies = []) {
  res.writeHead(302, { Location: location, ...(cookies.length ? { 'Set-Cookie': cookies } : {}) });
  res.end();
}

function handleGoogleAuthStart(req, res) {
  if (!GOOGLE_CLIENT_ID || !SESSION_SECRET) {
    return json(res, 503, { ok: false, error: 'Google SSO is not configured on the server' });
  }
  const state = auth.createState();
  const redirectUri = `${PUBLIC_BASE_URL}/api/admin/auth/google/callback`;
  const cookies = [
    auth.serializeCookie(auth.STATE_COOKIE, state, { maxAgeSeconds: auth.STATE_TTL_MS / 1000, secure: cookieSecure }),
  ];
  redirect(res, auth.buildAuthorizeUrl(GOOGLE_CLIENT_ID, redirectUri, state), cookies);
}

async function handleGoogleAuthCallback(req, res, query) {
  const cookies = auth.parseCookies(req.headers.cookie);
  const code = query.get('code');
  const state = query.get('state');
  const deniedByUser = query.get('error') === 'access_denied';

  const fail = () =>
    redirect(res, '/admin?denied=1', [auth.serializeCookie(auth.STATE_COOKIE, '', { maxAgeSeconds: 0, secure: cookieSecure })]);

  if (deniedByUser) return redirect(res, '/admin');
  if (!code || !state || !auth.stateMatches(cookies[auth.STATE_COOKIE], state)) return fail();
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !SESSION_SECRET) return fail();

  let user;
  try {
    const redirectUri = `${PUBLIC_BASE_URL}/api/admin/auth/google/callback`;
    user = await auth.exchangeCodeAndGetUser(code, redirectUri, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  } catch (e) {
    console.error('google auth callback failed:', e.message);
    return fail();
  }

  if (!auth.isAuthorizedEmail(user.email, ADMIN_EMAILS)) {
    // Authenticated with Google, but not an authorized admin — no session.
    console.warn(`admin login denied for ${user.email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
    return fail();
  }

  const session = auth.createSessionToken(user.email, SESSION_SECRET);
  redirect(res, '/admin', [
    auth.serializeCookie(auth.STATE_COOKIE, '', { maxAgeSeconds: 0, secure: cookieSecure }),
    auth.serializeCookie(auth.SESSION_COOKIE, session, { maxAgeSeconds: auth.SESSION_TTL_MS / 1000, secure: cookieSecure }),
  ]);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 64 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];

  // ── Admin auth (Google SSO) ─────────────────────────────────────────────
  if (url === '/api/admin/auth/google' && req.method === 'GET') {
    return handleGoogleAuthStart(req, res);
  }

  if (url === '/api/admin/auth/google/callback' && req.method === 'GET') {
    const query = new URL(req.url, PUBLIC_BASE_URL).searchParams;
    return handleGoogleAuthCallback(req, res, query);
  }

  if (url === '/api/admin/auth/session' && req.method === 'GET') {
    const email = getSessionUser(req);
    if (!email) return json(res, 401, { authenticated: false });
    return json(res, 200, { authenticated: true, email });
  }

  if (url === '/api/admin/auth/logout' && req.method === 'POST') {
    return redirect(res, '/admin', [auth.serializeCookie(auth.SESSION_COOKIE, '', { maxAgeSeconds: 0 })]);
  }

  // ── Analytics configuration API ────────────────────────────────────────
  if (url === '/api/analytics-config' && req.method === 'GET') {
    return json(res, 200, analyticsConfig.publicView());
  }

  if (url === '/api/admin/analytics-config' && req.method === 'PUT') {
    if (!isAdminAuthorized(req)) return json(res, 401, { ok: false, error: 'Unauthorized' });
    return readBody(req)
      .then((body) => {
        let incoming;
        try {
          incoming = JSON.parse(body || '{}');
        } catch {
          return json(res, 400, { ok: false, error: 'Invalid JSON' });
        }
        const result = analyticsConfig.validateAndMerge(incoming);
        if (result.errors) return json(res, 400, { ok: false, errors: result.errors });
        analyticsConfig.save(result.config);
        return json(res, 200, { ok: true, config: analyticsConfig.publicView() });
      })
      .catch(() => json(res, 413, { ok: false, error: 'Payload too large' }));
  }

  if (url === '/api/admin/analytics-diagnose' && req.method === 'POST') {
    if (!isAdminAuthorized(req)) return json(res, 401, { ok: false, error: 'Unauthorized' });
    return json(res, 200, { ok: true, ...analyticsConfig.diagnose() });
  }

  // ── Contact form API ───────────────────────────────────────────────────
  if (req.method !== 'POST' || url !== '/api/contact') {
    return json(res, 404, { ok: false, error: 'Not found' });
  }
  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 64 * 1024) req.destroy();
  });
  req.on('end', async () => {
    let d;
    try {
      d = JSON.parse(body || '{}');
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid JSON' });
    }
    const name = String(d.name || '').trim();
    const email = String(d.email || '').trim();
    const topic = String(d.topic || 'General').trim().slice(0, 120);
    const message = String(d.message || '').trim();
    const company = String(d.company || '').trim().slice(0, 200);

    if (!name || !EMAIL_RE.test(email) || message.length < 5) {
      return json(res, 422, { ok: false, error: 'Please fill in name, a valid email, and a message.' });
    }

    const entry = {
      at: new Date().toISOString(), name, email, company, topic,
      message: message.slice(0, 5000), ip: req.socket.remoteAddress,
    };
    appendLog(entry);

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"AI Solution Craft Website" <${SMTP_USER}>`,
          to: CONTACT_TO,
          replyTo: email,
          subject: `[Contact] ${topic} — ${name}${company ? ` (${company})` : ''}`,
          text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\nTopic: ${topic}\n\n${message}`,
        });
        // Auto-confirmation to the visitor (best-effort; failure here must not fail the request)
        try {
          await transporter.sendMail({
            from: `"AI Solution Craft" <${SMTP_USER}>`,
            to: email,
            subject: 'We received your message — AI Solution Craft',
            text:
              `Hi ${name},\n\nThank you for contacting AI Solution Craft. ` +
              `We have received your message and will get back to you within one business day.\n\n` +
              `Your message:\n"${message.slice(0, 1000)}"\n\n` +
              `— The AI Solution Craft Team\nhttps://webchat.aisolutioncraft.com`,
          });
        } catch (e) {
          console.error('confirmation sendMail failed:', e.message);
        }
        return json(res, 200, { ok: true, delivered: true });
      } catch (e) {
        console.error('sendMail failed:', e.message);
        return json(res, 200, { ok: true, delivered: false, note: 'Saved; email delivery failed.' });
      }
    }
    return json(res, 200, { ok: true, delivered: false, note: 'Saved; SMTP not configured.' });
  });
});

server.listen(Number(LISTEN), () => console.log(`contact api listening on ${LISTEN}`));
