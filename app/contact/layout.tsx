import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact AI Solution Craft — Talk to the Team',
  description:
    'Contact the AI Solution Craft team for a demo of our website AI assistant, pricing questions, or use-case discussions. We reply within one business day.',
  alternates: { canonical: 'https://webchat.aisolutioncraft.com/contact' },
  openGraph: {
    title: 'Contact AI Solution Craft',
    description: 'Book a demo or ask about our website AI assistant.',
    url: 'https://webchat.aisolutioncraft.com/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
