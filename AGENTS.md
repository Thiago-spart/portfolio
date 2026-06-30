# Thiago Portfolio — TanStack App

<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

---

## Scaffolding

### TanStack CLI command used

```bash
npx @tanstack/cli@latest create my-tanstack-app \
  --agent \
  --package-manager pnpm \
  --tailwind \
  --add-ons ai,shadcn,store,tanstack-query
```

> Note: `--tailwind` is deprecated — Tailwind is always enabled in TanStack Start scaffolds. The flag was silently ignored.

### TanStack Intent commands run after scaffolding

```bash
npx @tanstack/intent@latest install   # wired skill mappings into AGENTS.md
npx @tanstack/intent@latest list      # listed 41 skills across 10 intent-enabled packages
```

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | TanStack Start (React 19, SSR) |
| Router | TanStack Router (file-based, type-safe) |
| State | TanStack Store |
| Data fetching | TanStack Query |
| AI | TanStack AI (`@tanstack/ai`, multi-provider) |
| UI primitives | shadcn/ui (Tailwind CSS v4) |
| Toolchain | Vite 8 + TypeScript 6 |
| Package manager | pnpm |
| Testing | Vitest + @testing-library/react |

### Installed TanStack packages

- `@tanstack/react-start` — SSR framework
- `@tanstack/react-router` + `@tanstack/router-plugin` — file-based routing, auto route-tree generation
- `@tanstack/react-query` + `@tanstack/react-query-devtools` + `@tanstack/react-router-ssr-query` — server-state management
- `@tanstack/store` + `@tanstack/react-store` — client-state management
- `@tanstack/ai` + `@tanstack/ai-client` + `@tanstack/ai-react` — AI core and React hooks
- `@tanstack/ai-anthropic` + `@tanstack/ai-openai` + `@tanstack/ai-gemini` + `@tanstack/ai-ollama` — provider adapters
- `@tanstack/react-devtools` + `@tanstack/react-router-devtools` + `@tanstack/devtools-vite` — devtools

---

## Environment Variables

Create a `.env` file at the project root (next to `package.json`):

```env
# Required for the default AI chat (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional — only if you enable other provider adapters
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key        # or GEMINI_API_KEY
XAI_API_KEY=your_xai_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OLLAMA_HOST=http://localhost:11434        # default; change if Ollama runs elsewhere
```

> Only `ANTHROPIC_API_KEY` is required to run the default demo. All others are optional and only needed if you switch providers.

---

## Project Structure

```
src/
├── components/          # Shared UI components (Header, Footer, ThemeToggle, demo-*)
├── data/                # Static data fixtures (demo-guitars.ts)
├── hooks/               # Custom React hooks (demo-useAudioRecorder, demo-useTTS)
├── integrations/
│   └── tanstack-query/  # QueryClient provider + devtools wiring
├── lib/                 # Utilities and store (demo-store, demo-ai-hook, utils)
├── routes/
│   ├── __root.tsx       # Root layout (shell, head, providers)
│   ├── index.tsx        # Home page
│   ├── about.tsx
│   └── demo/            # Demo routes for every installed add-on
│       ├── ai-chat.tsx
│       ├── ai-image.tsx
│       ├── ai-structured.tsx
│       ├── api.ai.*.ts  # Server route handlers (chat, image, structured, TTS, transcription)
│       ├── guitars/     # TanStack Query demo (list + detail)
│       ├── store.tsx    # TanStack Store demo
│       └── tanstack-query.tsx
├── router.tsx           # createRouter factory
├── routeTree.gen.ts     # Auto-generated — do not edit manually
└── styles.css           # Global styles + Tailwind v4 import
```

> Files and components prefixed `demo-` are safe to delete once you replace them with real portfolio content.

---

## Key Scripts

```bash
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run Vitest test suite
pnpm generate-routes  # Regenerate routeTree.gen.ts (runs automatically on dev)
```

---

## Architectural Decisions

- **File-based routing** via `src/routes/` — TanStack Router auto-generates `routeTree.gen.ts`. Never edit that file manually.
- **Server routes as `.ts` files** — API endpoints live alongside page routes (e.g., `api.ai.chat.ts`). They export HTTP method handlers.
- **TanStack AI uses `chat()` not `streamText()`** — do not use Vercel AI SDK patterns. Server-side uses `toServerSentEventsResponse()`, client uses `fetchServerSentEvents()` via `useChat()`.
- **State via TanStack Store** — `src/lib/demo-store.ts` shows the pattern. Use `useStore()` on the client.
- **TanStack Query SSR** — `@tanstack/react-router-ssr-query` bridges route loaders and QueryClient for dehydration/hydration.
- **shadcn/ui with Tailwind v4** — add components with `pnpm dlx shadcn@latest add <component>`. Config is in `components.json`.
- **Path alias** — `#/*` maps to `./src/*` (configured in `package.json` `imports` and `tsconfig.json`).

---

## Known Gotchas

- `routeTree.gen.ts` is auto-generated on `pnpm dev`. Do not commit manual edits to it.
- `@tanstack/devtools-event-client` has a version conflict (0.5.0 used, 0.4.4 in nested deps). This is cosmetic — the CLI picked the correct version.
- Tailwind v4 config lives inside `vite.config.ts` (plugin-based), not a separate `tailwind.config.js`.
- AI server routes require `ANTHROPIC_API_KEY` at runtime (server-side only — never expose it to the client).
- `intent.skills` allowlist is not set — TanStack Intent surfaces all discovered skills. A future version will require an explicit allowlist.

---

## Next Steps

- [ ] Replace demo content with real portfolio routes (projects, about, contact)
- [ ] Apply the "A Light That Never Comes" design system from `../design-reference.md`
- [ ] Set `ANTHROPIC_API_KEY` in `.env` to enable the AI chat demo
- [ ] Delete `demo-*` files once real content is in place
- [ ] Configure deployment target (see `pnpm dlx @tanstack/intent@latest load @tanstack/start-client-core#start-core/deployment`)
- [ ] Add TanStack Hotkeys for keyboard navigation shortcuts
