// Google Analytics 4 configuration for webchat.aisolutioncraft.com.
// Stored as JSON in /data/analytics-config.json (same volume pattern as
// submissions.json). All admin-supplied values are validated and sanitized
// here before anything is persisted or served.

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || '/data';
const CONFIG_PATH = path.join(DATA_DIR, 'analytics-config.json');

const ENVIRONMENTS = ['development', 'test', 'production'];
const MEASUREMENT_ID_RE = /^(G|AW|DC)-[A-Z0-9_-]{4,}$/;
const PARAM_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,39}$/;
// Fields that must never contain markup, script URLs, or event-handler
// attributes — blocks arbitrary JS/HTML injection from the admin UI.
const FORBIDDEN_SUBSTRINGS = ['<script', 'javascript:', 'data:text/html', 'onerror=', 'onload=', 'srcdoc='];
const HTML_TAG_RE = /<[^>]*>/;

const DEFAULTS = {
  enabled: false,
  measurementId: '',
  environment: 'production',
  debugMode: false,
  trackPageViews: true,
  excludedPaths: ['/admin', '/admin/*', '/login', '/health'],
  requireConsent: true,
  respectDnt: true,
  customParameters: [], // [{ name, value }] merged into gtag('config')
};

function defaults() {
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return { ...defaults(), ...raw };
  } catch {
    return defaults();
  }
}

function save(config) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Rejects strings that could carry script/HTML injection.
function isSafeString(value, fieldName, errors, maxLen = 300) {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return;
  }
  if (value.length > maxLen) {
    errors.push(`${fieldName} exceeds ${maxLen} characters`);
  }
  const lower = value.toLowerCase();
  for (const bad of FORBIDDEN_SUBSTRINGS) {
    if (lower.includes(bad)) {
      errors.push(`${fieldName} contains forbidden content (${bad})`);
      return;
    }
  }
  if (HTML_TAG_RE.test(value)) {
    errors.push(`${fieldName} must not contain HTML`);
  }
}

// Validates and normalizes an incoming config object.
// Returns { config } (merged with defaults) or { errors: string[] }.
function validateAndMerge(incoming) {
  const errors = [];
  if (typeof incoming !== 'object' || incoming === null || Array.isArray(incoming)) {
    return { errors: ['Request body must be a JSON object'] };
  }

  // Start from the currently saved config (already validated at write time),
  // then apply only the fields present in the incoming request.
  const out = { ...defaults(), ...load() };

  // Booleans
  for (const key of ['enabled', 'debugMode', 'trackPageViews', 'requireConsent', 'respectDnt']) {
    if (incoming[key] !== undefined) {
      if (typeof incoming[key] !== 'boolean') errors.push(`${key} must be true or false`);
      else out[key] = incoming[key];
    }
  }

  // Measurement ID
  if (incoming.measurementId !== undefined) {
    const id = incoming.measurementId;
    isSafeString(id, 'measurementId', errors, 20);
    if (!errors.length || typeof id === 'string') {
      if (typeof id === 'string' && id !== '' && !MEASUREMENT_ID_RE.test(id)) {
        errors.push('measurementId must match G-XXXXXXXXXX (also AW-…/DC-… allowed), or be empty when disabled');
      }
      if (typeof id === 'string') out.measurementId = id;
    }
  }

  // Environment
  if (incoming.environment !== undefined) {
    if (!ENVIRONMENTS.includes(incoming.environment)) {
      errors.push(`environment must be one of: ${ENVIRONMENTS.join(', ')}`);
    } else {
      out.environment = incoming.environment;
    }
  }

  // Excluded paths: array of strings starting with '/', wildcards allowed
  if (incoming.excludedPaths !== undefined) {
    if (!Array.isArray(incoming.excludedPaths)) {
      errors.push('excludedPaths must be an array');
    } else {
      const paths = [];
      for (const p of incoming.excludedPaths) {
        if (typeof p !== 'string' || !p.startsWith('/')) {
          errors.push(`excluded path "${p}" must start with /`);
          continue;
        }
        isSafeString(p, `excluded path "${p}"`, errors, 200);
        paths.push(p.trim());
      }
      if (!errors.some((e) => e.startsWith('excluded path'))) out.excludedPaths = paths;
    }
  }

  // Custom GA4 config parameters: [{ name, value }]
  if (incoming.customParameters !== undefined) {
    if (!Array.isArray(incoming.customParameters)) {
      errors.push('customParameters must be an array of { name, value }');
    } else {
      const params = [];
      let paramsOk = true;
      for (const item of incoming.customParameters) {
        if (typeof item !== 'object' || item === null) {
          errors.push('customParameters entries must be objects');
          paramsOk = false;
          continue;
        }
        isSafeString(item.name, 'custom parameter name', errors, 40);
        isSafeString(String(item.value ?? ''), 'custom parameter value', errors, 100);
        if (typeof item.name !== 'string' || !PARAM_NAME_RE.test(item.name)) {
          errors.push(`custom parameter name "${item.name}" is not allowed (letters, digits, underscore; max 40 chars)`);
          paramsOk = false;
          continue;
        }
        params.push({ name: item.name, value: String(item.value ?? '').slice(0, 100) });
      }
      if (paramsOk) out.customParameters = params;
    }
  }

  // Cross-field rule: enabling requires a valid measurement ID.
  if (out.enabled && !MEASUREMENT_ID_RE.test(out.measurementId)) {
    errors.push('a valid measurementId is required to enable Google Analytics');
  }

  if (errors.length) return { errors };
  out.updatedAt = new Date().toISOString();
  return { config: out };
}

// Public (runtime) view served to the static frontend — same fields, but
// canonicalized through defaults so nothing unexpected is ever exposed.
function publicView() {
  const c = load();
  return {
    enabled: !!c.enabled && MEASUREMENT_ID_RE.test(c.measurementId),
    measurementId: MEASUREMENT_ID_RE.test(c.measurementId) ? c.measurementId : '',
    environment: ENVIRONMENTS.includes(c.environment) ? c.environment : 'production',
    debugMode: !!c.debugMode,
    trackPageViews: !!c.trackPageViews,
    excludedPaths: Array.isArray(c.excludedPaths) ? c.excludedPaths.filter((p) => typeof p === 'string') : [],
    requireConsent: !!c.requireConsent,
    respectDnt: !!c.respectDnt,
    customParameters: Array.isArray(c.customParameters)
      ? c.customParameters
          .filter((p) => p && typeof p.name === 'string' && PARAM_NAME_RE.test(p.name))
          .map((p) => ({ name: p.name, value: String(p.value ?? '').slice(0, 100) }))
      : [],
    updatedAt: c.updatedAt || null,
  };
}

// Diagnostics: real checks only — never claims Google received anything.
function diagnose() {
  const c = publicView();
  const checks = [
    {
      name: 'Configuration exists',
      pass: fs.existsSync(CONFIG_PATH),
      detail: fs.existsSync(CONFIG_PATH) ? CONFIG_PATH : 'no saved config yet; defaults apply',
    },
    {
      name: 'Measurement ID format valid',
      pass: MEASUREMENT_ID_RE.test(c.measurementId),
      detail: c.measurementId || 'measurementId is empty',
    },
    {
      name: 'Tracking enabled',
      pass: c.enabled,
      detail: c.enabled ? 'enabled' : 'disabled',
    },
    {
      name: 'Custom parameters valid',
      pass: true,
      detail: `${c.customParameters.length} parameter(s)`,
    },
    {
      name: 'Tracking snippet can be generated',
      pass: c.enabled && !!c.measurementId,
      detail:
        c.enabled && c.measurementId
          ? `gtag.js will load for ${c.measurementId} when consent/environment allow`
          : 'snippet not generated (tracking disabled or no measurement ID)',
    },
  ];
  return {
    checks,
    config: c,
    note: 'These are server-side configuration checks. They do not verify that Google received any hit; use GA4 DebugView (with debug mode on) for that.',
  };
}

module.exports = {
  defaults,
  load,
  save,
  validateAndMerge,
  publicView,
  diagnose,
  MEASUREMENT_ID_RE,
  PARAM_NAME_RE,
  ENVIRONMENTS,
  CONFIG_PATH,
};
