import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePage } from '@/components/site/SitePage';
import { JsonLd } from '@/components/site/JsonLd';

const BASE = 'https://webchat.aisolutioncraft.com';

export const metadata: Metadata = {
  title: 'Voice AI Chatbot for Your Website — Talk to Your Visitors | AI Solution Craft',
  description:
    'A website AI chatbot with voice: customers speak instead of typing. Natural voice AI assistant for business, multilingual, embedded in minutes. Chat and voice AI in one.',
  alternates: { canonical: `${BASE}/voice-ai-chatbot` },
  openGraph: {
    title: 'Voice AI Chatbot for Websites | AI Solution Craft',
    description: 'Website AI chatbot with voice — customers talk, it answers.',
    url: `${BASE}/voice-ai-chatbot`,
    type: 'website',
  },
};

export default function VoiceAiChatbotPage() {
  return (
    <SitePage>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'AI Solution Craft — Voice AI Chatbot',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description:
            'Website AI chatbot with voice. Customers speak naturally, the voice AI assistant answers from your website content, in their language.',
          url: `${BASE}/voice-ai-chatbot`,
        }}
      />
      <div className="page-wrap">
        <div className="page-hero">
          <p className="page-kicker">Voice AI</p>
          <h1 className="page-title">
            Voice AI Chatbot for Your Website — Let Customers Talk, Not Type
          </h1>
          <p className="page-sub">
            Typing is friction. A voice AI assistant lets customers ask
            questions out loud and hear natural, accurate answers — drawn from
            your own website content, in their own language.
          </p>
        </div>

        <section className="page-section">
          <h2>Why voice changes the conversation</h2>
          <p>
            Most visitors never fill in a contact form, and long FAQ pages go
            unread. Speaking is how customers naturally ask questions — on the
            phone, to staff, to voice assistants. A chat and voice AI bot on
            your website meets them there: they press the mic, ask anything,
            and get a spoken answer in seconds.
          </p>
          <ul>
            <li><strong>Real-time conversation:</strong> natural speech-to-text and lifelike text-to-speech, with instant responses.</li>
            <li><strong>No misheard intent:</strong> the same grounded answers as our text <Link href="/features">AI chat widget</Link> — voice is simply another way in.</li>
            <li><strong>Higher engagement:</strong> voice conversations run longer and convert better than silent browsing.</li>
            <li><strong>Accessibility:</strong> visitors who struggle to type or read get a channel that works for them.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Multilingual voice support, out of the box</h2>
          <p>
            Your customers may speak English, Spanish, Tamil, or German — the
            voice AI assistant speaks their language, answering from the same
            knowledge base regardless of how or in what language the question
            was asked. Multilingual customer support AI stops being a project
            and becomes a checkbox.
          </p>
        </section>

        <section className="page-section">
          <h2>One assistant, two voices</h2>
          <p>
            Voice is not a separate product to manage. The same assistant that
            handles your <Link href="/ai-customer-support">AI customer support chatbot</Link>{' '}
            conversations and captures leads handles voice — one knowledge
            base, one set of analytics, one embed script.
          </p>
        </section>

        <section className="page-section">
          <h2>Embed a voice-enabled AI chatbot in minutes</h2>
          <p>
            Add the widget to your website with a single script tag. The
            assistant crawls your pages, learns your answers, and is ready for
            its first spoken question the same day — no developers, no
            call-center integration project.
          </p>
        </section>

        <div className="page-cta">
          <h2>Hear it answer for yourself</h2>
          <p>We&apos;ll set up a voice demo on your own website content.</p>
          <a className="btn-primary" href="/contact">
            Book a voice demo
          </a>
        </div>
      </div>
    </SitePage>
  );
}
