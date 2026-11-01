# Measurement review: how each result was measured

Drafts for issues #67 (Result part, Approach trim), #73 (each result links to how it was measured) and #78 (How I work answers link to a case study), in en / pt / es. Content read from the live Sanity dataset on 2026-10-31 (13 case studies, 24 results, 4 FAQs, 3 hero results). Only what the published content already says is stated; everything else is **[confirm Qn]**, and every Qn is collected in section 5 so it can be answered in one pass.

**Status (2026-10-31):** all 28 questions answered and applied. Measurements, Approach trims and FAQ links are live in Sanity production (backups in `~/sanity-backups/`); the code is in #89 (measurements) and #90 (FAQ links). This file is the record of the answers.

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

**Q11 answered:** Vitest coverage over the whole app; documentation coverage means every component has a Storybook story (Q11b).

Record: tool `Vitest, Storybook`, no dates.

**en:** Vitest test coverage over the whole app, and a Storybook story for every component.

**pt:** Cobertura de testes do Vitest no app inteiro, e uma história no Storybook para cada componente.

**es:** Cobertura de pruebas de Vitest en toda la app, y una historia en Storybook para cada componente.

### Skydiet, web app and UI library (archive · Jan 2026 – Aug 2026)

#### 90% · Test coverage (`05f588499ece`)

Supported: CI/CD with Playwright, Vitest and RTL (Approach); within Jan – Aug 2026.

**Q12 answered:** Vitest and Playwright, over the whole app. No dates.

Record: tool `Vitest, Playwright`, no dates.

**en:** Test coverage from Vitest and Playwright over the whole app.

**pt:** Cobertura de testes do Vitest e do Playwright no app inteiro.

**es:** Cobertura de pruebas de Vitest y Playwright en toda la app.

#### 40+ · Components in the Atomic Design library (`94e2466f3147`)

Supported: a count of components in the Storybook library (Approach: "covering 40+ components"); within Jan – Aug 2026.

**Q13 answered:** counted in Storybook; month skipped.

Record: tool `Storybook`, no dates.

**en:** Components with a story in the project's Storybook.

**pt:** Componentes com história no Storybook do projeto.

**es:** Componentes con historia en el Storybook del proyecto.

### Skydiet, one app for web and mobile (archive · Jan 2026 – Aug 2026)

#### 80%+ · Code shared between web and mobile (`997c70fe1541`)

Supported: the shared layer is Tamagui on React Native and Expo (Approach); within Jan – Aug 2026.

**Q14 answered:** an estimate, not a count. No dates.

Record: method only, no tool, no dates.

**en:** An estimate of the code shared between the web and mobile apps, not a line count.

**pt:** Uma estimativa do código compartilhado entre os apps web e mobile, não uma contagem de linhas.

**es:** Una estimación del código compartido entre las apps web y móvil, no un conteo de líneas.

### Bask, 3D telehealth landing page (archive · Jul 2024 – Aug 2024)

No results. Nothing to measure.

### Redação Online, core platform v2 (archive · Feb 2023 – Jan 2025)

#### 95+ · Lighthouse score (`912160fdeeb9`)

Supported: tool Lighthouse (label); within Feb 2023 – Jan 2025. FAQ 02 says "Lighthouse 95+ on mobile across my contract projects", which suggests mobile but is about contract work, not this platform.

**Q15 answered:** all four Lighthouse categories at 95 or more, desktop, on every page. No dates. **Done 2026-10-31 (Q15b):** relabelled "Lighthouse scores, desktop" ("Notas no Lighthouse, desktop", "Puntuaciones en Lighthouse, escritorio"). Backup: `~/sanity-backups/before-lighthouse-relabel-2026-10-31.tar.gz`.

Record: tool `Lighthouse`, no dates.

**en:** Lighthouse, desktop: performance, accessibility, best practices and SEO all at 95 or more, on every page.

**pt:** Lighthouse, desktop: performance, acessibilidade, boas práticas e SEO todas em 95 ou mais, em todas as páginas.

**es:** Lighthouse, escritorio: rendimiento, accesibilidad, buenas prácticas y SEO todas en 95 o más, en todas las páginas.

#### 0 · Downtime during the rollout (`4610b96a70dc`)

Supported: the migration was incremental (Approach) and the platform was in daily use (Problem: "without any disruption to people actively using it"); within Feb 2023 – Jan 2025.

**Q16 answered:** no incident in the Google Cloud (GCP) incident log during the rollout. No dates.

Record: tool `Google Cloud incident log`, no dates.

**en:** No downtime in the Google Cloud incident log during the rollout.

**pt:** Nenhuma indisponibilidade no registro de incidentes do Google Cloud durante o rollout.

**es:** Ninguna caída en el registro de incidentes de Google Cloud durante el rollout.

#### 45+ · Components documented in Storybook (`acf0d70e7f1d`)

Supported: a count of components in the Storybook library (Approach: "documenting 45+ UI components"; the role summary says it was shared across the micro-frontends); within Feb 2023 – Jan 2025.

**Q17 answered:** counted in the Storybook of the internal UI library. No dates.

Record: tool `Storybook`, no dates.

**en:** Components with a story in the internal UI library's Storybook.

**pt:** Componentes com história no Storybook da biblioteca de UI interna.

**es:** Componentes con historia en el Storybook de la biblioteca de UI interna.

### Redação Online, AI mentor chat (archive · Feb 2023 – Jan 2025)

No results. (Its Approach says "Responses stream in under a second", a number with no result behind it; see Q23.)

### Redação Online, a checkout that keeps buyers (archive · Feb 2023 – Jan 2025)

#### 23% → 9% · Checkout drop-off (`ce23ce313bb3`, hero)

Supported: 23% is the old checkout (Problem: "leaking nearly a quarter of its buyers before they finished paying"); within Feb 2023 – Jan 2025.

**Q18 answered:** read from the payment provider's data. Periods unknown, so no dates. Drop-off is checkouts started that weren't paid (Q18b confirmed).

Record: tool `Payment provider`, no dates.

**en:** Share of checkouts started and not paid, from the payment provider: the old checkout against the new one.

**pt:** Parcela dos checkouts iniciados e não pagos, segundo o provedor de pagamento: o checkout antigo contra o novo.

**es:** Proporción de checkouts iniciados y no pagados, según el proveedor de pagos: el checkout antiguo frente al nuevo.

### Electromaps, EV charging app (archive · Nov 2022 – Jan 2023)

#### 3mo · Time to ship the full app (`a41c0d3f96b1`)

Supported: the deadline was 3 months (Problem) and the case runs Nov 2022 – Jan 2023. The role on the timeline runs to Feb 2023.

**Q19 answered:** from the start of work to the full app's release on both stores. The case's own dates (Nov 2022 – Jan 2023) bound it.

Record: tool `App Store, Google Play`, from `2022-11-01`, to `2023-01-31`.

**en:** From the start of work (Nov 2022) to the full app's release on the App Store and Google Play (Jan 2023).

**pt:** Do início do trabalho (nov. 2022) ao lançamento do app completo na App Store e na Google Play (jan. 2023).

**es:** Desde el inicio del trabajo (nov. 2022) hasta el lanzamiento de la app completa en la App Store y Google Play (ene. 2023).

#### 100% · Test coverage on critical flows (`f67222c099e0`)

Supported: "full test coverage on critical flows" was a requirement (Problem); within Nov 2022 – Jan 2023. No test tool named.

**Q20 answered:** one test for each critical flow, with Jest and React Native Testing Library, plus Maestro end-to-end flows. Critical flows: login, checkout, maps, and the offline architecture. (Q20b: the textbook-scanning flows given first belonged to another project.) Q19 confirmed for this project.

Record: tool `Jest, React Native Testing Library, Maestro`, no dates.

**en:** A test for each critical flow (login, checkout, maps and offline use), in Jest and React Native Testing Library, with end-to-end flows in Maestro.

**pt:** Um teste para cada fluxo crítico (login, checkout, mapas e uso offline), em Jest e React Native Testing Library, com fluxos end-to-end no Maestro.

**es:** Una prueba para cada flujo crítico (login, checkout, mapas y uso sin conexión), en Jest y React Native Testing Library, con flujos end-to-end en Maestro.

### Capitual, customer support tool (archive · Oct 2021 – Nov 2022)

#### 80% · Components and screens in Storybook (`7ac4e422ee3c`)

Supported: a Storybook library of the tool's components (Approach); within Oct 2021 – Nov 2022.

**Q21 answered:** components of the support tool with a Storybook story, 40 of 50. No dates.

Record: tool `Storybook`, no dates.

**en:** Components of the support tool with a Storybook story: 40 of 50.

**pt:** Componentes da ferramenta de suporte com história no Storybook: 40 de 50.

**es:** Componentes de la herramienta de soporte con historia en Storybook: 40 de 50.

#### 4wk → 3wk · Onboarding time for new developers (`bc36fe065d83`)

Supported: the two junior developers I mentored (Approach: "mentored two junior developers", "Mentoring cut the juniors' onboarding from 4 weeks to 3"); within Oct 2021 – Nov 2022.

**Q22 answered:** onboarding ends at the first ticket done alone; the 4 weeks is the team's usual estimate. No dates.

Record: method only, no tool, no dates.

**en:** Time until each of the two junior developers finished a ticket alone: 3 weeks, against the team's usual estimate of 4.

**pt:** Tempo até cada um dos dois desenvolvedores juniores concluir um ticket sozinho: 3 semanas, contra a estimativa habitual da equipe de 4.

**es:** Tiempo hasta que cada uno de los dos desarrolladores junior terminó un ticket solo: 3 semanas, frente a la estimación habitual del equipo de 4.

## 3. Approach trims (#67)

Only Redação Online, from PHP to Next.js has a Decision. Since the summary now shows as the lede on every case page, an Approach that restates the summary also counts. Four trims; the other nine: no change. **Done 2026-10-31:** all four applied in en/pt/es as written below, except that the checkout's "for sub-second loads" stays cut (Q24). Backup: `~/sanity-backups/before-approach-rewrites-2026-10-31.tar.gz`.

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

Cut: "Vite SSR, TanStack Router/Start", "Cloudflare CDN caching" and "mobile-first design" (all in the summary: "I built the public site mobile first on Vite SSR and TanStack Start, with Cloudflare caching in front"). Also drops "with Server Components": the site didn't use them (Q23), and the React Server Components tag is gone from its stack.

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

The rule above says numbers go in Results. These Approach sentences repeat a result, or state a number with no result behind it. **Done 2026-10-31 (Q24): all six cut** in all three languages (Lovefy's sentence was its own paragraph and is gone; the AI mentor chat now reads "Responses are streamed, and…"). Backup: `~/sanity-backups/before-approach-trims-2026-10-31.tar.gz`.

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

**Q25 answered: keep these two.** The answer's method (reverse proxy, one module at a time) is from Plin, which has no case study; both Redação cases are migrations without downtime, so they stay as the evidence. (Alternative to the checkout: Redação Online, from PHP to Next.js, "The migration couldn't break existing search rankings.")

### 02 How do you get Lighthouse to 95+?

1. **Redação Online, from PHP to Next.js.** Result "40 → 95 · Lighthouse performance score"; Approach: "Next.js SSG … SSG pre-rendering" (the answer's "static generation").
2. **Redação Online, core platform v2.** Result "95+ · Lighthouse score"; Approach: "SSR, ISG, and Server Components" (the answer's "SSR, React Server Components").

**Q26 answered: Redação Online, from PHP to Next.js + C6 Bank** (replacing core platform v2 above). Since 2026-10-31 the answer opens with exactly those two: "Lighthouse performance from 40 to 95 at Redação Online, and a 0.9 s Largest Contentful Paint at C6 Bank". The unsourced 80% page-weight line is gone.

### 03 How do you keep micro-frontends consistent?

1. **Redação Online, core platform v2.** Approach: "a Storybook library documenting 45+ UI components"; the role summary places it "across the micro-frontends".
2. **Capitual, customer support tool.** Approach: "front-end delivery within a Micro-Frontend architecture … built out a Storybook library"; result "80% · Components and screens in Storybook".

**Q27 answered: Redação Online, core platform v2.** **Done 2026-10-31:** its Approach gained a paragraph in all three languages: "The platform was split into micro-frontends with Module Federation behind a single GraphQL gateway, and each app had its own error boundaries and cache, so a failure stayed local." Links stay as above. Backup: `~/sanity-backups/before-v2-microfrontends-2026-10-31.tar.gz`.

### 04 How do you put AI agents into your pipeline?

1. **Lovefy, AI dating platform.** Result "14d → 4d · Feature delivery time" is the answer's opener; Approach: "AI agent workflows (Cursor and Claude) to speed up day-to-day development", with a CI/CD pipeline in Vitest, RTL and Playwright.
2. **Skydiet, web app and UI library.** Approach: "used AI agents (GitHub & Claude) to build out shareholder-requested modules faster"; result "90% · Test coverage" backs "nothing merges without passing tests".

**Q28 answered: Lovefy + Skydiet web app**, as above. "Claude Code" in the answer and "Cursor and Claude" in Lovefy's Approach are the same tooling (confirmed).

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
11. **Q11. Answered:** Lovefy, 100%: Vitest coverage over the whole app, and a Storybook story for every component.
12. **Q12. Answered:** Skydiet web app, 90%: Vitest and Playwright over the whole app. No dates.
13. **Q13. Answered:** Skydiet web app, 40+ components counted in Storybook. No dates.
14. **Q14. Answered:** Skydiet universal app, 80%+ shared code is an estimate. No dates.
15. **Q15. Answered, applied:** Redação core platform v2, 95+: all four Lighthouse categories, desktop, every page; relabelled "Lighthouse scores, desktop".
16. **Q16. Answered:** Redação core platform v2, zero downtime: Google Cloud incident log. No dates.
17. **Q17. Answered:** Redação core platform v2, 45+ components counted in the internal UI library's Storybook. No dates.
18. **Q18. Answered:** Redação checkout, 23% → 9% (hero): checkouts started and not paid, from the payment provider; periods unknown.
19. **Q19. Answered:** Electromaps, 3 months: start of work → release on both stores (Nov 2022 – Jan 2023). Confirmed.
20. **Q20. Answered:** Electromaps, 100%: a test for each critical flow (login, checkout, maps, offline), Jest + RNTL, Maestro E2E. No dates.
21. **Q21. Answered:** Capitual support tool, 80%: 40 of 50 components have a Storybook story. No dates.
22. **Q22. Answered:** Capitual support tool, 4 → 3 weeks: until the first ticket done alone; 4 weeks is the team's usual estimate.

Approach

23. **Q23. Answered, applied:** "with Server Components" cut from C6 Bank's Approach.
24. **Q24. Answered, applied:** all six numbers cut from the Approach texts.

FAQ evidence

25. **Q25. Answered:** migration FAQ links core platform v2 + checkout.
26. **Q26. Answered:** Lighthouse FAQ links Redação landing (PHP → Next.js) + C6 Bank, matching its new opener.
27. **Q27. Answered, applied:** Module Federation, GraphQL gateway and error boundaries were Redação core platform v2; added to its Approach.
28. **Q28. Answered:** AI agents FAQ links Lovefy + Skydiet web app. "Claude Code" = Lovefy's "Cursor and Claude" (confirmed).
