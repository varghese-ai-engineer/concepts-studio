# Concepts — Studio

Standalone Next.js app containing the **Studio** design concept, extracted from
the [aiassistant](https://github.com/varghese-ai-engineer/aiassistant) repo's
`/concepts/studio` page (originally served at
`https://test.app.webchat.aisolutioncraft.com/concepts/studio`).

## Routes

- `/` — the Studio design (same component)
- `/concepts/studio` — original path, kept for link parity

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## What was carried over

- `app/concepts/studio/page.tsx` → `StudioHome` component (incl. `journey/` scroll scenes)
- Shared concept utilities (`components/concepts/shared/concept-lib.ts`)
- Pricing components used by the page (`BillingIntervalToggle`, `PricingPlansGrid`)
- UI primitives (`button`, `card`), theme provider/context, globals.css, Tailwind v4 config

Everything else from the aiassistant monorepo (dashboards, auth, backend,
other concepts like `gallery`/`noir`) was intentionally excluded.
