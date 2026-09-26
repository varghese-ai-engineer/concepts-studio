'use client';

/**
 * SceneRail — a thin left-rail navigator that shows the 7 story beats as ticks.
 *
 * The tick for the current beat fills ember. Clicking a tick smooth-scrolls
 * the document to that beat's section (deterministic jump — the scroll IS the
 * timeline, so jumping scroll jumps the whole film to that beat).
 *
 * This is the ONLY deliberate interactive layer of the journey. The robot and
 * scene layers carry `pointer-events: none` so they never block the page;
 * this rail is a real, focusable control.
 */

import { useRef } from 'react';
import { BEATS, beatIndexAt } from './beats';
import s from './journey.module.css';

export function SceneRail({ progressNumber }: { progressNumber: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeIndex = beatIndexAt(progressNumber);

  const jumpTo = (start: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = Math.max(0, Math.min(1, start)) * max;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <nav className={s.sceneRail} aria-label="Story chapters" ref={railRef}>
      <ol className={s.sceneRailList}>
        {BEATS.map((beat, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <li key={beat.id} className={s.sceneRailItem}>
              <button
                type="button"
                className={`${s.sceneRailTick} ${isActive ? s.sceneRailTickActive : ''} ${
                  isPast ? s.sceneRailTickPast : ''
                }`}
                onClick={() => jumpTo(beat.start)}
                aria-label={`${beat.label} — ${beat.capability}`}
                aria-current={isActive ? 'step' : undefined}
                title={`${beat.label} · ${beat.capability}`}
              >
                <span className={s.sceneRailDot} data-filled={isActive || isPast ? 'on' : 'off'} />
              </button>
              <span className={`${s.sceneRailLabel} ${isActive ? s.sceneRailLabelActive : ''}`}>
                {beat.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
