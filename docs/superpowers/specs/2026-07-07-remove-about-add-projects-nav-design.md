# Remove /about Page, Add Projects Nav Link

## Problem

The Header's nav has three links: Home, About, Contact. The `/about` route is unused
starter boilerplate from the TanStack Start template (never customized — generic
"A small starter with room to grow" copy). A `nav.projects` translation key
("Projects"/"Proyectos"/"Projetos") already exists in all three locale files but isn't
used anywhere in the app — it was prepared in an earlier session in anticipation of a
homepage Projects section that hasn't been built yet.

## Goal

- Remove the `/about` route entirely.
- Replace the "About" nav item with a "Projects" nav item, in the same slot.
- The Projects nav item points to `/#projects`, an in-page anchor — matching how the
  existing Contact nav item (`/#contact`) works — rather than a separate route.

## Out of scope

- Building an actual Projects section on the homepage. No section with `id="projects"`
  exists yet, so the new nav link doesn't scroll anywhere until that's built as its own
  future piece of work (it needs a data-source decision — Sanity CMS vs. an
  alternative — flagged in an earlier session, not resolved here).
- Any other nav item, the Home or Contact links, LangToggle, ThemeToggle, or the
  LinkedIn/email icons.

## Approach

1. Delete `src/routes/about.tsx`.
2. Run `pnpm generate-routes` (`tsr generate`) to regenerate `src/routeTree.gen.ts`,
   removing the `/about` route entry. This generated file is committed to the repo, so
   the regenerated version is committed too.
3. In `src/components/Header.tsx`, replace the `<Link to="/about">{t('nav.about')}</Link>`
   nav item with a plain anchor: `<a href="/#projects" className="nav-link">{t('nav.projects')}</a>`.
   A plain `<a>` (not the router's `<Link>`) is used because `#projects` is an in-page
   anchor, not a route — the same pattern the existing Contact link already uses.
4. Remove the now-orphaned `nav.about` key from `src/i18n/locales/en.json`,
   `es.json`, and `pt.json`. Do not touch `nav.projects` — it already has the correct
   values.
5. Update `src/test/Header.test.tsx`'s "renders Home, About, and Contact nav links"
   test to assert Projects → `/#projects` instead of About → `/about`.

No new component, no new section, no changes to any other route or test file.
