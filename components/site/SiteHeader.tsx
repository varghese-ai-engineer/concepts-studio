import Link from 'next/link';

const links = [
  { href: '/ai-assistant', label: 'AI Assistant' },
  { href: '/features', label: 'Features' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-brand-mark">AI</span>
          <span className="site-brand-name">Solution Craft</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="site-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
