// Google SSO authentication for the site admin (/admin).
// Server-side OAuth 2.0 code flow with CSRF state, a signed stateless
// session cookie, and an explicit admin email allowlist. No database —
// the session payload is HMAC-signed with SESSION_SECRET.

const crypto = require('node:crypto');

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

const STATE_COOKIE = 'admin_oauth_state';
const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function hmac(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

// ── Admin email allowlist ─────────────────────────────────────────────────
// ADMIN_EMAILS is a comma-separated list; matching is case-insensitive
// (Google emails are case-insensitive in practice).
function isAuthorizedEmail(email, adminEmailsEnv) {
  if (typeof email !== 'string' || !email.includes('@')) return false;
  const list = String(adminEmailsEnv || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

// ── OAuth state ───────────────────────────────────────────────────────────
function createState() {
  return crypto.randomBytes(16).toString('base64url');
}

function stateMatches(cookieState, queryState) {
  if (typeof cookieState !== 'string' || typeof queryState !== 'string') return false;
  if (cookieState.length < 16) return false;
  const a = Buffer.from(cookieState);
  const b = Buffer.from(queryState);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return crypto.timingSafeEqual(a, b);
}

function buildAuthorizeUrl(clientId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email',
    state,
    access_type: 'online',
    include_granted_scopes: 'false',
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

// Exchanges the authorization code for tokens and returns the verified
// userinfo (email + email_verified). Throws on any failure.
async function exchangeCodeAndGetUser(code, redirectUri, clientId, clientSecret, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const tokenRes = await doFetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
  const tokens = await tokenRes.json();
  if (!tokens.access_token) throw new Error('no access_token in response');

  const userRes = await doFetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) throw new Error(`userinfo failed (${userRes.status})`);
  const user = await userRes.json();
  if (!user.email) throw new Error('no email in userinfo');
  if (user.email_verified === false) throw new Error('email not verified');
  return { email: String(user.email) };
}

// ── Signed session cookie ─────────────────────────────────────────────────
// Payload: base64url(JSON{email, exp}) + '.' + HMAC. Stateless and
// tamper-proof — any change to the payload invalidates the signature.
function createSessionToken(email, secret, now = Date.now()) {
  const payload = base64url(JSON.stringify({ email, exp: now + SESSION_TTL_MS }));
  return `${payload}.${hmac(payload, secret)}`;
}

function verifySessionToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.email !== 'string' || typeof data.exp !== 'number') return null;
    if (data.exp < now) return null;
    return { email: data.email, exp: data.exp };
  } catch {
    return null;
  }
}

// Parses a Cookie header into a plain object (first occurrence wins).
function parseCookies(header) {
  const out = {};
  if (typeof header !== 'string') return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    if (!(key in out)) out[key] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function serializeCookie(name, value, { maxAgeSeconds, path = '/', secure = true } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'HttpOnly', 'SameSite=Lax', `Path=${path}`];
  if (secure) parts.push('Secure');
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${maxAgeSeconds}`);
  return parts.join('; ');
}

module.exports = {
  STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  STATE_TTL_MS,
  isAuthorizedEmail,
  createState,
  stateMatches,
  buildAuthorizeUrl,
  exchangeCodeAndGetUser,
  createSessionToken,
  verifySessionToken,
  parseCookies,
  serializeCookie,
};
