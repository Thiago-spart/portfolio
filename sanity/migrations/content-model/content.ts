// Editorial input for the migration (#46): every judgment call lives here so
// it can be reviewed in one place. build.ts combines it with the snapshot.
// Drafts follow the brand voice: result first, first person, numbers, no hype.
import type { Direction, L10n } from './mapping.ts'

// ---------------------------------------------------------------------------
// Tech
// ---------------------------------------------------------------------------

// Old skillCategory (by English title) → tech category. `null` drops the
// whole category. Items can override this through CANONICAL in mapping.ts.
export const SKILL_CATEGORY_DEFAULTS: Record<string, string | null> = {
  'Languages':                          'frontend',
  'Front-end':                          'frontend',
  'Back-end':                           'backend',
  'Database':                           'data',
  'DevOps':                             'tooling',
  'Testing Frameworks':                 'testing',
  'Mobile':                             'mobile',
  'AI Tools':                           'ai',
  'Architecture & Development Practices': 'practice',
  'Operating Systems':                  null,
}

// Categories trimmed to what roles and case studies actually use (#43):
// an item in one of these that no techStack references is dropped.
export const TRIM_UNUSED_IN: string[] = ['ai', 'practice']

// Kept although no stack references them (approved 2026-10-27). Each is a
// tech document; the Stack section only lists techs a role or case study
// references, so these stay off it until something links them.
export const KEEP_UNUSED: string[] = ['Claude Code']

// Techs the old stacks left out but the text clearly shows (approved
// 2026-10-27). Keyed by old document _id; added to that role's or case
// study's stack, which also keeps them from being trimmed.
export const STACK_ADDITIONS: Record<string, string[]> = {
  // Redação Online – landing page: "turning WordPress into a Headless CMS behind a dedicated Next.js BFF layer"
  'goWIk3h6SuGMXzHRsOCwz9': ['Headless CMS'],
  // Capitual internal administration tool: "regular pair programming sessions and code review"
  'goWIk3h6SuGMXzHRsL16Ih': ['Code review & pair programming'],
  // Capitual customer assistance tool: "Converted Figma design tokens into pixel-perfect components",
  // "mentored two junior developers through pair programming and code review"
  'VFYot6xKbKJzLTTu0Lgugc': ['Design systems & tokens', 'Code review & pair programming'],
  // Freelance (Independent Contracts) role: no case study shows it; the role says
  // "reduced client-side bundle sizes using code splitting & lazy loading"
  'YBlKZ1cd22qYaJmOB4l9Sp': ['Code splitting & lazy loading'],
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

// Keyed by old experience _id. Short summaries; the STAR detail moves to the
// case studies.
export const ROLE_SUMMARIES: Record<string, L10n> = {
  // Government of Pernambuco (Freelance), 2019–2021
  '19da46d0-ac93-421c-98ae-aeaabc6bafcd': {
    en: 'I built the school app and public websites for the state education network: a React Native app used by 70k+ students, parents and teachers across 13 schools, plus 14 blogs and landing pages in React and WordPress. I also set up unit and E2E tests, kept the sites at Lighthouse 90+ and cut bundle size by 30%.',
    pt: 'Construí o app escolar e os sites públicos da rede estadual de ensino: um app em React Native usado por mais de 70 mil alunos, pais e professores em 13 escolas, além de 14 blogs e landing pages em React e WordPress. Também implantei testes unitários e E2E, mantive os sites com Lighthouse 90+ e reduzi o bundle em 30%.',
    es: 'Construí la app escolar y los sitios públicos de la red educativa estatal: una app en React Native usada por más de 70.000 estudiantes, padres y docentes en 13 escuelas, además de 14 blogs y landing pages en React y WordPress. También implementé pruebas unitarias y E2E, mantuve los sitios con Lighthouse 90+ y reduje el bundle un 30%.',
  },
  // Plin, 2021
  'YBlKZ1cd22qYaJmOB4KEsB': {
    en: 'I moved the web app from class components to React Hooks and built the React Native app, with WebSockets for real-time data. A testing and Storybook pipeline (Jest, RTL, RNTL) reached 70% coverage and let designers review components directly, which sped up feature delivery by 30%.',
    pt: 'Migrei a aplicação web de class components para React Hooks e construí o app em React Native, com WebSockets para dados em tempo real. Um pipeline de testes e Storybook (Jest, RTL, RNTL) chegou a 70% de cobertura e permitiu que os designers revisassem os componentes direto, o que acelerou a entrega de funcionalidades em 30%.',
    es: 'Migré la aplicación web de class components a React Hooks y construí la app en React Native, con WebSockets para datos en tiempo real. Un pipeline de pruebas y Storybook (Jest, RTL, RNTL) llegó al 70% de cobertura y permitió que los diseñadores revisaran los componentes directamente, lo que aceleró la entrega de funcionalidades un 30%.',
  },
  // Capitual, 2021–2022
  'hqCv48QZAlu5KnJBMll4ab': {
    en: "I worked on the front end of Capitual's internal tools and mobile banking app, in a micro-frontend architecture with React, GraphQL and AWS. We built a testing pipeline with Cypress, Jest and Storybook that reached 80% coverage on critical flows and cut production bugs by 96%.",
    pt: 'Trabalhei no front-end das ferramentas internas e do app bancário da Capitual, em uma arquitetura de micro-frontends com React, GraphQL e AWS. Montamos um pipeline de testes com Cypress, Jest e Storybook que chegou a 80% de cobertura nos fluxos críticos e reduziu os bugs em produção em 96%.',
    es: 'Trabajé en el front-end de las herramientas internas y la app bancaria de Capitual, en una arquitectura de micro-frontends con React, GraphQL y AWS. Montamos un pipeline de pruebas con Cypress, Jest y Storybook que llegó al 80% de cobertura en los flujos críticos y redujo los bugs en producción un 96%.',
  },
  // Freelance (Independent Contracts), 2022–2023
  'YBlKZ1cd22qYaJmOB4l9Sp': {
    en: 'Short contracts for startups and fintechs: React-to-Next.js migrations with SSR and code splitting, and React Native MVPs delivered in about 3 weeks. On the web projects I reached Lighthouse 95+ on mobile, 98+ on desktop and 100 on accessibility.',
    pt: 'Contratos curtos para startups e fintechs: migrações de React para Next.js com SSR e code splitting, e MVPs em React Native entregues em cerca de 3 semanas. Nos projetos web cheguei a Lighthouse 95+ no mobile, 98+ no desktop e 100 em acessibilidade.',
    es: 'Contratos cortos para startups y fintechs: migraciones de React a Next.js con SSR y code splitting, y MVPs en React Native entregados en unas 3 semanas. En los proyectos web alcancé Lighthouse 95+ en móvil, 98+ en escritorio y 100 en accesibilidad.',
  },
  // Redação Online, 2023–2025
  'YBlKZ1cd22qYaJmOB5I73E': {
    en: 'I led the front end of an edtech platform for ENEM and public-exam students. I moved the landing page from PHP and WordPress to Next.js (Lighthouse 40 → 95, organic search +40%), migrated checkout to Vite, Vue and TypeScript (drop-off 23% → 9%), and built a shared Storybook library of 45+ components.',
    pt: 'Liderei o front-end de uma plataforma de edtech para alunos do ENEM e de concursos públicos. Migrei a landing page de PHP e WordPress para Next.js (Lighthouse 40 → 95, busca orgânica +40%), levei o checkout para Vite, Vue e TypeScript (abandono 23% → 9%) e criei uma biblioteca compartilhada no Storybook com mais de 45 componentes.',
    es: 'Lideré el front-end de una plataforma de edtech para estudiantes del ENEM y de oposiciones. Migré la landing page de PHP y WordPress a Next.js (Lighthouse 40 → 95, búsqueda orgánica +40%), llevé el checkout a Vite, Vue y TypeScript (abandono 23% → 9%) y creé una biblioteca compartida en Storybook con más de 45 componentes.',
  },
  // Freelance, 2025–now
  'v6k3bk6m1Jc2rVtrPFXrwn': {
    en: "I build web and mobile products for startups with React Native, Next.js and Vite. Recent work: Skydiet's web and mobile apps on one Tamagui codebase, C6 Bank's landing page at 0.9s LCP, and agent workflows that cut Lovefy's feature delivery from 2 weeks to 4 days.",
    pt: 'Construo produtos web e mobile para startups com React Native, Next.js e Vite. Trabalhos recentes: os apps web e mobile da Skydiet em uma única base de código com Tamagui, a landing page do C6 Bank com LCP de 0,9s e fluxos com agentes que reduziram a entrega de funcionalidades da Lovefy de 2 semanas para 4 dias.',
    es: 'Construyo productos web y mobile para startups con React Native, Next.js y Vite. Trabajos recientes: las apps web y mobile de Skydiet en una sola base de código con Tamagui, la landing page de C6 Bank con un LCP de 0,9s y flujos con agentes que redujeron la entrega de funcionalidades de Lovefy de 2 semanas a 4 días.',
  },
}

// Old experience _id → companyUrl to use instead (null = leave empty).
export const COMPANY_URL_OVERRIDES: Record<string, string | null> = {
  // Government of Pernambuco: the old value is Thiago's own LinkedIn profile.
  '19da46d0-ac93-421c-98ae-aeaabc6bafcd': null,
}

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

// Recommended featured set, in display order. Everything else is "archive".
export const FEATURED: string[] = [
  'redacao-online-landing-page-migration',
  'internal-administration-tool-capitual',
  'redacao-online-checkout-migration',
  'c6-bank-web-platform',
]

// Highlights (by index) that become pure metrics and would only repeat the
// number in the approach bullets. Highlights that also carry a method stay.
export const HIGHLIGHTS_FOLDED_INTO_RESULTS: Record<string, number[]> = {
  'capitual-cripto-bank-app': [3],
  'electromaps-ev-charging-app': [3],
  'redacao-online-checkout-migration': [3],
  'skydiet-web-application': [2],
  'c6-bank-web-platform': [2, 3],
  'internal-administration-tool-capitual': [0, 1],
  'redacao-online-landing-page-migration': [3],
  'redacao-online-core-platform-v2': [3],
}

// Alt text per image asset. The covers are promo cards (device mock-ups with
// baked-in "Click here" buttons); the alt describes the product shown.
export const ALT_BY_ASSET: Record<string, L10n> = {
  'image-42652817655283bda983f9b0e4727497294f96ff-4000x2250-png': {
    en: "Capitual's website on a laptop and a phone, with the headline \"Sinta a liberdade de ser multimoedas\".",
    pt: 'Site da Capitual em um notebook e um celular, com o título "Sinta a liberdade de ser multimoedas".',
    es: 'Sitio de Capitual en un portátil y un teléfono, con el titular "Sinta a liberdade de ser multimoedas".',
  },
  'image-00b7f833c5343b65866ccaca828544f49e6108ed-4000x2250-png': {
    en: 'Bask landing page on a laptop and a phone: a 3D clinic scene above the headline "The Platform for Telehealth".',
    pt: 'Landing page da Bask em um notebook e um celular: uma cena 3D de clínica acima do título "The Platform for Telehealth".',
    es: 'Landing page de Bask en un portátil y un teléfono: una escena 3D de clínica sobre el titular "The Platform for Telehealth".',
  },
  'image-22170b11543e9b5f65c618659e41857e7cb15566-4000x2250-png': {
    en: 'Electromaps website on a laptop and a phone: an electric car at a charging point with the headline "Find / Charge / Go".',
    pt: 'Site da Electromaps em um notebook e um celular: um carro elétrico em um ponto de recarga com o título "Find / Charge / Go".',
    es: 'Sitio de Electromaps en un portátil y un teléfono: un coche eléctrico en un punto de recarga con el titular "Find / Charge / Go".',
  },
  'image-11068467758d7cbce0329a9cc4d124b9d3f7ac03-4000x2250-png': {
    en: 'Redação Online landing page on a laptop and a phone, offering essay correction for ENEM and university entrance exams.',
    pt: 'Landing page da Redação Online em um notebook e um celular, oferecendo correção de redação para o ENEM e vestibulares.',
    es: 'Landing page de Redação Online en un portátil y un teléfono, que ofrece corrección de redacciones para el ENEM y la selectividad.',
  },
  'image-f9d18aa2b7d096d86948b8eae183dd2966dfb5e3-4000x2250-png': {
    en: 'C6 Bank landing page on a laptop and a phone, with the headline "Uma experiência financeira extraordinária".',
    pt: 'Landing page do C6 Bank em um notebook e um celular, com o título "Uma experiência financeira extraordinária".',
    es: 'Landing page de C6 Bank en un portátil y un teléfono, con el titular "Uma experiência financeira extraordinária".',
  },
  'image-2d24625890a849a8157319ff1b42764ed8ee0d5b-4000x2250-png': {
    en: 'Lovefy landing page on a laptop and the Lovefy app on a phone, showing AI match profiles.',
    pt: 'Landing page da Lovefy em um notebook e o app da Lovefy em um celular, mostrando perfis de match com IA.',
    es: 'Landing page de Lovefy en un portátil y la app de Lovefy en un teléfono, con perfiles de match con IA.',
  },
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type MetricSpec = {
  /** Where the number comes from, for the review file. */
  source: string
  /** The raw value as written in the source. */
  raw: string
  /** Case study slug the metric goes to. */
  target: string
  label: L10n
  direction: Direction
  /** A change with no baseline ("96% fewer bugs"), not a level ("80% coverage"). */
  isChange?: boolean
  /** Stable id for heroResults (becomes part of the metric _key). */
  id: string
}

export const METRICS: MetricSpec[] = [
  // Redação Online – landing page (experience highlights h1, h2; the project's own highlight #3 says the same)
  { id: 'lighthouse', target: 'redacao-online-landing-page-migration', source: 'experience Redação Online · h1', raw: '40 → 95', direction: 'up',
    label: { en: 'Lighthouse performance score', pt: 'Nota de performance no Lighthouse', es: 'Puntuación de rendimiento en Lighthouse' } },
  { id: 'organic-search', target: 'redacao-online-landing-page-migration', source: 'experience Redação Online · h2', raw: '+40%', direction: 'up', isChange: true,
    label: { en: 'Organic search traffic growth', pt: 'Crescimento do tráfego de busca orgânica', es: 'Crecimiento del tráfico de búsqueda orgánica' } },

  // Redação Online – checkout (project highlight #3)
  { id: 'checkout-dropoff', target: 'redacao-online-checkout-migration', source: 'project redacao-online-checkout-migration · highlight 3', raw: '23% → 9%', direction: 'down',
    label: { en: 'Checkout drop-off', pt: 'Abandono no checkout', es: 'Abandono en el checkout' } },

  // Redação Online – core platform v2 (project highlights #3, #0)
  { id: 'lighthouse', target: 'redacao-online-core-platform-v2', source: 'project redacao-online-core-platform-v2 · highlight 3', raw: '95+', direction: 'up',
    label: { en: 'Lighthouse score', pt: 'Nota no Lighthouse', es: 'Puntuación en Lighthouse' } },
  { id: 'downtime', target: 'redacao-online-core-platform-v2', source: 'project redacao-online-core-platform-v2 · highlight 3', raw: '0', direction: 'down',
    label: { en: 'Downtime during the rollout', pt: 'Indisponibilidade durante o rollout', es: 'Caída del servicio durante el rollout' } },
  { id: 'storybook-components', target: 'redacao-online-core-platform-v2', source: 'project redacao-online-core-platform-v2 · highlight 0', raw: '45+', direction: 'up',
    label: { en: 'Components documented in Storybook', pt: 'Componentes documentados no Storybook', es: 'Componentes documentados en Storybook' } },

  // Capitual – internal tools (experience highlights h2, h1; the project's highlights #0 and #1 say the same)
  { id: 'production-bugs', target: 'internal-administration-tool-capitual', source: 'experience Capitual · h2', raw: '96%', direction: 'down', isChange: true,
    label: { en: 'Production bugs', pt: 'Bugs em produção', es: 'Bugs en producción' } },
  { id: 'coverage', target: 'internal-administration-tool-capitual', source: 'experience Capitual · h1', raw: '80%', direction: 'up',
    label: { en: 'Test coverage on critical flows', pt: 'Cobertura de testes nos fluxos críticos', es: 'Cobertura de pruebas en flujos críticos' } },

  // Capitual – banking app (project highlight #3)
  { id: 'app-rating', target: 'capitual-cripto-bank-app', source: 'project capitual-cripto-bank-app · highlight 3', raw: '3.5 → 4.8', direction: 'up',
    label: { en: 'App Store rating', pt: 'Nota na App Store', es: 'Valoración en la App Store' } },
  { id: 'mobile-bugs', target: 'capitual-cripto-bank-app', source: 'project capitual-cripto-bank-app · highlight 3', raw: '60%', direction: 'down', isChange: true,
    label: { en: 'Mobile bugs', pt: 'Bugs no mobile', es: 'Bugs en mobile' } },

  // Capitual – customer assistance tool (project highlights #2, #3)
  { id: 'storybook-coverage', target: 'customer-assistance-internal-tool-capitual', source: 'project customer-assistance-internal-tool-capitual · highlight 2', raw: '80%', direction: 'up',
    label: { en: 'Components and screens in Storybook', pt: 'Componentes e telas no Storybook', es: 'Componentes y pantallas en Storybook' } },
  { id: 'onboarding', target: 'customer-assistance-internal-tool-capitual', source: 'project customer-assistance-internal-tool-capitual · highlight 3', raw: '4wk → 3wk', direction: 'down',
    label: { en: 'Onboarding time for new developers', pt: 'Tempo de onboarding de novos devs', es: 'Tiempo de onboarding de nuevos devs' } },

  // C6 Bank (project highlights #2, #3)
  { id: 'lcp', target: 'c6-bank-web-platform', source: 'project c6-bank-web-platform · highlight 3', raw: '0.9s', direction: 'down',
    label: { en: 'Largest Contentful Paint', pt: 'Largest Contentful Paint', es: 'Largest Contentful Paint' } },
  { id: 'fcp', target: 'c6-bank-web-platform', source: 'project c6-bank-web-platform · highlight 3', raw: '1.5s', direction: 'down',
    label: { en: 'First Contentful Paint', pt: 'First Contentful Paint', es: 'First Contentful Paint' } },
  { id: 'lighthouse', target: 'c6-bank-web-platform', source: 'project c6-bank-web-platform · highlight 2', raw: '90', direction: 'up',
    label: { en: 'Lighthouse performance score', pt: 'Nota de performance no Lighthouse', es: 'Puntuación de rendimiento en Lighthouse' } },
  { id: 'accessibility', target: 'c6-bank-web-platform', source: 'project c6-bank-web-platform · highlight 2', raw: '100', direction: 'up',
    label: { en: 'Lighthouse accessibility score', pt: 'Nota de acessibilidade no Lighthouse', es: 'Puntuación de accesibilidad en Lighthouse' } },
  { id: 'best-practices', target: 'c6-bank-web-platform', source: 'project c6-bank-web-platform · highlight 2', raw: '100', direction: 'up',
    label: { en: 'Lighthouse best practices score', pt: 'Nota de boas práticas no Lighthouse', es: 'Puntuación de buenas prácticas en Lighthouse' } },

  // Electromaps (project highlight #3)
  { id: 'time-to-ship', target: 'electromaps-ev-charging-app', source: 'project electromaps-ev-charging-app · highlight 3', raw: '3mo', direction: 'down',
    label: { en: 'Time to ship the full app', pt: 'Prazo para lançar o app completo', es: 'Plazo para lanzar la app completa' } },
  { id: 'coverage', target: 'electromaps-ev-charging-app', source: 'project electromaps-ev-charging-app · highlight 3', raw: '100%', direction: 'up',
    label: { en: 'Test coverage on critical flows', pt: 'Cobertura de testes nos fluxos críticos', es: 'Cobertura de pruebas en flujos críticos' } },

  // Skydiet
  { id: 'shared-code', target: 'skydiet-universal-cross-platform-app', source: 'project skydiet-universal-cross-platform-app · highlight 0', raw: '80%+', direction: 'up',
    label: { en: 'Code shared between web and mobile', pt: 'Código compartilhado entre web e mobile', es: 'Código compartido entre web y mobile' } },
  { id: 'coverage', target: 'skydiet-web-application', source: 'project skydiet-web-application · highlight 2', raw: '90%', direction: 'up',
    label: { en: 'Test coverage', pt: 'Cobertura de testes', es: 'Cobertura de pruebas' } },
  { id: 'storybook-components', target: 'skydiet-web-application', source: 'project skydiet-web-application · highlight 0', raw: '40+', direction: 'up',
    label: { en: 'Components in the Atomic Design library', pt: 'Componentes na biblioteca Atomic Design', es: 'Componentes en la biblioteca Atomic Design' } },

  // Lovefy (project highlights #4, #3)
  { id: 'delivery-time', target: 'lovefy-ai-dating-platform', source: 'project lovefy-ai-dating-platform · highlight 4 ("2 weeks to 4 days")', raw: '14d → 4d', direction: 'down',
    label: { en: 'Feature delivery time', pt: 'Tempo de entrega de funcionalidades', es: 'Tiempo de entrega de funcionalidades' } },
  { id: 'coverage', target: 'lovefy-ai-dating-platform', source: 'project lovefy-ai-dating-platform · highlight 3', raw: '100%', direction: 'up',
    label: { en: 'Test and documentation coverage', pt: 'Cobertura de testes e documentação', es: 'Cobertura de pruebas y documentación' } },
]

// Highlights that are not one number, or have no case study to live on.
// Listed in REVIEW.md with a proposal; nothing here is written to Sanity.
type Misfit = { source: string; value: string; label: string; problem: string; proposal: string }

export const MISFITS: Misfit[] = [
  { source: 'experience Redação Online · h3', value: 'Next.js SSG + BFF', label: 'Headless WordPress & enhanced security',
    problem: 'Not a measurement.', proposal: 'Folded into the landing page approach (it is already there, from the long description). Nothing to do.' },
  { source: 'experience Capitual · h3', value: 'Storybook & E2E', label: 'Testing pipeline & component library',
    problem: 'Not a measurement.', proposal: 'Folded into the Capitual internal tools approach (already in its highlights). Nothing to do.' },
  { source: 'experience Freelance (Independent Contracts) · h1', value: '95+/98+', label: 'Lighthouse performance (mobile & desktop)',
    problem: 'Two values in one, both "at least"; and the role\'s only case study (Electromaps) is a mobile app, so the web scores have no case study to live on.',
    proposal: 'Kept in the role summary text. If you want it as metrics, create a case study for one of those web contracts and add two metrics with qualifier "atLeast" (mobile 95+, desktop 98+).' },
  { source: 'experience Freelance (Independent Contracts) · h2', value: '100', label: 'Accessibility score achieved',
    problem: 'Fits the schema, but no case study for the web contracts it came from.', proposal: 'Kept in the role summary. Same fix as above.' },
  { source: 'experience Freelance (Independent Contracts) · h3', value: '3 wks', label: 'Avg. MVP delivery time for mobile projects',
    problem: 'An average across projects, not one case study\'s result; the only case study here (Electromaps) took 3 months.',
    proposal: 'Kept in the role summary. Do not attach it to Electromaps.' },
  { source: 'experience Government of Pernambuco · h1–h5', value: '70k+ · 13 · 14 · 90+ · 30%', label: 'Active users · Schools · Blogs & portals · Lighthouse · Bundle size',
    problem: 'No project/case study exists for this role, so there is nowhere to attach metrics.',
    proposal: 'Numbers kept in the role summary. Strong candidate for a new case study (school app, 70k+ users); then add metrics: after 70, unit "k", qualifier "atLeast" renders "70k+".' },
  { source: 'experience Plin · h1–h3', value: '30% · 100% · 70%', label: 'Faster feature delivery · Components in Storybook · Test coverage',
    problem: 'No case study for this role.', proposal: 'Kept in the role summary. The FAQ answer on zero-downtime migrations also cites Plin; a short case study would back it.' },
  { source: 'experience Freelance (2025–now) · h1–h3', value: 'PWA · Firebase · AI Agents', label: 'Offline & engagement · Replicated legacy backend · Developer tooling',
    problem: 'Not measurements.', proposal: 'Dropped as metrics; PWA, Firebase and AI agents are in the role stack.' },
  { source: 'project redacao-online-ai-mentor-chat', value: 'sub-second', label: 'Response streaming',
    problem: '"Sub-second" is not a number.', proposal: 'No result on this case study. Add a measured number (e.g. time to first token) if you have one.' },
  { source: 'project skydiet-universal-cross-platform-app · highlight 1', value: 'sub-second', label: 'WebSocket chat performance',
    problem: '"Sub-second" is not a number.', proposal: 'Left in the approach bullets.' },
  { source: 'project capitual-cripto-bank-app · short description / challenge', value: '70 FPS / 60–70 FPS', label: 'Frame rate on budget Android phones',
    problem: 'A range, stated as a challenge rather than a result.', proposal: 'Not converted. If 60 fps was held after the work, add after 60, unit " fps".' },
]

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

// Old qa _id → new order. Only these are written; the rest are in REVIEW.md.
export const FAQ_KEEP: Record<string, number> = {
  'fc8692e3-bddc-4aa0-884f-1edad6eaf631': 1, // zero-downtime migrations
  'cc10d596-5988-4ee5-8909-f3f0b4115adf': 2, // Lighthouse 95+ / page weight
  '0a56f688-5715-4978-bd9d-bc5c88dafe00': 3, // micro-frontends consistency
  'a6de2155-1f31-4658-bf02-56547b4d6452': 4, // AI agent pipelines
}

export const FAQ_CUT_REASONS: Record<string, string> = {
  '7da1e7bc-bcaa-48e4-b402-aa6012242de1':
    'Gaps between contracts. Recommend dropping it: it raises a doubt most visitors never had, and the answer reads as defensive. The positioning page already has a one-line answer for recruiters who ask; use it in conversation, not on the page.',
  '0c41f369-35a6-4643-b935-1510934008e9':
    'React Native performance. Good answer, but it overlaps the Lighthouse answer (both are "how I make things fast"), and the proof (60 fps, 3.5 → 4.8 rating) is better shown in the Capitual app case study.',
  '58876269-a299-46a0-9273-3d98425f2d4b':
    'Primary tech stack. The Stack section answers it, and "As a Full Stack Engineer" contradicts the positioning ("not a generalist full-stack developer").',
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

// Availability: src/i18n/locales/*.json "hero.badge" on copy/brand-voice
// (uncommitted working tree of the main checkout at the time of the build).
export const AVAILABILITY: L10n = {
  en: 'Open to senior and lead roles',
  pt: 'Aberto a vagas sênior e de liderança',
  es: 'Abierto a roles sénior y de liderazgo',
}

// Email and LinkedIn: src/components/ContactSection.tsx. GitHub is not in
// ContactSection; this is the account that owns the repo. Confirm it.
export const CONTACT = {
  email: 'thiagomoraes.contact@gmail.com',
  linkedin: 'https://www.linkedin.com/in/thiago-moraes-souza/',
  github: 'https://github.com/Thiago-spart',
}

// SEO defaults: DEFAULT_TITLE / DEFAULT_DESCRIPTION in src/lib/seo.ts on
// copy/brand-voice (English). PT/ES follow the bios in brand/strategy.
export const SEO = {
  title: {
    en: 'Thiago Souza — Senior Mobile & Web Engineer',
    pt: 'Thiago Souza — Engenheiro Sênior Mobile & Web',
    es: 'Thiago Souza — Ingeniero Sénior Mobile & Web',
  },
  description: {
    en: 'Thiago Souza, senior mobile and web engineer. React, React Native and TypeScript products that load fast, test well and hold up in production: Lighthouse 40 → 95 at Redação Online, production bugs −96% at Capitual.',
    pt: 'Thiago Souza, engenheiro sênior mobile e web. Produtos em React, React Native e TypeScript que carregam rápido, são bem testados e se sustentam em produção: Lighthouse 40 → 95 na Redação Online, bugs em produção −96% na Capitual.',
    es: 'Thiago Souza, ingeniero sénior mobile y web. Productos en React, React Native y TypeScript que cargan rápido, están bien probados y se sostienen en producción: Lighthouse 40 → 95 en Redação Online, bugs en producción −96% en Capitual.',
  },
}

// The three hero results, in order: case study slug + metric id.
export const HERO_RESULTS: { slug: string; metric: string }[] = [
  { slug: 'redacao-online-landing-page-migration', metric: 'lighthouse' },
  { slug: 'internal-administration-tool-capitual', metric: 'production-bugs' },
  { slug: 'redacao-online-checkout-migration', metric: 'checkout-dropoff' },
]
