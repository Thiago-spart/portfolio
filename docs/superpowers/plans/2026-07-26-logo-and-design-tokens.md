# Logo & Design Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Vite/React app icon with a real "TS" brand mark, expose `design.md`'s color palette and font stack as Tailwind theme tokens, and make the header logo a text-only wordmark that collapses to initials on mobile.

**Architecture:** `design.md` (written and approved separately, see its §2–§4) is the source of truth. Brand assets (favicon, app icons, OG image) are generated from hand-written SVGs, rasterized with `@resvg/resvg-js` in a scratch dir (no new runtime dependency — the tool is only used to produce static files, not imported into the app) and copied into `public/`. Tailwind v4 is CSS-first (no `tailwind.config.js`), so palette/font tokens are added to the `@theme inline` block in `src/styles.css`. The header nav logo is deliberately kept text-only (no icon) — a small `Logo` component renders the full wordmark at `sm` and above and collapses to "TS" below `sm` via Tailwind's `hidden`/`sm:hidden` pair, matching `design.md` §2's "Header nav wordmark" note.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (`@theme inline`, no config file), Vitest + @testing-library/react.

## Global Constraints

- Do not migrate the rest of the Header (nav links, `LangToggle`, `ThemeToggle`, social icons) off the ocean palette — that's a separate, larger migration tracked in `design.md` §11 and out of scope here.
- No hamburger/drawer nav collapse — only the logo/wordmark collapses on mobile in this pass.
- No new npm dependency: `@resvg/resvg-js` is a one-off asset-generation tool run from a scratch directory, not added to `package.json`.
- `public/manifest.json` and the dark-mode `theme-color` meta in `src/routes/__root.tsx` should match the new near-black brand color; the light-mode `theme-color` and the rest of the ocean-themed light styling are untouched.

---

### Task 1: Tailwind theme tokens for the design system

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1:** Replace the Fraunces Google Fonts import with Rajdhani (`@import url(...)` at the top of the file), keeping Bebas Neue and Manrope.
- [x] **Step 2:** Add `--ember: #ff6a00` next to the existing `--electric-blue`/`--neon-purple`/etc. variables in `:root` (the palette in `design.md` §3 was missing this one token).
- [x] **Step 3:** In the `@theme inline` block, add `--font-display` (Bebas Neue) and `--font-heading` (Rajdhani), plus `--color-electric-blue`, `--color-neon-purple`, `--color-near-black`, `--color-dark-navy`, `--color-cyan-white`, `--color-muted-gray`, `--color-ember`, each mapped to the corresponding `:root` variable.
- [x] **Step 4:** Delete the now-unused `.display-title { font-family: 'Fraunces', ... }` rule (nothing referenced it).
- [x] **Step 5:** Verify: `pnpm build` succeeds and `pnpm test` still passes (font/token changes are additive, no component relied on Fraunces).

---

### Task 2: Generate brand assets from the design.md monogram spec

**Files:**
- Add (scratch, not committed): SVGs + `@resvg/resvg-js` render scripts in a temp working directory
- Modify: `public/favicon.ico`, `public/logo192.png`, `public/logo512.png`, `public/og-image.png`, `public/og-image.svg`, `public/manifest.json`
- Add: `src/assets/logo-monogram.svg` (source reference for the monogram)

- [x] **Step 1:** Hand-write an SVG monogram: "TS" in Bebas Neue on a near-black (`#050508`) rounded-square frame, electric-blue/cyan-white letterforms, and a single horizontal neon-purple glitch-slice band — per `design.md` §2. Write a second "clean" (non-glitched) variant for the 16px favicon size where the slice hurts legibility.
- [x] **Step 2:** Download the actual Bebas Neue (and, for the OG image, Rajdhani + Manrope) font files so rasterization doesn't silently fall back to a system font.
- [x] **Step 3:** Render PNGs at 512/192/64/32/16px with `@resvg/resvg-js`, using the clean variant only at 16px.
- [x] **Step 4:** Hand-pack a multi-image `favicon.ico` (16/24/32/64, matching the original's size set) from the rendered PNGs — no ICO CLI tool was available, so this was done directly with a small Node script per the ICO directory-entry format.
- [x] **Step 5:** Rebuild `og-image.svg`/`.png` (1200×630) in the new identity: near-black background, ambient blue/purple glow, the monogram badge, "THIAGO SOUZA" wordmark, "FULL-STACK DEVELOPER" subheading, tagline — replacing the old ocean-themed Fraunces version.
- [x] **Step 6:** Copy the rendered assets into `public/`, replacing the placeholder React-atom icon files.
- [x] **Step 7:** Update `public/manifest.json`'s `theme_color`/`background_color` to the near-black brand color (name/short_name were already correct — "Thiago Souza").
- [x] **Step 8:** Update the dark-mode `theme-color` meta in `src/routes/__root.tsx` to match (`#0a1418` → `#050508`); light-mode meta left untouched.

---

### Task 3: Text-only header logo, responsive to initials on mobile

**Files:**
- Add: `src/components/Logo.tsx`
- Modify: `src/components/Header.tsx`

- [x] **Step 1:** Create `Logo.tsx` rendering the wordmark in Bebas Neue with a subtle electric-blue text-glow: `Thiago Souza` visible at `sm` and above (`hidden sm:inline`), `TS` visible below `sm` (`sm:hidden`) — plain text, not the graphic monogram (the monogram stays reserved for favicon/app-icon/OG use per `design.md` §2).
- [x] **Step 2:** In `Header.tsx`, swap the old logo `<Link>` (light ocean-palette pill with a gradient dot + hardcoded "Thiago Souza" text) for a dark pill (`bg-[var(--near-black)]`, electric-blue border/glow) wrapping `<Logo />`.
- [x] **Step 3:** Update `design.md` §2 and §8 to describe the text-only nav treatment instead of the graphic monogram, so the doc matches what shipped.
- [x] **Step 4:** Verify: `pnpm test` passes (45/45) and `pnpm build` succeeds. No headless-browser tooling was available in this sandbox to screenshot the live header — visual confirmation of the `sm` breakpoint collapse is still pending a manual check with `pnpm dev`.

---

### Task 4: Commit

- [ ] **Step 1:** Stage and commit this plan doc, `design.md`, the deleted `design-reference.md`, and all asset/code changes.

```bash
git add design.md docs/superpowers/plans/2026-07-26-logo-and-design-tokens.md \
  AGENTS.md src/styles.css src/components/Header.tsx src/components/Logo.tsx \
  src/assets/logo-monogram.svg src/routes/__root.tsx \
  public/favicon.ico public/logo192.png public/logo512.png \
  public/og-image.png public/og-image.svg public/manifest.json
git add -u design-reference.md  # stages the deletion
git commit -m "feat: dark-glitch brand identity — TS logo, design tokens, text-only nav wordmark"
```
