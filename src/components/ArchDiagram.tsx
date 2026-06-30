import { useTranslation } from '#/i18n/useTranslation'

export default function ArchDiagram() {
  const { t } = useTranslation()

  return (
    <div
      id="architecture"
      className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-[rgba(0,170,255,0.2)] bg-[rgba(8,13,26,0.85)]"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <h2 className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
        {t('skills.archTitle')}
      </h2>
      <p className="text-sm text-[#5a6a7a]">
        Architecture diagram — coming after project data strategy
      </p>
    </div>
  )
}
