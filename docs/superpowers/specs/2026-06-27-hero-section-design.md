# Hero Section — Design Spec
**Date:** 2026-06-27  
**Status:** Approved

---

## Overview

A full-viewport hero section for the portfolio home page. Two-column layout: left side carries the text content and CTAs; right side renders an interactive 3D model that rotates as the user scrolls, following the Apple-style scroll-driven animation pattern.

The visual language follows the "A Light That Never Comes" design reference — dark, electric, industrial, neon blue/purple.

---

## 1. Layout & Structure

- **Height:** `100dvh` (dynamic viewport height, avoids mobile browser chrome issues)
- **Grid:** Two columns — left ~55%, right ~45% on desktop (`lg:` breakpoint). On mobile: single column, model stacks below text, model capped at `50dvh`.
- **Full bleed:** The hero section sits outside the `page-wrap` container so it spans the full viewport width. Inner content is horizontally constrained via padding.
- **Background:**
  - Base: `#050508` near-black
  - Radial glow behind model (right side): `rgba(0, 170, 255, 0.15)` electric blue
  - Radial bloom behind headline (left side): `rgba(123, 47, 255, 0.12)` neon purple
  - Overrides the existing body gradient within this section only

---

## 2. Left Column Content

### Badge
- Small pill at the top: `"Available for work"`
- Animated green pulse dot on the left
- Style: dark background (`rgba(5,5,8,0.8)`), electric blue border (`#00aaff` at 40% opacity), `rgba(255,255,255,0.85)` text
- Font size: `0.75rem`, letter-spacing wide

### Headline
- Font: `Bebas Neue` (display), very heavy, wide tracking
- Two lines — placeholder: `"Building things / for the web"` (to be replaced with final copy)
- Color: `#ffffff`
- Second line gets a subtle CSS text-shadow light-trail: `0 0 40px rgba(0,170,255,0.4)`
- Size: `clamp(3rem, 7vw, 6rem)` for fluid scaling

### Subtitle
- Font: `Inter`, regular weight
- Color: `rgba(255, 255, 255, 0.7)`
- One short paragraph describing who Thiago is and what he does (placeholder until copy is finalized)
- Max width: `480px`

### Button Row
Two buttons, side by side, with `gap-4`:

**Primary — "Get in touch"**
- Style: dark base (`rgba(5,5,8,0.9)`), glowing electric blue border (`1px solid #00aaff` + `box-shadow: 0 0 12px rgba(0,170,255,0.35)`)
- Text: `#c8f0ff` (cyan-white from design ref)
- Hover: border glow intensifies + 2-frame horizontal glitch flicker animation (horizontal slice offset, ~100ms total, CSS keyframes)
- Route: `<Link to="/contact">` (TanStack Router)

**Secondary — "See my work →"**
- Style: ghost/text, no background, muted white text with arrow
- Hover: text brightens to `#ffffff`, arrow translates right 4px
- Route: `<Link to="/projects">` (TanStack Router)

---

## 3. Right Column — 3D Canvas

### Model
- Source: [Living Things by [author] on Sketchfab](https://sketchfab.com/3d-models/living-things-7dc9e33d87004ddb86179a430e7e2871)
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — attribution required
- File: downloaded as `.glb`, placed at `/public/models/living-things.glb`
- Loaded via `useGLTF` from `@react-three/drei`
- Wrapped in `<Suspense>` — fallback is opacity 0 (no visible spinner)

### Lighting
Three lights for the dark electric split-tone look:
| Light | Color | Position | Intensity |
|-------|-------|----------|-----------|
| Ambient | white | — | 0.15 |
| Key/rim | `#00aaff` electric blue | upper-left | 2.0 |
| Fill | `#7b2fff` neon purple | lower-right | 1.2 |

### Camera
- Fixed position, slightly elevated angle looking at model center
- FOV: 45°
- No orbit controls — scroll is the only input

### Attribution
- Small text below the canvas: `3D model: "Living Things" by [author] — CC BY 4.0`
- Color: `#5a6a7a` (muted gray from design ref)
- Font size: `0.65rem`

---

## 4. Scroll Animation

### Library
`@react-three/drei` `ScrollControls` + `useScroll`

### Behavior
- `ScrollControls pages={1.5}` wraps the canvas scene — the hero "costs" 1.5 scroll lengths before the rest of the page appears
- `scroll.offset` (0 → 1) maps linearly to `rotation.y` (0 → 2π) — one full Y-axis rotation over the scroll range
- Applied in `useFrame` each tick: `model.rotation.y = scroll.offset * Math.PI * 2`
- No spring/damping — rotation is deterministic and reversible (scroll back = rotates back), matching the Apple approach

### Idle float
A subtle continuous Y-axis bob layered on top of the scroll rotation:
```
model.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.05
```
Makes the model feel alive when the user is not scrolling.

### Performance
- Canvas prop `frameloop="always"` — required for the continuous idle float animation (`clock.elapsedTime`)
- `IntersectionObserver` on the canvas container toggles a `paused` state that sets `frameloop="never"` when the hero scrolls fully off-screen, resuming with `"always"` when it re-enters the viewport

---

## 5. Component Structure

```
src/
  components/
    HeroSection.tsx   — layout grid, left column (badge, headline, subtitle, buttons)
    HeroCanvas.tsx    — R3F <Canvas>, lighting, ScrollControls, Suspense, attribution
    HeroModel.tsx     — useGLTF, useScroll, useFrame (rotation + idle float)
  routes/
    index.tsx         — updated to render <HeroSection> as first element
```

### New dependencies
```
@react-three/fiber
@react-three/drei
three
@types/three
```

### Out of scope (separate specs)
- `/contact` route content
- `/projects` route content
- Remaining home page sections (about, skills, etc.)

---

## 6. Open Items

- [ ] Confirm final headline and subtitle copy with Thiago
- [ ] Download `.glb` from Sketchfab and verify it loads correctly in R3F
- [ ] Confirm author name from Sketchfab for attribution line
- [ ] Add `Bebas Neue` font import to `styles.css`
