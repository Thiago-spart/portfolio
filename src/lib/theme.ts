// Theme switching. The tokens (src/styles/tokens.css) follow the system
// preference by default; `data-theme="light" | "dark"` on <html> overrides
// it. The visitor's pick is remembered in localStorage under THEME_KEY and
// re-applied before first paint by THEME_INIT_SCRIPT (inlined in the root
// document's <head>), so there's no flash of the wrong theme.

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

// The same rule as applyTheme, as a plain inline script: it runs before
// React or any module loads. Anything else stored (an old "auto") means
// "follow the system". Storage access can throw (blocked site data).
export const THEME_INIT_SCRIPT = `(function(){try{var t=window.localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

// The theme in effect right now: the override on <html>, else the system's.
export function resolvedTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  return isTheme(attr) ? attr : systemTheme()
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Not remembered, but still applied for this page view.
  }
}

// Notifies on both an explicit switch (attribute change) and a system
// change while no override is set. For useSyncExternalStore.
export function subscribeTheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => {
    media.removeEventListener('change', onChange)
    observer.disconnect()
  }
}
