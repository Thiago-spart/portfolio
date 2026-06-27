# Home Page Sections — Design Spec
**Date:** 2026-06-27  
**Status:** Approved

---

## Overview

Three sections that follow the hero on the home page (`index.tsx`): Timeline, Skills, and Q&A. All share the "A Light That Never Comes" dark electric aesthetic. The page order is:

```
Hero → Timeline → Skills → Q&A (+ final CTA)
```

No projects section on the home page — "See my work" on the hero links directly to `/projects` (separate route, separate brainstorm).

All sections are **mobile-first**. The portfolio's primary audience is expected to visit on mobile.

---

## 1. Timeline Section

### Purpose
Presents Thiago's professional history — companies, roles, and career arc — in a scannable, interactive format.

### Layout
- **Desktop**: Vertical center spine with entries alternating left/right
- **Mobile**: Spine on the left edge, all entries stacked on the right

**Spine**: A 1px vertical line in `#00aaff` with a soft blue glow (`box-shadow: 0 0 8px rgba(0,170,255,0.5)`). Each entry connects to the spine via a small glowing dot node (8px circle, filled electric blue).

### Entry — Collapsed State
Each entry shows:
| Field | Style |
|-------|-------|
| Company name | Bold, `#ffffff`, larger font |
| Role/title | `#00aaff` electric blue, smaller |
| Date range | `#5a6a7a` muted gray |
| Short description | `rgba(255,255,255,0.7)`, 2–3 lines max |
| Tech stack tags | Dark pills (`rgba(8,13,26,0.85)`), `1px solid rgba(0,170,255,0.3)` border, small text |

### Entry — Expanded State (click to toggle)
Clicking the entry opens a panel below the collapsed content (smooth height transition). The panel reveals 2–3 highlight stats styled as glowing metric cards:
- Dark surface `rgba(8,13,26,0.85)`
- Thin top-border glow in electric blue
- Stat value (large, white) + label (small, muted)
- Examples: `"Led team of 5"`, `"Shipped to 200k users"`, `"Reduced load time by 40%"`

Multiple entries can be expanded simultaneously. Clicking again collapses.

### Entrance Animation
Each entry animates in as it enters the viewport via `IntersectionObserver`. Animation: brief glitch burst (2-frame horizontal slice offset) → fade in + rise. Staggered per entry (80ms delay between each), consistent with the design ref entrance principles.

### Data Shape (per entry)
```ts
type TimelineEntry = {
  company: string
  role: string
  dateRange: string        // e.g. "Jan 2022 – Present"
  description: string
  techStack: string[]
  highlights: { value: string; label: string }[]
}
```
Data lives as a static array in `src/data/timeline.ts`. No external fetch.

---

## 2. Skills Section

### Purpose
Communicates Thiago's technical range — both breadth (category groups) and depth (a real architecture diagram from a specific project).

### Layout
Two parts stacked vertically within the section, separated by a gradient divider line.

### Part 1 — Category Groups
A responsive grid: **2 columns on mobile, 4 columns on desktop**.

Each category card:
- Background: `rgba(8,13,26,0.85)` semi-transparent dark surface
- Left border: 2px solid `#00aaff` (electric blue accent)
- Inner shadow: subtle blue glow
- **Category title**: all-caps, thin weight, `#00aaff`, high letter-spacing (matches design ref subheadings)
- **Skill tags**: dark pills inside the card, text-only or with lucide-react icon where available

Suggested categories (to be confirmed with Thiago):
- Frontend
- Backend
- Infrastructure / DevOps
- Architecture & Patterns

**Entrance**: Cards rise in staggered (80ms delay each) via `IntersectionObserver`, using the existing `.rise-in` keyframe from `styles.css`.

### Part 2 — Architecture Diagram
A full-width dark panel below the category grid.

**Visual**: An SVG diagram showing a real project's tech stack as a flow — nodes (rounded boxes/chips) connected by animated dashed lines.
- Line animation: `stroke-dashoffset` CSS animation, electric blue color, slow loop
- Node boxes: same dark surface + electric blue border as cards
- Layer labels: e.g. "Client → API Gateway → Services → DB → Cache → Cloud"

**Status**: This panel is a **placeholder** in this spec. Content (which project, which stack) is decided after the project data strategy brainstorm. The SVG diagram is authored manually or generated when that decision is made.

### Data Shape (categories)
```ts
type SkillCategory = {
  title: string
  skills: { name: string; icon?: string }[]
}
```
Data lives in `src/data/skills.ts`. No external fetch.

---

## 3. Q&A Section

### Purpose
Humanizes Thiago's profile through personality-driven questions, in an interactive chat-style format. Doubles as a soft FAQ.

### Container
A chat window panel:
- Rounded corners (`border-radius: 1.5rem`)
- Thin title bar with three decorative macOS-style dots and label `"ask_thiago.sh"`
- Top border: 1px solid `#00aaff` with soft glow
- Background: `rgba(8,13,26,0.9)`
- Max width: `720px`, centered

### Question Bubbles (left side)
- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Text: `rgba(255,255,255,0.85)`
- Small icon/avatar on the left (generic user icon via lucide-react)
- Cursor: pointer

### Answer Bubbles (right side, revealed on click)
- Background: `rgba(0,170,255,0.08)` with `1px solid rgba(0,170,255,0.25)` border
- Text: `rgba(255,255,255,0.8)`
- Entrance: text fades in with a blinking `|` typing cursor animation; cursor disappears when text finishes rendering (~400ms — intentionally slower than the 100–200ms UI transitions in the design ref, as this simulates typing rather than a state change)
- Clicking the question again collapses the answer

### Interaction Rules
- Multiple answers can be open simultaneously — the conversation thread builds up as the user explores
- No auto-scroll — user controls what they open

### Suggested Questions (to be confirmed with Thiago)
- "Are you available for freelance work?"
- "What's your preferred tech stack?"
- "What kind of problems do you enjoy solving?"
- "How do you approach a new project?"
- "What do you do outside of work?"

### Data Shape
```ts
type QAEntry = {
  question: string
  answer: string
}
```
Data lives in `src/data/qa.ts`. No external fetch.

---

## 4. Final CTA (below Q&A)

A centered block at the very bottom of the home page, before the footer:

- Heading: `"Want to talk?"` — display font, white
- Subline: short one-liner (e.g. `"I'm always open to new projects and opportunities."`)
- Primary button: `"Get in touch"` → `<Link to="/contact">` — same glowing electric blue style as hero CTA

---

## 5. Component Structure

```
src/
  components/
    TimelineSection.tsx     — section wrapper, spine, entry list
    TimelineEntry.tsx       — single entry (collapsed + expanded toggle)
    SkillsSection.tsx       — section wrapper, category grid, diagram placeholder
    SkillCard.tsx           — single category card with skill tags
    ArchDiagram.tsx         — SVG architecture diagram (placeholder until project data decision)
    QASection.tsx           — chat window wrapper, question + answer bubbles
    HomeCTA.tsx             — final "Want to talk?" block
  data/
    timeline.ts             — TimelineEntry[] static data
    skills.ts               — SkillCategory[] static data
    qa.ts                   — QAEntry[] static data
  routes/
    index.tsx               — updated to render all sections in order
```

---

## 6. Open Items

- [ ] Confirm final copy for headline/subtitle (hero spec)
- [ ] Confirm category names and skill lists with Thiago
- [ ] Confirm Q&A questions and answers with Thiago
- [ ] Confirm timeline entries (companies, roles, dates, descriptions, highlights)
- [ ] **Architecture diagram content blocked on**: project data strategy decision (TanStack DB vs. other system) — see project memory note
- [ ] Add `Bebas Neue` font import to `styles.css` (shared with hero spec)
