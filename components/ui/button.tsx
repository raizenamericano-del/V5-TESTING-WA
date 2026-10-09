import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[12px] font-semibold transition-[background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[15px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(20,40,25,0.1)] hover:bg-primary/90 active:translate-y-px',
        secondary: 'border border-border bg-card text-foreground shadow-[0_1px_2px_rgba(20,40,25,0.025)] hover:border-primary/25 hover:bg-muted/70',
        outline: 'border border-input bg-transparent text-foreground hover:bg-muted',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive: 'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
        subtle: 'border border-primary/15 bg-primary/[0.07] text-primary hover:bg-primary/[0.12]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-[11px]',
        lg: 'h-11 px-5 text-[12px]',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8 [&_svg]:size-[15px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} disabled={disabled || loading}
        type={asChild ? undefined : type || 'button'} aria-busy={loading || undefined} {...props}>
        {loading && !asChild ? <><Loader2 className="animate-spin" aria-hidden="true" />{children}</> : children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
export { Button, buttonVariants }
