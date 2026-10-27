# Copy review: critique step 2

Drafts for Sanity, in en / pt / es. Nothing is written until approved. Every number below already exists in Sanity or in the current FAQ text; no new claims.

Voice rules (DESIGN/PRODUCT): result first, then method; "I" for my work, "we" for team results; no "utilizing", "rigorous", "high-performance", "slashing", "boosting".

## 1. Featured card summaries (one decision sentence, no metric repeated)

The metric already sits under each card, so the sentence says what was decided, not what improved.

| Case study | en | pt | es |
|---|---|---|---|
| Redação Online, from PHP to Next.js | I moved the landing page off a PHP monolith inside WordPress to static Next.js pages, keeping WordPress as a headless CMS behind a BFF. | Tirei a landing page de um monolito PHP dentro do WordPress e a levei para páginas estáticas em Next.js, mantendo o WordPress como CMS headless atrás de um BFF. | Saqué la landing page de un monolito PHP dentro de WordPress y la pasé a páginas estáticas en Next.js, con WordPress como CMS headless detrás de un BFF. |
| Capitual, internal banking tools | We built the admin tools in React and GraphQL and covered their critical flows with end-to-end and unit tests before adding more features. | Construímos as ferramentas de administração em React e GraphQL e cobrimos os fluxos críticos com testes end-to-end e unitários antes de adicionar mais funcionalidades. | Construimos las herramientas de administración en React y GraphQL y cubrimos los flujos críticos con pruebas end-to-end y unitarias antes de sumar funcionalidades. |
| Redação Online, a checkout that keeps buyers | I rebuilt the live checkout in Vite, Vue and TypeScript, with stronger security around payments. | Reconstruí o checkout em produção com Vite, Vue e TypeScript, com mais segurança em torno dos pagamentos. | Reconstruí el checkout en producción con Vite, Vue y TypeScript, con más seguridad alrededor de los pagos. |
| C6 Bank, a landing page in under a second | I built the public site mobile first on Vite SSR and TanStack Start, with Cloudflare caching in front. | Construí o site público mobile first com Vite SSR e TanStack Start, com cache da Cloudflare na frente. | Construí el sitio público mobile first con Vite SSR y TanStack Start, con caché de Cloudflare delante. |

C6 Bank card metrics: show **Largest Contentful Paint 0.9s** and **Lighthouse accessibility 100** (reorder the results so FCP 1.5s drops out of the card; it stays on the case-study page).

## 2. Featured mix (one mobile case study in, one Redação Online out)

Recommended: **Capitual, crypto bank app** replaces **Redação Online, a checkout that keeps buyers** in the featured four.

- Adds the mobile proof the grid lacks: App Store rating 3.5 → 4.8, mobile bugs −60%.
- The checkout result (23% → 9%) stays visible: it is still one of the three hero results and still in "More work".
- New featured order: 1 Redação Online, from PHP to Next.js · 2 Capitual, internal banking tools · 3 Capitual, crypto bank app · 4 C6 Bank.

Its summary:

| en | pt | es |
|---|---|---|
| I optimized the React Native banking app's lists and rendering for 70 FPS, and added support for more languages. | Otimizei listas e renderização do app bancário em React Native para 70 FPS e adicionei suporte a mais idiomas. | Optimicé listas y renderizado de la app bancaria en React Native para 70 FPS y añadí soporte para más idiomas. |

(Card shows App Store rating 3.5 → 4.8 and Mobile bugs −60%.)

## 3. How I work: answers open with the result

### 01 How do you migrate a stack without downtime?

**en:** Zero downtime during Redação Online's platform rollout, and checkout drop-off fell from 23% to 9% after its migration. I replace systems piece by piece. At Plin we put a reverse proxy in front of the old app and moved one module at a time, switching traffic only after each part was rebuilt and validated. For React class components we went bottom-up, wrapping old components so new hooks code and old code could run side by side.

**pt:** Zero downtime no rollout da plataforma da Redação Online, e o abandono no checkout caiu de 23% para 9% depois da migração. Eu substituo sistemas por partes. Na Plin colocamos um reverse proxy na frente do app antigo e migramos um módulo por vez, trocando o tráfego só depois que cada parte estava reconstruída e validada. Para componentes de classe em React fomos de baixo para cima, envolvendo os componentes antigos para que código novo com hooks e código antigo rodassem lado a lado.

**es:** Cero downtime en el despliegue de la plataforma de Redação Online, y el abandono en el checkout bajó del 23% al 9% tras su migración. Reemplazo sistemas por partes. En Plin pusimos un reverse proxy delante de la app antigua y migramos un módulo a la vez, cambiando el tráfico solo cuando cada parte estaba reconstruida y validada. Para los componentes de clase de React fuimos de abajo hacia arriba, envolviendo los componentes antiguos para que el código nuevo con hooks y el antiguo convivieran.

### 02 How do you get Lighthouse to 95+?

**en:** Lighthouse 40 → 95 at Redação Online, with page weight down 80%, and 0.9s LCP at C6 Bank. I move rendering to the server (static generation, SSR, React Server Components) so less JavaScript ships, serve images as AVIF or WebP, split code by route and lazy-load heavy features, and cache at the CDN edge. Accessibility is part of the same pass: semantic HTML, ARIA only where needed, and full keyboard support.

**pt:** Lighthouse de 40 → 95 na Redação Online, com 80% menos peso de página, e LCP de 0,9s no C6 Bank. Levo a renderização para o servidor (geração estática, SSR, React Server Components) para enviar menos JavaScript, sirvo imagens em AVIF ou WebP, divido o código por rota com lazy loading das partes pesadas e faço cache na borda da CDN. Acessibilidade entra na mesma passada: HTML semântico, ARIA só onde precisa e suporte completo a teclado.

**es:** Lighthouse de 40 → 95 en Redação Online, con un 80% menos de peso de página, y LCP de 0,9s en C6 Bank. Llevo el renderizado al servidor (generación estática, SSR, React Server Components) para enviar menos JavaScript, sirvo imágenes en AVIF o WebP, divido el código por ruta con carga diferida de lo pesado y uso caché en el borde de la CDN. La accesibilidad va en la misma pasada: HTML semántico, ARIA solo donde hace falta y soporte completo de teclado.

### 03 How do you keep micro-frontends consistent?

**en:** One shared UI library of 45+ Storybook components across Redação Online's micro-frontends. We split the platform with Module Federation and kept a single framework-agnostic component library, so every app looked the same without being tightly coupled. GraphQL worked as one gateway so micro-apps stopped over-fetching, and each app had its own error boundaries and cache, so a failure stayed local.

**pt:** Uma biblioteca de UI compartilhada com mais de 45 componentes no Storybook entre os micro-frontends da Redação Online. Dividimos a plataforma com Module Federation e mantivemos uma única biblioteca de componentes independente de framework, para que todos os apps tivessem a mesma cara sem acoplamento forte. O GraphQL funcionou como gateway único para os micro-apps pararem de buscar dados em excesso, e cada app tinha seus próprios error boundaries e cache, então uma falha ficava local.

**es:** Una biblioteca de UI compartida con más de 45 componentes en Storybook entre los micro-frontends de Redação Online. Dividimos la plataforma con Module Federation y mantuvimos una sola biblioteca de componentes independiente del framework, para que todas las apps se vieran igual sin acoplarse. GraphQL funcionó como gateway único para que las micro-apps dejaran de pedir datos de más, y cada app tenía sus propios error boundaries y caché, así un fallo quedaba aislado.

### 04 How do you put AI agents into your pipeline?

**en:** Feature delivery at Lovefy went from 14 days to 4. Agents write tests, refactors and first drafts inside a sandbox, and nothing merges without passing tests and my review. With Claude Code and custom CLI configurations, the pipeline generates unit and E2E tests, runs static analysis, refactors legacy code against strict rules, and validates in CI before a person reads it.

**pt:** A entrega de funcionalidades na Lovefy caiu de 14 dias para 4. Agentes escrevem testes, refatorações e primeiros rascunhos dentro de um sandbox, e nada é mergeado sem testes passando e minha revisão. Com Claude Code e configurações de CLI próprias, o pipeline gera testes unitários e E2E, roda análise estática, refatora código legado com regras estritas e valida no CI antes de uma pessoa ler.

**es:** La entrega de funcionalidades en Lovefy pasó de 14 días a 4. Los agentes escriben pruebas, refactorizaciones y primeros borradores dentro de un sandbox, y nada se fusiona sin pruebas en verde y mi revisión. Con Claude Code y configuraciones de CLI propias, el pipeline genera pruebas unitarias y E2E, ejecuta análisis estático, refactoriza código legado con reglas estrictas y valida en CI antes de que una persona lo lea.

## 4. Availability line (contracts first)

| en | pt | es |
|---|---|---|
| Taking on contract work. Open to senior and lead roles. | Disponível para projetos. Aberto a vagas sênior e de liderança. | Disponible para proyectos. Abierto a roles sénior y de liderazgo. |
