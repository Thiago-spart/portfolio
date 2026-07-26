# Header Refactor — Design Spec
**Date:** 2026-07-04
**Status:** Approved

---

## Overview

`Header.tsx` is still the TanStack Start scaffold header: logo linking to "TanStack Start", a "Demos" dropdown to AI-demo routes, a Docs link to TanStack's own docs, and X/GitHub icons pointing at TanStack's accounts. None of it is portfolio content. This spec replaces that content with Thiago's own branding/links, and changes when/how the header appears: instead of sitting sticky at the very top of every page (overlapping the Hero's full-bleed dark visual), it stays absent while the Hero is in view and becomes fixed only once the user has scrolled past it.

---

## 1. Content Changes

### Logo / brand
- Replace the "TanStack Start" chip with a name/initials mark for Thiago, linking to `/`.
- Reuse existing chip styling (`--chip-bg`, `--chip-line`, the pill shape already in the current markup).

### Nav links
- `Home` → `/`
- `About` → `/about`
- `Contact` → `/#contact` (anchors to the `ContactSection` on the home page)
- Remove `Docs` (external TanStack docs link) and the `Demos` dropdown (AI-demo routes: chat, image, structured output, store, tanstack-query) entirely — not portfolio content.
- Keep using the existing `nav-link` class from `styles.css`.

### Social icons
- Remove the X icon.
- Keep two icons, reusing the SVGs/hrefs already present in `ContactSection.tsx`:
  - LinkedIn → `https://www.linkedin.com/in/thiago-moraes-souza/`
  - Email → `mailto:thiagomoraes.contact@gmail.com`

### AI chat widget
- Remove `<TanChatAIAssistant />` from the header — it's the leftover "guitar recommendation" demo widget, unrelated to portfolio content.

### Keep as-is
- `LangToggle` (en/pt/es switch) — unchanged.
- `ThemeToggle` (light/dark/auto) — unchanged. Confirmed non-decorative: `--sea-ink`, `--sea-ink-soft`, `--header-bg`, `--chip-bg`, `--line` are used across body text, cards, and footer. Only `HeroSection` is deliberately hardcoded dark regardless of theme.

---

## 2. Appearance Timing

### Current behavior (to be replaced)
`Header` is rendered in `__root.tsx` above `{children}` on every route, `position: sticky; top: 0`, so it occupies flow space immediately and overlaps/precedes the Hero on the home page.

### New behavior
- Header switches from `sticky` (in normal flow) to **conditionally rendered `fixed top-0 inset-x-0 z-50`**, controlled by scroll position.
- **Threshold:** `1.5 × window.innerHeight`.
  - Not arbitrary — it's the exact scroll distance for `HeroSection` to fully release. The Hero's wrapper is `250dvh` tall with a `100dvh` pinned inner section, so it scrolls fully away at `250dvh − 100dvh = 150dvh = 1.5×viewport`.
  - The same fixed threshold is reused on routes with no hero (`/about`, demo routes) so behavior is consistent site-wide — no per-route configuration, no `HeroSection` DOM dependency.
- **Below threshold:** header renders nothing (not merely visually hidden — unmounted, so it can't intercept clicks or be tabbed into).
- **At/above threshold:** header renders fixed at the top, immediately, at full opacity — no fade/slide-in transition. Once shown it stays fixed for the rest of the scroll (matches "sticky from that point on").
- **Mechanism:** a small hook (e.g. `useScrollPastThreshold()`) inside `Header.tsx`:
  - One `scroll` event listener (`{ passive: true }`).
  - Also checks scroll position once on mount (handles page load already scrolled — reload mid-page, back-navigation with restored scroll position).
- **SSR:** server has no `window`, so it always renders the "not yet visible" (unmounted) state — same as the client's pre-mount state. No hydration mismatch; the client corrects itself in the mount-time check.

---

## 3. Component Structure

```
src/
  components/
    Header.tsx        — rewritten: new brand/nav/social content, scroll-gated fixed positioning
    ThemeToggle.tsx    — unchanged
```

No changes to `__root.tsx` JSX structure — `Header` stays declared once in the shared root layout; the fixed+conditional-render approach means its screen position is independent of DOM order, so it doesn't need to move relative to `{children}` per route.

---

## 4. Out of Scope

Flagged, not touched in this pass:
- `Footer.tsx` — has the same scaffold problem ("Your name here", TanStack links).
- `about.tsx` — page content is still placeholder scaffold text.
- `/projects` route — doesn't exist yet, even though Hero's CTA and `nav.projects` i18n key reference it. Header nav uses `/about` and `/#contact` instead for this pass.

---

## 5. Open Items

- [ ] Add an `nav.about` / `nav.contact` (or similar) i18n key set — current locale files only have `nav.home` and `nav.projects`.
- [ ] Confirm final brand mark text/initials for the logo.
