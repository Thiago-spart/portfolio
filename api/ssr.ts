// TanStack Start's Vite build emits a Web Fetch API handler at
// dist/server/server.js ({ fetch(request): Promise<Response> }). This
// project's Vercel framework preset ("tanstack-start") maps to
// @vercel/static-build, which only serves dist/client as static files and
// never invokes the SSR entry — so this thin wrapper exposes it as a real
// Vercel Function instead. vercel.json rewrites every non-static path here;
// Vercel resolves actual static files first, so this only runs for routes.
//
// TanStack Start's compiled SSR bundle imports node:stream, so it can't run
// on Vercel's Edge runtime — this must stay on the Node.js runtime. There,
// Vercel calls this export with Node's raw (req, res) pair (relative url,
// plain-object headers), not a spec-compliant Request. @whatwg-node/server
// is the standard adapter for exactly this bridge — it builds a real
// Request from (req, res), calls the fetch handler, and streams the
// Response back correctly (headers, status, chunked body).
import { createServerAdapter } from '@whatwg-node/server'
// @ts-expect-error - build artifact (git-ignored, generated fresh each build), no shipped types
import handler from '../dist/server/server.js'

export default createServerAdapter((request: Request) => handler.fetch(request))
