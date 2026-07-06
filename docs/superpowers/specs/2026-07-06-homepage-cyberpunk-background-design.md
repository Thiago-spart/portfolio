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

The `Header` component (`Header.tsx`) becomes visible (fixed, `bg-[var(--header-bg)]`)
at the exact scroll position where the Hero's sticky pin releases and Experience
begins (`useScrollPastHero`, threshold `1.5 * viewport height`) — so the top of
Experience is what visually surrounds the Header the moment it appears.

## Goal

- The Experience section's background starts (top) matching the Header's current
  background color (`--header-bg`, which already differs between light and dark theme)
  so the Header blends into the page instead of looking like a disjoint floating bar.
- Moving down, the background transitions into the same fixed cyberpunk near-black
  (`#050508`) used by the Hero — regardless of which light/dark theme is active. Per
  `design-reference.md`, this aesthetic is a fixed design choice, not something that
  toggles with the site's light/dark theme.
- Skills, Q&A, and Contact continue that same flat `#050508` background, so the whole
  homepage below the Hero is one continuous dark backdrop with no further seams.
- Out of scope: the `/about` page, the Header's own background, the Hero's own
  background — none of these change.

## Approach

Add two CSS rules to `src/styles.css`, following the existing `.hero-section-bg`
naming convention (a named class per background treatment, not inline hex values):

```css
.cyberpunk-surface {
  background: #050508;
}

.experience-bg-transition {
  background: linear-gradient(180deg, var(--header-bg) 0%, #050508 400px, #050508 100%);
}
```

`--header-bg` is already theme-aware (defined once under `:root` for light, once under
`.dark` for dark — see `styles.css:23` and `styles.css:89`), so
`.experience-bg-transition` automatically starts at the right color for whichever theme
is active without any JS or per-theme duplication. The gradient fully resolves to
`#050508` within the first 400px of the section (roughly the length of the header-color
fade), then stays flat cyberpunk-dark for the rest of the section's height, however long
it is (the timeline can have any number of entries).

Apply the classes:
- `TimelineSection.tsx`: add `experience-bg-transition` to the `<section id="experience">` className.
- `SkillsSection.tsx`: add `cyberpunk-surface` to the `<section id="skills">` className.
- `QASection.tsx`: add `cyberpunk-surface` to the `<section id="qa">` className.
- `ContactSection.tsx`: add `cyberpunk-surface` to the `<section id="contact">` className.

No JSX restructuring, no new wrapper components — each section keeps rendering and
testing independently. No changes to any component's text or card colors: they already
assume a dark backdrop, so this fix also resolves the pre-existing legibility problem
against the old light background as a side effect.

## Out of scope

- `/about` page and any other route using the light "sea/lagoon" theme.
- `Header.tsx`'s own background, `HeroSection.tsx`'s own background.
- `SkillCard.tsx` / `ArchDiagram.tsx` internals — only the parent `<section>`
  background changes.
- Making the cyberpunk background theme-toggle-aware below the 400px transition zone
  (explicitly rejected — it's a fixed design choice per `design-reference.md`).
