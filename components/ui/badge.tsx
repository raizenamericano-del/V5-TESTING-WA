import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const badgeVariants = cva('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[9px] font-semibold', {
  variants: { variant: {
    default: 'border-primary/10 bg-primary/[0.07] text-primary',
    secondary: 'border-border bg-muted/70 text-muted-foreground',
    success: 'border-primary/10 bg-primary/[0.07] text-primary',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    outline: 'border-border text-foreground',
  } }, defaultVariants: { variant: 'default' },
})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} /> }
export { Badge, badgeVariants }
