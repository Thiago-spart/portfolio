---
name: Thiago Souza — Portfolio
description: Engineering you can measure.
colors:
  ground: "#f3f5f0"
  surface-raised: "#ffffff"
  surface-sunken: "#e7ebe2"
  line: "#d2d9cb"
  line-strong: "#7a8771"
  ink: "#15201a"
  ink-muted: "#4f5c52"
  mangrove: "#1f5a3f"
  mangrove-soft: "#dbeadf"
  on-mangrove: "#f3f5f0"
  mango: "#a84d05"
  mango-soft: "#fbe8cf"
  on-mango: "#ffffff"
  score-good: "#0b6e6e"
  score-average: "#7a6400"
  score-poor: "#c0262d"
  logo-cursor: "#f4a340"
  ground-dark: "#0d1510"
  surface-raised-dark: "#141f18"
  surface-sunken-dark: "#080e0a"
  line-dark: "#26352b"
  line-strong-dark: "#617564"
  ink-dark: "#e6eee7"
  ink-muted-dark: "#9fb0a3"
  mangrove-dark: "#6fcf9a"
  mangrove-soft-dark: "#173526"
  mango-dark: "#f4a340"
  mango-soft-dark: "#3a2810"
  score-good-dark: "#62c3ea"
  score-average-dark: "#e3c443"
  score-poor-dark: "#ff6b6b"
typography:
  display-xl:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "76px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  display-l:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: "56px"
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Newsreader, Georgia, 'Times New Roman', serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "28px"
  lede:
    fontFamily: "'Public Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "30px"
  body:
    fontFamily: "'Public Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  small:
    fontFamily: "'Public Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  metric:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
  metric-s:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "28px"
    letterSpacing: "-0.02em"
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.06em"
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "22px"
  button:
    fontFamily: "'Public Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.mangrove}"
    textColor: "{colors.on-mangrove}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.mangrove-soft}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mangrove}"
    typography: "{typography.button}"
    padding: "0 8px"
    height: "44px"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "26px"
  tag-core:
    backgroundColor: "{colors.mangrove-soft}"
    textColor: "{colors.mangrove}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "26px"
  case-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Thiago Souza — Portfolio

## Overview

**Creative North Star: "The Engineering Sheet"**

The site reads like a drawing sheet from an engineering office: a pale drafting ground, hairline rules, dimension lines, numbered callouts, mono labels and a title block. Nothing is decorative for its own sake; every mark either carries information or frames it. The hero's mangrove is drawn as technical line art by day and as glowing points by night, and the same sheet logic runs through the case studies (numbered parts) and the experience timeline (a rail with markers).

The personality is precise and quiet. Surfaces are flat, lines are thin, color is rare, and the measured results are the loudest thing on any screen. A serif with editorial weight (Newsreader) gives headlines a human voice; a plain sans (Public Sans) carries the reading; a mono (JetBrains Mono) is reserved for numbers, labels and anything that is measured. Light is the day sheet at low tide, dark is the night sheet at high tide: the same tokens, never two designs.

The old dark, electric, glitch identity ("A Light That Never Comes") is retired: no glows, no chromatic distortion, no Bebas Neue.

**Key Characteristics:**
- Flat, pale green-grey ground with hairline structure.
- One accent, mango, used once per view.
- Numbers in mono, before → after, with a real minus sign.
- Serif headlines, sans reading, mono measurement.
- Drafting vocabulary: grid, rails, dimension lines, numbered callouts, title block.

## Colors

A restrained green-neutral palette from a mangrove at the tide line, with a single warm accent and three score colors that exist only to grade results.

### Primary
- **Mangrove Green** (light #1f5a3f, dark #6fcf9a): the brand voice in color. Primary buttons, links, core Tags, the current-role marker, case-study link labels, hover states. Mangrove Soft (#dbeadf / #173526) is its tint for core Tag fills, secondary button hover and selection.

### Tertiary
- **Mango** (light #a84d05, dark #f4a340): the single accent and the focus ring. The headline metric on the first featured case card, the mango in the hero drawing, and the 2px focus ring. Mango Soft (#fbe8cf / #3a2810) is reserved for its background tint.
- **Logo Cursor** (light #f4a340, dark #874004): the mango "cursor" in the monogram. It is part of the logo and exempt from the once-per-view rule.

### Score
- **Score Good** (#0b6e6e / #62c3ea), **Score Average** (#7a6400 / #e3c443), **Score Poor** (#c0262d / #ff6b6b): Lighthouse bands on results only. Always paired with their glyph (● good, ■ average, ▲ poor).

### Neutral
- **Drafting Ground** (#f3f5f0 / #0d1510): the page.
- **Sheet White** (#ffffff / #141f18): raised surfaces: case cards, result labels.
- **Sunken Ground** (#e7ebe2 / #080e0a): row hover, cover placeholders.
- **Hairline** (#d2d9cb / #26352b): dividers, card borders, grid.
- **Strong Line** (#7a8771 / #617564): the timeline rail, Tag borders, secondary button borders, drawing strokes.
- **Ink** (#15201a / #e6eee7): headlines and body text.
- **Muted Ink** (#4f5c52 / #9fb0a3): ledes, summaries, labels, dates.

### Named Rules
**The Mango Once Rule.** Mango appears once per view in content: one headline metric or the hero mango, never both on one screen. The focus ring and the monogram cursor don't count.

**The Earned Color Rule.** Color carries meaning (brand action, the one accent, a score band) or it isn't there. Decoration is done with line and type, not color.

**The Same Sheet Rule.** Light and dark come from the same token names; a component never branches its markup by theme.

## Typography

**Display Font:** Newsreader (with Georgia, Times New Roman)
**Body Font:** Public Sans (with Segoe UI, system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Menlo)

**Character:** an editorial serif with engineering discipline around it. The serif speaks, the sans explains, the mono measures.

### Hierarchy
- **Display XL** (600, 76px, line-height 1, −0.02em): the hero headline only. One per page; it is the page's LCP element.
- **Display L** (600, 52px, 56px): case-study titles on phones, the contact heading.
- **Heading** (600, 32px, 38px): section titles (Projects, Experience, Stack, How I work).
- **Title** (600, 22px, 28px): case-card titles, role titles, questions.
- **Lede** (400, 19px, 30px): section intros and case-study summaries, max about 608px (about 67 characters).
- **Body** (400, 16px, 26px): reading text, capped at the measure, 34rem (`max-w-measure`, about 70 characters).
- **Small** (400, 14px, 20px): secondary notes.
- **Metric** (mono 500, 48px, line-height 1, −0.03em) and **Metric S** (mono 500, 24px): results.
- **Label** (mono 500, 12px, 0.06em, uppercase): roles, metric labels, callouts, category names.
- Nothing is set below 11px. Drawing annotations (callout numbers, the results on the shoots, the title block) use 11px mono.
- **Code** (mono 400, 13px, 22px): dates and years, emails, archive results.

### Named Rules
**The Mono Measures Rule.** Every number, date, label and tick is mono. Prose is never mono.

**The One Display Rule.** Display XL appears once per page. Section titles use Heading, never a second display size.

## Layout

A single 1120px content column (`--content-max`), centered, with 16px gutters on phones and 24px from 768px. Spacing is a 4px grid: components step by 4 (4, 8, 12, 16), layouts step by 8 (24, 32, 48, 64, 96). Sections are separated by 64px on phones and 96px from 768px.

- Hero: copy left and drawing right from 900px; copy above and drawing below under 900px. The drawing bleeds past the right edge of the column on wide screens.
- Projects: featured case cards in two equal columns from 768px, one column below; the archive is a full-width ruled list.
- Case study and Experience: a 232px label column (numbered callout or dates) beside a reading column capped at the measure (34rem); the label moves above the text on phones.
- How I work: a 352px heading column beside the questions from 1024px.
- Breakpoints: 640px (compact → wide rows), 768px (gutters, grids), 900px (hero split), 1024px (two-column sections).

## Elevation & Depth

Flat. Depth comes from tone (Sheet White on Drafting Ground, Sunken Ground on hover) and from hairlines, not shadows. Cards in a grid have no shadow.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 1px 2px var(--shadow-near), 0 8px 24px var(--shadow-far)`): only for content that genuinely floats above the page, such as a popover. Not used on cards or buttons.

### Named Rules
**The Flat Sheet Rule.** Nothing casts a shadow at rest. If a surface needs separation, give it a hairline or a tone step.

## Shapes

Gently squared. Small radii keep the drafting precision: 4px for Tags and focus outlines, 8px for buttons and cards, 16px only for large media frames; fully round only for markers and toggles. Borders are 1px hairlines; the timeline rail and drawing strokes use Strong Line. No pills, no blobs, no clipped corners.

## Components

### Buttons
Precise and quiet: one primary action per view.
- **Shape:** gently squared (8px), 44px tall (32px Small, for desktop toolbars and the 48px sheet-index bar on phones, where it still clears WCAG 2.2's 24px target minimum).
- **Primary:** Mangrove Green fill, ground-colored text, 16px side padding; hover deepens toward ink.
- **Secondary:** transparent with a Strong Line border and Ink text; hover fills Mangrove Soft.
- **Ghost:** Mangrove text with 8px padding; hover draws a 1px mangrove underline as an inset shadow, not text decoration.
- **Focus:** the global 2px Mango ring with a 2px gap. Labels are verbs in sentence case. Never a mango fill.

### Tags
- **Style:** mono 12px, 26px tall, 4px corners, 8px padding; Strong Line border and Ink text.
- **Core:** Mangrove Soft fill with Mangrove text, for React, React Native and TypeScript.
- **Count:** optional muted number after the label (how many case studies use the tech), Stack section only.

### Case card
- **Corner Style:** 8px. **Background:** Sheet White with a Hairline border. **Padding:** 24px.
- **Content order:** role (Label) and years, title (Title), one-sentence method, up to four Tags, up to two Metrics.
- **States:** hover turns the border Mangrove; the title is the link and its overlay makes the whole card clickable; the card shows the Mango ring when the link has focus.

### Metric
- Label above, then the value: Delta shows the before value struck through in Muted Ink, an arrow, and the after value; Single shows one value. Accent puts the after value in Mango (once per view); Plain keeps it Ink. Uses the real minus sign.

### Archive row
- A full-width ruled row: year, title, two techs, the headline result, an arrow. Hover fills Sunken Ground and turns the title Mangrove. The result column keeps its width when empty so rows align.

### Navigation (site header)
- Monogram and wordmark on the left; the EN / PT / ES switch and the theme toggle on the right, within the content column. No nav links: the page is one scroll plus case studies.

### The Mangrove (signature)
The hero drawing: an SVG poster of a mangrove at the tide line on a drafting grid (line art by day, points by night), with an unnumbered tide gauge, numbered callouts and a title block. The drawing measures the work, not the tree: each result grows as a shoot with its value written above it and a dimension line to its mark on the gauge, and its label in the lane beside the gauge names the product and links to the case study. A three.js version replaces the poster on the visitor's first interaction; clicking the water grows roots, clicking a seed replays a result, and the mango leads to Contact.

### Scroll motion
Two drawings, both tied to scroll position in CSS (`src/styles/motion.css`) and finished by the time their element is fully in view: the Experience rail draws down from each marker, and a Mangrove tide line runs under each case card's results, uncovering the before value, then fades. The after value, the result, is never covered. Nothing else moves on scroll. Browsers without scroll-driven animations, and reduced motion, get the finished drawing.

## Do's and Don'ts

### Do:
- **Do** lead every surface with a measured result, set in mono, before → after.
- **Do** keep Mango to one use per view (the focus ring and logo cursor excepted).
- **Do** use hairlines (1px Hairline) and tone steps for structure instead of shadows.
- **Do** pair score colors with their glyph (● ■ ▲).
- **Do** use the drafting vocabulary (numbered callouts, rails, dimension lines) for structure that has an order.

### Don't:
- **Don't** bring back the retired identity: no near-black electric palette, glows, glitch slices or Bebas Neue.
- **Don't** put shadows on cards or buttons, or use pills and large rounded blobs.
- **Don't** fill a button with Mango or use Mango as decoration.
- **Don't** set prose in mono or numbers in the serif.
- **Don't** add raster images or effects to the hero that paint before the headline.
