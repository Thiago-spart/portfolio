# Copy review: critique round 3

Drafts for Sanity and the UI strings, in en / pt / es, from the 2026-10-31 Impeccable critique (phases 4 and 5, plus the "working with me" note). Nothing is written to Sanity until approved. Every number below already exists in Sanity; anything I could not source is marked **[confirm]**.

## 1. Experience timeline: scope and leadership, not the same numbers again

The hero, the cards and the FAQ already carry 40 → 95, +40%, 23% → 9%, −96%, 80% and 0.9s. The role summaries say what the role covered instead. Plin, Government of Pernambuco and the independent contracts keep their numbers (they appear nowhere else).

### Lead Frontend Engineer · Redação Online

**en:** I led the front end of an edtech platform for ENEM and public-exam students: the landing page's move from PHP and WordPress to Next.js, the checkout rebuild in Vite, Vue and TypeScript, and a shared Storybook library of 45+ components across the micro-frontends.

**pt:** Liderei o front-end de uma plataforma de edtech para alunos do ENEM e de concursos públicos: a migração da landing page de PHP e WordPress para Next.js, a reconstrução do checkout com Vite, Vue e TypeScript e uma biblioteca compartilhada no Storybook com mais de 45 componentes entre os micro-frontends.

**es:** Lideré el front-end de una plataforma de edtech para estudiantes del ENEM y de oposiciones: la migración de la landing page de PHP y WordPress a Next.js, la reconstrucción del checkout con Vite, Vue y TypeScript y una biblioteca compartida en Storybook con más de 45 componentes entre los micro-frontends.

### Frontend Developer · Capitual

**en:** I worked on the front end of Capitual's internal tools and mobile banking app, in a micro-frontend architecture with React, GraphQL and AWS. We put a testing pipeline with Cypress, Jest and Storybook in place before adding features to the critical flows.

**pt:** Trabalhei no front-end das ferramentas internas e do app bancário da Capitual, em uma arquitetura de micro-frontends com React, GraphQL e AWS. Montamos um pipeline de testes com Cypress, Jest e Storybook antes de adicionar funcionalidades aos fluxos críticos.

**es:** Trabajé en el front-end de las herramientas internas y la app bancaria de Capitual, en una arquitectura de micro-frontends con React, GraphQL y AWS. Montamos un pipeline de pruebas con Cypress, Jest y Storybook antes de sumar funcionalidades a los flujos críticos.

### Senior Mobile & Web Engineer · Freelance

**en:** I build web and mobile products for startups with React Native, Next.js and Vite. Recent work: Skydiet's web and mobile apps on one Tamagui codebase, C6 Bank's public site on Vite SSR and TanStack Start, and an agent-assisted delivery pipeline for Lovefy.

**pt:** Construo produtos web e mobile para startups com React Native, Next.js e Vite. Trabalhos recentes: os apps web e mobile da Skydiet em uma única base de código com Tamagui, o site público do C6 Bank com Vite SSR e TanStack Start e um pipeline de entrega com agentes para a Lovefy.

**es:** Construyo productos web y mobile para startups con React Native, Next.js y Vite. Trabajos recientes: las apps web y mobile de Skydiet en una sola base de código con Tamagui, el sitio público de C6 Bank con Vite SSR y TanStack Start y un pipeline de entrega con agentes para Lovefy.

## 2. How I work: openers that don't repeat the hero

Only the first sentence of answers 01 and 02 changes; the rest stays as published. 03 and 04 stay as they are.

### 01 How do you migrate a stack without downtime?

**en:** Zero downtime during Redação Online's platform rollout. *(drops "and checkout drop-off fell from 23% to 9% after its migration")*

**pt:** Zero downtime no rollout da plataforma da Redação Online.

**es:** Cero downtime en el despliegue de la plataforma de Redação Online.

### 02 How do you get Lighthouse to 95+?

**en:** Page weight down 80% at Redação Online, and Lighthouse 95+ on mobile across my contract projects. *(was "Lighthouse 40 → 95 at Redação Online, with page weight down 80%, and 0.9s LCP at C6 Bank.")*

**pt:** 80% menos peso de página na Redação Online, e Lighthouse 95+ no mobile nos meus projetos por contrato.

**es:** Un 80% menos de peso de página en Redação Online, y Lighthouse 95+ en móvil en mis proyectos por contrato.

## 3. Case studies: one telling of each part

Every case study (all 13) tells Problem and Approach twice: a paragraph, then bullets that restate it. Proposal: delete the bullet lists in both parts, in all three languages. Before deleting, I check each list for a fact the paragraph lacks and fold it into the paragraph; the list of folded facts comes back for review with the write.

## 4. Decision: Redação Online, from PHP to Next.js

Shown as part 2, between Problem and Approach. Built only from what the case study already says; the trade-off lines need your confirmation.

**en:**
I kept WordPress and changed what it does. Moving the content to a new CMS would have meant migrating every post and retraining the editors, and optimizing the PHP theme in place left content and code in the same monolith, the security problem we started with. So WordPress became a headless CMS behind a Next.js BFF, and the pages became static.

The cost: two systems to run instead of one, a BFF to maintain, and pages that have to be rebuilt when content changes **[confirm: how publishing triggered rebuilds]**.

**pt:**
Mantive o WordPress e mudei o papel dele. Levar o conteúdo para um novo CMS significaria migrar todos os posts e treinar a equipe de novo, e otimizar o tema PHP deixaria conteúdo e código no mesmo monolito, o problema de segurança do começo. Então o WordPress virou um CMS headless atrás de um BFF em Next.js, e as páginas viraram estáticas.

O custo: dois sistemas para manter em vez de um, um BFF para cuidar e páginas que precisam ser regeradas quando o conteúdo muda **[confirmar]**.

**es:**
Mantuve WordPress y cambié su papel. Pasar el contenido a un CMS nuevo habría supuesto migrar todos los posts y volver a formar al equipo, y optimizar el tema PHP dejaba contenido y código en el mismo monolito, el problema de seguridad del principio. Así que WordPress pasó a ser un CMS headless detrás de un BFF en Next.js, y las páginas pasaron a ser estáticas.

El coste: dos sistemas que mantener en vez de uno, un BFF que cuidar y páginas que hay que regenerar cuando cambia el contenido **[confirmar]**.

The other 12 case studies keep an empty Decision (the part is hidden) until you write theirs; I can draft the featured three next the same way.

## 5. Working with me (under "Let's talk")

A short line of facts under the Contact subtitle, for the founder who wants to know what happens after Email. In the UI strings (code), not Sanity.

**en:** Remote from Brazil **[confirm: UTC−3]**. I work in English, Portuguese and Spanish, and reply within one working day **[confirm]**.

**pt:** Remoto, do Brasil **[confirmar: UTC−3]**. Trabalho em inglês, português e espanhol, e respondo em até um dia útil **[confirmar]**.

**es:** En remoto desde Brasil **[confirmar: UTC−3]**. Trabajo en inglés, portugués y español, y respondo en un día hábil **[confirmar]**.

## 6. The gauge measures the results

Today the drawing's gauge reads 0.0–3.0 m and its annotations measure the tree ("H 5.0 m", "Root spread 6.5 m", "Tide +0.6 m"). The three proof shoots already rise to marks on the gauge, but their heights are spaced so leaders never cross, so a numbered scale under them would be false.

- **A. Result labels on the drawing (recommended).** The gauge keeps its ticks but loses the metre numbers. Each proof shoot's dimension line carries its result ("40 → 95", "−96%", "23% → 9%") in place of the tree measurements, and "Root spread" / "H" / "Tide" go. Honest, no fake scale; the 3D scene gets the same labels.
- **B. A real percentage scale.** Gauge 0–100%, each shoot at its true value, lane reordered by height. Truthful only if the marks may sit 1 unit apart (95 and 96 today), so two leaders nearly overlap; bigger change to the 3D scene.
