'use client';

import { StudioHome } from '@/components/concepts/StudioHome/StudioHome';

/**
 * /concepts/studio — Design 1 (Studio).
 * Self-contained; does not affect the production landing page at "/" or
 * the existing /showcase/* designs.
 */
export default function StudioPage() {
  return <StudioHome />;
}
