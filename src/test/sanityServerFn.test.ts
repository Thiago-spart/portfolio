import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// issue #40: Sanity's CORS allowlist rejects browser-origin requests, and a
// route loader runs in the browser on client-side navigation (e.g.
// /projects/<slug> → /). Every query module a loader calls must therefore
// fetch through createServerFn, never via a plain exported function.
const queriesDir = resolve(__dirname, '../lib/queries')
const queryFiles = readdirSync(queriesDir).filter((f) => f.endsWith('.ts'))

describe('Sanity queries run as server functions (issue #40)', () => {
  it.each(queryFiles)('%s exports no plain function that calls sanityClient', (file) => {
    const source = readFileSync(resolve(queriesDir, file), 'utf-8')
    expect(source).not.toMatch(/export (async )?function/)
  })

  it.each(queryFiles)('%s wraps every sanityClient.fetch in createServerFn', (file) => {
    const source  = readFileSync(resolve(queriesDir, file), 'utf-8')
    const fetches = source.match(/sanityClient\.fetch\(/g) ?? []
    const fns     = source.match(/createServerFn\(\{ method: 'GET' \}\)/g) ?? []
    expect(fetches.length).toBeGreaterThan(0)
    expect(fns.length).toBe(fetches.length)
  })

  // Page routes (with loaders) must go through the query modules. Server
  // routes (server.handlers) only ever run on the server, so they may use
  // sanityClient directly.
  it('no page route imports sanityClient directly', () => {
    const routesDir = resolve(__dirname, '../routes')
    const offenders = readdirSync(routesDir)
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => {
        const source = readFileSync(resolve(routesDir, f), 'utf-8')
        return source.includes('#/lib/sanity') && !/server:\s*\{\s*handlers/.test(source)
      })
    expect(offenders).toEqual([])
  })
})
