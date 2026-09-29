import type { Metadata } from 'next';
import { SitePage } from '@/components/site/SitePage';

export const metadata: Metadata = {
  title: 'About AI Solution Craft — The AI Assistant Platform Team',
  description:
    'Learn about AI Solution Craft: why we build grounded AI assistants and chatbots that answer from your own content, capture leads, and make business knowledge available 24/7.',
  alternates: { canonical: 'https://webchat.aisolutioncraft.com/about' },
  openGraph: {
    title: 'About AI Solution Craft — The AI Assistant Platform Team',
    description: 'Why we build grounded AI assistants that answer from your own content.',
    url: 'https://webchat.aisolutioncraft.com/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">About</p>
          <h1 className="page-title">
            We Believe Every Business Website Should Answer for Itself
          </h1>
          <p className="page-sub">
            AI Solution Craft builds AI assistants that are grounded in your own
            content — accurate by design, useful by default, and measurable in
            revenue, not hype.
          </p>
        </div>

        <section className="page-section">
          <h2>Our mission</h2>
          <p>
            Large language models changed what software can do, but most businesses
            still answer customer questions the 2005 way: static FAQ pages and
            overflowing inboxes. Our mission is to close that gap — giving every
            company an AI assistant that knows their business as well as their best
            employee does, and works every hour of every day.
          </p>
          <h2>How we&apos;re different</h2>
          <ul>
            <li><strong>Grounded, not guessed:</strong> answers come from your website and documents, with sources — never invented facts.</li>
            <li><strong>Business-first:</strong> every conversation is designed to either resolve an issue or capture a lead.</li>
            <li><strong>Transparent pricing:</strong> plans scale with usage, not with feature checkboxes.</li>
            <li><strong>Human in the loop:</strong> the assistant knows when to hand off, and hands off gracefully.</li>
          </ul>
          <h2>What we build</h2>
          <p>
            Our platform combines a website crawler, a retrieval-augmented answer
            engine, voice and multilingual chat, lead capture workflows, team
            workspaces, and analytics — so an AI assistant goes from signup to
            production in minutes, not months.
          </p>
        </section>

        <div className="page-cta">
          <h2>Let&apos;s build your assistant together</h2>
          <p>Tell us about your business and we&apos;ll show you what day one looks like.</p>
          <a className="btn-primary" href="/contact">
            Get in touch
          </a>
        </div>
      </div>
    </SitePage>
  );
}
