# Project highlights & challenges content structure — design

## Context

The `project` document's `longDescription` field is a single plain-text field per
locale (`localeText`: `en`/`pt`/`es`), rendered in `ProjectDetails.tsx` as one
unbroken `<p>`. Existing content (e.g. Lovefy) was written in a STAR format using
markdown bold labels (`**Situation:**`, `**Task:**`, ...) as a workaround for the
lack of real structure — the markdown never renders; it shows as literal `**`
characters in one wall of text.

The user wants: two paragraphs, a bullet list of highlights, and a bullet list of
challenges faced, rendered as real structure — not markdown-in-a-blob, and not a
Portable Text field either. Once real `highlights`/`challenges` list fields exist,
the STAR markdown labels become unnecessary: the section headings come from real
UI structure, and `longDescription` goes back to being plain flowing prose (no
bold, no lists needed inside it).

This is being implemented schema-wide (available to every project going forward),
but content is only being written for the Lovefy project as the first example —
other existing projects keep working unchanged since the new fields are optional.

## Decision: structured fields, not richer text

- `longDescription` (existing `localeText` field, unchanged type): becomes two
  paragraphs, separated by a blank line in the raw text.
- `highlights` (new): `array of localeString` — each item a short, concrete
  achievement, e.g. "Built a Node.js + NestJS BFF layer...".
- `challenges` (new): `array of localeString` — each item a short problem faced
  building the project.

No markdown, no Portable Text, no new rendering dependency. Sanity's own answer to
"I want bold/lists in one field" is Portable Text + `@portabletext/react` — but
that's for genuinely freeform prose with occasional inline formatting. Here the
shape is fully predictable (prose + two flat lists), so plain structured fields are
simpler, safer (no HTML/markdown injection surface), and match the existing
codebase convention of arrays-of-primitives for list-shaped content (e.g.
`techStack: array of string`).

## Schema changes

Both schema copies must be updated identically (existing duplication in the
codebase — a legacy standalone Studio at `studio-personal-portfolio/` and a
second Studio embedded at `my-tanstack-app/sanity/`, both pointing at the same
Sanity project/dataset; not addressed by this change, just kept in sync as the
current pattern already requires):

- `studio-personal-portfolio/schemaTypes/project.ts`
- `my-tanstack-app/sanity/schemas/project.ts`

Add, after the existing `longDescription` field:

```ts
{
  name: 'highlights',
  title: 'Highlights',
  type: 'array',
  of: [{ type: 'localeString' }],
},
{
  name: 'challenges',
  title: 'Challenges',
  type: 'array',
  of: [{ type: 'localeString' }],
},
```

Both optional (no `validation: Rule.required()`), so existing project documents
without them keep rendering fine — the frontend only shows a section when its
array is present and non-empty.

## Type/query changes (`my-tanstack-app`)

- `src/types/sanity.ts`: add `highlights?: LocaleString[]` and
  `challenges?: LocaleString[]` to `SanityProject`.
- `src/lib/queries/projects.ts`: add `highlights[]{en, pt, es}` and
  `challenges[]{en, pt, es}` to the detail GROQ projection (`detailQuery`) — not
  the list query, since these aren't needed on `/projects` card views.

## Frontend changes (`ProjectDetails.tsx`)

- Split `project.longDescription[lang]` on blank lines (`\n\s*\n`), render each
  non-empty chunk as its own `<p>` (same styling as today's single `<p>`).
- After the paragraphs, if `project.highlights` is present and non-empty, render
  a heading ("Highlights", localized via `t('project.highlights')`) and a `<ul>`
  of `project.highlights.map(h => h[lang])`.
- Same pattern for `challenges` / "Challenges" / `t('project.challenges')`.
- Both sections render nothing (not even the heading) when their array is
  absent or empty — existing projects without this content see no change.
- New i18n keys needed: `project.highlights` and `project.challenges` (en/pt/es)
  in whatever i18n dictionary file already backs `t('project.scrollHint')` etc.

## Content: Lovefy (first example)

Sourced from the existing raw STAR-format content (already accurate — real tech
stack, real results), restructured into the new shape, translated consistently
across en/pt/es. Final approved copy:

**English — longDescription (two paragraphs):**

> Lovefy needed a high-performance web platform for AI-assisted, long-term dating — real-time messaging, photo sharing, fast page transitions, and AI-powered match assistance, all under real production traffic.
>
> I joined as a Front-End Software Engineer acting full-stack, owning the real-time chat architecture end to end: building a Node.js + NestJS BFF, resolving backend API bottlenecks, and designing a hybrid rendering strategy (ISG + SSR + virtualization) to keep the app fast under load. I built the Next.js application on Vercel with React, TypeScript, Tailwind CSS, Shadcn UI, and React Query, and set up a CI/CD pipeline alongside AI agent workflows (Cursor and Claude) to speed up day-to-day development.

**English — highlights:**
- Built a Node.js + NestJS BFF layer that streamlined API contracts and resolved backend bottlenecks
- Implemented list virtualization and caching for instant, low-latency chat rendering
- Combined ISG for dashboards with SSR for fast, seamless page transitions
- Set up a full CI/CD pipeline (Vitest, RTL, Playwright E2E, Storybook) reaching 100% test and documentation coverage
- Introduced AI agent workflows (Cursor & Claude) that cut feature delivery time from 2 weeks to 4 days

**English — challenges:**
- Eliminating real-time chat latency without sacrificing UI smoothness, solved via SSR-aware list virtualization
- Owning full-stack scope as a front-end engineer, including designing and building the BFF layer from scratch
- Keeping bundle size in check while continuously shipping new AI-assisted features
- Speeding up delivery without cutting corners on test coverage or documentation

**Portuguese — longDescription:**

> A Lovefy precisava de uma plataforma web de alta performance para relacionamentos de longo prazo com apoio de IA — mensagens em tempo real, envio de fotos, transições rápidas entre páginas e assistentes de IA para matches, tudo sob tráfego real de produção.
>
> Entrei como Engenheiro de Software Front-End atuando como Full-Stack, responsável de ponta a ponta pela arquitetura do chat em tempo real: construção de um BFF em Node.js + NestJS, resolução de gargalos nas APIs de back-end e desenho de uma estratégia de renderização híbrida (ISG + SSR + virtualização) para manter a aplicação rápida mesmo sob carga. Desenvolvi a aplicação web em Next.js implantada na Vercel com React, TypeScript, Tailwind CSS, Shadcn UI e React Query no front-end, junto com um BFF em Node.js + NestJS que simplificou os contratos de API entre cliente e serviços de back-end. Além do trabalho de engenharia, montei um pipeline de CI/CD e introduzi fluxos de agentes de IA (Cursor e Claude) para acelerar o dia a dia do desenvolvimento.

**Portuguese — highlights:**
- Construiu uma camada de BFF em Node.js + NestJS que simplificou os contratos de API e resolveu gargalos no back-end
- Implementou virtualização de listas e cache para renderização instantânea e de baixa latência do chat
- Combinou ISG nos dashboards com SSR para transições de página rápidas e contínuas
- Criou um pipeline de CI/CD completo (Vitest, RTL, Playwright E2E, Storybook) alcançando 100% de cobertura de testes e documentação
- Introduziu fluxos de agentes de IA (Cursor e Claude) que reduziram o tempo de entrega de funcionalidades de 2 semanas para 4 dias

**Portuguese — challenges:**
- Eliminar a latência do chat em tempo real sem abrir mão da fluidez da interface, resolvido com virtualização de listas orientada a SSR
- Assumir escopo full-stack como engenheiro front-end, incluindo o desenho e a construção do BFF do zero
- Manter o tamanho do bundle sob controle enquanto novas funcionalidades com IA eram lançadas continuamente
- Acelerar a entrega sem abrir mão da cobertura de testes ou da documentação

**Spanish — longDescription:**

> Lovefy necesitaba una plataforma web de alto rendimiento para citas a largo plazo impulsada por IA — mensajería en tiempo real, envío de fotos, transiciones rápidas entre páginas y asistentes de IA para matches, todo bajo tráfico real de producción.
>
> Me incorporé como Ingeniero de Software Front-End actuando como Full-Stack, responsable de principio a fin de la arquitectura del chat en tiempo real: construcción de un BFF en Node.js + NestJS, resolución de cuellos de botella en las APIs de back-end y diseño de una estrategia de renderizado híbrido (ISG + SSR + virtualización) para mantener la aplicación rápida incluso bajo carga. Construí la aplicación web en Next.js desplegada en Vercel con React, TypeScript, Tailwind CSS, Shadcn UI y React Query en el front-end, junto con un BFF en Node.js + NestJS que simplificó los contratos de API entre el cliente y los servicios de back-end. Además del trabajo de ingeniería, configuré un pipeline de CI/CD e introduje flujos de agentes de IA (Cursor y Claude) para acelerar el desarrollo diario.

**Spanish — highlights:**
- Construyó una capa de BFF en Node.js + NestJS que simplificó los contratos de API y resolvió cuellos de botella en el back-end
- Implementó virtualización de listas y caché para un renderizado de chat instantáneo y de baja latencia
- Combinó ISG en los paneles de usuario con SSR para transiciones de página rápidas y fluidas
- Configuró un pipeline de CI/CD completo (Vitest, RTL, Playwright E2E, Storybook) alcanzando 100% de cobertura de pruebas y documentación
- Introdujo flujos de agentes de IA (Cursor y Claude) que redujeron el tiempo de entrega de funcionalidades de 2 semanas a 4 días

**Spanish — challenges:**
- Eliminar la latencia del chat en tiempo real sin sacrificar la fluidez de la interfaz, resuelto con virtualización de listas orientada a SSR
- Asumir un alcance full-stack como ingeniero front-end, incluyendo el diseño y la construcción del BFF desde cero
- Mantener el tamaño del bundle bajo control mientras se lanzaban continuamente nuevas funcionalidades con IA
- Acelerar la entrega sin sacrificar la cobertura de pruebas ni la documentación

## Applying the Sanity content update

The `project` document for Lovefy already exists (`_id: goWIk3h6SuGMXzHRsLrZLz`,
dataset `production`, project `wbbntp0o`). This change needs a Sanity mutation
(patch) against that document — via the Sanity MCP server (requires OAuth
authentication first) or the `sanity` CLI/`@sanity/client` with a write token.
Whichever is used, this is a live production content write, not a code change —
it should be applied once schema changes are deployed (the new fields must exist
in the dataset's schema before/at the same time the document is patched with
them, though Sanity is schemaless at the storage layer so technically the patch
would succeed regardless of deploy order — the practical requirement is just that
the Studio schema is updated so the fields are editable/visible there afterward).

## Testing

- `ProjectDetails.test.tsx`: new tests for paragraph splitting (two `<p>` from a
  blank-line-separated string), highlights list rendering, challenges list
  rendering, and the "renders nothing when absent" case for both new sections —
  plus confirm existing tests (which pass a single-paragraph `longDescription`
  and no highlights/challenges) still pass unchanged.

## Out of scope

- Not fixing the pre-existing duplicated Studio setup (`studio-personal-portfolio/`
  vs. `my-tanstack-app/sanity/`) — both get the same schema edit, matching how
  the codebase already keeps them in sync.
- Not writing highlights/challenges content for any project other than Lovefy.
- No Portable Text migration for `longDescription` — out of scope per the design
  decision above.
