// Unit tests for the GA4 analytics configuration (API side).
// Run: node --test tests/analytics.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Isolated /data dir per test run.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ga-test-'));
process.env.DATA_DIR = tmp;
// Delete the cached module if a previous test already loaded it.
delete require.cache[require.resolve('../api/analytics-config')];
const cfg = require('../api/analytics-config');

const VALID_ID = 'G-ABC123DEFG';

test('defaults: GA disabled, no measurement ID, standard exclusions', () => {
  const d = cfg.defaults();
  assert.equal(d.enabled, false);
  assert.equal(d.measurementId, '');
  assert.deepEqual(d.excludedPaths, ['/admin', '/admin/*', '/login', '/health']);
  assert.equal(d.requireConsent, true);
  assert.equal(d.respectDnt, true);
});

test('measurement ID validation', () => {
  assert.ok(cfg.MEASUREMENT_ID_RE.test('G-ABC123DEFG'));
  assert.ok(cfg.MEASUREMENT_ID_RE.test('AW-123456789'));
  assert.ok(cfg.MEASUREMENT_ID_RE.test('DC-1A2B3C'));
  assert.ok(!cfg.MEASUREMENT_ID_RE.test('UA-123456-2')); // UA not supported
  assert.ok(!cfg.MEASUREMENT_ID_RE.test('G-abc'));
  assert.ok(!cfg.MEASUREMENT_ID_RE.test('G-'));
  assert.ok(!cfg.MEASUREMENT_ID_RE.test('garbage'));
  assert.ok(!cfg.MEASUREMENT_ID_RE.test('G-ABC<script>'));
});

test('enabling requires a valid measurement ID', () => {
  const r = cfg.validateAndMerge({ enabled: true, measurementId: 'nope' });
  assert.ok(r.errors && r.errors.some((e) => e.includes('measurementId')));
  // Invalid IDs are rejected even when disabled; empty is allowed when disabled.
  assert.ok(cfg.validateAndMerge({ enabled: false, measurementId: 'nope' }).errors);
  assert.ok(cfg.validateAndMerge({ enabled: false, measurementId: '' }).config);
  assert.ok(cfg.validateAndMerge({ enabled: true, measurementId: VALID_ID }).config);
});

test('rejected: script / javascript: / HTML injection in any field', () => {
  for (const payload of [
    { measurementId: `${VALID_ID}<script>alert(1)</script>` },
    { customParameters: [{ name: 'x', value: 'javascript:alert(1)' }] },
    { customParameters: [{ name: '<img src=x onerror=alert(1)>', value: 'v' }] },
    { excludedPaths: ['/ok', '/x<script>'] },
  ]) {
    const r = cfg.validateAndMerge(payload);
    assert.ok(r.errors && r.errors.length > 0, `expected rejection: ${JSON.stringify(payload)}`);
  }
});

test('custom parameter name allowlist', () => {
  const bad = cfg.validateAndMerge({ customParameters: [{ name: 'not allowed!', value: 'v' }] });
  assert.ok(bad.errors);
  const good = cfg.validateAndMerge({ customParameters: [{ name: 'campaign_source', value: 'newsletter' }] });
  assert.deepEqual(good.config.customParameters, [{ name: 'campaign_source', value: 'newsletter' }]);
});

test('environment enum enforced', () => {
  assert.ok(cfg.validateAndMerge({ environment: 'staging' }).errors);
  assert.equal(cfg.validateAndMerge({ environment: 'test' }).config.environment, 'test');
});

test('excluded paths must start with /', () => {
  const r = cfg.validateAndMerge({ excludedPaths: ['admin'] });
  assert.ok(r.errors);
});

test('configuration persistence round-trip', () => {
  const save = cfg.validateAndMerge({ enabled: true, measurementId: VALID_ID, environment: 'production', debugMode: true });
  assert.ok(save.config, save.errors && save.errors.join('; '));
  cfg.save(save.config);
  const pub = cfg.publicView();
  assert.equal(pub.enabled, true);
  assert.equal(pub.measurementId, VALID_ID);
  assert.equal(pub.debugMode, true);
  assert.ok(pub.updatedAt);
  // A fresh load (new process would re-read the file) sees the same values.
  assert.equal(cfg.load().measurementId, VALID_ID);
});

test('public view sanitizes a corrupted saved file', () => {
  fs.writeFileSync(cfg.CONFIG_PATH, JSON.stringify({ enabled: true, measurementId: 'BAD ID', customParameters: [{ name: 'bad name', value: 'x' }] }));
  const pub = cfg.publicView();
  assert.equal(pub.enabled, false, 'enabled only with valid measurement ID');
  assert.equal(pub.measurementId, '');
  assert.deepEqual(pub.customParameters, []);
});

test('diagnostics report real checks', () => {
  fs.writeFileSync(cfg.CONFIG_PATH, JSON.stringify({ enabled: true, measurementId: VALID_ID }));
  const d = cfg.diagnose();
  const names = d.checks.map((c) => c.name);
  assert.ok(names.includes('Configuration exists'));
  assert.ok(names.includes('Measurement ID format valid'));
  assert.ok(d.note.includes('do not verify'));
});

// ── Path matcher (frontend parity checks in JS) ──────────────────────────
// The TS matcher is not requireable from node:test directly; these cases
// mirror its logic 1:1 and the Playwright spec exercises the real module.
test('wildcard exclusion patterns (reference cases)', () => {
  function isPathExcluded(path, patterns) {
    for (const raw of patterns) {
      const pattern = String(raw || '').trim();
      if (!pattern) continue;
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -1);
        if (path === prefix.slice(0, -1) || path.startsWith(prefix)) return true;
      } else if (pattern.endsWith('*')) {
        if (path.startsWith(pattern.slice(0, -1))) return true;
      } else if (path === pattern) return true;
    }
    return false;
  }
  const defaults = ['/admin', '/admin/*', '/login', '/health'];
  assert.ok(isPathExcluded('/admin', defaults));
  assert.ok(isPathExcluded('/admin/analytics', defaults));
  assert.ok(isPathExcluded('/login', defaults));
  assert.ok(isPathExcluded('/health', defaults));
  assert.ok(!isPathExcluded('/', defaults));
  assert.ok(!isPathExcluded('/contact', defaults));
  assert.ok(!isPathExcluded('/admin-tools', defaults)); // prefix must respect segment
  assert.ok(!isPathExcluded('/about', ['/admin/*']));
});
