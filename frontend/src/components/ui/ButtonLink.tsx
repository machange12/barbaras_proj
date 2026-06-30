import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type ButtonVariant = 'primary' | 'ghost'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-brass/90 bg-[linear-gradient(180deg,rgba(176,141,87,0.24),rgba(92,64,51,0.66))] text-[#fff3d5] shadow-[inset_0_1px_0_rgba(255,244,210,0.24),0_18px_44px_-18px_rgba(0,0,0,0.6)] hover:border-[#d1ae73] hover:shadow-[0_20px_46px_-18px_rgba(0,0,0,0.64)] hover:brightness-105',
  ghost:
    'border-brass/20 bg-[#2b1e17]/55 text-parchment/90 shadow-[inset_0_1px_0_rgba(255,244,210,0.08)] hover:border-brass/60 hover:bg-[#33271f]/80 hover:text-[#fff3d5]',
}

export function ButtonLink({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`inline-flex min-h-11 items-center gap-3 rounded-[0.65rem] border px-6 py-3 font-serif text-sm uppercase tracking-[0.16em] transition duration-500 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
    </a>
  )
}
