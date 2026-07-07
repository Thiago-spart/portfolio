# Remove /about, Add Projects Nav Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unused `/about` route and replace the Header's "About" nav item with a "Projects" nav item pointing to an in-page `/#projects` anchor.

**Architecture:** Delete the route file and regenerate TanStack Router's route tree. Swap one `<Link to="/about">` for a plain `<a href="/#projects">` in `Header.tsx` (matching the existing `/#contact` anchor pattern), reusing the already-present `nav.projects` translation key. Drop the now-orphaned `nav.about` key from all three locale files.

**Tech Stack:** React, TypeScript, TanStack Router (`tsr generate` CLI), Vitest + @testing-library/react.

## Global Constraints

- No new component, no new homepage section — `/#projects` does not need to scroll anywhere yet; that's future work.
- Do not touch the Home or Contact nav items, LangToggle, ThemeToggle, or the LinkedIn/email icons in `Header.tsx`.
- Do not touch `nav.projects` values in the locale files — they're already correct ("Projects"/"Proyectos"/"Projetos").
- `src/routeTree.gen.ts` is a committed, generated file — regenerate it with `pnpm generate-routes`, never hand-edit it.

---

### Task 1: Remove /about route and wire up the Projects nav link

**Files:**
- Delete: `src/routes/about.tsx`
- Modify: `src/routeTree.gen.ts` (regenerated via CLI, not hand-edited)
- Modify: `src/components/Header.tsx:88-94`
- Modify: `src/i18n/locales/en.json:4`, `src/i18n/locales/es.json:4`, `src/i18n/locales/pt.json:4`
- Test: `src/test/Header.test.tsx:60-74`

**Interfaces:**
- Consumes: existing `nav.projects` translation key (already defined in all three locale files, unchanged by this task) and the existing `t()` function from `useTranslation()` (already imported in `Header.tsx`).
- Produces: nothing new consumed by other tasks — this is the only task in this plan.

- [ ] **Step 1: Write the failing test**

In `src/test/Header.test.tsx`, replace the test at lines 60-74 (currently named `'renders Home, About, and Contact nav links'`) with:

```tsx
  it('renders Home, Projects, and Contact nav links', async () => {
    await renderHeader()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/#projects',
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/#contact',
    )
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- Header`
Expected: FAIL — there is no link named "Projects" yet (the nav still renders "About" linking to `/about`), so `screen.getByRole('link', { name: 'Projects' })` throws.

- [ ] **Step 3: Delete the /about route and regenerate the route tree**

```bash
rm src/routes/about.tsx
pnpm generate-routes
```

Verify `src/routeTree.gen.ts` no longer contains `/about`:

```bash
grep -c "about" src/routeTree.gen.ts
```

Expected: `0`

- [ ] **Step 4: Replace the About nav link with a Projects anchor**

In `src/components/Header.tsx`, replace lines 88-94:

```tsx
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            {t('nav.about')}
          </Link>
```

with:

```tsx
          <a href="/#projects" className="nav-link">
            {t('nav.projects')}
          </a>
```

- [ ] **Step 5: Remove the orphaned nav.about translation key**

In `src/i18n/locales/en.json`, remove line 4 (`"nav.about": "About",`) so the file reads:

```json
{
  "nav.home": "Home",
  "nav.projects": "Projects",
  "nav.contact": "Contact",
```

In `src/i18n/locales/es.json`, remove line 4 (`"nav.about": "Acerca de",`) so the file reads:

```json
{
  "nav.home": "Inicio",
  "nav.projects": "Proyectos",
  "nav.contact": "Contacto",
```

In `src/i18n/locales/pt.json`, remove line 4 (`"nav.about": "Sobre",`) so the file reads:

```json
{
  "nav.home": "Início",
  "nav.projects": "Projetos",
  "nav.contact": "Contato",
```

(The rest of each file's keys are unchanged — only the `nav.about` line is deleted from each.)

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- Header`
Expected: PASS

- [ ] **Step 7: Run the full test suite to check for regressions**

Run: `pnpm test`
Expected: PASS — no regressions elsewhere (no other test references `/about`, `nav.about`, or the About nav link).

- [ ] **Step 8: Commit**

```bash
git add src/routes/about.tsx src/routeTree.gen.ts src/components/Header.tsx src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/test/Header.test.tsx
git commit -m "feat: remove /about route, add Projects nav link to /#projects"
```

Note: `git add` on a deleted file stages the deletion — this is correct.
