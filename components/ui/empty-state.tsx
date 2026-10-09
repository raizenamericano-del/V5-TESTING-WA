import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({ icon: Icon, title, description, children, className }: {
  icon: LucideIcon
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-5 py-14 text-center', className)}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.05]">
        <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
      {description && <div className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">{description}</div>}
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  )
}
