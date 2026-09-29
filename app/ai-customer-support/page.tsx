import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { JsonLd } from '@/components/site/JsonLd';

const BASE = 'https://webchat.aisolutioncraft.com';

export const metadata: Metadata = {
  title: 'AI Customer Support Chatbot — 24/7 Answers From Your Website | AI Solution Craft',
  description:
    'AI customer support chatbot that resolves customer questions 24/7, trained on your own website content. Cut ticket volume, keep humans for complex cases, set up in minutes.',
  alternates: { canonical: `${BASE}/ai-customer-support` },
  openGraph: {
    title: 'AI Customer Support Chatbot | AI Solution Craft',
    description: '24/7 AI customer support chatbot trained on your website content.',
    url: `${BASE}/ai-customer-support`,
    type: 'website',
  },
};

const faqs = [
  {
    q: 'How does an AI customer support chatbot learn our answers?',
    a: 'It crawls your website and learns your products, pricing, and policies. Every answer it gives is grounded in your own content — no invented facts — and links customers back to the source page.',
  },
  {
    q: 'Do we need developers to set it up?',
    a: 'No. You point the assistant at your website, it indexes your pages, and you embed the chat widget with a single script tag. Most teams are live the same day.',
  },
  {
    q: 'What happens when the chatbot cannot answer?',
    a: 'It hands the conversation to your team with the full transcript attached, so a human picks up exactly where the bot stopped — customers never repeat themselves.',
  },
  {
    q: 'Can it work outside business hours?',
    a: 'Yes — that is the point. The assistant answers customer questions 24/7, on nights, weekends, and holidays, in every language your customers speak.',
  },
];

export default function AiCustomerSupportPage() {
  return (
    <SitePage>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Customer Support</p>
          <h1 className="page-title">
            AI Customer Support Chatbot That Answers From Your Own Website
          </h1>
          <p className="page-sub">
            Every unanswered customer question costs you a sale. An AI customer
            support chatbot trained on your website content resolves the
            repetitive majority of questions instantly, around the clock — and
            escalates the rest to your team with full context.
          </p>
        </div>

        <section className="page-section">
          <h2>Why businesses automate customer support with AI</h2>
          <p>
            Most support requests are the same twenty questions: pricing,
            shipping, business hours, returns, &quot;how does X work?&quot; A
            customer support AI assistant answers them in seconds, every time,
            in any language — so your team spends its day on the conversations
            that actually need a human.
          </p>
          <ul>
            <li><strong>24/7 customer support chatbot:</strong> nights, weekends, and holidays covered without staffing.</li>
            <li><strong>Instant, accurate answers:</strong> grounded in your live website content, always current.</li>
            <li><strong>Lower ticket volume:</strong> deflect the repetitive questions before they become emails.</li>
            <li><strong>Graceful human handoff:</strong> complex cases reach your team with the full conversation attached.</li>
            <li><strong>Support analytics:</strong> see what customers ask most and where your content has gaps.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Trained on your content — not on guesses</h2>
          <p>
            Generic chatbots invent answers. Ours reads your website the way a
            new hire would: it crawls your pages, learns your products and
            policies, and re-checks them automatically when you update your
            site. When it answers, it cites the page the answer came from, so
            customers trust it — and keep browsing instead of bouncing to a
            competitor.
          </p>
          <p>
            Curious how the underlying technology works? See{' '}
            <Link href="/features">how our website AI chatbot grounds every answer</Link>{' '}
            in your content.
          </p>
        </section>

        <section className="page-section">
          <h2>From support cost to sales channel</h2>
          <p>
            A support conversation is often a buying conversation in disguise.
            The same assistant that answers &quot;does this work with X?&quot;
            can qualify the visitor and hand your sales team a structured lead.
            Read more about the{' '}
            <Link href="/lead-generation-chatbot">lead generation chatbot</Link>{' '}
            side of the product.
          </p>
        </section>

        <section className="page-section">
          <h2>Frequently asked questions</h2>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <div className="page-cta">
          <h2>Start deflecting tickets this week</h2>
          <p>Point the assistant at your site and watch it answer.</p>
          <a className="btn-primary" href="/contact">
            Book a free demo
          </a>
        </div>
      </div>
    </SitePage>
  );
}
