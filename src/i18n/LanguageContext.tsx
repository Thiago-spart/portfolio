import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lang } from '#/types/sanity'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

function detectLang(): Lang {
  const stored = localStorage.getItem('lang') as Lang | null
  if (stored === 'en' || stored === 'pt' || stored === 'es') return stored
  const browser = navigator.language.slice(0, 2)
  if (browser === 'pt') return 'pt'
  if (browser === 'es') return 'es'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window !== 'undefined' ? detectLang() : 'en'
  )

  function setLang(l: Lang) {
    localStorage.setItem('lang', l)
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
