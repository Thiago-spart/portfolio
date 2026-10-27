import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

// The 1120px content column with the page gutter: space-4 on phones,
// space-6 from 768px. content-box sizing lets max-width apply to the
// content, so the column is 1120 wide at any gutter.
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mx-auto box-content max-w-content px-4 md:px-6', className)}>{children}</div>
  )
}

interface SectionProps {
  id?: string
  // Section heading (type-heading) and optional lede under it. The heading
  // gets `${id}-heading` and labels the section.
  heading?: ReactNode
  lede?: ReactNode
  className?: string
  children: ReactNode
}

// A page section as drawn on the Figma Sections and Home pages: space-16
// top and bottom on phones, space-24 on desktop; the head (heading, then
// lede space-3 below) sits space-8 / space-12 above the content.
export function Section({ id, heading, lede, className, children }: SectionProps) {
  const headingId = id && heading ? `${id}-heading` : undefined
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('scroll-mt-4 py-16 md:py-24', className)}
    >
      <Container>
        {heading && (
          <div className="mb-8 flex flex-col gap-3 md:mb-12">
            <h2 id={headingId} className="m-0 type-heading text-ink">
              {heading}
            </h2>
            {lede && <p className="m-0 type-lede text-ink-muted">{lede}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
