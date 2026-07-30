# Earth Loop Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a decorative, looping Earth video as the full-bleed backdrop on every project detail page, without touching Sanity.

**Architecture:** A single ffmpeg-optimized `.mp4` ships as a static asset under `public/media/`. `ProjectHero` gains one new optional prop, `ambientVideoSrc`, rendered only in its existing full-bleed backdrop layer (independent of the centered cover-image logic). The route component passes the same static path on every project page.

**Tech Stack:** ffmpeg (asset prep), React + TypeScript (`ProjectHero.tsx`), Vitest + Testing Library (`ProjectHero.test.tsx`), TanStack Router (`projects.$slug.tsx`).

## Global Constraints

- No Sanity schema, field, or query changes — this asset is not modeled as content.
- Source video: `/home/loki/Downloads/16412141_1920_1080_24fps.mp4` (1920×1080, ~24fps, H.264, no audio, ~39.5s, ~90MB).
- Output target: `my-tanstack-app/public/media/earth-loop.mp4`, ~1280px wide, no audio, H.264 `yuv420p`, `+faststart`.
- `ambientVideoSrc` must be ignored (fallback to existing `bgImageSrc`/gradient) when `prefers-reduced-motion` is active — reuse the component's existing `reducedMotion` state, do not add a second mechanism.
- Existing props (`videoSrc`, `bgImageSrc`, `posterSrc`) and all current `ProjectHero.test.tsx` cases must keep passing unmodified.

---

### Task 1: Produce the optimized static asset

**Files:**
- Create: `my-tanstack-app/public/media/earth-loop.mp4`

**Interfaces:**
- Produces: a static file served at request path `/media/earth-loop.mp4` — no code references it yet (that's Task 3).

- [ ] **Step 1: Create the output directory**

Run: `mkdir -p /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app/public/media`

- [ ] **Step 2: Run the ffmpeg encode**

Run:
```bash
ffmpeg -i /home/loki/Downloads/16412141_1920_1080_24fps.mp4 \
  -vf "scale=1280:-2" \
  -c:v libx264 -crf 28 -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app/public/media/earth-loop.mp4
```

- [ ] **Step 3: Verify the output**

Run: `ffprobe -v error -show_entries stream=codec_name,width,height -show_entries format=size,duration -of default=noprint_wrappers=0 /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app/public/media/earth-loop.mp4`

Expected: `codec_name=h264`, `width=1280`, a `duration` close to 39.5s, and `size` dramatically smaller than the ~90MB source (target: a few MB — if it's still tens of MB, raise `-crf` to 30–32 and re-run Step 2).

- [ ] **Step 4: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add public/media/earth-loop.mp4
git commit -m "Add optimized Earth loop background asset"
```

---

### Task 2: Add `ambientVideoSrc` to `ProjectHero`

**Files:**
- Modify: `my-tanstack-app/src/components/ProjectHero.tsx`
- Test: `my-tanstack-app/src/test/ProjectHero.test.tsx`

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces: `ProjectHero` prop `ambientVideoSrc?: string`, rendered in the backdrop layer only, gated by the component's existing internal `reducedMotion` state.

- [ ] **Step 1: Write the failing tests**

Add to `my-tanstack-app/src/test/ProjectHero.test.tsx` (inside the top-level `describe('ProjectHero', ...)` block, alongside the other cases):

```tsx
  it('renders the ambient video in the backdrop when ambientVideoSrc is present', () => {
    const { container } = render(
      <ProjectHero
        ambientVideoSrc="https://example.com/earth-loop.mp4"
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    const backdropVideo = container.querySelector('video[src="https://example.com/earth-loop.mp4"]')
    expect(backdropVideo).toBeInTheDocument()
    expect(backdropVideo).toHaveAttribute('autoplay')
    expect(backdropVideo).toHaveAttribute('loop')
  })

  describe('with prefers-reduced-motion and ambientVideoSrc', () => {
    afterEach(() => vi.restoreAllMocks())

    it('falls back to bgImageSrc instead of playing the ambient video', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('prefers-reduced-motion'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      )

      const { container } = render(
        <ProjectHero
          ambientVideoSrc="https://example.com/earth-loop.mp4"
          bgImageSrc="https://example.com/cover.jpg"
          title="Portfolio Site"
          date="Jan 2024"
          scrollToExpand="Scroll to explore"
        />,
      )

      expect(container.querySelector('video[src="https://example.com/earth-loop.mp4"]')).not.toBeInTheDocument()
      expect(container.querySelector('img[src="https://example.com/cover.jpg"]')).toBeInTheDocument()
    })
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx vitest run src/test/ProjectHero.test.tsx`
Expected: FAIL — the two new cases fail because `ambientVideoSrc` doesn't exist on `ProjectHeroProps` and is never rendered.

- [ ] **Step 3: Implement the prop and backdrop rendering**

In `my-tanstack-app/src/components/ProjectHero.tsx`, add `ambientVideoSrc` to the props interface (line 4-12):

```tsx
interface ProjectHeroProps {
  videoSrc?: string
  posterSrc?: string
  bgImageSrc?: string
  ambientVideoSrc?: string
  title: string
  date: string
  scrollToExpand: string
  children?: ReactNode
}
```

Destructure it in the function signature (lines 26-34):

```tsx
export default function ProjectHero({
  videoSrc,
  posterSrc,
  bgImageSrc,
  ambientVideoSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ProjectHeroProps) {
```

Replace the backdrop conditional (currently lines 176-183):

```tsx
            {bgImageSrc ? (
              <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                data-testid="project-hero-bg-fallback"
                className="cyberpunk-surface h-full w-full"
              />
            )}
```

with:

```tsx
            {ambientVideoSrc && !reducedMotion ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                src={ambientVideoSrc}
                className="h-full w-full object-cover"
              />
            ) : bgImageSrc ? (
              <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                data-testid="project-hero-bg-fallback"
                className="cyberpunk-surface h-full w-full"
              />
            )}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx vitest run src/test/ProjectHero.test.tsx`
Expected: PASS — all cases, including the two new ones and every pre-existing case.

- [ ] **Step 5: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add src/components/ProjectHero.tsx src/test/ProjectHero.test.tsx
git commit -m "Add ambientVideoSrc backdrop layer to ProjectHero"
```

---

### Task 3: Wire the asset into the project detail route

**Files:**
- Modify: `my-tanstack-app/src/routes/projects.$slug.tsx`

**Interfaces:**
- Consumes: `ProjectHero`'s `ambientVideoSrc` prop from Task 2.
- Produces: every project detail page renders the same backdrop asset.

- [ ] **Step 1: Add the static path constant and pass the prop**

In `my-tanstack-app/src/routes/projects.$slug.tsx`, add a module-level constant near the top (after the imports, before `formatHeroDate`):

```tsx
const EARTH_LOOP_SRC = '/media/earth-loop.mp4'
```

Then update the `ProjectHero` usage inside `ProjectPage` (currently lines 54-63) to pass it:

```tsx
      <ProjectHero
        videoSrc={project.videoUrl}
        posterSrc={project.coverImageUrl}
        bgImageSrc={project.coverImageUrl}
        ambientVideoSrc={EARTH_LOOP_SRC}
        title={project.title[lang]}
        date={formatHeroDate(project.startDate, project.endDate, t('timeline.present'))}
        scrollToExpand={t('project.scrollHint')}
      >
```

- [ ] **Step 2: Run the full test suite**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx vitest run`
Expected: PASS — no existing test references `projects.$slug.tsx` directly, so this step confirms nothing else broke.

- [ ] **Step 3: Manually verify in the dev server**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npm run dev`

Open any `/projects/<slug>` page in a browser. Expected: the Earth loop plays, looping, behind the centered project cover image, and the project's own cover image still shows as the centered/expanding media. Then stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add src/routes/projects.\$slug.tsx
git commit -m "Wire Earth loop backdrop into project detail pages"
```
