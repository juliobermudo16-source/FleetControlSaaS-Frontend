import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { AlertStatus } from '@/types'

const statusClasses: Record<AlertStatus, string> = {
  Green: 'bg-green/15 text-green border-green/30',
  Yellow: 'bg-yellow/15 text-yellow border-yellow/30',
  Red: 'bg-red/15 text-red border-red/30',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: AlertStatus
}

export function Badge({ className, status, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        status ? statusClasses[status] : 'bg-surface-hover text-text-muted border-border',
        className
      )}
      {...props}
    >
      {status && <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-green': status === 'Green',
        'bg-yellow': status === 'Yellow',
        'bg-red': status === 'Red',
      })} />}
      {children}
    </span>
  )
}
