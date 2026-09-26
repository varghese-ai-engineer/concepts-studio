'use client';

/**
 * Design 1 — STUDIO  (/concepts/studio)
 *
 * An editorial product-film landing experience. The page opens with a
 * production-mark intro — a large black circle + ember dot, centered and
 * dominant — that scales down and translates in ONE continuous motion to
 * its final top-left navigation position, where it becomes the permanent
 * site mark. No disappearance, no flash, no second render: the small mark
 * is the exact same visual object that started the sequence.
 *
 * Each chapter is a new scene revealed as you scroll, with intentional
 * timing, typography choreography, and continuity between sections.
 *
 * Pricing is fully API-driven (GET /api/v1/plans) but rendered in a
 * Studio-native presentation rather than a generic grid.
 *
 * Self-contained: owns palette/type tokens in a scoped .module.css,
 * does not touch the global theme system, globals.css, or any other page.
 * Desktop (≥1024px) gets the full motion; tablet/mobile get clean, lighter,
 * fully-usable compositions. All motion respects prefers-reduced-motion.
 *
 * Reuses: motion/react, next/font, @/components/ui/button, lucide-react,
 * the public pricing API + BillingIntervalToggle.
 */

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  Globe,
  Mic,
  Workflow,
  Users,
  BarChart3,
  Check,
  Loader2,
} from 'lucide-react';
import { useIsDesktop, useScrollProgress } from '@/components/concepts/shared/concept-lib';
import { BillingIntervalToggle } from '@/components/pricing/BillingIntervalToggle';
import { type PricingPlanDetails } from '@/components/pricing/PricingPlansGrid';
import { RobotJourney } from './journey/RobotJourney';
import { JourneyBoundary } from './journey/JourneyBoundary';
import api from '@/lib/api';
import s from './StudioHome.module.css';

// Soft, decelerating ease — never linear.
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_INOUT: [number, number, number, number] = [0.83, 0, 0.17, 1];

// Serif display face — instantiated here so the root layout's Geist setup
// is untouched. Self-hosted via next/font (no layout shift).
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-studio-serif',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});
const geist = Geist({ subsets: ['latin'], variable: '--font-studio-sans', display: 'swap' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-studio-mono',
  display: 'swap',
});

export function StudioHome() {
  const reduce = useReducedMotion();
  const progress = useScrollProgress();

  // Intro state: "loading" (large centered mark) → "traveling" (mark animates
  // to the nav position) → "done" (intro mark retired, nav mark owns the spot).
  const [introPhase, setIntroPhase] = useState<'loading' | 'traveling' | 'done'>(
    reduce ? 'done' : 'loading'
  );

  // Ref to the nav mark's SPACER (the 28px slot the mark will occupy).
  // Measuring the spacer — not the whole link — gives the true mark footprint,
  // so the hero mark scales down to ~28px, not stays ~168px.
  const navMarkSlotRef = useRef<HTMLSpanElement>(null);
  const [navMarkRect, setNavMarkRect] = useState<{ x: number; y: number; size: number } | null>(
    null
  );

  useEffect(() => {
    if (reduce) {
      setIntroPhase('done');
      return;
    }
    // Measure the nav mark slot's final position + size. Run after paint so
    // layout/fonts are settled, and again right before travel begins.
    const measure = () => {
      const el = navMarkSlotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0) return; // not laid out yet
      setNavMarkRect({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        size: r.width, // ~28
      });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    // Hold the production mark, re-measure right before travel (fonts/layout
    // may have shifted the nav slot since mount), then travel, then settle.
    const t1 = setTimeout(() => {
      const el = navMarkSlotRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0) {
          setNavMarkRect({ x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width });
        }
      }
      setIntroPhase('traveling');
    }, 1900);
    const t2 = setTimeout(() => setIntroPhase('done'), 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce]);

  // Knowledge-engine pinned pipeline scroll.
  const pipelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pipelineProgress } = useScroll({
    target: pipelineRef,
    offset: ['start center', 'end center'],
  });
  const drawLength = useTransform(pipelineProgress, [0.05, 0.85], [0, 1]);
  const activeStage = useTransform(pipelineProgress, (v) => {
    const stages = 5;
    return Math.min(stages - 1, Math.max(0, Math.floor(v * stages)));
  });

  const lockScroll = introPhase !== 'done' && !reduce;

  return (
    <div
      className={`${s.page} ${fraunces.variable} ${geist.variable} ${geistMono.variable}`}
      data-reduce={reduce ? 'on' : 'off'}
      data-intro={introPhase}
      style={lockScroll ? { overflow: 'hidden' } : undefined}
    >
      {/* ---------- TOP SCROLL-PROGRESS BAR ---------- */}
      <div className={s.progressBar} aria-hidden>
        <div className={s.progressFill} style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/*
        ---------- THE MARK (single persistent element) ----------
        ONE element, always mounted, opacity never changes. It starts large +
        centered during loading, then continuously scales + translates to the
        measured nav-mark position and STAYS there forever — becoming the
        permanent nav mark. It never unmounts, never fades, never re-renders.
        The nav slot below reserves layout space but renders no visible mark;
        this element sits fixed on top of it once it lands.
      */}
      <TravelingMark phase={introPhase} navMarkRect={navMarkRect} reduce={reduce} />

      {/* ---------- INTRO VEIL + WORDMARK (separate, allowed to fade) ---------- */}
      <IntroBackdrop phase={introPhase} reduce={reduce} />

      {/* ---------- NAV ---------- */}
      {/* The nav only fades in — its Y position is NEVER animated, so the title
          and mark slot stay in their final layout position at all times. This
          keeps the measured mark-slot coordinates stable and the title exactly
          where it belongs. */}
      <motion.nav
        className={s.nav}
        initial={false}
        animate={{ opacity: introPhase === 'done' ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        data-scrolled={progress > 0.02 ? 'on' : 'off'}
      >
        <div className={s.shell}>
          {/* Nav brand link. During the intro (loading/traveling) the slot is a
              measured spacer so the floating TravelingMark can land on it. Once
              the intro is DONE, the real BrandMark renders inline here — right
              next to the title, in normal flow — so it can NEVER float or drift
              away from the title. */}
          <Link href="/concepts" className={s.brand} aria-label="AI Solution Craft — home">
            {introPhase === 'done' ? (
              <BrandMark size="nav" />
            ) : (
              <span ref={navMarkSlotRef} className={s.brandMarkSpacer} aria-hidden />
            )}
            <span className={s.brandName}>AI Solution Craft</span>
          </Link>
        </div>
      </motion.nav>

      {/* ---------- CINEMATIC ROBOT JOURNEY (scroll = film timeline) ----------
          Mounted only AFTER the loading intro completes, so the mark→nav
          transform is never disturbed. The journey is a pure visual layer:
          world + bot carry pointer-events:none; only the SceneRail is
          interactive. Page content below stays fully usable.

          Wrapped in an error boundary so ANY journey failure (WebGL context
          loss, three/r3f chunk-load error, GPU issue) degrades silently — the
          page content + loading intro must NEVER be affected. */}
      {introPhase === 'done' && (
        <JourneyBoundary>
          <RobotJourney />
        </JourneyBoundary>
      )}

      <main className={s.main}>
        {/* ---------- CHAPTER 1: HERO ---------- */}
        <section className={s.hero} aria-label="Introduction">
          <div className={s.shell}>
            <motion.p
              className={s.eyebrow}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: introPhase === 'done' ? 1 : 0,
                y: introPhase === 'done' ? 0 : 12,
              }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              <Sparkles className="size-3.5" /> AI that understands your website
            </motion.p>

            <h1 className={s.heroTitle}>
              <WordReveal text="Your website," at={introPhase === 'done'} delay={0.15} reduce={reduce} />
              <br />
              <WordReveal text="finally" at={introPhase === 'done'} delay={0.55} reduce={reduce} />{' '}
              <span className={s.ember}>
                <WordReveal text="understood." at={introPhase === 'done'} delay={0.75} reduce={reduce} />
                <span className={s.caret} aria-hidden />
              </span>
            </h1>

            <motion.p
              className={s.heroLead}
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: introPhase === 'done' ? 1 : 0,
                y: introPhase === 'done' ? 0 : 16,
              }}
              transition={{ duration: 0.8, ease: EASE, delay: 1.0 }}
            >
              An AI assistant that reads every page of your site, answers your
              customers in any language, and turns conversations into revenue.
            </motion.p>

            <motion.div
              className={s.heroCta}
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: introPhase === 'done' ? 1 : 0,
                y: introPhase === 'done' ? 0 : 16,
              }}
              transition={{ duration: 0.8, ease: EASE, delay: 1.3 }}
            >
              <Link href="/register">
                <Button size="lg">
                  Start free <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg">
                  See pricing
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Bottom film-scrubber (the page IS the film) */}
          <motion.div
            className={s.scrubber}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: introPhase === 'done' ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.5 }}
          >
            <div className={s.shell}>
              <span className={s.scrubberLabel}>SCENE 01</span>
              <div className={s.scrubberTrack}>
                <div className={s.scrubberHead} style={{ left: `${progress * 100}%` }} />
              </div>
              <span className={s.scrubberTime}>{Math.round(progress * 100)}%</span>
            </div>
          </motion.div>
        </section>

        {/* ---------- CHAPTER 2: PROBLEM ---------- */}
        <section className={s.chapter} aria-labelledby="problem-h">
          <div className={s.shell}>
            <SceneShell>
              <motion.blockquote className={s.pullquote} {...sceneReveal()}>
                <span className={s.quoteMark} aria-hidden>
                  &ldquo;
                </span>
                <p id="problem-h">
                  Every day, visitors arrive with questions. Your site can&rsquo;t
                  talk back. They leave. The sale leaves with them.
                </p>
                <cite className={s.cite}>The silent checkout problem</cite>
              </motion.blockquote>
            </SceneShell>
          </div>
        </section>

        {/* ---------- CHAPTER 3: KNOWLEDGE ENGINE (pinned SVG pipeline) ---------- */}
        <section ref={pipelineRef} className={s.chapter} aria-labelledby="engine-h">
          <div className={s.shell}>
            <SceneShell>
              <motion.p className={s.eyebrow} {...sceneReveal()}>
                <Workflow className="size-3.5" /> Knowledge engine
              </motion.p>
              <motion.h2 id="engine-h" className={s.chapterTitle} {...sceneReveal(0.08)}>
                It reads your site the way a new hire would.
              </motion.h2>
              <motion.p className={s.chapterLead} {...sceneReveal(0.16)}>
                Crawl, chunk, embed, retrieve. A pipeline that turns your content
                into answers — drawn here as it happens.
              </motion.p>

              <PipelineDiagram progress={drawLength} activeStage={activeStage} reduce={reduce} />
            </SceneShell>
          </div>
        </section>

        {/* ---------- CHAPTER 4: VOICE & MULTILINGUAL ---------- */}
        <section className={s.chapter} aria-labelledby="voice-h">
          <div className={s.shell}>
            <SceneShell>
              <motion.p className={s.eyebrow} {...sceneReveal()}>
                <Mic className="size-3.5" /> Voice &amp; language
              </motion.p>
              <motion.h2 id="voice-h" className={s.chapterTitle} {...sceneReveal(0.08)}>
                Speaks your customer&rsquo;s language. Out loud.
              </motion.h2>

              <div className={s.voiceGrid}>
                <motion.div className={s.voiceCard} {...sceneReveal(0.16)}>
                  <Waveform reduce={reduce} />
                  <p className={s.voiceCaption}>
                    Real-time voice powered by LiveKit. Tap, talk, get an answer.
                  </p>
                </motion.div>

                <motion.div className={s.voiceCard} {...sceneReveal(0.28)}>
                  <LanguageCycle reduce={reduce} />
                  <p className={s.voiceCaption}>
                    One assistant, twelve languages — detected automatically.
                  </p>
                </motion.div>
              </div>
            </SceneShell>
          </div>
        </section>

        {/* ---------- CHAPTER 5: AUTOMATION & RESULTS ---------- */}
        <section className={s.chapter} aria-labelledby="results-h">
          <div className={s.shell}>
            <SceneShell>
              <motion.p className={s.eyebrow} {...sceneReveal()}>
                <BarChart3 className="size-3.5" /> Automation &amp; results
              </motion.p>
              <motion.h2 id="results-h" className={s.chapterTitle} {...sceneReveal(0.08)}>
                From conversation to closed deal.
              </motion.h2>

              <div className={s.resultsGrid}>
                {RESULTS.map((r, i) => (
                  <motion.div key={r.title} className={s.resultCard} {...sceneReveal(0.16 + i * 0.1)}>
                    <span className={s.resultIcon} aria-hidden>
                      <r.icon />
                    </span>
                    <h3 className={s.resultTitle}>{r.title}</h3>
                    <p className={s.resultText}>{r.text}</p>
                  </motion.div>
                ))}
              </div>
            </SceneShell>
          </div>
        </section>

        {/* ---------- CHAPTER 6: PRICING (API-driven, Studio-native presentation) ---------- */}
        <StudioPricing />

        {/* ---------- CHAPTER 7: FINAL CTA ---------- */}
        <section className={s.finalCta} aria-labelledby="cta-h">
          <div className={s.shell}>
            <SceneShell>
              <motion.h2 id="cta-h" className={s.finalTitle} {...sceneReveal()}>
                Give your website a voice.
              </motion.h2>
              <motion.p className={s.finalLead} {...sceneReveal(0.1)}>
                Set up in minutes. No credit card to start.
              </motion.p>
              <motion.div className={s.finalButtons} {...sceneReveal(0.2)}>
                <Link href="/register">
                  <Button size="lg">
                    Start free <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/concepts">
                  <Button variant="outline" size="lg">
                    Compare all designs
                  </Button>
                </Link>
              </motion.div>
            </SceneShell>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className={s.footer}>
        <div className={s.shell}>
          <span>AI Solution Craft · Design 1 of 3</span>
          <span>AI Solution Craft</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   TravelingMark — THE mark. One persistent element.
   Always mounted (never returns null), opacity never changes (always 1).
   Starts large + centered during loading, then continuously scales +
   translates to the measured nav position and STAYS there forever. It does
   not unmount, does not fade, does not crossfade into another mark. The
   "done" phase simply means it has arrived at its permanent home.
   ============================================================ */

function TravelingMark({
  phase,
  navMarkRect,
  reduce,
}: {
  phase: 'loading' | 'traveling' | 'done';
  navMarkRect: { x: number; y: number; size: number } | null;
  reduce: boolean | null;
}) {
  // The mark's natural (un-scaled) size in the hero state.
  const HERO_SIZE = 168;

  // Once the intro is done, the inline nav BrandMark takes over (rendered in
  // normal flow next to the title). The floating traveling mark retires here.
  // Because it landed exactly on the nav slot (same 28px size, same coords),
  // the handoff is visually seamless — no flash, no gap, and the inline mark
  // can NEVER float away from the title.
  if (phase === 'done' || reduce) return null;

  // Target geometry, derived from the measured nav slot. Until measured, the
  // mark stays centered at scale 1.
  const targetScale = navMarkRect ? navMarkRect.size / HERO_SIZE : 1;
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 900;
  // Translate from viewport center (the fixed mark's origin) to nav mark center.
  const targetX = navMarkRect ? navMarkRect.x - winW / 2 : 0;
  const targetY = navMarkRect ? navMarkRect.y - winH / 2 : 0;

  // "settled" = the mark is traveling toward the nav slot. (done/reduce return early above.)
  const settled = phase === 'traveling' && navMarkRect !== null;

  return (
    <motion.div
      className={s.travelingMark}
      aria-hidden
      // opacity is deliberately NEVER animated — it stays 1 during the travel.
      initial={{ scale: 1, x: 0, y: 0 }}
      animate={{
        scale: settled ? targetScale : 1,
        x: settled ? targetX : 0,
        y: settled ? targetY : 0,
      }}
      transition={{
        duration: settled ? 1.25 : 0,
        ease: EASE_INOUT,
      }}
      style={{ pointerEvents: 'none' }}
    >
      <BrandMark size="hero" />
    </motion.div>
  );
}

/* ============================================================
   IntroBackdrop — the dimming veil + loading wordmark.
   These are NOT the mark, so they are allowed to fade out as the page
   reveals. The mark itself (TravelingMark) is completely separate and
   never fades.
   ============================================================ */

function IntroBackdrop({
  phase,
  reduce,
}: {
  phase: 'loading' | 'traveling' | 'done';
  reduce: boolean | null;
}) {
  if (reduce || phase === 'done') return null;
  const traveling = phase === 'traveling';

  return (
    <motion.div className={s.intro} aria-hidden initial={false}>
      {/* Dimming backdrop that lifts as the mark travels. */}
      <motion.div
        className={s.introVeil}
        initial={{ opacity: 1 }}
        animate={{ opacity: traveling ? 0 : 1 }}
        transition={{ duration: 1.0, ease: EASE_INOUT }}
      />

      {/* Wordmark shown only during the centered loading beat.
          NOTE: do NOT animate x/y here — motion would take over `transform`
          and clobber the CSS `translateX(-50%)` that centers the wordmark
          on screen. Only animate opacity + letterSpacing (non-transform). */}
      <AnimatePresence>
        {!traveling && (
          <motion.div
            className={s.introWord}
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.18em' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
          >
            AI SOLUTION CRAFT
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================
   BrandMark — the single identity. The TravelingMark renders this at
   hero scale; it scales down to nav scale via the parent transform.
   ============================================================ */

function BrandMark({ size = 'nav' }: { size?: 'nav' | 'hero' }) {
  return (
    <span className={`${s.brandMark} ${size === 'hero' ? s.brandMarkHero : ''}`} aria-hidden>
      <span className={s.brandMarkRing} />
      <span className={s.brandMarkDot} />
    </span>
  );
}

/* ============================================================
   Scene choreography helpers
   ============================================================ */

/** Wraps a scene's content; the wrapper itself does a soft opacity reveal
 *  so scenes arrive as units (continuity) rather than piece-by-piece noise. */
function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={s.sceneShell}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Per-element scene reveal: fade + rise with a decelerating ease. */
function sceneReveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10% 0px' },
    transition: { duration: 0.95, ease: EASE, delay },
  } as const;
}

/** Reveals a word/phrase with a staggered fade+rise once the intro is done. */
function WordReveal({
  text,
  at,
  delay,
  reduce,
}: {
  text: string;
  at: boolean;
  delay: number;
  reduce: boolean | null;
}) {
  if (reduce) return <>{text}</>;
  return (
    <motion.span
      style={{ display: 'inline-block' }}
      initial={{ opacity: 0, y: '0.4em' }}
      animate={at ? { opacity: 1, y: 0 } : { opacity: 0, y: '0.4em' }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {text}
    </motion.span>
  );
}

/* ============================================================
   Knowledge-engine pipeline diagram
   ============================================================ */

function PipelineDiagram({
  progress,
  activeStage,
  reduce,
}: {
  progress: any;
  activeStage: any;
  reduce: boolean | null;
}) {
  const stages = [
    { label: 'Crawl', icon: Globe },
    { label: 'Chunk', icon: Workflow },
    { label: 'Embed', icon: Sparkles },
    { label: 'Retrieve', icon: BarChart3 },
    { label: 'Answer', icon: Check },
  ];

  return (
    <motion.div
      className={s.pipeline}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <svg className={s.pipelineLine} viewBox="0 0 1000 4" preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1="2" x2="1000" y2="2" className={s.lineTrack} />
        <motion.line
          x1="0"
          y1="2"
          x2="1000"
          y2="2"
          className={s.lineDraw}
          style={{ pathLength: reduce ? 1 : progress }}
        />
      </svg>

      <ol className={s.pipelineStages}>
        {stages.map((stage, i) => (
          <PipelineStage
            key={stage.label}
            index={i}
            label={stage.label}
            Icon={stage.icon}
            activeStage={activeStage}
            reduce={reduce}
          />
        ))}
      </ol>
    </motion.div>
  );
}

function PipelineStage({
  index,
  label,
  Icon,
  activeStage,
  reduce,
}: {
  index: number;
  label: string;
  Icon: any;
  activeStage: any;
  reduce: boolean | null;
}) {
  const [active, setActive] = useState(reduce ? true : false);
  useEffect(() => {
    if (reduce) return;
    const unsub = activeStage.on('change', (v: number) => setActive(v >= index));
    return () => unsub();
  }, [activeStage, index, reduce]);

  return (
    <li className={s.pipelineStage} data-active={active ? 'on' : 'off'}>
      <span className={s.stageNode}>
        <Icon className="size-4" />
      </span>
      <span className={s.stageLabel}>
        <span className={s.stageIndex}>0{index + 1}</span>
        {label}
      </span>
    </li>
  );
}

/* ============================================================
   Voice & multilingual
   ============================================================ */

function Waveform({ reduce }: { reduce: boolean | null }) {
  const bars = 28;
  return (
    <div className={s.waveform} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className={s.waveBar}
          animate={reduce ? undefined : { scaleY: [0.3, 0.9 + Math.sin(i * 0.7) * 0.3, 0.4] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: 1.4 + (i % 5) * 0.12,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: EASE,
                  delay: i * 0.04,
                }
          }
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
}

function LanguageCycle({ reduce }: { reduce: boolean | null }) {
  const langs = [
    { word: 'Hello', sub: 'English' },
    { word: 'नमस्ते', sub: 'Hindi' },
    { word: '你好', sub: 'Chinese' },
    { word: 'مرحبا', sub: 'Arabic' },
    { word: 'Hola', sub: 'Spanish' },
    { word: 'বাংলা', sub: 'Bengali' },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % langs.length), 1600);
    return () => clearInterval(t);
  }, [reduce, langs.length]);

  return (
    <div className={s.langCycle}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          className={s.langWord}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {langs[i].word}
        </motion.span>
      </AnimatePresence>
      <span className={s.langSub}>{langs[i].sub}</span>
    </div>
  );
}

/* ============================================================
   PRICING — API-driven, Studio-native presentation.
   Data comes from GET /api/v1/plans (no hardcoded prices). Logic reused
   (BillingIntervalToggle + the same checkout-intent pattern). Presentation
   is redesigned to belong to this page: numbered tiers, serif names,
   hairline rules, ember accent, staggered reveal.
   ============================================================ */

function StudioPricing() {
  const [plans, setPlans] = useState<PricingPlanDetails[]>([]);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/v1/plans')
      .then((res) => {
        if (!cancelled) setPlans(res.data || []);
      })
      .catch((err) => {
        console.error('StudioPricing: failed to load plans:', err);
        if (!cancelled) setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visiblePlans = plans
    .filter((p) => p.code !== 'free')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .slice(0, 3);

  const goCheckout = (plan: PricingPlanDetails) => {
    sessionStorage.setItem(
      'checkout_intent',
      JSON.stringify({
        flow: 'subscribe',
        plan: plan.code.replace('_monthly', '').replace('_yearly', ''),
        billing_interval: billingInterval,
        trial_mode: false,
        coupon: null,
        referral: null,
        return_url: null,
      })
    );
    window.location.href = '/register';
  };

  return (
    <section id="pricing" className={s.chapter} aria-labelledby="pricing-h">
      <div className={s.shell}>
        <SceneShell>
          <motion.p className={s.eyebrow} {...sceneReveal()}>
            <Sparkles className="size-3.5" /> Pricing
          </motion.p>
          <motion.h2 id="pricing-h" className={s.chapterTitle} {...sceneReveal(0.08)}>
            Simple pricing that scales with you.
          </motion.h2>
          <motion.p className={s.chapterLead} {...sceneReveal(0.16)}>
            Start free. Upgrade when you are ready. Every plan includes the full
            knowledge engine, voice, and multilingual support.
          </motion.p>

          <motion.div
            className={s.priceToggleRow}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            <BillingIntervalToggle billingInterval={billingInterval} onChange={setBillingInterval} />
          </motion.div>

          {loading ? (
            <div className={s.priceLoading} aria-live="polite">
              <Loader2 className="size-5 animate-spin" style={{ color: 'var(--c-ink-faint)' }} />
              <span>Loading plans…</span>
            </div>
          ) : visiblePlans.length === 0 ? (
            <p className={s.priceEmpty}>Plans are temporarily unavailable. Please try again later.</p>
          ) : (
            <ol className={s.priceList}>
              {visiblePlans.map((plan, i) => (
                <StudioPriceCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  billingInterval={billingInterval}
                  onChoose={() => goCheckout(plan)}
                />
              ))}
            </ol>
          )}

          <motion.div
            className={s.priceFootnote}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          >
            <span>Prices in {visiblePlans[0]?.currency || 'USD'}. Adjusts to your region.</span>
            <Link href="/register" className={s.priceSeeAll}>
              See all plans <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        </SceneShell>
      </div>
    </section>
  );
}

function StudioPriceCard({
  plan,
  index,
  billingInterval,
  onChoose,
}: {
  plan: PricingPlanDetails;
  index: number;
  billingInterval: 'monthly' | 'yearly';
  onChoose: () => void;
}) {
  const baseCode = plan.code.replace('_monthly', '').replace('_yearly', '');
  const isFree = plan.monthly_price === 0;
  const isFeatured = index === 1; // middle tier gets the ember accent
  const monthly = billingInterval === 'yearly' ? plan.yearly_price / 12 : plan.monthly_price;
  const [symbol, ...rest] = (plan.symbol || '').split(' ');
  const symbolSuffix = rest.join(' ');

  return (
    <motion.li
      className={`${s.priceCard} ${isFeatured ? s.priceCardFeatured : ''}`}
      data-free={isFree ? 'on' : 'off'}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.12 }}
    >
      <div className={s.priceCardHead}>
        <span className={s.priceTierIndex}>0{index + 1}</span>
        <span className={s.priceTierName}>{plan.name}</span>
        {isFeatured && <span className={s.priceBadge}>Most chosen</span>}
      </div>

      <p className={s.priceDesc}>{plan.description || ''}</p>

      <div className={s.priceAmountRow}>
        <span className={s.priceSymbol}>{symbol}</span>
        <span className={s.priceAmount}>{isFree ? '0' : Math.round(monthly).toLocaleString()}</span>
        {symbolSuffix && <span className={s.priceSymbolSuffix}>{symbolSuffix}</span>}
        <span className={s.pricePer}>/ mo</span>
      </div>
      <p className={s.priceBilledNote} data-on={billingInterval === 'yearly' && !isFree ? 'on' : 'off'}>billed annually</p>

      <ul className={s.priceFeatures}>
        {plan.features.slice(0, 5).map((f, fi) => (
          <li key={fi} className={s.priceFeature}>
            <Check className={`size-3.5 ${s.priceCheck}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button className={s.priceCta} onClick={onChoose} data-variant={isFeatured ? 'solid' : 'outline'}>
        {isFree ? 'Start free' : `Choose ${baseCode}`}
      </button>
    </motion.li>
  );
}

/* ============================================================
   Static content
   ============================================================ */

const RESULTS = [
  {
    title: 'Lead capture',
    text: 'Every conversation becomes a qualified lead, routed to the right inbox automatically.',
    icon: Users,
  },
  {
    title: 'Human handoff',
    text: 'When it matters, the assistant hands off to a human with full context — no repeated questions.',
    icon: ArrowRight,
  },
  {
    title: 'Analytics',
    text: 'See what people ask, what is missing, and where you lose them — in real time.',
    icon: BarChart3,
  },
];
