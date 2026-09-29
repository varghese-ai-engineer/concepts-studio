import type { Metadata } from 'next';
import { StudioHome } from '@/components/concepts/StudioHome/StudioHome';
import { JsonLd } from '@/components/site/JsonLd';

const BASE = 'https://webchat.aisolutioncraft.com';

export const metadata: Metadata = {
  title: 'AI Assistant for Business | AI Chatbot for Your Website — AI Solution Craft',
  description:
    'Give your website an AI assistant for business that answers customer questions 24/7, trained on your own content. AI chatbot with voice, lead generation, and easy setup in minutes.',
  alternates: { canonical: BASE },
  openGraph: {
    title: 'AI Assistant for Business — AI Solution Craft',
    description:
      'A website AI assistant trained on your content: 24/7 AI customer support, voice chat, and lead generation.',
    url: BASE,
    type: 'website',
    siteName: 'AI Solution Craft',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'AI Solution Craft',
          url: BASE,
          description:
            'AI assistant and AI chatbot platform for business websites: 24/7 customer support, voice chat, and lead generation.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'AI Solution Craft',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description:
            'AI assistant for business websites. An AI chatbot trained on your website content that answers customer questions 24/7, talks by voice, and captures leads.',
          url: BASE,
          offers: { '@type': 'Offer', url: `${BASE}/#pricing` },
        }}
      />
      <StudioHome />
    </>
  );
}
