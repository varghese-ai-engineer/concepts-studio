'use client';

import { useState } from 'react';
import { SitePage } from '@/components/site/SitePage';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: 'Demo request', message: '' });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Contact</p>
          <h1 className="page-title">Talk to the AI Solution Craft Team</h1>
          <p className="page-sub">
            Book a demo, ask a product question, or tell us about your use case.
            We reply within one business day.
          </p>
        </div>

        <section className="page-section">
          {status === 'sent' ? (
            <div className="contact-sent" role="status">
              <p className="contact-sent-title">✓ Message sent</p>
              <p>
                Thank you, your message is on its way. We&apos;ll get back to you
                within one business day. A confirmation email has also been sent
                to you.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setForm({ name: '', email: '', company: '', topic: 'Demo request', message: '' });
                  setStatus('idle');
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
          {status === 'error' && (
            <p className="form-note" role="alert">
              {error} Please try again or email us directly at
              vargheset@aisolutioncraft.com.
            </p>
          )}
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Full name *
              <input required value={form.name} onChange={set('name')} autoComplete="name" placeholder="Jane Doe" />
            </label>
            <label>
              Work email *
              <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="jane@company.com" />
            </label>
            <label>
              Company
              <input value={form.company} onChange={set('company')} autoComplete="organization" placeholder="Acme Inc." />
            </label>
            <label>
              What can we help with?
              <select value={form.topic} onChange={set('topic')}>
                <option>Demo request</option>
                <option>Pricing question</option>
                <option>Use case discussion</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Message *
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={set('message')}
                placeholder="Tell us about your website, your customers, and what you'd like the AI assistant to handle…"
              />
            </label>
            <div>
              <button type="submit" className="btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </div>
            <p className="form-note">
              Prefer email? Write to us directly at vargheset@aisolutioncraft.com.
            </p>
          </form>
            </>
          )}
        </section>
      </div>
    </SitePage>
  );
}
