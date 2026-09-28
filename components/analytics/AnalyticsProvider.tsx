'use client';

import { useEffect } from 'react';
import * as analytics from '@/lib/analytics/client';

// Mounted once in the root layout: fetches config, initializes analytics
// when every gate allows, and registers the generic click/outbound events.
export function AnalyticsProvider() {
  useEffect(() => {
    analytics.init();
    analytics.attachAutoEvents();
  }, []);
  return null;
}
