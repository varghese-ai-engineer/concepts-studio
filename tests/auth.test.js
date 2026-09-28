// Unit tests for the Google SSO admin auth module.
// Run: node --test tests/auth.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const auth = require('../api/auth');

const SECRET = 'test-session-secret';
const EMAIL = 'Admin@Example.com';

test('session token: sign → verify round-trip', () => {
  const token = auth.createSessionToken(EMAIL, SECRET);
  const session = auth.verifySessionToken(token, SECRET);
  assert.ok(session);
  assert.equal(session.email, EMAIL);
  assert.ok(session.exp > Date.now());
});

test('session token: tampered payload is rejected', () => {
  const token = auth.createSessionToken(EMAIL, SECRET);
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ email: 'attacker@evil.com', exp: Date.now() + 999999 })).toString('base64url');
  assert.equal(auth.verifySessionToken(`${forged}.${sig}`, SECRET), null);
  assert.equal(auth.verifySessionToken(`${payload}.${sig}x`, SECRET), null);
});

test('session token: wrong secret and expiry are rejected', () => {
  const token = auth.createSessionToken(EMAIL, SECRET);
  assert.equal(auth.verifySessionToken(token, 'other-secret'), null);
  const expired = auth.createSessionToken(EMAIL, SECRET, Date.now() - auth.SESSION_TTL_MS - 1000);
  assert.equal(auth.verifySessionToken(expired, SECRET), null);
  assert.equal(auth.verifySessionToken('garbage', SECRET), null);
  assert.equal(auth.verifySessionToken('', SECRET), null);
});

test('oauth state: random, matches itself, rejects mismatch/short values', () => {
  const s1 = auth.createState();
  const s2 = auth.createState();
  assert.notEqual(s1, s2);
  assert.ok(s1.length >= 16);
  assert.ok(auth.stateMatches(s1, s1));
  assert.ok(!auth.stateMatches(s1, s2));
  assert.ok(!auth.stateMatches('short', 'short')); // too short → reject
  assert.ok(!auth.stateMatches(undefined, s1));
  assert.ok(!auth.stateMatches(s1, undefined));
});

test('authorize URL contains client id, redirect uri, state, and code flow params', () => {
  const url = new URL(auth.buildAuthorizeUrl('client-123', 'https://webchat.aisolutioncraft.com/api/admin/auth/google/callback', 'state-abc'));
  assert.equal(url.searchParams.get('client_id'), 'client-123');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('state'), 'state-abc');
  assert.ok(url.searchParams.get('redirect_uri').startsWith('https://webchat'));
  assert.ok(url.searchParams.get('scope').includes('email'));
});

test('admin email allowlist: exact + case-insensitive + multiple entries', () => {
  assert.ok(auth.isAuthorizedEmail('admin@example.com', 'admin@example.com'));
  assert.ok(auth.isAuthorizedEmail('ADMIN@EXAMPLE.COM', 'admin@example.com'));
  assert.ok(auth.isAuthorizedEmail('b@x.com', 'a@x.com, b@x.com ,c@x.com'));
  assert.ok(!auth.isAuthorizedEmail('evil@example.com', 'admin@example.com'));
  assert.ok(!auth.isAuthorizedEmail('admin@example.com', ''));
  assert.ok(!auth.isAuthorizedEmail('admin@example.com@x', 'admin@example.com'));
  assert.ok(!auth.isAuthorizedEmail(null, 'admin@example.com'));
});

test('code exchange rejects bad token responses (stubbed fetch)', async () => {
  const stub = async (url) => ({ ok: false, status: 400 });
  await assert.rejects(
    auth.exchangeCodeAndGetUser('code', 'https://cb', 'id', 'secret', stub),
    /token exchange failed/,
  );
  const noEmail = async () => ({ ok: true, json: async () => ({ access_token: 't' }) });
  // userinfo returns no email
  const stub2 = async (url) =>
    url.includes('userinfo')
      ? { ok: true, json: async () => ({ email_verified: true }) }
      : { ok: true, json: async () => ({ access_token: 't' }) };
  await assert.rejects(
    auth.exchangeCodeAndGetUser('code', 'https://cb', 'id', 'secret', stub2),
    /no email/,
  );
  const unverified = async (url) =>
    url.includes('userinfo')
      ? { ok: true, json: async () => ({ email: 'x@y.com', email_verified: false }) }
      : { ok: true, json: async () => ({ access_token: 't' }) };
  await assert.rejects(
    auth.exchangeCodeAndGetUser('code', 'https://cb', 'id', 'secret', unverified),
    /not verified/,
  );
});

test('cookie helpers: parse and serialize', () => {
  const cookies = auth.parseCookies('a=1; admin_session=x.y.z; b=hello%20world');
  assert.equal(cookies.a, '1');
  assert.equal(cookies.admin_session, 'x.y.z');
  assert.equal(cookies.b, 'hello world');
  assert.deepEqual(auth.parseCookies(undefined), {});

  const c = auth.serializeCookie('s', 'v', { maxAgeSeconds: 60 });
  assert.ok(c.includes('HttpOnly'));
  assert.ok(c.includes('SameSite=Lax'));
  assert.ok(c.includes('Secure'));
  assert.ok(c.includes('Max-Age=60'));
  assert.ok(!auth.serializeCookie('s', 'v', { secure: false }).includes('Secure'));
});
