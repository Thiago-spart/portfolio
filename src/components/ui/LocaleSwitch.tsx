import { useLanguage, type Lang } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'

// Always EN · PT · ES, in that order. Each title is in its own language.
const LOCALES: Array<{ code: Lang; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
]

// Figma: Components / Locale switch (9:67). No flags.
export function LocaleSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  const { t } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className={cn(
        'inline-flex gap-0.5 rounded-md border border-line-strong bg-surface-raised p-0.5',
        className,
      )}
    >
      {LOCALES.map(({ code, name }) => (
        <button
          key={code}
          type="button"
          lang={code}
          title={name}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className="inline-flex h-[30px] w-10 items-center justify-center rounded-sm uppercase type-control-mono text-ink-muted transition-colors duration-150 ease-out hover:text-ink aria-pressed:bg-mangrove aria-pressed:text-on-mangrove"
        >
          {code}
        </button>
      ))}
    </div>
  )
}
