import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';

export const metadata: Metadata = {
  title: 'AI Chatbot Features — RAG Answers, Voice, CRM & Analytics | AI Solution Craft',
  description:
    'Website AI chatbot features: grounded answers from your content (RAG), voice AI chatbot, multilingual support, AI chat widget, lead capture, knowledge sync, and analytics.',
  alternates: { canonical: 'https://webchat.aisolutioncraft.com/features' },
  openGraph: {
    title: 'Website AI Chatbot Features — Voice, RAG, Multilingual | AI Solution Craft',
    description: 'Everything your website AI chatbot needs: RAG answers, voice, AI chat widget, lead capture.',
    url: 'https://webchat.aisolutioncraft.com/features',
    type: 'website',
  },
};

export default function FeaturesPage() {
  return (
    <SitePage>
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Features</p>
          <h1 className="page-title">
            Everything Your AI Chatbot Needs to Sell, Support, and Scale
          </h1>
          <p className="page-sub">
            Every capability below ships in the standard platform — no add-ons, no
            per-feature pricing. Built for teams that want answers that are fast,
            accurate, and measurable.
          </p>
        </div>

        <section className="page-section">
          <h2>Grounded AI answers (RAG)</h2>
          <p>
            Retrieval-augmented generation keeps every response tied to your real
            content. The assistant cites the source page, so customers trust the
            answer — and search engines reward the engagement.
          </p>
          <h2>Voice &amp; multilingual conversations</h2>
          <p>
            Customers can talk, not just type. Real-time voice chat with natural
            speech-to-text and text-to-speech, in the languages your audience
            actually speaks. Learn more about the{' '}
            <Link href="/voice-ai-chatbot">voice AI chatbot</Link>.
          </p>
          <h2>Lead generation built into every chat</h2>
          <p>
            The assistant asks the right qualifying questions at the right moment,
            then delivers structured leads — name, email, company, and the full
            conversation — to your CRM or inbox. See the{' '}
            <Link href="/lead-generation-chatbot">lead generation chatbot</Link> in detail.
          </p>
          <h2>Website crawler &amp; knowledge sync</h2>
          <p>
            Change a price or policy on your site and the assistant stays current
            with scheduled re-crawls. Your knowledge base is never stale.
          </p>
          <h2>Team roles &amp; workspaces</h2>
          <p>
            Invite teammates with owner, admin, member, or viewer roles. Agencies
            can manage multiple customer workspaces from one account.
          </p>
          <h2>Analytics that tie chat to revenue</h2>
          <p>
            See which questions get asked most, which answers convert, and where
            visitors drop off — then feed those insights back into your content.
          </p>
          <h2>Enterprise-ready security</h2>
          <p>
            Encrypted data at rest and in transit, strict tenant isolation, and
            granular API access control — designed for regulated industries.
          </p>
        </section>

        <div className="page-cta">
          <h2>Want a walkthrough of any feature?</h2>
          <p>We&apos;ll show you the exact workflow for your use case.</p>
          <a className="btn-primary" href="/contact">
            Talk to us
          </a>
        </div>
      </div>
    </SitePage>
  );
}
