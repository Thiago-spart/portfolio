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

// Runs `cb` once, on the visitor's first sign of engagement (pointer,
// touch, key, wheel or scroll) after the page has loaded. Until then the SVG
// poster is the hero: the three.js scene costs ~600 ms of main-thread work
// to build, and loading it on idle put that inside the mobile page-load
// window (Lighthouse TBT 650-810 ms on the Vercel preview). Desktop
// visitors move the pointer almost at once, so they still get the scene
// straight away. Returns a cancel.
const ENGAGE_EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const

export function whenEngaged(cb: () => void): () => void {
  let done = false
  const fire = () => {
    if (done) return
    done = true
    detach()
    cb()
  }
  const detach = () => {
    for (const type of ENGAGE_EVENTS) window.removeEventListener(type, fire)
    window.removeEventListener('load', attach)
  }
  const attach = () => {
    for (const type of ENGAGE_EVENTS) window.addEventListener(type, fire, { once: true, passive: true })
  }
  if (document.readyState === 'complete') attach()
  else window.addEventListener('load', attach, { once: true })
  return () => {
    done = true
    detach()
  }
}
