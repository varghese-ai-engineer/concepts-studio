import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';

export const metadata: Metadata = {
  title: 'AI Assistant Use Cases — Support, Sales, SaaS, Healthcare & More | AI Solution Craft',
  description:
    'AI customer support automation and lead generation use cases: support chatbots for small business, AI sales assistants, internal knowledge assistants, and AI chatbots for SaaS, ecommerce, and healthcare.',
  alternates: { canonical: 'https://webchat.aisolutioncraft.com/use-cases' },
  openGraph: {
    title: 'AI Customer Support Automation & Lead Gen Use Cases | AI Solution Craft',
    description: 'How teams automate support and generate leads with an AI assistant for small business and beyond.',
    url: 'https://webchat.aisolutioncraft.com/use-cases',
    type: 'website',
  },
};

export default function UseCasesPage() {
  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Use Cases</p>
          <h1 className="page-title">
            One AI Assistant, Every Corner of Your Business
          </h1>
          <p className="page-sub">
            From deflecting support tickets to qualifying inbound leads to answering
            HR questions internally — here&apos;s how teams put AI Solution Craft to
            work on day one.
          </p>
        </div>

        <section className="page-section">
          <h2>Customer support automation</h2>
          <p>
            The assistant resolves the repetitive 70% of tickets — order status,
            pricing, returns, business hours — and escalates the complex 30% with a
            full transcript attached. Support costs drop; CSAT rises. See the{' '}
            <Link href="/ai-customer-support">AI customer support chatbot</Link> page
            for the full picture.
          </p>
          <h2>Website lead generation</h2>
          <p>
            Every anonymous visitor is a conversation waiting to happen. The
            assistant engages, qualifies, and books demos while your sales team
            sleeps — a true <Link href="/lead-generation-chatbot">AI sales assistant</Link>.
          </p>
          <h2>Internal knowledge assistant</h2>
          <p>
            Point it at your HR handbook, IT wiki, or SOPs. Employees self-serve
            answers to &quot;how do I expense this&quot; or &quot;what&apos;s the
            VPN process&quot; instead of pinging a colleague.
          </p>
          <h2>SaaS &amp; software onboarding</h2>
          <p>
            Answer &quot;how do I…&quot; product questions inside your docs and
            app, reducing churn during the critical first 30 days.
          </p>
          <h2>Ecommerce &amp; retail</h2>
          <p>
            Product questions, sizing, shipping windows, and returns — answered
            instantly, with links straight to the product page.
          </p>
          <h2>Healthcare, legal &amp; professional services</h2>
          <p>
            Field appointment, coverage, and intake questions 24/7 while keeping
            humans in the loop for anything sensitive or regulated.
          </p>
          <h2>Education &amp; training</h2>
          <p>
            Turn course catalogs and policy pages into an always-available guide
            for students, parents, and staff.
          </p>
        </section>

        <div className="page-cta">
          <h2>Don&apos;t see your industry?</h2>
          <p>If it lives on a website or in documents, the assistant can learn it.</p>
          <a className="btn-primary" href="/contact">
            Discuss your use case
          </a>
        </div>
      </div>
    </SitePage>
  );
}
