import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 ease-out-soft focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.97]'

const variants: Record<Variant, string> = {
  primary:
    'bg-cta-gradient text-ink-900 shadow-glow-sm hover:shadow-glow hover:-translate-y-0.5',
  secondary:
    'bg-white dark:bg-night-surface text-ink-900 dark:text-night-text border border-sand-200 dark:border-night-border hover:border-teal-400 hover:-translate-y-0.5 shadow-sm',
  ghost:
    'text-ink-700 dark:text-night-muted hover:text-ink-900 dark:hover:text-night-text hover:bg-sand-100 dark:hover:bg-night-raised',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-[0.95rem] px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type LinkProps = CommonProps & { to: string; href?: undefined }
type AnchorProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined }

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    )
  }
  if ('href' in props && props.href) {
    const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props as AnchorProps
    return (
      <a className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  const { variant: _v, size: _s, className: _c, children: _ch, to: _t, href: _h, ...rest } =
    props as ButtonProps & { to?: string; href?: string }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
