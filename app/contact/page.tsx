'use client';

import { useState } from 'react';
import { SitePage } from '@/components/site/SitePage';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: 'Demo request', message: '' });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm({ ...form, [k]: e.target.value });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[AI Solution Craft] ${form.topic} — ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nTopic: ${form.topic}\n\n${form.message}`,
    );
    window.location.href = `mailto:hello@aisolutioncraft.com?subject=${subject}&body=${body}`;
    setSent(true);
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
          {sent && (
            <p className="form-note" role="status">
              Thanks! Your email app should have opened with your message ready to
              send. Press send there and we&apos;ll get back to you.
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
              <button type="submit" className="btn-primary">Send message</button>
            </div>
            <p className="form-note">
              Prefer email? Write to us directly at hello@aisolutioncraft.com.
            </p>
          </form>
        </section>
      </div>
    </SitePage>
  );
}
