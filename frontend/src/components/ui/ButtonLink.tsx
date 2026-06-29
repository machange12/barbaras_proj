import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type ButtonVariant = 'primary' | 'ghost'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-brass/70 bg-brass/15 text-parchment shadow-[0_0_32px_rgba(177,132,65,0.18)] hover:border-brass hover:bg-brass/20',
  ghost:
    'border-parchment/15 bg-ink/30 text-parchment/80 hover:border-parchment/35 hover:text-parchment',
}

export function ButtonLink({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`inline-flex min-h-11 items-center gap-3 rounded-sm border px-5 py-3 font-serif text-sm uppercase tracking-[0.18em] transition duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
    </a>
  )
}
