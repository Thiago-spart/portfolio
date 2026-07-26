# Experience Section: Replay Scroll Animation on Re-entry

## Problem

`TimelineSection.tsx`'s `useGlitchRise` hook animates each timeline card in with a
"glitch-rise" effect (fade + rise) the first time it enters the viewport, then calls
`observer.unobserve()` so it never fires again. Scrolling back up past the section and
back down into it does nothing — cards just sit there already visible.

## Goal

Every time a timeline card enters the viewport — scrolling down into it for the first
time, or scrolling back up and then back down into it again — the glitch-rise entrance
animation should replay.

## Approach

Modify `useGlitchRise` in `src/components/TimelineSection.tsx`:

- Keep the existing `IntersectionObserver`, but stop calling `observer.unobserve()`.
- On `entry.isIntersecting === true`: set `animationDelay` (staggered by index, same as
  today), remove the `opacity-0` class, add the `glitch-rise` class.
- On `entry.isIntersecting === false`: remove the `glitch-rise` class and add
  `opacity-0` back, resetting the card to its pre-animation state with no visible
  fade-out (it's off-screen at that point, so the reset isn't noticeable).

No changes to `styles.css` — the `glitch-rise` keyframes, duration, and easing stay as-is.

## Out of scope

- No exit/fade-out animation while a card leaves the viewport (explicitly rejected —
  instant reset only).
- No changes to `TimelineEntry.tsx` or any other section's animations.
