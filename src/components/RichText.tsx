import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { LocaleBlock } from '#/types/sanity.generated'

interface Props {
  value: LocaleBlock['en'] | null | undefined
  className?: string
}

// localeBlock is deliberately small (sanity/schemas/locale/localeBlock.ts):
// paragraphs, bullet/numbered lists, strong/em/code and links. Text color and
// size come from the wrapper, so the same blocks fit the QA bubble and the
// project page.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-5 first:mt-0">{children}</ul>,
    number: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-5 first:mt-0">{children}</ol>,
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded bg-surface-raised px-1 py-0.5 text-[0.9em]">{children}</code>
    ),
    link: ({ value, children }) => {
      const href     = (value as { href?: string } | undefined)?.href
      const external = Boolean(href && /^https?:/.test(href))
      return (
        <a
          href={href}
          className="font-semibold text-mangrove underline underline-offset-2"
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
  },
}

export default function RichText({ value, className }: Props) {
  if (!value || value.length === 0) return null
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  )
}
