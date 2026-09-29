import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-brand">AI Solution Craft</p>
          <p className="site-footer-tagline">
            Enterprise AI assistant &amp; AI chatbot platform for customer support,
            lead generation, and knowledge automation.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="site-footer-nav">
          <Link href="/ai-assistant">AI Assistant</Link>
          <Link href="/features">Features</Link>
          <Link href="/use-cases">Use Cases</Link>
          <Link href="/ai-customer-support">AI Customer Support</Link>
          <Link href="/voice-ai-chatbot">Voice AI Chatbot</Link>
          <Link href="/lead-generation-chatbot">Lead Generation</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className="site-footer-copy">
          © {new Date().getFullYear()} AI Solution Craft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
