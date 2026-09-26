'use client';

/**
 * Scenes — the 7 CSS-3D scene layers of the journey world.
 *
 * Each scene is a full-viewport plane placed at increasing depths inside the
 * world rig (which itself translates with scroll). As the rig dolls downward,
 * each scene passes through the focal plane in turn. Scene opacity is driven
 * by scroll progress so a scene is only visible while it's near the focal
 * plane — this is what makes the journey read as discrete chapters.
 *
 * Everything here is decorative storytelling. pointer-events: none (via the
 * parent .world). Content (text/buttons/pricing) lives in the page on top.
 *
 * Particle motifs per beat (each communicates a real AI capability):
 *  0 arrival     — a single ember orb (the mark spirit) on a platform
 *  1 problem     — visitor motes drifting away into the dark
 *  2 crawl       — document shards streaming along a filament
 *  3 knowledge   — a luminous core with orbiting shards snapping to a grid
 *  4 understanding — a question beam in, an answer beam out
 *  5 voice       — concentric sound rings + script glyphs
 *  6 conversion  — visitor motes returning as gold/ember lead motes
 */

import { useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { BEATS, WORLD_DEPTH } from './beats';
import s from './journey.module.css';

/** Spacing between scenes (px depth). */
const SCENE_SPACING = WORLD_DEPTH / (BEATS.length - 1);

interface ScenesProps {
  smoothProgress: MotionValue<number>;
}

export function Scenes({ smoothProgress }: ScenesProps) {
  return (
    <>
      {BEATS.map((beat, i) => {
        // Scene sits at this depth in the rig.
        const z = -i * SCENE_SPACING;
        // Opacity window: scene i is visible while scroll progress is near its beat.
        const [start, end] = beatWindow(i);
        return (
          <SceneLayer key={beat.id} z={z} progress={smoothProgress} opacityRange={[start, end]}>
            <SceneContent index={i} />
          </SceneLayer>
        );
      })}
    </>
  );
}

/** Scroll-progress window over which scene i is visible (with overlap feathering). */
function beatWindow(i: number): [number, number] {
  const span = 1 / BEATS.length;
  const center = BEATS[i].start + span / 2;
  return [Math.max(0, center - span), Math.min(1, center + span)];
}

function SceneLayer({
  z,
  progress,
  opacityRange,
  children,
}: {
  z: number;
  progress: MotionValue<number>;
  opacityRange: [number, number];
  children: React.ReactNode;
}) {
  const opacity = useRange(progress, opacityRange, [0, 1, 1, 0]);
  return (
    <div className={s.sceneLayer} style={{ transform: `translateZ(${z}px)` }}>
      <motion.div style={{ opacity }} className={s.sceneInner}>
        {children}
      </motion.div>
    </div>
  );
}

/* ---------------- per-scene decorative content ---------------- */

function SceneContent({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <ArrivalScene />;
    case 1:
      return <ProblemScene />;
    case 2:
      return <CrawlScene />;
    case 3:
      return <KnowledgeScene />;
    case 4:
      return <UnderstandingScene />;
    case 5:
      return <VoiceScene />;
    case 6:
      return <ConversionScene />;
    default:
      return null;
  }
}

/* ---- helpers: particle fields ---- */

/** Deterministic pseudo-random so particle layouts are stable across renders. */
function useParticles(count: number, seed: number) {
  return useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 4 + rand() * 10,
      delay: rand() * 4,
    }));
  }, [count, seed]);
}

function ArrivalScene() {
  // The hero scene is intentionally clean — no decorative orb/platform.
  // (The red ember orb was removed; it clashed with the content.)
  return null;
}

function ProblemScene() {
  const motes = useParticles(14, 7);
  return (
    <div className={s.sceneField}>
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className={`${s.particle} ${s.particleInk}`}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
          }}
          animate={{ y: [0, -40], opacity: [0.4, 0] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: 'easeOut', delay: m.delay }}
        />
      ))}
    </div>
  );
}

function CrawlScene() {
  const shards = useParticles(10, 13);
  return (
    <div className={s.sceneField}>
      <div className={s.filament} />
      {shards.map((m, i) => (
        <motion.span
          key={i}
          className={`${s.particle} ${s.shard}`}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: 6,
            height: 14,
          }}
          animate={{ x: [0, 30], opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.5 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        />
      ))}
    </div>
  );
}

function KnowledgeScene() {
  const shards = useParticles(16, 29);
  return (
    <div className={s.sceneField}>
      <div className={s.core} />
      <div className={s.coreRing} />
      {shards.map((m, i) => (
        <motion.span
          key={i}
          className={`${s.particle} ${s.shard}`}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: 5,
            height: 12,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8 + (i % 5) * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

function UnderstandingScene() {
  return (
    <div className={s.sceneField}>
      <motion.div
        className={s.beam}
        style={{ left: '30%' }}
        animate={{ scaleY: [0, 1], opacity: [0, 0.8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={s.coreSmall} />
      <motion.div
        className={`${s.beam} ${s.beamOut}`}
        style={{ right: '30%' }}
        animate={{ scaleY: [0, 1], opacity: [0, 0.8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
    </div>
  );
}

function VoiceScene() {
  return (
    <div className={s.sceneField}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={s.soundRing}
          animate={{ scale: [0.5, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 1 }}
        />
      ))}
    </div>
  );
}

function ConversionScene() {
  const motes = useParticles(12, 41);
  return (
    <div className={s.sceneField}>
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className={`${s.particle} ${s.particleGold}`}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size - 2,
            height: m.size - 2,
          }}
          animate={{ y: [20, -20], opacity: [0, 0.7, 0] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
        />
      ))}
    </div>
  );
}

/* ---- motion helper: map a MotionValue through a multi-stop range ----
 * Stable across renders: derives the input stops purely from primitives
 * (a, b, count) so we never create a fresh array dependency each render. */
function useRange(
  value: MotionValue<number>,
  inRange: [number, number],
  outStops: number[]
): MotionValue<number> {
  const [a, b] = inRange;
  const stops = outStops.length;
  // Build both arrays from primitives inside useMemo keyed on primitives only.
  const { inStops, outs } = useMemo(() => {
    const ins = outStops.map((_, i) => a + (i * (b - a)) / (stops - 1));
    return { inStops: ins, outs: outStops };
  }, [a, b, stops]); // eslint-disable-line react-hooks/exhaustive-deps -- outStops is constant per call site
  return useTransform(value, inStops, outs);
}
