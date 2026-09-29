import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Keep the admin surface out of search engines. The page itself exposes
// nothing without a valid SSO session, but indexing it is bad hygiene.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
