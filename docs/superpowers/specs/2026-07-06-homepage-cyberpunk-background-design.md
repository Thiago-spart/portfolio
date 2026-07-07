# Homepage Below-Hero Sections: Fixed Cyberpunk Background

## Problem

The Hero section (`HeroSection.tsx`) uses a fixed near-black cyberpunk background
(`.hero-section-bg`, base color `#050508`, per `design-reference.md`'s "A Light That
Never Comes" aesthetic). Every section below it — Experience (`TimelineSection.tsx`),
Skills (`SkillsSection.tsx`), Q&A (`QASection.tsx`), and Contact (`ContactSection.tsx`)
— has no background of its own, so it inherits `body`'s light pastel "sea/lagoon"
gradient (`--bg-base`, `--hero-a`/`--hero-b` radial gradients). This causes two problems:

1. A hard, jarring color cut at the Hero → Experience boundary.
2. Skills/Q&A/Contact already use white/cyan text and dark card surfaces
   (`rgba(8,13,26,...)`, `text-white`, `rgba(255,255,255,...)`) designed for a dark
   backdrop — against the light pastel body background these are barely legible. This
   is a pre-existing readability bug, not just an aesthetic mismatch.

The Hero's `position: sticky` inner wrapper stays pinned to fill the viewport until it
releases (`HeroSection.tsx:38-39`, at `1.5 * viewport height` scrolled); at that exact
point, Experience's top edge is what scrolls up to visually touch Hero's bottom edge.
Since Hero's background is uniformly `#050508` across its whole area, that seam only
reads as smooth if Experience's top edge is that same dark color — not the (in light
theme, near-white) `--header-bg` color originally proposed here. An earlier version of
this spec called for Experience's top to match the `Header` component's background
instead; visual testing showed this was backwards; it produced a harder cut at the
Hero → Experience boundary than before, in light theme. That framing has been dropped —
this is a correction on live visual review, not a hypothesis carried forward.

## Goal

- The Experience section's background matches the Hero's background exactly
  (`#050508`) starting from its very top edge, so scrolling from Hero into Experience
  is seamless in both light and dark theme.
- Skills, Q&A, and Contact continue that same flat `#050508` background, so the whole
  homepage below the Hero — Experience included — is one continuous dark backdrop with
  no seams anywhere.
- This is a fixed design choice per `design-reference.md`'s "A Light That Never Comes"
  aesthetic — not something that toggles with the site's light/dark theme.
- Out of scope: the `/about` page, the Header's own background, the Hero's own
  background — none of these change.

## Approach

Add one CSS rule to `src/styles.css`, following the existing `.hero-section-bg`
naming convention (a named class per background treatment, not inline hex values):

```css
.cyberpunk-surface {
  background: #050508;
}
```

Apply this single class to all four sections:
- `TimelineSection.tsx`: add `cyberpunk-surface` to the `<section id="experience">` className.
- `SkillsSection.tsx`: add `cyberpunk-surface` to the `<section id="skills">` className.
- `QASection.tsx`: add `cyberpunk-surface` to the `<section id="qa">` className.
- `ContactSection.tsx`: add `cyberpunk-surface` to the `<section id="contact">` className.

No gradient, no `--header-bg` involvement, no per-section variation — all four sections
get the identical flat background, which is also identical to Hero's, so there is no
seam anywhere below the Hero. No JSX restructuring, no new wrapper components — each
section keeps rendering and testing independently. No changes to any component's text
or card colors: they already assume a dark backdrop, so this fix also resolves the
pre-existing legibility problem against the old light background as a side effect.

## Out of scope

- `/about` page and any other route using the light "sea/lagoon" theme.
- `Header.tsx`'s own background, `HeroSection.tsx`'s own background.
- `SkillCard.tsx` / `ArchDiagram.tsx` internals — only the parent `<section>`
  background changes.
- Making the cyberpunk background theme-toggle-aware (explicitly rejected — it's a
  fixed design choice per `design-reference.md`).
- Any gradient or `--header-bg`-based transition on Experience (superseded — see
  Problem section above).
