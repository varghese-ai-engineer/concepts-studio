'use client';

/**
 * useJourneyScroll — the single source of truth for the cinematic journey.
 *
 * Principle: SCROLL = FILM TIMELINE. The returned MotionValue `progress` is a
 * 0..1 mapping of the document scroll, deterministic and reversible. Every
 * scene layer, the CSS-3D world, and the robot all derive their state from
 * `progress` (and its spring-smoothed sibling `smoothProgress`) so the whole
 * experience stays 1:1 with the user's scroll — slow scrolls move slowly,
 * fast scrolls move fast, stop settles, reverse reverses exactly.
 *
 * No autoplay. No independent timelines. Scroll owns everything.
 */

import { useEffect, useState } from 'react';
import { useScroll, useSpring, type MotionValue } from 'motion/react';

export interface JourneyScroll {
  /** Raw document scroll progress, 0..1. Deterministic, reversible, immediate. */
  progress: MotionValue<number>;
  /** Spring-smoothed progress — same target as `progress` but with subtle
   *  inertia so fast scrolls feel cinematic. It always settles to the exact
   *  scroll position (low stiffness → never drifts away from the user). */
  smoothProgress: MotionValue<number>;
  /** Plain-number progress (for places that need a re-rendering value, like
   *  the scene rail active state). rAF-throttled. */
  progressNumber: number;
}

export function useJourneyScroll(): JourneyScroll {
  // Track the whole document scroll.
  const { scrollYProgress } = useScroll();
  // Subtle smoothing only — stiff enough to stay glued to scroll, soft enough
  // to add a hint of cinematic ease. (Low damping = less wobble.)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
    restDelta: 0.0005,
  });

  const [progressNumber, setProgressNumber] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = (v: number) => {
      frame = 0;
      setProgressNumber(v);
    };
    const unsub = scrollYProgress.on('change', (v) => {
      if (!frame) frame = requestAnimationFrame(() => update(v));
    });
    return () => {
      unsub();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollYProgress]);

  return { progress: scrollYProgress, smoothProgress, progressNumber };
}
