/**
 * beats — the 7 story beats of the AI Assistant journey.
 *
 * The journey is the product value chain, top to bottom:
 *   arrival → problem → crawl → knowledge → understanding → voice → conversion
 *
 * `start` is the scroll-progress (0..1) at which each beat begins. The last
 * beat ends at 1.0. These are the SINGLE source of truth used by the scene
 * rail, the CSS-3D world layers, and the robot's per-beat poses — so the
 * whole experience is driven by one timeline.
 *
 * NOTE: every entry maps to a real AI Assistant capability. No decorative beats.
 */

export interface Beat {
  id: string;
  /** Scroll-progress (0..1) at which this beat starts. */
  start: number;
  /** One-line story label shown in the scene rail. */
  label: string;
  /** The AI capability this beat communicates. */
  capability: string;
}

export const BEATS: Beat[] = [
  { id: 'arrival',     start: 0.0,  label: 'Arrival',          capability: 'Your website, finally understood' },
  { id: 'problem',     start: 0.12, label: 'The silent problem', capability: 'Visitors leave unanswered' },
  { id: 'crawl',       start: 0.26, label: 'Crawling the site',  capability: 'Website crawling' },
  { id: 'knowledge',   start: 0.42, label: 'Knowledge core',     capability: 'Knowledge base + vector DB' },
  { id: 'understanding', start: 0.58, label: 'Understanding',    capability: 'RAG retrieval + reasoning' },
  { id: 'voice',       start: 0.74, label: 'Voice & language',   capability: 'Voice AI + multilingual' },
  { id: 'conversion',  start: 0.88, label: 'Conversion',         capability: 'Lead capture + handoff' },
];

/** Total vertical travel of the 3D world (in px) as the camera dollies down. */
export const WORLD_DEPTH = 4200;

/** Returns the beat index active at a given 0..1 progress. */
export function beatIndexAt(progress: number): number {
  for (let i = BEATS.length - 1; i >= 0; i--) {
    if (progress >= BEATS[i].start) return i;
  }
  return 0;
}
