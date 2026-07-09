import type { AlertStatus } from '@/types'
import { cn } from '@/lib/utils'

const barColor: Record<AlertStatus, string> = {
  Green: 'bg-green',
  Yellow: 'bg-yellow',
  Red: 'bg-red',
}

interface ProgressBarProps {
  percentage: number
  status: AlertStatus
  className?: string
}

export function ProgressBar({ percentage, status, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage))

  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-hover', className)}>
      <div
        className={cn('h-full rounded-full transition-all', barColor[status])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
