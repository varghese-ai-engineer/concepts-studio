'use client';

/**
 * RobotJourney — orchestrates the cinematic scroll experience.
 *
 * NOTE: the WebGL robot was removed — it did not fit this design and was
 * visually unstable (appearing/disappearing). The journey now keeps the
 * parts that work well and fit the editorial tone: the scroll-driven 3D
 * world (scene layers + depth dolly) and the SceneRail navigator.
 *
 * Scroll = film timeline. This component:
 *   1. reads the single journey scroll progress (useJourneyScroll),
 *   2. renders the CSS-3D world rig whose vertical translate == scroll dolly,
 *   3. renders the SceneRail (the only interactive layer).
 *
 * Every visual layer carries pointer-events: none so the website content
 * (text, buttons, pricing, nav) stays fully usable. Only the SceneRail is
 * interactive. The world is z-index 0 (behind content at z-index 1/2).
 *
 * Mounted only AFTER the loading intro completes (gated by parent), so the
 * mark→nav transformation is never disturbed.
 */

import { type ReactNode } from 'react';
import { motion, useTransform } from 'motion/react';
import { useJourneyScroll } from './useJourneyScroll';
import { SceneRail } from './SceneRail';
import { Scenes } from './Scenes';
import { WORLD_DEPTH } from './beats';
import s from './journey.module.css';

export function RobotJourney({ children }: { children?: ReactNode }) {
  const { smoothProgress, progressNumber } = useJourneyScroll();

  // The world rig dolls downward as the user scrolls. Using smooth progress
  // gives a hint of cinematic inertia while staying glued to scroll.
  const worldY = useTransform(smoothProgress, [0, 1], [0, -WORLD_DEPTH]);

  return (
    <>
      {/* Scene rail — interactive navigator (jump-scroll). Desktop only. */}
      <SceneRail progressNumber={progressNumber} />

      {/* The 3D world. pointer-events: none via .world; z-index 0 (behind
          content) so it can never cover the page. */}
      <div className={s.world} aria-hidden>
        <motion.div className={s.worldTint} />
        <motion.div className={s.worldRig} style={{ y: worldY }}>
          {/* 7 scene layers at increasing depth; each fades in near its beat. */}
          <Scenes smoothProgress={smoothProgress} />
        </motion.div>
      </div>

      {/* The actual page content renders on top, fully interactive. */}
      {children}
    </>
  );
}
