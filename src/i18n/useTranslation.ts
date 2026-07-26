import { useLanguage } from './LanguageContext'
import en from './locales/en.json'
import pt from './locales/pt.json'
import es from './locales/es.json'

const locales = { en, pt, es } as const

export function useTranslation() {
  const { lang } = useLanguage()
  const strings = locales[lang]

  function t(key: keyof typeof en): string {
    return (strings as Record<string, string>)[key] ?? key
  }

  return { t, lang }
}
