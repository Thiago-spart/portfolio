// Browser helpers for the hero shell. Everything here works without the 3D
// scene; the scene only adds to it.

export const ROOTS_KEY = 'mangrove-roots'
export const HINT_KEY = 'mangrove-hint-seen'

// Storage can throw (blocked site data, private mode): the hero still works,
// nothing persists.
export function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStore(key: string, value: string | null) {
  try {
    if (value == null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Not remembered, but the page keeps working.
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// The mango (and its keyboard twin, "Get in touch") lead to the contact
// block. #contact-heading has tabIndex -1 (ContactSection contract).
export function goToContact() {
  const section = document.getElementById('contact')
  section?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  document.getElementById('contact-heading')?.focus({ preventScroll: true })
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

// Runs `cb` once the page has loaded and the browser is idle, so the scene
// never competes with the headline for the first paint. Returns a cancel.
export function whenIdleAfterLoad(cb: () => void): () => void {
  let cancelled = false
  let idleId: number | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  const run = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(() => !cancelled && cb(), { timeout: 2000 })
    else timer = setTimeout(() => !cancelled && cb(), 200)
  }
  if (document.readyState === 'complete') run()
  else window.addEventListener('load', run, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener('load', run)
    if (idleId != null) window.cancelIdleCallback(idleId)
    if (timer != null) clearTimeout(timer)
  }
}
