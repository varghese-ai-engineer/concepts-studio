import type { Metadata } from 'next';
import { SitePage } from '@/components/site/SitePage';

export const metadata: Metadata = {
  title: 'AI Assistant for Business — AI Chatbot & Knowledge Automation | AI Solution Craft',
  description:
    'Deploy an AI assistant that answers customer questions 24/7, captures leads, and turns your website content into a self-service knowledge base. Enterprise-grade AI chatbot platform.',
  alternates: { canonical: 'https://webchat.aisolutioncraft.com/ai-assistant' },
  openGraph: {
    title: 'AI Assistant for Business | AI Solution Craft',
    description:
      '24/7 AI assistant and chatbot for customer support, lead generation, and knowledge automation.',
    type: 'website',
  },
};

export default function AiAssistantPage() {
  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Product</p>
          <h1 className="page-title">
            AI Assistant for Business — Your Website&apos;s 24/7 Intelligent Front Desk
          </h1>
          <p className="page-sub">
            AI Solution Craft turns your existing website content into a trained AI
            assistant that answers customer questions instantly, qualifies visitors,
            and hands your team clean, actionable leads — around the clock, in any
            language.
          </p>
        </div>

        <section className="page-section">
          <h2>What the AI Assistant Does</h2>
          <p>
            Most business websites force visitors to hunt through menus or wait on
            email replies. Our AI assistant removes that friction. It crawls your
            site, learns your products, pricing, and policies, and then responds to
            visitor questions in natural language — accurately, and always on-brand.
          </p>
          <ul>
            <li><strong>Instant answers:</strong> visitors get help in seconds, not business days.</li>
            <li><strong>Always on:</strong> nights, weekends, holidays — the assistant never clocks out.</li>
            <li><strong>Lead capture:</strong> conversations convert into structured leads pushed to your CRM or inbox.</li>
            <li><strong>Human handoff:</strong> complex questions escalate to your team with full conversation context.</li>
            <li><strong>multilingual:</strong> serves customers in their language, including voice and chat.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Built on Your Own Knowledge Base</h2>
          <p>
            The assistant is grounded in retrieval-augmented generation (RAG): it
            answers only from your crawled website content and uploaded documents.
            That means no hallucinated promises, no invented pricing — and every
            answer links back to the source page on your site, which keeps visitors
            browsing instead of bouncing.
          </p>
          <h3>Set up in minutes</h3>
          <ul>
            <li>Point the crawler at your domain.</li>
            <li>The assistant indexes your pages and refreshes them automatically.</li>
            <li>Embed the chat widget with a single script tag — no developers required.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Why Businesses Choose AI Solution Craft</h2>
          <p>
            Support teams use it to cut ticket volume. Marketing teams use it to
            convert abandoned visits into booked demos. Operations teams use it as
            an internal knowledge assistant for policies and procedures. One
            platform, three wins: faster answers, more leads, lower support cost.
          </p>
        </section>

        <div className="page-cta">
          <h2>Ready to put an AI assistant on your website?</h2>
          <p>
            See how quickly your site can start answering for you.
          </p>
          <a className="btn-primary" href="/contact">
            Book a free demo
          </a>
        </div>
      </div>
    </SitePage>
  );
}
