import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// The site's content languages: localeString/localeText/localeBlock in Sanity
// carry one field per language, picked with `field[lang]`.
export type Lang = 'en' | 'pt' | 'es'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

function readStoredLang(): string | null {
  try {
    return localStorage.getItem('lang')
  } catch {
    return null // storage blocked: fall back to the browser language
  }
}

function detectLang(): Lang {
  const stored = readStoredLang()
  if (stored === 'en' || stored === 'pt' || stored === 'es') return stored
  const browser = navigator.language.slice(0, 2)
  if (browser === 'pt') return 'pt'
  if (browser === 'es') return 'es'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always starts as 'en' to match the server's render (which has no window
  // to detect from). Detecting synchronously on the client here would make
  // the very first client render diverge from the server-rendered HTML,
  // causing a hydration mismatch (React error #418) for any visitor whose
  // browser language or stored preference isn't English. Detection instead
  // runs in an effect below, after hydration has already completed.
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  function setLang(l: Lang) {
    try {
      localStorage.setItem('lang', l)
    } catch {
      // Not remembered, but still switched for this page view.
    }
    document.documentElement.lang = l
    setLangState(l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
