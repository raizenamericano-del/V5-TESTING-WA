import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow = 'Ruang kerja', title, description, children, className }: {
  eyebrow?: string
  title: string
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('page-heading', className)}>
      <div className="min-w-0">
        <p className="eyebrow mb-2.5">{eyebrow}</p>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-1.1px] sm:text-[32px]">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</div>}
      </div>
      {children && <div className="page-heading-actions">{children}</div>}
    </header>
  )
}
