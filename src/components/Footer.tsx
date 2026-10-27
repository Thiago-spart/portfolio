import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'

// Figma: Home (39:5927 / 39:6098), footer. Copyright left, a Ghost Small
// "Back to top" right; stacked on phones.
export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-start gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="m-0 type-small text-ink-muted">
          {t('footer.copyright').replace('{year}', String(year))}
        </p>
        {/* "#top" scrolls to the top of the document without an anchor. */}
        <Button href="#top" variant="ghost" size="small">
          {t('footer.backToTop')}
        </Button>
      </Container>
    </footer>
  )
}
