# Homepage Cyberpunk Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Post-implementation correction:** Live visual review showed the `.experience-bg-transition` gradient below was backwards — Hero's background is uniformly dark, so Experience's top edge needs to be dark too, not the (in light theme, near-white) `--header-bg` color this plan originally specified. The gradient and `--header-bg` involvement were dropped; Experience now uses the same flat `.cyberpunk-surface` class as the other three sections. See the spec's "Problem" section for the corrected reasoning. The task/step text below is kept as an execution record of what was actually built first — do not use it as the current design source; the spec doc is current.

**Goal:** Give the Experience, Skills, Q&A, and Contact sections a fixed dark cyberpunk background so the Hero → Experience scroll transition is smooth and the rest of the homepage below the Hero is one continuous dark backdrop instead of clashing with the light "sea" body gradient.

**Architecture:** Two new CSS classes in `src/styles.css` — `.experience-bg-transition` (a gradient from the theme-aware `--header-bg` variable down to the fixed `#050508` cyberpunk color within 400px) and `.cyberpunk-surface` (flat `#050508`) — applied to the four existing `<section>` elements. No JS, no new components, no changes to text/card colors.

**Tech Stack:** React, TypeScript, Tailwind CSS (utility classes) + plain CSS custom classes in `src/styles.css`, Vitest + @testing-library/react for verification.

## Global Constraints

- No changes to `/about` page or anything using the light "sea/lagoon" theme.
- No changes to `Header.tsx`'s own background or `HeroSection.tsx`'s own background (`.hero-section-bg` stays as-is).
- No changes to any text or card color in `TimelineSection.tsx`, `SkillsSection.tsx`, `QASection.tsx`, `ContactSection.tsx`, `SkillCard.tsx`, or `ArchDiagram.tsx` — only the parent `<section>` background changes.
- The cyberpunk background below the 400px transition zone is fixed (`#050508`) regardless of light/dark theme — this is a deliberate design choice per `design-reference.md`, not a bug to "fix" by making it theme-aware.
- `--header-bg` (defined in `src/styles.css:23` for light theme, `src/styles.css:89` for dark theme) is the exact variable to use for the gradient's starting color — do not hardcode separate light/dark values.

---

### Task 1: Add cyberpunk background classes and apply to the four sections

**Files:**
- Modify: `src/styles.css` (add two new CSS rules after the `.hero-section-bg` block, around line 350)
- Modify: `src/components/TimelineSection.tsx:45` (add `experience-bg-transition` to the `#experience` section's className)
- Modify: `src/components/SkillsSection.tsx:15` (add `cyberpunk-surface` to the `#skills` section's className)
- Modify: `src/components/QASection.tsx:24` (add `cyberpunk-surface` to the `#qa` section's className)
- Modify: `src/components/ContactSection.tsx:33` (add `cyberpunk-surface` to the `#contact` section's className)
- Test: `src/test/TimelineSection.test.tsx` (add one test)
- Test: `src/test/QASection.test.tsx` (add one test)
- Test: `src/test/ContactSection.test.tsx` (add one test)
- Test: `src/test/SkillsSection.test.tsx` (new file — no test file exists yet for `SkillsSection`)

**Interfaces:**
- Consumes: existing `--header-bg` CSS custom property (already defined, theme-aware, no changes needed to it).
- Produces: two new CSS class names other code/tests can rely on: `.experience-bg-transition` and `.cyberpunk-surface`. No JS exports change.

This is a pure styling change — tests verify the right CSS class lands on the right DOM element, not visual rendering (jsdom doesn't compute actual pixel colors).

- [ ] **Step 1: Write the failing tests**

Add to `src/test/TimelineSection.test.tsx` (inside the existing `describe('TimelineSection glitch-rise replay', ...)` block is fine, or a new adjacent `describe` — add this new `describe` block at the end of the file, after the existing one closes):

```tsx
describe('TimelineSection background', () => {
  it('has the experience-bg-transition class for the Hero-to-cyberpunk background', () => {
    const { container } = render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const section = container.querySelector('#experience')
    expect(section).toHaveClass('experience-bg-transition')
  })
})
```

Add to `src/test/QASection.test.tsx`, inside the existing `describe('QASection', ...)` block, as a new `it`:

```tsx
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(container.querySelector('#qa')).toHaveClass('cyberpunk-surface')
  })
```

Add to `src/test/ContactSection.test.tsx`, inside the existing `describe('ContactSection', ...)` block, as a new `it`:

```tsx
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(<LanguageProvider><ContactSection /></LanguageProvider>)
    expect(container.querySelector('#contact')).toHaveClass('cyberpunk-surface')
  })
```

Create `src/test/SkillsSection.test.tsx` (new file — no prior test coverage exists for this component):

```tsx
// src/test/SkillsSection.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import SkillsSection from '../components/SkillsSection'
import type { SanitySkillCategory } from '../types/sanity'

const mockCategories: SanitySkillCategory[] = []

describe('SkillsSection', () => {
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(
      <LanguageProvider>
        <SkillsSection categories={mockCategories} lang="en" />
      </LanguageProvider>,
    )
    expect(container.querySelector('#skills')).toHaveClass('cyberpunk-surface')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- TimelineSection QASection ContactSection SkillsSection`
Expected: FAIL — the four new/changed assertions fail because none of the four sections currently carry `experience-bg-transition` or `cyberpunk-surface` (the classes don't exist yet and aren't applied).

- [ ] **Step 3: Add the CSS classes**

In `src/styles.css`, insert immediately after the `.hero-section-bg` block (after line 350, before the `/* Primary button glitch on hover */` comment):

```css
/* Below-hero sections: fixed cyberpunk background (design-reference.md — not theme-toggled) */
.experience-bg-transition {
  background: linear-gradient(180deg, var(--header-bg) 0%, #050508 400px, #050508 100%);
}

.cyberpunk-surface {
  background: #050508;
}
```

- [ ] **Step 4: Apply the classes to the four sections**

In `src/components/TimelineSection.tsx`, change line 45 from:

```tsx
    <section id="experience" className="py-24 px-6">
```

to:

```tsx
    <section id="experience" className="experience-bg-transition py-24 px-6">
```

In `src/components/SkillsSection.tsx`, change line 15 from:

```tsx
    <section id="skills" className="px-6 py-24">
```

to:

```tsx
    <section id="skills" className="cyberpunk-surface px-6 py-24">
```

In `src/components/QASection.tsx`, change line 24 from:

```tsx
    <section id="qa" className="px-6 py-24">
```

to:

```tsx
    <section id="qa" className="cyberpunk-surface px-6 py-24">
```

In `src/components/ContactSection.tsx`, change line 33 from:

```tsx
    <section id="contact" className="px-6 py-24 scroll-mt-24">
```

to:

```tsx
    <section id="contact" className="cyberpunk-surface px-6 py-24 scroll-mt-24">
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test -- TimelineSection QASection ContactSection SkillsSection`
Expected: PASS (all new assertions pass; no existing assertions in these files break).

- [ ] **Step 6: Run the full test suite to check for regressions**

Run: `pnpm test`
Expected: PASS (no regressions anywhere else in the suite).

- [ ] **Step 7: Manually verify in the browser**

Run: `pnpm dev`, open the homepage, and scroll from the Hero through Experience, Skills, Q&A, and Contact in both light and dark theme (use the theme toggle in the header). Confirm:
- No hard color cut between the Hero and the Experience section.
- The background stays a consistent dark cyberpunk tone through Skills, Q&A, and Contact in both themes.
- Text in Skills/Q&A/Contact (previously white/cyan on the old light background) is now clearly legible.

- [ ] **Step 8: Commit**

```bash
git add src/styles.css src/components/TimelineSection.tsx src/components/SkillsSection.tsx src/components/QASection.tsx src/components/ContactSection.tsx src/test/TimelineSection.test.tsx src/test/QASection.test.tsx src/test/ContactSection.test.tsx src/test/SkillsSection.test.tsx
git commit -m "feat: fixed cyberpunk background for homepage sections below Hero"
```
