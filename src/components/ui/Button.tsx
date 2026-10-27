import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from '#/lib/utils'

// Figma: Components / Button (7:126). Primary is the one main next step per
// view; Secondary supports it; Ghost is inline navigation. Small (32px) is
// for toolbars. Never a mango fill, never a pill. Focus ring comes from the
// global :focus-visible rule (2px mango, 2px offset).
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent no-underline',
    'transition-[background-color,border-color,box-shadow,translate] duration-150 ease-out',
    'active:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-mangrove text-on-mangrove hover:bg-mangrove-hover disabled:bg-mangrove',
        secondary:
          'border-line-strong bg-transparent text-ink hover:bg-mangrove-soft disabled:bg-transparent',
        ghost:
          'bg-transparent px-2 text-mangrove hover:shadow-[inset_0_-1px_0_var(--mangrove)] disabled:shadow-none',
      },
      size: {
        default: 'h-11 type-button',
        small: 'h-8 type-button-sm',
      },
    },
    compoundVariants: [
      { variant: ['primary', 'secondary'], size: 'default', className: 'px-4' },
      { variant: ['primary', 'secondary'], size: 'small', className: 'px-3' },
    ],
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'default' | 'small'

interface CommonProps {
  variant?: Variant
  size?: Size
  // A Lucide icon, drawn before the label in currentColor.
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: undefined }
type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

// Renders an <a> when given an href, otherwise a <button type="button">.
export function Button(props: ButtonProps) {
  const { variant, size, icon: Icon, children, className, ...rest } = props
  const classes = cn(buttonVariants({ variant, size }), className)
  const content = (
    <>
      {Icon && <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0" />}
      {children}
    </>
  )

  if (rest.href !== undefined) {
    return (
      <a {...(rest as ComponentPropsWithoutRef<'a'>)} className={classes}>
        {content}
      </a>
    )
  }

  const { type = 'button', ...buttonRest } = rest as ComponentPropsWithoutRef<'button'>
  return (
    <button {...buttonRest} type={type} className={classes}>
      {content}
    </button>
  )
}
