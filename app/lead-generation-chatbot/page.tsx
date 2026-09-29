import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { JsonLd } from '@/components/site/JsonLd';

const BASE = 'https://webchat.aisolutioncraft.com';

export const metadata: Metadata = {
  title: 'Lead Generation Chatbot — Convert Website Visitors With AI | AI Solution Craft',
  description:
    'A lead generation chatbot that turns anonymous traffic into qualified leads. AI qualifies visitors in conversation, captures contact details, and hands sales clean opportunities 24/7.',
  alternates: { canonical: `${BASE}/lead-generation-chatbot` },
  openGraph: {
    title: 'Lead Generation Chatbot | AI Solution Craft',
    description: 'Convert website visitors with AI — qualified leads, 24/7.',
    url: `${BASE}/lead-generation-chatbot`,
    type: 'website',
  },
};

const faqs = [
  {
    q: 'How does a lead generation chatbot qualify leads?',
    a: 'In natural conversation. The AI assistant answers the visitor’s real questions first — building trust — then asks the qualifying questions that matter to your sales process at the right moment, and hands over a structured lead with the full transcript.',
  },
  {
    q: 'Does it interrupt visitors with pop-ups?',
    a: 'No. It is a helpful assistant visitors choose to talk to, not an aggressive pop-up. Because it answers genuine questions, visitors volunteer information forms could never collect.',
  },
  {
    q: 'Where do the captured leads go?',
    a: 'Straight to your inbox or CRM — name, email, company, and the complete conversation, so sales knows exactly what the prospect asked before making contact.',
  },
];

export default function LeadGenerationChatbotPage() {
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
          <p className="page-kicker">Lead Generation</p>
          <h1 className="page-title">
            Lead Generation Chatbot: Convert Website Visitors With AI
          </h1>
          <p className="page-sub">
            98% of your traffic leaves without contacting you. A lead
            qualification chatbot engages those silent visitors, answers their
            questions, and turns them into structured leads your sales team
            can act on — 24/7.
          </p>
        </div>

        <section className="page-section">
          <h2>From anonymous traffic to qualified pipeline</h2>
          <p>
            Forms ask; assistants help. That difference is why an AI chatbot
            for lead generation outperforms static contact forms — the visitor
            gets real answers to real questions first, and the qualification
            happens inside a conversation they chose to have.
          </p>
          <ul>
            <li><strong>Qualify before you contact:</strong> budget, needs, and intent captured conversationally.</li>
            <li><strong>Capture, don&apos;t chase:</strong> name, email, and company collected at the moment of highest interest.</li>
            <li><strong>Full context for sales:</strong> every lead arrives with the complete conversation attached.</li>
            <li><strong>Never sleeps:</strong> leads captured at 2 a.m. are as warm as the ones from 2 p.m.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Answering questions is the best lead magnet</h2>
          <p>
            Visitors with questions are visitors with intent. Because our
            assistant is <Link href="/ai-assistant">trained on your website content</Link>,
            it answers product and pricing questions instantly and accurately —
            the exact moment a buyer is deciding. That is when a polite
            &quot;want us to follow up?&quot; converts.
          </p>
        </section>

        <section className="page-section">
          <h2>Works with your support, not against it</h2>
          <p>
            The same assistant handles {' '}
            <Link href="/ai-customer-support">customer support questions</Link> and
            sales conversations — one widget, one knowledge base, two jobs:
            happier customers and more leads.
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
          <h2>Turn your traffic into pipeline</h2>
          <p>See what a lead generation chatbot would capture on your site.</p>
          <a className="btn-primary" href="/contact">
            Get a demo
          </a>
        </div>
      </div>
    </SitePage>
  );
}
