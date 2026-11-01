// Writes the approved copy from docs/copy-review-2026-10-31.md to Sanity:
// role summaries, FAQ openers, one telling of each case-study part (bullet
// lists removed, facts they alone carried kept as a closing paragraph) and
// the Redação Online Decision.
//
//   npx sanity exec migrations/copy-review-2026-10-31/apply.ts --with-user-token          # dry run
//   npx sanity exec migrations/copy-review-2026-10-31/apply.ts --with-user-token -- --write
//
// Backup taken first: ~/sanity-backups/production-before-copy-round3-2026-10-31.tar.gz
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

type Lang = 'en' | 'pt' | 'es'
type Copy = Record<Lang, string>
interface Span { _type: 'span'; _key: string; text: string; marks: string[] }
interface Block { _type: 'block'; _key: string; style?: string; listItem?: string; level?: number; markDefs?: unknown[]; children: Span[] }
type LocaleBlock = { _type?: string } & Partial<Record<Lang, Block[]>>

const WRITE = process.argv.includes('--write')
const client = getCliClient({ apiVersion: '2024-01-01' })
const LANGS: Lang[] = ['en', 'pt', 'es']

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const paragraph = (text: string): Block => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

// 1. Experience timeline: scope and leadership, not the hero's numbers.
const ROLES: Record<string, Copy> = {
  // Lead Frontend Engineer · Redação Online
  '6efe319e-b3b2-48d6-949a-66142d03e395': {
    en: 'I led the front end of an edtech platform for ENEM and public-exam students: the landing page’s move from PHP and WordPress to Next.js, the checkout rebuild in Vite, Vue and TypeScript, and a shared Storybook library of 45+ components across the micro-frontends.',
    pt: 'Liderei o front-end de uma plataforma de edtech para alunos do ENEM e de concursos públicos: a migração da landing page de PHP e WordPress para Next.js, a reconstrução do checkout com Vite, Vue e TypeScript e uma biblioteca compartilhada no Storybook com mais de 45 componentes entre os micro-frontends.',
    es: 'Lideré el front-end de una plataforma de edtech para estudiantes del ENEM y de oposiciones: la migración de la landing page de PHP y WordPress a Next.js, la reconstrucción del checkout con Vite, Vue y TypeScript y una biblioteca compartida en Storybook con más de 45 componentes entre los micro-frontends.',
  },
  // Frontend Developer · Capitual
  'c89e9cee-e0d3-4979-a3bb-11fa7cf3dfc4': {
    en: 'I worked on the front end of Capitual’s internal tools and mobile banking app, in a micro-frontend architecture with React, GraphQL and AWS. We put a testing pipeline with Cypress, Jest and Storybook in place before adding features to the critical flows.',
    pt: 'Trabalhei no front-end das ferramentas internas e do app bancário da Capitual, em uma arquitetura de micro-frontends com React, GraphQL e AWS. Montamos um pipeline de testes com Cypress, Jest e Storybook antes de adicionar funcionalidades aos fluxos críticos.',
    es: 'Trabajé en el front-end de las herramientas internas y la app bancaria de Capitual, en una arquitectura de micro-frontends con React, GraphQL y AWS. Montamos un pipeline de pruebas con Cypress, Jest y Storybook antes de sumar funcionalidades a los flujos críticos.',
  },
  // Senior Mobile & Web Engineer · Freelance
  'e6c360a2-08ac-476c-81ae-82792ae2e7e8': {
    en: 'I build web and mobile products for startups with React Native, Next.js and Vite. Recent work: Skydiet’s web and mobile apps on one Tamagui codebase, C6 Bank’s public site on Vite SSR and TanStack Start, and an agent-assisted delivery pipeline for Lovefy.',
    pt: 'Construo produtos web e mobile para startups com React Native, Next.js e Vite. Trabalhos recentes: os apps web e mobile da Skydiet em uma única base de código com Tamagui, o site público do C6 Bank com Vite SSR e TanStack Start e um pipeline de entrega com agentes para a Lovefy.',
    es: 'Construyo productos web y mobile para startups con React Native, Next.js y Vite. Trabajos recientes: las apps web y mobile de Skydiet en una sola base de código con Tamagui, el sitio público de C6 Bank con Vite SSR y TanStack Start y un pipeline de entrega con agentes para Lovefy.',
  },
}

// 2. FAQ: the opening sentence changes, the rest stays.
const FAQ_OPENERS: Record<string, { from: Copy; to: Copy }> = {
  // 01 How do you migrate a stack without downtime?
  '387425a1-9da6-4463-9140-de13ee177741': {
    from: {
      en: 'Zero downtime during Redação Online\'s platform rollout, and checkout drop-off fell from 23% to 9% after its migration.',
      pt: 'Zero downtime no rollout da plataforma da Redação Online, e o abandono no checkout caiu de 23% para 9% depois da migração.',
      es: 'Cero downtime en el despliegue de la plataforma de Redação Online, y el abandono en el checkout bajó del 23% al 9% tras su migración.',
    },
    to: {
      en: 'Zero downtime during Redação Online\'s platform rollout.',
      pt: 'Zero downtime no rollout da plataforma da Redação Online.',
      es: 'Cero downtime en el despliegue de la plataforma de Redação Online.',
    },
  },
  // 02 How do you get Lighthouse to 95+?
  'aa90fd8d-c0fb-401d-ad23-4828db628f82': {
    from: {
      en: 'Lighthouse 40 → 95 at Redação Online, with page weight down 80%, and 0.9s LCP at C6 Bank.',
      pt: 'Lighthouse de 40 → 95 na Redação Online, com 80% menos peso de página, e LCP de 0,9s no C6 Bank.',
      es: 'Lighthouse de 40 → 95 en Redação Online, con un 80% menos de peso de página, y LCP de 0,9s en C6 Bank.',
    },
    to: {
      en: 'Page weight down 80% at Redação Online, and Lighthouse 95+ on mobile across my contract projects.',
      pt: '80% menos peso de página na Redação Online, e Lighthouse 95+ no mobile nos meus projetos por contrato.',
      es: 'Un 80% menos de peso de página en Redação Online, y Lighthouse 95+ en móvil en mis proyectos por contrato.',
    },
  },
}

// 3. Facts only a bullet carried, kept as a closing paragraph of the part.
const FOLDS: Record<string, Partial<Record<'problem' | 'approach', Copy>>> = {
  'redacao-online-landing-page-migration': {
    problem: {
      en: 'The migration couldn’t break existing search rankings.',
      pt: 'A migração não podia quebrar o posicionamento existente no SEO.',
      es: 'La migración no podía romper el posicionamiento SEO existente.',
    },
  },
  'capitual-cripto-bank-app': {
    problem: {
      en: 'The target was a steady 60–70 FPS on budget Android devices.',
      pt: 'A meta era uma taxa estável de 60–70 FPS em aparelhos Android de entrada.',
      es: 'El objetivo era una tasa estable de 60–70 FPS en dispositivos Android de gama baja.',
    },
    approach: {
      en: 'I applied memoization (useMemo, useCallback, React.memo) to remove redundant re-renders.',
      pt: 'Apliquei memoização (useMemo, useCallback, React.memo) para eliminar re-renderizações desnecessárias.',
      es: 'Apliqué memoización (useMemo, useCallback, React.memo) para eliminar re-renders innecesarios.',
    },
  },
  'lovefy-ai-dating-platform': {
    approach: {
      en: 'The CI/CD pipeline (Vitest, RTL, Playwright E2E, Storybook) reached 100% test and documentation coverage.',
      pt: 'O pipeline de CI/CD (Vitest, RTL, Playwright E2E, Storybook) alcançou 100% de cobertura de testes e documentação.',
      es: 'El pipeline de CI/CD (Vitest, RTL, Playwright E2E, Storybook) alcanzó el 100% de cobertura de pruebas y documentación.',
    },
  },
  'skydiet-universal-cross-platform-app': {
    problem: {
      en: 'I negotiated scope and technical trade-offs directly with the CTO and stakeholders.',
      pt: 'Negociei escopo e decisões técnicas diretamente com o CTO e os acionistas.',
      es: 'Negocié alcance y decisiones técnicas directamente con el CTO y los accionistas.',
    },
    approach: {
      en: 'I also built a real-time WebSocket chat with message virtualization and a dynamic form engine with custom async validation.',
      pt: 'Também construí um chat em tempo real via WebSockets com virtualização de mensagens e um motor de formulários dinâmicos com validação assíncrona customizada.',
      es: 'También construí un chat en tiempo real vía WebSockets con virtualización de mensajes y un motor de formularios dinámicos con validación asíncrona personalizada.',
    },
  },
  'customer-assistance-internal-tool-capitual': {
    approach: {
      en: 'Mentoring cut the juniors’ onboarding from 4 weeks to 3, and CI/CD enforced Jest and RTL testing standards.',
      pt: 'A mentoria reduziu o onboarding dos juniores de 4 para 3 semanas, e o CI/CD reforçou os padrões de teste com Jest e RTL.',
      es: 'La mentoría redujo el onboarding de los junior de 4 a 3 semanas, y el CI/CD reforzó los estándares de prueba con Jest y RTL.',
    },
  },
  'redacao-online-ai-mentor-chat': {
    approach: {
      en: 'Responses stream in under a second, and the AI behaviour has its own test pipelines in Vitest and React Testing Library.',
      pt: 'As respostas chegam por streaming em menos de um segundo, e o comportamento da IA tem pipelines de teste próprios com Vitest e React Testing Library.',
      es: 'Las respuestas llegan por streaming en menos de un segundo, y el comportamiento de la IA tiene sus propios pipelines de prueba con Vitest y React Testing Library.',
    },
  },
  'redacao-online-checkout-migration': {
    problem: {
      en: 'It had to move without interrupting purchases.',
      pt: 'A migração não podia interromper as compras.',
      es: 'La migración no podía interrumpir las compras.',
    },
  },
  'electromaps-ev-charging-app': {
    problem: {
      en: 'The deadline was 3 months, with full test coverage on critical flows.',
      pt: 'O prazo era de 3 meses, com cobertura total de testes nos fluxos críticos.',
      es: 'El plazo era de 3 meses, con cobertura total de pruebas en los flujos críticos.',
    },
  },
}

// 4. Decision: Redação Online, from PHP to Next.js.
const DECISIONS: Record<string, Record<Lang, string[]>> = {
  'redacao-online-landing-page-migration': {
    en: [
      'I kept WordPress and changed what it does. Moving the content to a new CMS would have meant migrating every post and retraining the editors, and optimizing the PHP theme in place left content and code in the same monolith, the security problem we started with. So WordPress became a headless CMS behind a Next.js BFF, and the pages became static.',
      'The cost: two systems to run instead of one, and a BFF to maintain.',
    ],
    pt: [
      'Mantive o WordPress e mudei o papel dele. Levar o conteúdo para um novo CMS significaria migrar todos os posts e treinar a equipe de novo, e otimizar o tema PHP deixaria conteúdo e código no mesmo monolito, o problema de segurança do começo. Então o WordPress virou um CMS headless atrás de um BFF em Next.js, e as páginas viraram estáticas.',
      'O custo: dois sistemas para manter em vez de um, e um BFF para cuidar.',
    ],
    es: [
      'Mantuve WordPress y cambié su papel. Pasar el contenido a un CMS nuevo habría supuesto migrar todos los posts y volver a formar al equipo, y optimizar el tema PHP dejaba contenido y código en el mismo monolito, el problema de seguridad del principio. Así que WordPress pasó a ser un CMS headless detrás de un BFF en Next.js, y las páginas pasaron a ser estáticas.',
      'El coste: dos sistemas que mantener en vez de uno, y un BFF que cuidar.',
    ],
  },
}

// One telling: drop the list blocks, then append the folded fact.
function oneTelling(value: LocaleBlock | undefined, fold: Copy | undefined): LocaleBlock | undefined {
  if (!value) return value
  const out: LocaleBlock = { ...value }
  for (const lang of LANGS) {
    const blocks = (value[lang] ?? []).filter((block) => !block.listItem)
    if (fold) blocks.push(paragraph(fold[lang]))
    out[lang] = blocks
  }
  return out
}

function replaceOpener(value: LocaleBlock, from: Copy, to: Copy): LocaleBlock {
  const out: LocaleBlock = { ...value }
  for (const lang of LANGS) {
    let hits = 0
    out[lang] = (value[lang] ?? []).map((block) => ({
      ...block,
      children: block.children.map((span) => {
        if (!span.text.startsWith(from[lang])) return span
        hits++
        return { ...span, text: to[lang] + span.text.slice(from[lang].length) }
      }),
    }))
    if (hits !== 1) throw new Error(`FAQ opener not found exactly once (${lang}): ${from[lang]}`)
  }
  return out
}

async function main() {
  const tx = client.transaction()
  const log: string[] = []

  const roles = await client.fetch<{ _id: string; summary: Copy }[]>(`*[_id in $ids]{ _id, summary }`, { ids: Object.keys(ROLES) })
  if (roles.length !== Object.keys(ROLES).length) throw new Error('Missing role')
  for (const role of roles) {
    tx.patch(role._id, { set: { summary: { _type: 'localeText', ...ROLES[role._id] } } })
    log.push(`role ${role._id}: summary`)
  }

  const faqs = await client.fetch<{ _id: string; answer: LocaleBlock }[]>(`*[_id in $ids]{ _id, answer }`, { ids: Object.keys(FAQ_OPENERS) })
  if (faqs.length !== Object.keys(FAQ_OPENERS).length) throw new Error('Missing FAQ')
  for (const faq of faqs) {
    const { from, to } = FAQ_OPENERS[faq._id]
    tx.patch(faq._id, { set: { answer: replaceOpener(faq.answer, from, to) } })
    log.push(`faq ${faq._id}: opener`)
  }

  const studies = await client.fetch<{ _id: string; slug: string; problem?: LocaleBlock; approach?: LocaleBlock }[]>(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current, problem, approach }`,
  )
  for (const slug of [...Object.keys(FOLDS), ...Object.keys(DECISIONS)]) {
    if (!studies.some((s) => s.slug === slug)) throw new Error(`Unknown case study: ${slug}`)
  }
  for (const study of studies) {
    const folds = FOLDS[study.slug] ?? {}
    const set: Record<string, unknown> = {
      problem: oneTelling(study.problem, folds.problem),
      approach: oneTelling(study.approach, folds.approach),
    }
    const decision = DECISIONS[study.slug]
    if (decision) {
      set.decision = { _type: 'localeBlock', ...Object.fromEntries(LANGS.map((l) => [l, decision[l].map(paragraph)])) }
    }
    const dropped = LANGS.reduce(
      (n, l) => n + [study.problem, study.approach].reduce((m, part) => m + (part?.[l]?.filter((b) => b.listItem).length ?? 0), 0),
      0,
    )
    tx.patch(study._id, { set })
    log.push(`caseStudy ${study.slug}: -${dropped} bullets${Object.keys(folds).length ? `, folded ${Object.keys(folds).join('+')}` : ''}${decision ? ', decision' : ''}`)
  }

  console.log(log.join('\n'))
  if (!WRITE) {
    console.log('\nDry run. Pass -- --write to commit.')
    return
  }
  const result = await tx.commit()
  console.log(`\nCommitted transaction ${result.transactionId} (${result.results.length} documents).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
