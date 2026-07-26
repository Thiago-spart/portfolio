# Design System — "A Light That Never Comes"
*Linkin Park x Steve Aoki*

This document is the single source of truth for the site's visual identity: brand mark, color, type, effects, layout, components, responsiveness, and motion. It supersedes `design-reference.md`.

---

## 1. Brand Identity Overview

**Name:** Thiago Souza
**Positioning:** A dark, electric, glitch-driven portfolio identity — high contrast, digital, alive. The aesthetic reads as intense and modern rather than corporate-clean: bright focal points isolated against near-black space, chromatic distortion as a deliberate texture, motion that snaps rather than glides.

**Mood keywords:** Dark · Electric · Raw · Industrial · Intense · Digital · Otherworldly · Urgent · Alive

---

## 2. Logo & Brand Mark

Current state: `public/logo192.png` / `logo512.png` / `favicon.ico` are the default Vite/React placeholder icon. These are **not** the brand mark and need to be replaced with real assets built to this spec.

### Wordmark
- Text: **"Thiago Souza"**
- Used in the header/nav, footer, and anywhere there's room for the full name.
- Set in **Bebas Neue**, uppercase, wide tracking — matching the Hero headline treatment.
- Color: pure white (`#ffffff`) on dark backgrounds, with an optional subtle electric-blue text-glow (`text-shadow: 0 0 20px rgba(0,170,255,0.35)`) for emphasis placements (e.g. footer).
- Occasional glitch treatment (RGB channel split / horizontal slice) on hover or entrance, consistent with heading glitch rules in §5.

### Monogram
- Text: **"TS"**
- Used wherever space is tight: favicon, `logo192.png`/`logo512.png` app icons, browser tab, social/OG image mark.
- The header nav does **not** use the graphic monogram — it uses plain text instead (see below), so the nav stays lightweight and consistent with the wordmark's typography.
- Construction: "TS" set in Bebas Neue inside a square/circular frame, near-black background (`#050508`), letters in electric blue (`#00aaff`) or cyan-white (`#c8f0ff`), with a single horizontal glitch-slice offset through the letterforms (one thin horizontal band shifted left/right by a few px, in neon purple `#7b2fff`) as the signature distinguishing mark.
- Must remain legible at 16×16 (favicon) — keep the glitch slice subtle enough not to break letter recognition at small sizes; a clean (non-glitched) fallback variant is acceptable for the 16px favicon specifically.

### Clear space & don'ts
- Maintain clear space around the mark equal to the cap-height of the "T".
- Don't place the wordmark or monogram on light/busy backgrounds — both are designed for near-black or deep-navy surfaces only.
- Don't stretch, recolor outside the palette in §3, or apply the glitch slice to more than one band at once (it should read as a glitch, not noise).

### Header nav wordmark
The header logo link is text-only, no icon: the full wordmark **"Thiago Souza"** at `sm` breakpoint and above, collapsing to the plain text initials **"TS"** below `sm` (not the graphic monogram — just the same Bebas Neue treatment at shorter text).

### Open task
Favicon/app-icon/OG-image asset production is implementation work, not covered by this document — see §11.

---

## 3. Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Near-black | `#050508` |
| Deep shadow | Dark navy-black | `#080d1a` |
| Primary accent | Electric blue | `#00aaff` |
| Secondary accent | Neon purple | `#7b2fff` |
| Energy burst | Cyan-white | `#c8f0ff` |
| Light core | Pure white | `#ffffff` |
| Ember/spark | Hot orange | `#ff6a00` |
| Muted text | Cool gray | `#5a6a7a` |

This is the canonical palette for the entire site — every section, not just the Hero. It maps to the existing `--electric-blue`, `--neon-purple`, `--near-black`, `--dark-navy`, `--cyan-white`, `--muted-gray` CSS variables already defined in `src/styles.css`. The `--sea-ink` / `--lagoon` / `--palm` / `--sand` / `--foam` ocean-theme variables are **deprecated** — see §11.

---

## 4. Typography

| Role | Treatment |
|------|-----------|
| Display / Hero text | Bebas Neue, heavy weight, wide tracking, motion blur or light-trail effect applied |
| Glitch heading treatment | Occasional horizontal slice offset on headings (RGB channel split) |
| Subheadings | Rajdhani (or equivalent geometric sans), thin weight, all-caps, high letter-spacing, electric blue |
| Body | Manrope, clean sans-serif, low-opacity white (`rgba(255,255,255,0.7)`) |

**Fonts to load:** `Bebas Neue`, `Rajdhani`, `Manrope`.

Fraunces (serif) has been removed from the identity — it was loaded in `styles.css` but the only class referencing it (`.display-title`) isn't used by any component. If a serif accent is wanted later, it should be proposed as a deliberate addition, not carried forward as unused leftover.

---

## 5. Visual Effects

### Glitch / Digital Distortion
- Horizontal slice displacement on text and images
- RGB chromatic aberration (red/blue channel offset)
- Scan line overlay (subtle repeating horizontal lines)
- Occasional full-frame noise/static burst

### Light & Glow
- Radial glow behind focal elements (electric blue / purple)
- Bloom effect on bright text and icons
- Light streak / motion trail on key UI transitions
- Blindingly bright core surrounded by dark falloff (vignette inverse)

### Particles & Atmosphere
- Floating ember/spark particles drifting upward
- Fine dust particles caught in light beams
- Subtle fog/haze layer over dark sections

### Textures
- Raw concrete or industrial texture at very low opacity as background overlay
- Digital noise grain over the entire canvas
- Occasional crack/fracture lines used as decorative dividers

---

## 6. Layout Principles

- **High contrast** — dark backgrounds with isolated bright focal points
- **Dramatic negative space** — let darkness breathe around elements
- **Asymmetric composition** — elements off-center, tension-driven layouts
- **Layered depth** — foreground particles, midground content, background glow
- **Full-viewport sections** — hero and key sections take 100dvh (already used in `HeroSection.tsx`)

---

## 7. UI Component Direction

### Buttons
- Dark base with glowing border (electric blue)
- Hover: light core glow + subtle glitch flicker animation
- Text in bright cyan-white

### Cards / Panels
- Semi-transparent dark surface (`rgba(8,13,26,0.85)`)
- Thin glowing border on one side (left or top)
- Subtle inner shadow in blue
- Interactive cards (e.g. Contact section links) use `src/components/ui/glow-card.tsx` — a pointer-tracking spotlight/border glow keyed to the palette in §3 (`blue`/`purple`/`ember` hues), reused wherever a hover-glow card is needed instead of one-off implementations

### Dividers
- Single pixel lines with gradient fade (blue → transparent)
- Or fractured/cracked line decorative element

### Navigation
- Transparent dark bar
- Active item: glowing underline in electric blue
- Hover: chromatic aberration ghost effect

### Images / Media
- Desaturated base with blue/purple duotone overlay
- Glitch frame on hover
- Scan line overlay at low opacity

---

## 8. Responsiveness

### Breakpoint scale
Default Tailwind breakpoints — no custom scale:

| Breakpoint | Min width | Status |
|------------|-----------|--------|
| `sm` | 640px | In active use |
| `md` | 768px | In active use |
| `lg` | 1024px | In active use |
| `xl` | 1280px | Not yet used |
| `2xl` | 1536px | Not yet used |

### Strategy — mobile-first
Build for the smallest viewport first, layer complexity in at each breakpoint.

- **Navigation** — full "Thiago Souza" wordmark at `sm` and above; collapses to plain-text "TS" below `sm` (see §2). Nav bar stays fixed/transparent-dark at all sizes. A hamburger/drawer collapse for the nav *links* themselves (as opposed to the wordmark) remains an open item — not yet implemented.
- **Hero** — the two-column `55fr/45fr` grid (`HeroSection.tsx`) with the 3D canvas is `lg`-and-up only; below `lg`, stack to a single column with text first, 3D canvas below (or a lighter static fallback if the WebGL scene is too heavy for mobile — evaluate at implementation time). Section stays `100dvh` at every size so text never gets cropped by mobile browser chrome.
- **Grids** (skills, projects, timeline) — single column below `sm`, 2 columns at `sm`–`md`, 3+ columns at `lg` and above. Card gap scales down proportionally on mobile to avoid excessive scroll length.
- **Typography scale** — display headlines use `clamp()` (already the pattern in `HeroSection.tsx`, e.g. `clamp(3rem,7vw,6rem)`) so type scales fluidly between breakpoints rather than jumping at fixed steps.
- **Touch targets** — all interactive elements (nav links, buttons, cards) maintain a minimum 44×44px hit area on touch viewports, even where the visual glyph is smaller.
- **Effects budget** — particle systems, blur/backdrop-filter, and glow layers are visually secondary on mobile; reduce particle count and glow radius below `md` to protect scroll performance on lower-powered devices. Glitch/scanline effects stay but should be lighter-weight (fewer simultaneous layers).
- **Viewport units** — prefer `dvh` over `vh` for full-screen sections (already correct in Hero) so mobile browser UI chrome doesn't cause layout jumps.

---

## 9. Animation Principles

- **Entrances** — elements fade in with a brief glitch burst, not a smooth slide
- **Transitions** — fast cuts or distortion wipes, avoid generic fades
- **Looping ambience** — particle system and background glow pulse slowly
- **Interaction feedback** — hover states trigger micro-glitch, not just color change
- **Timing** — snappy (100–200ms) with slight overshoot; nothing floaty

---

## 10. Mood Keywords

> Dark · Electric · Raw · Industrial · Intense · Digital · Otherworldly · Urgent · Alive

---

## 11. Current Gaps / Migration Notes

This document defines the *intended* canonical identity. As of writing, the codebase does not fully match it yet:

- **Ocean palette still live** — `src/styles.css` `:root`/`.dark` define `--sea-ink`, `--sea-ink-soft`, `--lagoon`, `--lagoon-deep`, `--palm`, `--sand`, `--foam` and related surface/line variables, and `Header.tsx` / `ThemeToggle.tsx` / lighting comments in `HeroCanvas.tsx` use them. These need to be migrated to the palette in §3 (or removed if superseded).
- **Fraunces cleanup** — the Google Fonts import and `.display-title` class in `src/styles.css` reference Fraunces, which is unused. Remove both.
- **Logo assets are placeholders** — `public/favicon.ico`, `logo192.png`, `logo512.png`, and `og-image.png`/`og-image.svg` are the default Vite/React icon, not the "TS" monogram / "Thiago Souza" wordmark defined in §2. New assets need to be produced and swapped in, and `public/manifest.json` reviewed for name/icon references.

None of the above is fixed by writing this document — they're tracked here so implementation work has a clear checklist.
