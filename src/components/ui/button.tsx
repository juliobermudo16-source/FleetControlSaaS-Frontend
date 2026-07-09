import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary hover:bg-primary-hover text-white',
  outline: 'border border-border bg-transparent hover:bg-surface-hover text-text',
  ghost: 'bg-transparent hover:bg-surface-hover text-text',
  destructive: 'bg-red hover:opacity-90 text-white',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
