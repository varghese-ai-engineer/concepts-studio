'use client';

/**
 * JourneyBoundary — an error boundary around the cinematic Robot Journey.
 *
 * The journey (world + bot) is a PURE VISUAL LAYER. If anything inside it
 * throws — a WebGL context loss, a three/r3f chunk-load failure, a GPU error —
 * the boundary catches it and silently renders nothing. The page content
 * (hero, pricing, nav, loading intro) must NEVER be affected by a journey
 * failure. This guarantees "the page always loads its content."
 *
 * (React still requires error boundaries to be class components.)
 */

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class JourneyBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Log so failures are diagnosable, but do NOT propagate.
    console.warn('[JourneyBoundary] cinematic journey disabled due to error:', error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
