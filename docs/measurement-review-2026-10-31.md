# Measurement review: how each result was measured

Drafts for issues #67 (Result part, Approach trim), #73 (each result links to how it was measured) and #78 (How I work answers link to a case study), in en / pt / es. Content read from the live Sanity dataset on 2026-10-31 (13 case studies, 24 results, 4 FAQs, 3 hero results). Only what the published content already says is stated; everything else is **[confirm Qn]**, and every Qn is collected in section 5 so it can be answered in one pass.

**Status (2026-10-31):** draft, not approved. Nothing written to Sanity, no app code changed.

What the content supports, in short: the tool when the label names it (Lighthouse, App Store, Storybook), test tools named in an Approach, a "before" value stated in a Problem, and a window no wider than the case study's start and end dates. No case study says how a number was measured, on which device, or in which month.

## 1. Schema proposal (#67, #73)

### A. A `measurement` field on each `metric` (recommended)

```ts
// sanity/schemas/objects/metric.ts, one more field
defineField({
  name: 'measurement',
  title: 'How it was measured',
  type: 'object',
  description: 'Optional. Shown in the Result part of the case study, linked from the number.',
  fields: [
    defineField({ name: 'method', title: 'Method', type: 'localeString',
      description: 'What was counted and how, e.g. "Lab run, mobile, home page".',
      validation: (rule) => rule.required() }),
    defineField({ name: 'tool',   title: 'Tool',   type: 'string',
      description: 'Not translated, e.g. Lighthouse, Google Search Console, Jira.' }),
    defineField({ name: 'from',   title: 'From',   type: 'date',
      description: 'The single reading, or the "before" reading / start of the window.' }),
    defineField({ name: 'to',     title: 'To',     type: 'date',
      description: 'Optional. The "after" reading / end of the window.' }),
    defineField({ name: 'source', title: 'Source', type: 'url',
      description: 'Optional. A public report (PageSpeed, a store listing).' }),
  ],
})
```

The record lives inside the result it describes, so it is keyed to `results[_key]` by construction.

- **Link is structural.** Same object, same `_key`: nothing can point at a deleted result, reordering results carries the note with it, and no validator is needed (option B needs one like `resultKeyExists` in `heroResult.ts`).
- **Queries.** `CASE_STUDY_DETAIL_QUERY` asks for `results[]{ ${METRIC_FIELDS}, measurement }`. `CASE_STUDIES_QUERY` (cards and archive rows) stays as it is, so the home payload doesn't grow. TypeGen adds an optional `measurement` to the metric type. The hero already stores `caseStudy` + `resultKey`, so a hero number could later link to `#result-<_key>` on its case page without new fields.
- **UI.** A "Result" part after Approach, rendered only when at least one result has a `measurement` (the 12 case studies without notes look the same as today). One row per result with `id="result-<_key>"`: the number as published, then tool · method · when, e.g. "Lighthouse · Lab run, mobile, home page · Mar 2023 → Nov 2023". `Metric` in the strip gets an optional footnote marker linking to `#result-<_key>`, and each row links back to `#metric-<_key>` (#73).
- **Cost.** The note is edited inside each result's dialog in Studio, not as one block of prose. That is the point (#73), but there is no free paragraph for context that covers all results; a short optional `resultNote` localeBlock on the case study can come later if one is needed.

### B. A separate `measurements[]` array on the case study

`{ resultKey, method, tool, from, to, source }` items, like `heroResult`. Editors write all notes in one place, in story order. But the key can dangle or be duplicated (needs a custom validator against `document.results`), deleting or re-keying a result leaves an orphan, and the query has to join by key (`results[]{ ..., "measurement": ^.measurements[resultKey == ^._key][0] }`). More moving parts for the same output.

**Recommendation: A.** It satisfies #73's "keyed to `results[_key]`" without a key field, and #67's Result part is then a rendering of `results[].measurement`, not a separate localeBlock to keep in sync. **Q1 answered: A.**

Dates: `from` and `to` stay Sanity `date` fields holding the real date. When only the month is known, store its 1st. The front end shows month and year only ("Mar 2023", "mar. 2023"). When neither date is set, the row shows no dates. **Q2 answered.**

### Approach rule (#67)

New description for the `approach` field, in Studio (English only, like the other field descriptions):

> What you built, and in what order. Don't restate the Decision or the summary; numbers go in Results and their measurement.

## 2. Per case study, per result

Order as on the site (featured first, then archive by date). Hero results are marked. Each result: as published, what the content supports, the question, then the drafted measurement line. The `[...]` slots are filled from the answers.

### Redação Online, from PHP to Next.js (featured 1 · Feb 2023 – Jan 2025)

#### 40 → 95 · Lighthouse performance score (`0d50b67da185`, hero)

Supported: tool Lighthouse (label); 40 was the score before the migration (Problem: "a Lighthouse score of 40"); within Feb 2023 – Jan 2025. Live URL https://redacaoonline.com.br/.

**Q3 answered:** mobile, Lighthouse CLI, home page only. The owner doesn't remember the months, so `from` and `to` stay empty.

Record: tool `Lighthouse CLI`, no dates, no source.

**en:** Lighthouse CLI, performance category, mobile, on the home page: 40 before the migration, 95 after launch.

**pt:** Lighthouse CLI, categoria performance, mobile, na página inicial: 40 antes da migração, 95 depois do lançamento.

**es:** Lighthouse CLI, categoría de rendimiento, móvil, en la página de inicio: 40 antes de la migración, 95 después del lanzamiento.

#### +40% · Organic search traffic growth (`1603fde3c8f0`)

Supported: nothing about the method; within Feb 2023 – Jan 2025. Problem says the page was "ranking poorly on search" and "the migration couldn't break existing search rankings".

**Q4 answered:** organic sessions in Google Analytics. The owner doesn't remember the windows, so the dates stay empty.

Record: tool `Google Analytics`.

**en:** Organic sessions in Google Analytics, after launch against before the migration.

**pt:** Sessões orgânicas no Google Analytics, depois do lançamento contra antes da migração.

**es:** Sesiones orgánicas en Google Analytics, después del lanzamiento frente a antes de la migración.

### Capitual, internal banking tools (featured 2 · Oct 2021 – Nov 2022)

#### −96% · Production bugs (`3049fc78f46b`, hero)

Supported: nothing about the method; within Oct 2021 – Nov 2022. Summary: tests went in "before adding more features".

**Q5 answered:** counted in Jira. Both error monitoring and support team reports count as production bugs. Compared: the Jira history before the owner joined, against the first 3 months of their work (Oct–Dec 2021). The −96% compares bugs per month: the monthly average before, against the rate in those 3 months (Q5b confirmed).

Record: tool `Jira`, from `2021-10-01`, to `2021-12-31`.

**en:** Production bugs on the admin tools logged in Jira, from error monitoring and support team reports: bugs per month in the first 3 months of the work (Oct–Dec 2021) against the monthly average before.

**pt:** Bugs em produção nas ferramentas de administração registrados no Jira, vindos do monitoramento de erros e de relatos das equipes de suporte: bugs por mês nos 3 primeiros meses do trabalho (out.–dez. 2021) contra a média mensal anterior.

**es:** Bugs en producción en las herramientas de administración registrados en Jira, a partir del monitoreo de errores y de los reportes de los equipos de soporte: bugs por mes en los primeros 3 meses del trabajo (oct.–dic. 2021) frente al promedio mensual anterior.

#### 80% · Test coverage on critical flows (`f60a96d09d4a`)

Supported: E2E and unit tests (Approach); the role summary names Cypress and Jest for Capitual's testing pipeline; within Oct 2021 – Nov 2022.

**Q6 answered:** Jest and Cypress, with React Testing Library on web and React Native Testing Library on mobile. Critical flows: onboarding, account creation and account configuration. The 80% is Cypress code coverage on those flows (Q6b). Month unknown, so no dates.

Record: tool `Jest, Cypress`, no dates.

**en:** Cypress code coverage on the critical flows: onboarding, account creation and account configuration. Unit tests in Jest (React Testing Library on web, React Native Testing Library on mobile).

**pt:** Cobertura de código do Cypress nos fluxos críticos: onboarding, criação de conta e configuração da conta. Testes unitários em Jest (React Testing Library na web, React Native Testing Library no mobile).

**es:** Cobertura de código de Cypress en los flujos críticos: onboarding, creación de cuenta y configuración de la cuenta. Pruebas unitarias en Jest (React Testing Library en web, React Native Testing Library en móvil).

### Capitual, crypto bank app (featured 3 · Oct 2021 – Nov 2022)

#### 3.5 → 4.8 · App Store rating (`85b7fd4b0fc8`)

Supported: the App Store (label); within Oct 2021 – Nov 2022.

**Q7 answered:** the 3.5 → 4.8 is the overall rating on **Google Play**, not the App Store. The App Store rating was 4.2. Months unknown; no archived listing. The live URL (Capital.com's app) was cleared on 2026-10-31.

**Done 2026-10-31 (Q7b):** relabelled to "Google Play rating" ("Nota na Google Play", "Valoración en Google Play"), and added "App Store rating · 4.2" as a third result (`3ef3470ce3bd`, no dates). Backup: `~/sanity-backups/before-results-relabel-2026-10-31.tar.gz`.

Record: tool `Google Play`, no dates, no source.

**en:** Overall rating on Google Play: 3.5 before, 4.8 after.

**pt:** Nota geral na Google Play: 3,5 antes, 4,8 depois.

**es:** Valoración general en Google Play: 3,5 antes, 4,8 después.

#### −60% · Mobile bugs (`c92f62b84310`)

Supported: nothing about the method; within Oct 2021 – Nov 2022. Approach: "reviewed pull requests to help enforce the team's testing standards".

**Q8 answered:** bug reports counted in Jira and in store reviews; bugs, not crashes. Periods unknown, so no dates.

Record: tool `Jira, store reviews`, no dates.

**en:** Bugs on the mobile app, counted from Jira tickets and store reviews, after the work against before.

**pt:** Bugs no app, contados nos tickets do Jira e nas avaliações das lojas, depois do trabalho contra antes.

**es:** Bugs en la app, contados en los tickets de Jira y en las reseñas de las tiendas, después del trabajo frente a antes.

### C6 Bank, a landing page in under a second (featured 4 · Jan 2025 – Mar 2025)

Five results, all Lighthouse metrics or categories, so one question covers them.

- 0.9s · Largest Contentful Paint (`94671fdc123d`)
- 100 · Lighthouse accessibility score (`03e350f8a16f`)
- 90 · Lighthouse performance score (`7df097bbfe0a`)
- 100 · Lighthouse best practices score (`27c1efb7d202`)
- 1.5s · First Contentful Paint (`0a5d66700379`)

Supported: tool Lighthouse for the three scores (labels); LCP and FCP are Lighthouse metrics too, but could also be field data; within Jan – Mar 2025. Live URL https://www.c6bank.com.br/.

**Q9 answered:** Lighthouse, run in production, mobile and desktop, on three pages: the main page, the privacy clients page and the create account page. Desktop was all green, performance 98. LCP and FCP come from the same Lighthouse runs (lab, not field data). Month unknown, so no dates.

**Done 2026-10-31 (Q9b):** the five published numbers are the mobile run on the main page. The 90 is relabelled "Lighthouse performance score, mobile", and "Lighthouse performance score, desktop · 98" sits right after it. The desktop row takes the same record with "desktop" in place of "mobile".

Record: tool `Lighthouse`, no dates, source https://www.c6bank.com.br/.

**en:** Lighthouse, run in production, mobile, on the main page.

**pt:** Lighthouse, executado em produção, mobile, na página inicial.

**es:** Lighthouse, ejecutado en producción, móvil, en la página de inicio.

### Lovefy, AI dating platform (archive · Jan 2026 – Mar 2026)

#### 14d → 4d · Feature delivery time (`1625445214df`)

Supported: the change came with "AI agent workflows (Cursor and Claude)" and a CI/CD pipeline (Approach); within Jan – Mar 2026.

**Q10 answered:** work started → merged, median, over the planned features that were delivered. Periods unknown, so no dates.

Q10b: "started" read from Jira, "merged" from GitHub.

Record: tool `Jira, GitHub`, no dates.

**en:** Median time from work started (Jira) to merged (GitHub), over the planned features delivered: before against after.

**pt:** Tempo mediano do início do trabalho (Jira) até o merge (GitHub), nas funcionalidades planejadas e entregues: antes contra depois.

**es:** Tiempo mediano desde el inicio del trabajo (Jira) hasta el merge (GitHub), en las funcionalidades planificadas y entregadas: antes frente a después.

#### 100% · Test and documentation coverage (`4c50bf00652b`)

Supported: the CI/CD pipeline ran "Vitest, RTL, Playwright E2E, Storybook" (Approach); within Jan – Mar 2026.

**[confirm Q11]** Which tool reported the test coverage (Vitest coverage, lines or branches), and of which code? What does "documentation coverage" count (every component has a Storybook story)? Which month?

**en:** [Line/branch] coverage from Vitest on [scope], and a Storybook story for every [component], [month year].

**pt:** Cobertura de [linhas/branches] do Vitest em [escopo], e uma história no Storybook para cada [componente], [mês ano].

**es:** Cobertura de [líneas/ramas] de Vitest en [alcance], y una historia en Storybook para cada [componente], [mes año].

### Skydiet, web app and UI library (archive · Jan 2026 – Aug 2026)

#### 90% · Test coverage (`05f588499ece`)

Supported: CI/CD with Playwright, Vitest and RTL (Approach); within Jan – Aug 2026.

**[confirm Q12]** Which tool reported the 90% (Vitest coverage?), lines or branches, of which code, and which month?

**en:** [Line/branch] coverage from [Vitest] on [scope], [month year].

**pt:** Cobertura de [linhas/branches] do [Vitest] em [escopo], [mês ano].

**es:** Cobertura de [líneas/ramas] de [Vitest] en [alcance], [mes año].

#### 40+ · Components in the Atomic Design library (`94e2466f3147`)

Supported: a count of components in the Storybook library (Approach: "covering 40+ components"); within Jan – Aug 2026.

**[confirm Q13]** Which month was the count taken?

**en:** Components with a story in the project's Storybook, counted in [month year].

**pt:** Componentes com história no Storybook do projeto, contados em [mês ano].

**es:** Componentes con historia en el Storybook del proyecto, contados en [mes año].

### Skydiet, one app for web and mobile (archive · Jan 2026 – Aug 2026)

#### 80%+ · Code shared between web and mobile (`997c70fe1541`)

Supported: the shared layer is Tamagui on React Native and Expo (Approach); within Jan – Aug 2026.

**[confirm Q14]** How was "shared" measured: lines in shared packages against platform-specific files (with cloc or similar), or screens built once? Which month?

**en:** [Lines of code / screens] in shared packages against platform-specific ones, [counted with tool], [month year].

**pt:** [Linhas de código / telas] em pacotes compartilhados contra os específicos de cada plataforma, [contadas com ferramenta], [mês ano].

**es:** [Líneas de código / pantallas] en paquetes compartidos frente a los específicos de cada plataforma, [contadas con herramienta], [mes año].

### Bask, 3D telehealth landing page (archive · Jul 2024 – Aug 2024)

No results. Nothing to measure.

### Redação Online, core platform v2 (archive · Feb 2023 – Jan 2025)

#### 95+ · Lighthouse score (`912160fdeeb9`)

Supported: tool Lighthouse (label); within Feb 2023 – Jan 2025. FAQ 02 says "Lighthouse 95+ on mobile across my contract projects", which suggests mobile but is about contract work, not this platform.

**[confirm Q15]** Which category (performance, or all four)? Mobile or desktop? Which pages (95+ on each, or the lowest of them)? Which month?

**en:** Lighthouse [performance / every category], [mobile/desktop] lab run, [n] pages each at 95 or above, [month year].

**pt:** Lighthouse, [performance / todas as categorias], execução em laboratório [mobile/desktop], [n] páginas, todas com 95 ou mais, [mês ano].

**es:** Lighthouse, [rendimiento / todas las categorías], ejecución de laboratorio [móvil/escritorio], [n] páginas, todas con 95 o más, [mes año].

#### 0 · Downtime during the rollout (`4610b96a70dc`)

Supported: the migration was incremental (Approach) and the platform was in daily use (Problem: "without any disruption to people actively using it"); within Feb 2023 – Jan 2025.

**[confirm Q16]** How was zero downtime checked: an uptime monitor (which one), or no incident logged? From which month to which month did the rollout run?

**en:** No downtime recorded by [uptime monitor / the incident log] during the rollout, [month year] to [month year].

**pt:** Nenhuma indisponibilidade registrada pelo [monitor de uptime / registro de incidentes] durante o rollout, de [mês ano] a [mês ano].

**es:** Ninguna caída registrada por el [monitor de disponibilidad / registro de incidentes] durante el rollout, de [mes año] a [mes año].

#### 45+ · Components documented in Storybook (`acf0d70e7f1d`)

Supported: a count of components in the Storybook library (Approach: "documenting 45+ UI components"; the role summary says it was shared across the micro-frontends); within Feb 2023 – Jan 2025.

**[confirm Q17]** Which month was the count taken?

**en:** Components with a story in the shared Storybook, counted in [month year].

**pt:** Componentes com história no Storybook compartilhado, contados em [mês ano].

**es:** Componentes con historia en el Storybook compartido, contados en [mes año].

### Redação Online, AI mentor chat (archive · Feb 2023 – Jan 2025)

No results. (Its Approach says "Responses stream in under a second", a number with no result behind it; see Q23.)

### Redação Online, a checkout that keeps buyers (archive · Feb 2023 – Jan 2025)

#### 23% → 9% · Checkout drop-off (`ce23ce313bb3`, hero)

Supported: 23% is the old checkout (Problem: "leaking nearly a quarter of its buyers before they finished paying"); within Feb 2023 – Jan 2025.

**[confirm Q18]** Which tool (Google Analytics funnel, the payment provider's dashboard, the database)? What counts as drop-off (opened checkout and didn't pay)? Which two periods were compared, and which months?

**en:** Share of buyers who opened checkout and didn't pay, from [tool]: [period before the migration] against [period after] ([months]).

**pt:** Parcela dos compradores que abriram o checkout e não pagaram, segundo [ferramenta]: [período antes da migração] contra [período depois] ([meses]).

**es:** Proporción de compradores que abrieron el checkout y no pagaron, según [herramienta]: [periodo antes de la migración] frente a [periodo después] ([meses]).

### Electromaps, EV charging app (archive · Nov 2022 – Jan 2023)

#### 3mo · Time to ship the full app (`a41c0d3f96b1`)

Supported: the deadline was 3 months (Problem) and the case runs Nov 2022 – Jan 2023. The role on the timeline runs to Feb 2023.

**[confirm Q19]** Is "ship" the store release of the full app, in Jan 2023? Or did the release land in Feb 2023?

**en:** From the start of the contract (Nov 2022) to the full app's release on [Google Play / both stores] ([month year]).

**pt:** Do início do contrato (nov. 2022) ao lançamento do app completo na [Google Play / nas duas lojas] ([mês ano]).

**es:** Desde el inicio del contrato (nov. 2022) hasta el lanzamiento de la app completa en [Google Play / las dos tiendas] ([mes año]).

#### 100% · Test coverage on critical flows (`f67222c099e0`)

Supported: "full test coverage on critical flows" was a requirement (Problem); within Nov 2022 – Jan 2023. No test tool named.

**[confirm Q20]** Which tool (Jest, Detox, something else)? Which flows counted as critical? Line coverage of those modules, or every flow has a test?

**en:** [Line coverage from tool on / a test for each of] the critical flows ([flows]), at release ([month year]).

**pt:** [Cobertura de linhas da ferramenta em / um teste para cada um d]os fluxos críticos ([fluxos]), no lançamento ([mês ano]).

**es:** [Cobertura de líneas de la herramienta en / una prueba para cada uno de] los flujos críticos ([flujos]), en el lanzamiento ([mes año]).

### Capitual, customer support tool (archive · Oct 2021 – Nov 2022)

#### 80% · Components and screens in Storybook (`7ac4e422ee3c`)

Supported: a Storybook library of the tool's components (Approach); within Oct 2021 – Nov 2022.

**[confirm Q21]** 80% of what: components and screens of the support tool that have a story? Counted how, and in which month?

**en:** Components and screens of the support tool with a Storybook story, [n] of [total], [month year].

**pt:** Componentes e telas da ferramenta de suporte com história no Storybook, [n] de [total], [mês ano].

**es:** Componentes y pantallas de la herramienta de soporte con historia en Storybook, [n] de [total], [mes año].

#### 4wk → 3wk · Onboarding time for new developers (`bc36fe065d83`)

Supported: the two junior developers I mentored (Approach: "mentored two junior developers", "Mentoring cut the juniors' onboarding from 4 weeks to 3"); within Oct 2021 – Nov 2022.

**[confirm Q22]** When does onboarding end (first merged PR, first ticket done alone)? The 4 weeks came from whom (earlier hires, the team's usual estimate)?

**en:** Weeks from a junior developer's first day to [their first merged PR / first ticket done alone]: two juniors I mentored, against [earlier hires / the team's usual time].

**pt:** Semanas entre o primeiro dia de um dev júnior e [o primeiro PR mergeado / o primeiro ticket feito sozinho]: dois juniores que mentorei, contra [contratações anteriores / o tempo usual do time].

**es:** Semanas entre el primer día de un dev junior y [su primer PR fusionado / el primer ticket hecho solo]: dos juniors que mentoré, frente a [contrataciones anteriores / el tiempo habitual del equipo].

## 3. Approach trims (#67)

Only Redação Online, from PHP to Next.js has a Decision. Since the summary now shows as the lede on every case page, an Approach that restates the summary also counts. Four trims; the other nine: no change.

### Redação Online, from PHP to Next.js: trim

Cut: "turning WordPress into a Headless CMS behind a dedicated Next.js BFF layer" (said in the summary and the Decision) and "and SSG pre-rendering" (SSG is already named). Keeps what the BFF did, which is said nowhere else.

**en:** I led the migration to a decoupled front end in Next.js SSG, Tailwind CSS and DaisyUI. The BFF handled API communication and security. I also put the SEO basics in place: semantic HTML and dynamic Open Graph metadata.

**pt:** Liderei a migração para um front-end desacoplado em Next.js SSG, Tailwind CSS e DaisyUI. O BFF cuidava da comunicação com a API e da segurança. Também implementei a base de SEO: HTML semântico e metadados dinâmicos de Open Graph.

**es:** Lideré la migración a un front-end desacoplado en Next.js SSG, Tailwind CSS y DaisyUI. El BFF se encargaba de la comunicación con la API y de la seguridad. También implementé la base de SEO: HTML semántico y metadatos dinámicos de Open Graph.

### Capitual, internal banking tools: trim

Cut: "React … GraphQL" and "an automated testing pipeline covering both E2E and unit tests" (the summary says both: "We built the admin tools in React and GraphQL and covered their critical flows with end-to-end and unit tests").

**en:** The interfaces use Ant Design and Styled Components, run on AWS and ship through CI/CD pipelines. I also ran regular pair programming sessions and code reviews to mentor other developers and keep the architecture clean.

**pt:** As interfaces usam Ant Design e Styled Components, rodam na AWS e vão para produção por pipelines de CI/CD. Também conduzi sessões regulares de pair programming e code reviews para mentorar outros desenvolvedores e manter a arquitetura limpa.

**es:** Las interfaces usan Ant Design y Styled Components, corren en AWS y llegan a producción mediante pipelines de CI/CD. También realicé sesiones regulares de pair programming y code reviews para mentorar a otros desarrolladores y mantener la arquitectura limpia.

### C6 Bank, a landing page in under a second: trim

Cut: "Vite SSR, TanStack Router/Start", "Cloudflare CDN caching" and "mobile-first design" (all in the summary: "I built the public site mobile first on Vite SSR and TanStack Start, with Cloudflare caching in front"). Also drops "with Server Components" **[confirm Q23]**.

**en:** I worked full-stack: React, TypeScript, Tailwind CSS and Shadcn UI on the front end, React Query cache policies behind the Cloudflare cache, and quick back-end changes to endpoints and metadata when the pages needed them.

**pt:** Trabalhei full-stack: React, TypeScript, Tailwind CSS e Shadcn UI no front-end, políticas de cache do React Query atrás do cache da Cloudflare e ajustes rápidos no back-end, em endpoints e metadados, quando as páginas precisavam.

**es:** Trabajé full-stack: React, TypeScript, Tailwind CSS y Shadcn UI en el front-end, políticas de caché de React Query detrás de la caché de Cloudflare y ajustes rápidos en el back-end, en endpoints y metadatos, cuando las páginas lo necesitaban.

### Redação Online, a checkout that keeps buyers: trim

Cut: "built with Vite, Vue.js 3, and TypeScript" and "stronger … security around payment transactions" as the lead (the summary: "I rebuilt the live checkout in Vite, Vue and TypeScript, with stronger security around payments"). Keeps the parts the summary lacks: single-page app, client and API level, state and rendering.

**en:** The checkout became a decoupled single-page app. I hardened payment transactions on both the client and the API, and tuned state management and rendering for sub-second loads.

**pt:** O checkout virou uma single-page app desacoplada. Reforcei a segurança das transações de pagamento no cliente e na API, e otimizei o gerenciamento de estado e a renderização para carregar em menos de um segundo.

**es:** El checkout pasó a ser una single-page app desacoplada. Reforcé la seguridad de las transacciones de pago en el cliente y en la API, y optimicé el estado y el renderizado para cargar en menos de un segundo.

### No change

- **Capitual, crypto bank app:** the Approach gives what the summary only names (i18n in English, Portuguese and Spanish; useMemo, useCallback, React.memo).
- **Lovefy**, **Skydiet ×2**, **Bask**, **Redação Online core platform v2**, **Redação Online AI mentor chat**, **Electromaps**, **Capitual customer support tool:** no Decision, and the Approach doesn't restate the summary. (Their summaries are still the old keyword lists that restate the Approach; that is a summary rewrite, outside #67.)

### Numbers inside Approach

The rule above says numbers go in Results. These Approach sentences repeat a result, or state a number with no result behind it **[confirm Q24]**:

- Lovefy: "The CI/CD pipeline (Vitest, RTL, Playwright E2E, Storybook) reached 100% test and documentation coverage." (repeats a result; its tools would move into that result's measurement)
- Skydiet, web app: "covering 40+ components" (repeats a result)
- Redação Online core platform v2: "documenting 45+ UI components" (repeats a result)
- Capitual customer support tool: "Mentoring cut the juniors' onboarding from 4 weeks to 3" (repeats a result)
- Redação Online checkout: "for sub-second load times" (no result)
- Redação Online AI mentor chat: "Responses stream in under a second" (no result)

Cutting them is a deletion in all three languages, no new copy. Keeping them is fine until the Result part ships.

## 4. FAQ evidence (#78)

Up to two case studies per answer, shown as "See it in: …".

### 01 How do you migrate a stack without downtime?

1. **Redação Online, core platform v2.** Its result "0 · Downtime during the rollout" is the answer's opener, and its Approach says "I led the incremental migration to Next.js App Router".
2. **Redação Online, a checkout that keeps buyers.** Problem: "It had to move without interrupting purchases."

**[confirm Q25]** The answer's method (reverse proxy, one module at a time) is from Plin, which has no case study. Link these two Redação cases anyway? (Alternative to the checkout: Redação Online, from PHP to Next.js, "The migration couldn't break existing search rankings.")

### 02 How do you get Lighthouse to 95+?

1. **Redação Online, from PHP to Next.js.** Result "40 → 95 · Lighthouse performance score"; Approach: "Next.js SSG … SSG pre-rendering" (the answer's "static generation").
2. **Redação Online, core platform v2.** Result "95+ · Lighthouse score"; Approach: "SSR, ISG, and Server Components" (the answer's "SSR, React Server Components").

**[confirm Q26]** Or C6 Bank second: "Cloudflare CDN caching" matches "cache at the CDN edge", but its Lighthouse performance is 90, not 95+. Also, "page weight down 80% at Redação Online" (the answer's opener) appears in no case study: which case is it, and should it become a result there?

### 03 How do you keep micro-frontends consistent?

1. **Redação Online, core platform v2.** Approach: "a Storybook library documenting 45+ UI components"; the role summary places it "across the micro-frontends".
2. **Capitual, customer support tool.** Approach: "front-end delivery within a Micro-Frontend architecture … built out a Storybook library"; result "80% · Components and screens in Storybook".

**[confirm Q27]** Module Federation, the GraphQL gateway and per-app error boundaries (the rest of the answer) are in neither case. Which work were they? If Redação Online, core platform v2 should say so.

### 04 How do you put AI agents into your pipeline?

1. **Lovefy, AI dating platform.** Result "14d → 4d · Feature delivery time" is the answer's opener; Approach: "AI agent workflows (Cursor and Claude) to speed up day-to-day development", with a CI/CD pipeline in Vitest, RTL and Playwright.
2. **Skydiet, web app and UI library.** Approach: "used AI agents (GitHub & Claude) to build out shareholder-requested modules faster"; result "90% · Test coverage" backs "nothing merges without passing tests".

**[confirm Q28]** Skydiet web app, or Skydiet, one app for web and mobile ("custom MCP servers to speed up AI-assisted feature development")? Also: the answer names Claude Code; Lovefy's Approach says "Cursor and Claude". Same thing?

## 5. Questions for the owner

Hero results first: Q3, Q5, Q18 back the three numbers on the home page.

Schema

1. **Q1. Answered:** measurement as a field on each result (option A), with method, tool, from, to and source.
2. **Q2. Answered:** `from` and `to` hold real `date` values (the 1st when only the month is known); the front end shows month and year.

Results

3. **Q3. Answered:** Redação landing, Lighthouse 40 → 95 (hero): mobile, Lighthouse CLI, home page only. Months unknown, so no dates.
4. **Q4. Answered:** Redação landing, organic search +40%: organic sessions in Google Analytics; windows unknown, so no dates.
5. **Q5. Answered:** Capitual internal tools, production bugs −96% (hero): Jira, from error monitoring and support team reports; bugs per month in Oct–Dec 2021 against the monthly average before.
6. **Q6. Answered:** Capitual internal tools, 80% is Cypress code coverage on onboarding, account creation and account configuration. No dates.
7. **Q7. Answered, applied:** relabelled "Google Play rating" (3.5 → 4.8); App Store 4.2 added as its own result. No dates, no source.
8. **Q8. Answered:** Capitual crypto app, mobile bugs −60%: Jira and store reviews, bugs not crashes. No dates.
9. **Q9. Answered, applied:** C6 Bank numbers are mobile, main page, Lighthouse lab in production; desktop 98 added. No dates.
10. **Q10. Answered:** Lovefy, 14 → 4 days: median, started (Jira) → merged (GitHub), over planned features delivered. No dates.
11. **Q11.** Lovefy, 100% test and documentation coverage: which tool and which coverage (Vitest lines or branches)? What does documentation coverage count? Which month?
12. **Q12.** Skydiet web app, 90% coverage: which tool, lines or branches, of which code, which month?
13. **Q13.** Skydiet web app, 40+ components: month of the count?
14. **Q14.** Skydiet universal app, 80%+ shared code: lines in shared packages (with which tool) or screens built once? Which month?
15. **Q15.** Redação core platform v2, Lighthouse 95+: which category, mobile or desktop, which pages, which month?
16. **Q16.** Redação core platform v2, zero downtime: uptime monitor (which) or incident log? Rollout from which month to which?
17. **Q17.** Redação core platform v2, 45+ Storybook components: month of the count?
18. **Q18.** Redação checkout, drop-off 23% → 9% (hero): which tool? Drop-off defined as opened checkout and didn't pay? Which two periods, which months?
19. **Q19.** Electromaps, 3 months to ship: store release of the full app in Jan 2023 (the role runs to Feb 2023)? Which store(s)?
20. **Q20.** Electromaps, 100% coverage on critical flows: which tool? Which flows? Line coverage or a test per flow?
21. **Q21.** Capitual support tool, 80% in Storybook: 80% of which components and screens, counted how, which month?
22. **Q22.** Capitual support tool, onboarding 4 → 3 weeks: when does onboarding end? Where does the 4-week baseline come from?

Approach

23. **Q23.** C6 Bank: drop "with Server Components" from the Approach, or did the site use them?
24. **Q24.** Cut the six numbers inside Approach (section 3), or keep them until the Result part ships? For the AI mentor chat's "under a second", add it as a result (with how it was measured) or cut it?

FAQ evidence

25. **Q25.** 01 (migration): core platform v2 + checkout, though the method in the answer is from Plin? Or landing instead of checkout?
26. **Q26.** 02 (Lighthouse): landing + core platform v2, or landing + C6 Bank? Which case is "page weight down 80%", and should it be a result?
27. **Q27.** 03 (micro-frontends): core platform v2 + Capitual support tool? Which work had Module Federation and the GraphQL gateway?
28. **Q28.** 04 (AI agents): Lovefy + Skydiet web app, or + Skydiet universal app? Is "Claude Code" in the answer the same as "Cursor and Claude" in Lovefy?
