// Contact form API for webchat.aisolutioncraft.com
// POST /api/contact  { name, email, company?, topic, message }
// Sends email via SMTP if configured; ALWAYS logs the submission to
// /data/submissions.json so nothing is lost even without SMTP.
const http = require('http');
const fs = require('fs');
const path = require('path');

const {
  SMTP_HOST, SMTP_PORT = '587', SMTP_USER, SMTP_PASS,
  CONTACT_TO = 'hello@aisolutioncraft.com', PORT: LISTEN = '3000',
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

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/contact') {
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
