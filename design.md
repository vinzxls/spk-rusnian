# Design — Sistem Identifikasi Kecanduan Media Sosial (AHP + VIKOR)

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre

modern-minimal

The canonical Hallmark voice for polished enterprise / dev-tool / API dashboards. Stripe / Linear / ElevenLabs school: Geist sans, large confident displays, generous whitespace, pill CTAs, monochrome with optional accent. Minimalism with conviction, not the absence of choice.

Brief mentions any of: *SaaS, enterprise, API, platform, developer tool, infra, B2B, dashboard, billing*. Also pick when the user names a brand colour but the rest of the brief is restrained.

## Macrostructure family

App pages: **Workbench** — product screenshots in frames are the primary content. The page is a guided tour of the app in use. Less marketing copy, more "here's what you do with it."

Pages within this family share the family's shape; they vary only in component archetypes.

- App pages: Workbench (variation knobs: nav archetype, footer archetype, enrichment not allowed)

## Theme

- `--color-paper`   oklch(97% 0.02 230)      /* snow-white, near-white paper */
- `--color-paper-2` oklch(95% 0.03 240)      /* icy supplement */
- `--color-ink`     oklch(20% 0.03 230)      /* near-black body text */
- `--color-ink-2`   oklch(30% 0.02 240)      /* muted sidebar */
- `--color-rule`    oklch(88% 0.01 230)      /* hairline rules */
- `--color-accent`  oklch(60% 0.15 225)      /* royal blue accent — UnPattimura #1A3D6E */
- `--color-focus`   oklch(60% 0.2 225)       /* focus ring accent */

- `--font-display` "Geist Sans", system-ui, -apple-system, sans-serif
- `--font-body`    "Geist Sans", system-ui, -apple-system, sans-serif   /* single-family discipline */
- `--font-outlier` "JetBrains Mono", "Fira Code", Consolas, monospace

## Typography

- **Display** — Geist Sans 500–700. Letter-spacing tight (`-0.02em` to `-0.035em`).
- **Body** — Geist Sans 400. Same family as display (single-family discipline).
- **Mono** — JetBrains Mono 400 for code snippets / AHP matrix display.
- **Display tracking** — `-0.02em`.
- **Type scale anchor** — `clamp(1rem, 2vw + 0.5rem, 1.25rem)` for body.

## Spacing

4-point named scale. The values are in `tokens.css`. Pages must use named tokens (`var(--space-md)`), never raw values.

- `--space-3xs: 0.25rem;  --space-2xs: 0.5rem;  --space-xs: 0.75rem;`
- `--space-sm:  1rem;     --space-md:  1.5rem;  --space-lg: 2rem;`
- `--space-xl:  3rem;     --space-2xl: 4.5rem;  --space-3xl: 7rem;`

## Motion

- **Easings** — cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`.
- **Reveal pattern** — fade only. No bounces, no overshoot.
- **Reduced-motion fallback** — opacity-only, ≤ 150 ms.

## Microinteractions stance

- **Hover delay** — 800 ms (deliberate, not instant).
- **Focus delay** — 0 ms.
- **Other** — subtle shadow lift on active state.

## CTA voice

- **Primary CTA** — filled pill: `background: var(--color-accent); color: var(--color-ink); border-radius: var(--radius-pill); padding: var(--space-2) var(--space-4); font-weight: 500; transition: background var(--ease-out) 150ms.`
- **Secondary CTA** — outlined pill: `background: var(--color-ink); color: var(--color-accent); border: 1px solid var(--color-accent); border-radius: var(--radius-pill); padding: var(--space-2) var(--space-4); font-weight: 500; transition: background var(--ease-out) 150ms.`

## Per-page allowances

- App pages MUST NOT use enrichment — function carries the page.

## What pages MUST share

- The wordmark / logotype: SI (styled with var(--color-accent))
- The accent colour and its placement (≤ 5 % per viewport) — UnPattimura blue #1A3D6E
- The display + body fonts — Geist Sans throughout
- The CTA voice (button shape, border-radius, padding rhythm) — pills
- Section heading rhythm (numeral + label + display heading pattern)

## What pages MAY differ on

- Macrostructure within the page-type family (Workbench on dashboard pages)
- Nav archetype (within the family's allowance)
- Footer archetype (within the family's allowance)
- Component states (hover / focus / active / disabled / loading / error / success)

## Exports

See `export-formats.md` for the canonical mapping.

### tokens.css (Hallmark-required format)

```css
:root {
  --color-paper:      oklch(97% 0.02 230);
  --color-paper-2:    oklch(95% 0.03 240);
  --color-ink:        oklch(20% 0.03 230);
  --color-ink-2:      oklch(30% 0.02 240);
  --color-rule:       oklch(88% 0.01 230);
  --color-accent:     oklch(60% 0.15 225);
  --color-focus:      oklch(60% 0.2 225);

  --font-display: "Geist Sans", system-ui, -apple-system, sans-serif;
  --font-body:    "Geist Sans", system-ui, -apple-system, sans-serif;
  --font-outlier: "JetBrains Mono", "Fira Code", Consolas, monospace;

  --space-3xs: 0.25rem;  --space-2xs: 0.5rem;  --space-xs: 0.75rem;
  --space-sm:  1rem;     --space-md:  1.5rem;  --space-lg: 2rem;
  --space-xl:  3rem;     --space-2xl: 4.5rem;  --space-3xl: 7rem;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1.125rem;
  --text-lg: 1.375rem; --text-xl: 1.75rem;  --text-2xl: 2.25rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 220ms;
  --radius-card: 0.5rem; --radius-pill: 0.5rem; --radius-input: 0.375rem;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   oklch(97% 0.02 230);
  --color-ink:     oklch(20% 0.03 230);
  --color-accent:  oklch(60% 0.15 225);
  --font-display:  "Geist Sans", sans-serif;
  --font-body:     "Geist Sans", sans-serif;
  --spacing-md:    1.5rem;
  --text-md:       1.125rem;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":  { "$value": "oklch(97% 0.02 230)", "$type": "color" },
    "ink":    { "$value": "oklch(20% 0.03 230)", "$type": "color" },
    "accent": { "$value": "oklch(60% 0.15 225)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Geist Sans", "$type": "fontFamily" },
    "body":    { "$value": "Geist Sans", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:        oklch(97% 0.02 230);   /* paper */
  --foreground:        oklch(20% 0.03 230);   /* ink */
  --primary:           oklch(60% 0.15 225);   /* accent */
  --primary-foreground: oklch(20% 0.03 230);   /* ink on accent */
  --muted:             oklch(95% 0.02 240);   /* paper-2 */
  --muted-foreground:  oklch(40% 0.02 235);   /* rule */
  --border:            oklch(88% 0.01 230);   /* rule */
  --input:             oklch(93% 0.02 235);   /* rule */
  --ring:              oklch(60% 0.2 225);   /* focus */
  --radius:            0.5rem;
}
```

## Stamp signature for every page's CSS comment header:

```css
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
```

The `designed-as-app` flag tells future Hallmark runs to read `design.md`, not invent a new system.

### .hallmark/log.json (single entry for multi-page app)

```json
[
  {
    "date": "2026-10-08",
    "macrostructure": "Workbench",
    "theme": "modern-minimal (OKLCH palette anchored on UnPattimura blue)",
    "genre": "modern-minimal",
    "brief": "Sistem Identifikasi Kecanduan Media Sosial AHP+VIKOR Universitas Pattimura",
    "enrichment": "none"
  }
]
```

## Design rationale

- **Genre modern-minimal** fits an admin/dashboard system: professional, structured, no visual fluff.
- **OKLCH tokens** ensure cross-theme consistency and modern color science (no random hex gradients).
- **Geist Sans** as single-family font eliminates the "one-font template" anti-pattern.
- **Workbench macrostructure** guides users through the AHP+VIKOR workflow: pairwise comparison → data entry → results → ranking — as a guided tour of the app in use.
- **Pill CTA voice** is distinctive without being playful; fits the academic-unpatti brand blue.
- **No enrichment** on app pages keeps focus on the AHP/VIKOR engine function.
- **UnPattimura blue (#1A3D6E ≈ oklch(60% 0.15 225))** as accent ties back to the university brand while fitting the modern-minimal genre.