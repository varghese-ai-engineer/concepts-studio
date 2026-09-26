'use client';

/**
 * Concepts shared utilities.
 *
 * Used ONLY by the /concepts/* experimental design pages. Deliberately
 * isolated from the rest of the app so the concept designs never affect
 * the production landing page ("/"), the existing /showcase/* designs,
 * the global theme system, or globals.css.
 *
 * Mirrors the established /showcase/shared pattern so conventions match.
 */

import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport satisfies a CSS media query.
 * SSR-safe: returns false on the server / first paint to avoid hydration
 * mismatches, then corrects on mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** Convenience: is this a desktop-class viewport (≥ 1024px)? */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

/** Convenience: tablet and up (≥ 640px). */
export const useIsTablet = () => useMediaQuery('(min-width: 640px)');

/**
 * Coarse page scroll progress (0..1), rAF-throttled. Used for the
 * scroll-scrubber UI. The heavy scroll work inside chapters is done by
 * motion's useScroll/useTransform; this hook only feeds the top progress bar
 * and the bottom film-scrubber.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}
