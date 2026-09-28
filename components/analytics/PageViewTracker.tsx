'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/client';

// Tracks page views for the initial load and every app-router (SPA)
// navigation. Path exclusions and consent gating are handled in the client.
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Small defer so document.title reflects the new route.
    const t = setTimeout(() => trackPageView(pathname), 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
