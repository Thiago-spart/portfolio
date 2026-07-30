# Earth loop hero background — design

## Context

Project pages (`/projects/$slug`) render `ProjectHero`, which already has a full-bleed
backdrop layer behind the centered, scroll-expanding project media. Today that backdrop
reuses the project's own cover image (`bgImageSrc`).

The goal: add a purely decorative, looping Earth video as that backdrop, shown behind
every project page regardless of which project it is. It's aesthetic only — not project
content, so it should not be modeled as per-project data.

The existing per-project `video` field on the `project` Sanity schema (an untranscoded
`file` type, used for an optional per-project demo clip in the centered media slot) is
unrelated and unchanged by this work.

## Decision: static app asset, not Sanity

Because the video is a single shared asset with no per-project variation and no need for
non-technical editors to swap it independently of a deploy, it ships as a static file in
the app rather than as Sanity content:

- No Sanity document, field, or GROQ query for it.
- No asset bandwidth/storage cost against the Sanity project.
- Served directly by the host's CDN (Vercel) with standard static-asset caching.
- Changing the clip later means replacing the file and redeploying — acceptable since
  it's not editorial content.

## Asset prep

Source file: `/home/loki/Downloads/16412141_1920_1080_24fps.mp4`
(1920×1080, ~24fps, H.264, no audio track, ~39.5s, ~90MB.)

Processed once with ffmpeg into `my-tanstack-app/public/media/earth-loop.mp4`:

- No audio track to strip (source already has none).
- Scale to ~1280px wide — it's a dimmed, opacity-faded backdrop, not focal content, so
  source resolution beyond this is wasted bytes.
- Re-encode H.264 `yuv420p`, `+faststart`, moderate CRF (~28–30) for a small file.
- Loop point trimmed if needed so `loop` doesn't visibly jump.

Example: `ffmpeg -i source.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -pix_fmt yuv420p -movflags +faststart -an public/media/earth-loop.mp4`

## Component integration

`ProjectHero.tsx` gains one new optional prop: `ambientVideoSrc?: string`. It's used only
in the full-bleed backdrop layer (the outer `motion.div`), and does not touch the
existing centered-media logic (`videoSrc` / `bgImageSrc` fallback chain) at all:

```tsx
{ambientVideoSrc && !reducedMotion ? (
  <video autoPlay loop muted playsInline className="h-full w-full object-cover" src={ambientVideoSrc} />
) : bgImageSrc ? (
  <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
) : (
  <div data-testid="project-hero-bg-fallback" className="cyberpunk-surface h-full w-full" />
)}
```

- `!reducedMotion` guard: users with `prefers-reduced-motion` get the existing
  gradient/image fallback instead of a forced autoplay video.
- `projects.$slug.tsx` imports the static asset path once and passes it as
  `ambientVideoSrc={earthLoopSrc}` for every project page — it is not threaded through
  `SanityProject` or any Sanity query.
- Existing `videoSrc`, `bgImageSrc`, `posterSrc` props and their current tests are
  unchanged.

## Testing

- Existing `ProjectHero.test.tsx` cases are unaffected (they don't pass
  `ambientVideoSrc`).
- New test: when `ambientVideoSrc` is provided (and no reduced-motion), the backdrop
  renders a `<video>` (not the `<img>`/fallback).
- New test: under `prefers-reduced-motion`, `ambientVideoSrc` is ignored and the existing
  `bgImageSrc`/fallback backdrop renders instead.

## Out of scope

- No changes to the Sanity `project` schema or the per-project `video` file field.
- No CDN/service evaluation (Mux, Cloudflare Stream, etc.) — moot once the asset isn't
  Sanity-hosted content.
